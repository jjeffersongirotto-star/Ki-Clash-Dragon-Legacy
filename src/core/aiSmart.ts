/**
 * v0.37.0 — Adversário esperto.
 *
 * A IA simples (ai.ts) segue regras fixas. A IA esperta PENSA ANTES DE JOGAR: para cada jogada possível (invocar
 * uma carta pronta numa casa da zona, lançar um feitiço num alvo, ou parar), ela copia a batalha, faz a jogada na
 * cópia, deixa o motor de verdade rodar alguns turnos à frente (o próprio lado age, o adversário responde com a IA
 * simples, e assim por diante) e dá uma NOTA ao resultado. Fica com a jogada de nota mais alta e repete até parar
 * de valer a pena.
 *
 * A nota (`evaluate`) pesa: vida dos dois Comandantes (com um peso extra de PERIGO quando o próprio Comandante está
 * baixo — aí a IA passa a defender), vida/ataque/habilidades das unidades, unidades-chave (curandeiros, auras,
 * guardiões), avanço das próprias unidades e ameaça das unidades inimigas que chegam perto, efeitos ruins e cartas
 * prontas na mão. Os pesos foram ajustados por treino contra ela mesma (scripts/balance/train_ai.ts → aiWeights.ts).
 *
 * DETERMINÍSTICA: só mexe em CÓPIAS da batalha (o sorteio da batalha real não anda) e o tempo de pensar é limitado
 * por número de simulações, nunca por relógio. Por isso refazer a partida (`verifyMatch`) dá o mesmo resultado.
 */
import { has } from './abilities';
import { getChar } from './characters';
import { Ctx, castSpell, deploy, deployCells, effectiveAtk, endRound, enemyOf, resolveSide, spellTargets, startTurn, unitAt, waitOf, BAD_EFFECTS } from './battle';
import { isSpell } from './spells';
import { AI_WEIGHTS, type AiWeights } from './aiWeights';
import type { BattleState, Side, Unit } from './types';

/** Coletor de eventos vazio: as simulações não precisam de animação (e ficam muito mais rápidas). */
class SilentCtx extends Ctx {
  emit() {}
}

/** Níveis da IA: 0 = simples (ai.ts); 1..3 = esperta, pensando mais turnos à frente e com mais opções por jogada. */
export const AI_LEVELS: Record<number, { plies: number; cells: number; steps: number; budget: number }> = {
  1: { plies: 1, cells: 4, steps: 4, budget: 30 },
  2: { plies: 3, cells: 6, steps: 5, budget: 50 },
  3: { plies: 5, cells: 6, steps: 6, budget: 60 },
};

type Action = { t: 'deploy' | 'cast'; i: number; r: number; c: number };

/** Cópia barata da batalha para simular (sem o histórico de texto e sem a gravação). */
export function cloneForSim(state: BattleState): BattleState {
  const { log: _log, record: _rec, ...rest } = state;
  const c = structuredClone(rest) as BattleState;
  c.log = [];
  return c;
}

const frac = (hp: number, max: number) => Math.max(0, hp) / Math.max(1, max);
const isKey = (u: Unit) => !!has(u.abilities, (a) => !!(a.healRow || a.allyAtkAura || a.guardian || a.necro || a.enemyAtkAura));

/** Valor de uma unidade no tabuleiro. */
function unitValue(state: BattleState, u: Unit, w: AiWeights): number {
  if (u.hp <= 0) return 0;
  let v = w.hp * u.hp + w.atk * effectiveAtk(state, u) + w.abil * u.abilities.length;
  if (isKey(u)) v += w.key * (1 + u.hp / Math.max(1, u.maxHp));
  if (u.isMinion) v *= 0.6;
  const bad = u.effects?.filter((e) => e.turns > 0 && BAD_EFFECTS.includes(e.kind)).length ?? 0;
  v -= w.eff * bad;
  return v;
}

/** Nota do estado do ponto de vista de `side` (maior = melhor para `side`). */
export function evaluate(state: BattleState, side: Side, w: AiWeights = AI_WEIGHTS): number {
  const foe = enemyOf(side);
  if (state.winner === side) return 1e6 - state.turn;
  if (state.winner === foe) return -1e6 + state.turn;
  const me = frac(state.heroes[side].hp, state.heroes[side].maxHp);
  const them = frac(state.heroes[foe].hp, state.heroes[foe].maxHp);
  // perigo: abaixo de 40% de vida cada ponto perdido pesa muito mais (a IA passa a defender)
  let score = w.hero * 100 * (me - them) - w.danger * 100 * Math.max(0, 0.4 - me) + w.danger * 50 * Math.max(0, 0.4 - them);
  const cols = state.cols;
  for (const u of state.units) {
    if (u.hp <= 0) continue;
    const val = unitValue(state, u, w);
    // avanço: 0 na própria base, 1 encostado no Comandante adversário
    const adv = u.side === 'player' ? u.col / (cols - 1) : (cols - 1 - u.col) / (cols - 1);
    const reach = w.adv * adv * effectiveAtk(state, u);
    if (u.side === side) score += val + reach;
    else score -= val + reach * w.threat * (1 + w.danger * Math.max(0, 0.5 - me));
  }
  const ready = (s: Side) => state.decks[s].hand.filter((h) => !waitOf(h)).length;
  score += w.hand * (ready(side) - ready(foe));
  return score;
}

/** Jogadas possíveis agora para `side` (cartas iguais contam uma vez; casas limitadas a `maxCells` por carta). */
export function candidates(state: BattleState, side: Side, maxCells: number): Action[] {
  const out: Action[] = [];
  const hand = state.decks[side].hand;
  const seen = new Set<string>();
  const cells = deployCells(state, side).filter(([r, c]) => !unitAt(state, r, c));
  // casas preferidas: as mais avançadas e as mais recuadas de cada fileira primeiro
  const front = side === 'player' ? (c: number) => -c : (c: number) => c;
  const ordered = cells.slice().sort((a, b) => front(a[1]) - front(b[1]) || a[0] - b[0]);
  const pickCells = (n: number) => {
    if (ordered.length <= n) return ordered;
    const res: [number, number][] = [];
    for (let k = 0; res.length < n && k < ordered.length; k++) {
      const idx = k % 2 === 0 ? k / 2 : ordered.length - 1 - (k - 1) / 2;
      if (!res.includes(ordered[idx])) res.push(ordered[idx]);
    }
    return res;
  };
  hand.forEach((h, i) => {
    if (waitOf(h)) return;
    const key = `${h.charId}|${h.stars}|${h.plus ?? 0}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (isSpell(h.charId)) {
      for (const [r, c] of spellTargets(state, side, h.charId).slice(0, 8)) out.push({ t: 'cast', i, r, c });
    } else {
      for (const [r, c] of pickCells(maxCells)) out.push({ t: 'deploy', i, r, c });
    }
  });
  return out;
}

function apply(state: BattleState, side: Side, a: Action, ctx: Ctx): boolean {
  const res = a.t === 'deploy' ? deploy(state, side, a.i, a.r, a.c, ctx) : castSpell(state, side, a.i, a.r, a.c, ctx);
  return res.ok;
}

/**
 * Deixa o motor rodar `plies` metades de turno a partir do momento em que `side` acabou de invocar: o lado age,
 * o turno passa e o adversário joga com a IA simples (`simple`), e assim por diante.
 */
function rollout(state: BattleState, side: Side, plies: number, simple: (s: BattleState, ctx: Ctx, side: Side) => void) {
  const ctx = new SilentCtx();
  let cur = side;
  for (let p = 0; p < plies && !state.winner; p++) {
    resolveSide(state, ctx, cur);
    if (state.winner) break;
    if (cur === 'enemy') {
      endRound(state, ctx);
      if (state.winner) break;
      state.turn++;
    }
    if (p === plies - 1) break;
    cur = enemyOf(cur);
    startTurn(state, ctx, cur);
    simple(state, ctx, cur);
  }
}

/** Contador de simulações feitas (para medir o custo do pensamento). */
export const AI_STATS = { rollouts: 0 };

/**
 * Turno da IA esperta para `side`: escolhe e faz as jogadas, uma por vez, enquanto alguma melhora a nota.
 * `simple` é a IA usada para prever as respostas (a do ai.ts).
 */
export function smartDeploy(state: BattleState, ctx: Ctx, side: Side, level: number, simple: (s: BattleState, ctx: Ctx, side: Side) => void, w: AiWeights = AI_WEIGHTS) {
  const cfg = AI_LEVELS[Math.min(3, Math.max(1, level))];
  const value = (s: BattleState) => {
    AI_STATS.rollouts++;
    rollout(s, side, cfg.plies, simple);
    return evaluate(s, side, w);
  };
  // limite de simulações por turno (o tempo de pensar não depende do relógio — fica igual ao refazer a partida)
  let left = cfg.budget;
  for (let step = 0; step < cfg.steps && !state.winner && left > 1; step++) {
    left--;
    const base = value(cloneForSim(state));
    let best: { a: Action; v: number } | null = null;
    for (const a of candidates(state, side, cfg.cells)) {
      if (left <= 0) break;
      left--;
      const sim = cloneForSim(state);
      if (!apply(sim, side, a, new SilentCtx())) continue;
      const v = value(sim);
      if (!best || v > best.v) best = { a, v };
    }
    // margem pequena: só joga se a jogada deixa a situação melhor do que parar aqui
    if (!best || best.v <= base + w.margin) break;
    if (!apply(state, side, best.a, ctx)) break;
  }
}

/** Nome curto do personagem (para relatórios do treino). */
export const charName = (id: string) => (isSpell(id) ? id : getChar(id).name);
