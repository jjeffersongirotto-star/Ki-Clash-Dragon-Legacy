import { TEMP_WAIT } from './tempOverrides'; // TEMP card balance editor
import { ABILITIES, MINION_CAP, RES_CAP, has } from './abilities';
import { getChar } from './characters';
import { statsFor, tierLabel, stepOf } from './progression';
import { DECK_ABS_MAX, createDeck, deckProblem, defeatCopy, drawOpening, drawStep, playFromHand, returnFromNecropolis, HAND_SIZE } from './deck';
import { getSpell, isSpell } from './spells';
import { nextRandom } from './rng';
import type {
  BattleEvent,
  BattleState,
  CardInstance,
  Effect,
  EffectKind,
  RecordedEvent,
  Side,
  Snapshot,
  Unit,
} from './types';

import { rangeOf, hasRangeBonus, pw, furyBonus, effectiveAtk, computeDamage, findTarget } from './battleRules';
import { leapLanding, moveUnit } from './battleMove';
import { CHARACTERS } from './characters';

export { rangeOf, hasRangeBonus, auraPenalty, FURY_START, FURY_EVERY, furyBonus, allyBuff, effectiveAtk, computeDamage, distanceToEnemyHero, findTarget } from './battleRules';
export { SALTO_MOVE, moveRange, leapLanding, moveUnit } from './battleMove';

export const ROWS = 2;
export const COLS = 10; // v0.36.0: arena 2 × 10 (antes 2 × 12)
export const DEPLOY_DEPTH = 3;
export const HAND_MAX = HAND_SIZE;
/**
 * v0.16.0: contagem de rodadas no lugar da energia. Cada carta que entra na mão espera
 * `2 × custo − 1` rodadas (custo 2 → 3, 3 → 5, 4 → 7, 5 → 9, 6 → 11; a gota mostra quantas faltam)
 * e só pode ser invocada quando chega a 0. Escolhido pela simulação das 10 fases
 * (espera = custo deixava as fases 4–6 e 10 muito difíceis: enxurrada de unidades caras).
 */
export const waitFor = (charId: string) => (TEMP_WAIT[charId] != null ? TEMP_WAIT[charId] : isSpell(charId) ? Math.max(1, getSpell(charId).cost - 1) : Math.max(1, 2 * getChar(charId).cost - 1));
/** A mão inicial começa 2 rodadas adiantada: cartas de custo 2 ficam prontas já no turno 1. */
export const OPENING_HEADSTART = 2;

export interface BattleSetup {
  playerDeck: CardInstance[];
  enemyDeck: CardInstance[];
  playerHeroHp: number;
  enemyHeroHp: number;
  seed?: number;
  rows?: number;
  cols?: number;
  maxTurns?: number;
  /** Fúria de batalha ligada (padrão: sim) */
  fury?: boolean;
  /** v0.33.0: tutorial — as cartas não esperam na mão (as dos dois lados ficam prontas na hora) */
  noWait?: boolean;
  /** v0.37.0: nível da IA inimiga (0 = simples; 1–3 = esperta) */
  aiLevel?: number;
}

/** Coletor de eventos: cada evento leva um retrato do estado para a UI animar. */
export class Ctx {
  events: RecordedEvent[] = [];
  emit(state: BattleState, ev: BattleEvent) {
    state.log.push(ev.text);
    this.events.push({ ...ev, snap: snapshot(state) } as RecordedEvent);
  }
}

export function snapshot(state: BattleState): Snapshot {
  return {
    units: state.units.map((u) => ({ ...u, abilities: u.abilities.slice(), effects: u.effects?.map((e) => ({ ...e })) })),
    heroes: { player: { ...state.heroes.player }, enemy: { ...state.heroes.enemy } },
    turn: state.turn,
    active: state.active,
  };
}

export const dir = (side: Side) => (side === 'player' ? 1 : -1);
export const enemyOf = (side: Side): Side => (side === 'player' ? 'enemy' : 'player');

/**
 * Cria a batalha. O baralho não pode ter entradas repetidas nem passar do máximo, e precisa de 1 personagem;
 * um baralho vazio só é aceito para cenários de teste (unidades colocadas à mão).
 * v0.33.0: o MÍNIMO de cartas é conferido pela tela (`deckIssue`, que conhece as cópias que o jogador tem —
 * v0.32.0); aqui o mínimo é 1, porque um personagem recém-ganho tem só 1 cópia.
 */
export function createBattle(setup: BattleSetup): BattleState {
  for (const [who, cards] of [['jogador', setup.playerDeck], ['inimigo', setup.enemyDeck]] as const) {
    const problem = cards.length ? deckProblem(cards, DECK_ABS_MAX, 1) : null;
    if (problem) throw new Error(`Baralho do ${who} inválido: ${problem}`);
  }
  const state: BattleState = {
    rows: setup.rows ?? ROWS,
    cols: setup.cols ?? COLS,
    turn: 1,
    active: 'player',
    heroes: {
      player: { hp: setup.playerHeroHp, maxHp: setup.playerHeroHp },
      enemy: { hp: setup.enemyHeroHp, maxHp: setup.enemyHeroHp },
    },
    units: [],
    decks: { player: createDeck([], { seed: 0 }), enemy: createDeck([], { seed: 0 }) },
    winner: null,
    nextUid: 1,
    seed: setup.seed ?? Math.floor(Math.random() * 1e9),
    maxTurns: setup.maxTurns ?? 40,
    fury: setup.fury ?? true,
    noWait: setup.noWait || undefined,
    aiLevel: setup.aiLevel || undefined,
    log: [],
    stats: { player: { cards: 0, spells: 0, kills: 0 }, enemy: { cards: 0, spells: 0, kills: 0 } },
  };
  // v0.18.0: grava a configuração com a semente INICIAL (o sorteio muda state.seed a cada uso)
  state.record = { version: 1, setup: JSON.parse(JSON.stringify({ ...setup, seed: state.seed })), actions: [] };
  state.decks.player = createDeck(setup.playerDeck, state);
  state.decks.enemy = createDeck(setup.enemyDeck, state);
  for (const side of ['player', 'enemy'] as const)
    for (const h of drawOpening(state.decks[side], state)) h.wait = state.noWait ? 0 : Math.max(0, waitFor(h.charId) - OPENING_HEADSTART);
  startTurn(state, new Ctx(), 'player');
  return state;
}

/**
 * Compra da rodada: quantas cartas faltarem para a mão voltar a ter 6 (tudo numa compra só).
 * Mão cheia: não compra e a fila não anda.
 */
export function refillCount(state: BattleState, side: Side): number {
  return Math.max(0, HAND_SIZE - state.decks[side].hand.length);
}
function drawCard(state: BattleState, side: Side) {
  for (const h of drawStep(state.decks[side], state, refillCount(state, side))) h.wait = state.noWait ? 0 : waitFor(h.charId);
}
/** Rodadas que faltam para a carta da mão poder ser invocada (0 = pronta). */
export const waitOf = (card: { charId: string; wait?: number }) => card.wait ?? 0;
/** Início do turno do lado: as cartas que já estavam na mão andam 1 rodada. */
function tickHand(state: BattleState, side: Side) {
  for (const h of state.decks[side].hand) h.wait = Math.max(0, waitOf(h) - 1);
}

export function startTurn(state: BattleState, ctx: Ctx, side: Side) {
  state.active = side;
  tickHand(state, side);
  drawCard(state, side);
  if (side === 'player' && state.fury && furyBonus(state.turn) > furyBonus(state.turn - 1))
    ctx.emit(state, { type: 'aura', uid: 0, text: `🔥 Fúria de batalha! Todas as unidades ganham +${furyBonus(state.turn)} de ataque.` });
  ctx.emit(state, {
    type: 'turn',
    side,
    turn: state.turn,
    text: `— Turno ${state.turn}: ${side === 'player' ? 'sua vez' : 'vez do inimigo'} (${state.decks[side].hand.filter((h) => !waitOf(h)).length} carta(s) pronta(s)) —`,
  });
}

// ---------- utilidades de grade ----------

export function unitAt(state: BattleState, row: number, col: number): Unit | undefined {
  return state.units.find((u) => u.hp > 0 && u.row === row && u.col === col);
}

export function inBoard(state: BattleState, row: number, col: number) {
  return row >= 0 && row < state.rows && col >= 0 && col < state.cols;
}

export function isDeployCell(state: BattleState, side: Side, row: number, col: number) {
  if (!inBoard(state, row, col)) return false;
  return side === 'player' ? col < DEPLOY_DEPTH : col >= state.cols - DEPLOY_DEPTH;
}

export function deployCells(state: BattleState, side: Side): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < state.rows; r++)
    for (let c = 0; c < state.cols; c++)
      if (isDeployCell(state, side, r, c) && !unitAt(state, r, c)) out.push([r, c]);
  return out;
}

// ---------- criação de unidades ----------

export function makeUnit(
  state: BattleState,
  card: CardInstance,
  side: Side,
  row: number,
  col: number,
  opts: { minion?: boolean; atk?: number; hp?: number } = {},
): Unit {
  const def = getChar(card.charId);
  const step = opts.minion ? 0 : stepOf(card);
  const s = statsFor(def, card.stars, step);
  const hp = opts.hp ?? s.hp;
  // v0.17.0 (decisão 14): resistência só vem de habilidade
  let physRes = 0;
  let magRes = 0;
  for (const id of def.abilities) {
    const rb = ABILITIES[id].resBonus?.(card.stars);
    if (rb) {
      physRes += rb.phys;
      magRes += rb.mag;
    }
  }
  return {
    uid: state.nextUid++,
    charId: def.id,
    side,
    row,
    col,
    atk: opts.atk ?? s.atk,
    maxHp: hp,
    hp,
    damageType: def.damageType,
    physRes: Math.min(RES_CAP, physRes),
    magRes: Math.min(RES_CAP, magRes),
    move: def.move,
    range: def.range,
    abilities: def.abilities.slice(),
    stars: card.stars,
    plus: step,
    isMinion: !!opts.minion,
    card: opts.minion ? undefined : { ...card },
  };
}

/** Coloca uma unidade diretamente (útil para testes e cenários). */
export function placeUnit(state: BattleState, card: CardInstance, side: Side, row: number, col: number, opts?: { minion?: boolean; atk?: number; hp?: number }): Unit {
  const u = makeUnit(state, card, side, row, col, opts);
  state.units.push(u);
  return u;
}

// ---------- regras de combate: alcance, ataque efetivo, dano e alvo (v0.28.1: em battleRules.ts) ----------

function isMeleeFrontAttack(att: Unit, target: Unit): boolean {
  if (att.damageType !== 'fisico' || hasRangeBonus(att)) return false;
  if (att.row !== target.row) return false;
  return (att.col - target.col) * dir(target.side) === 1;
}

export const nameOf = (u: Unit) => `${getChar(u.charId).name}${u.side === 'enemy' ? ' (inimigo)' : ''}`;

function checkWinner(state: BattleState, ctx: Ctx) {
  if (state.winner) return;
  if (state.heroes.enemy.hp <= 0) state.winner = 'player';
  else if (state.heroes.player.hp <= 0) state.winner = 'enemy';
  if (state.winner)
    ctx.emit(state, { type: 'end', winner: state.winner, text: state.winner === 'player' ? '🏆 Vitória! O Comandante inimigo caiu.' : '💀 Derrota... seu Comandante caiu.' });
}

export interface AttackOpts {
  /** multiplicador do ataque (contra-golpe) */
  mult?: number;
  /** é um contra-ataque (não gera outro contra) */
  counter?: boolean;
  /** bônus somado ao ataque */
  bonus?: number;
  /** porcentagem do ataque (golpes secundários) */
  pct?: number;
  /** ataque fixo (2ª flecha) */
  fixed?: number;
  /** golpe secundário: não aciona contra-golpe */
  secondary?: boolean;
  label?: string;
}

// ---------- v0.17.0: efeitos com duração, dano centralizado, salvamentos ----------

export const effectOf = (u: Unit, kind: EffectKind): Effect | undefined => u.effects?.find((e) => e.kind === kind && e.turns > 0);
export const isStunned = (u: Unit) => !!effectOf(u, 'atordoado');
const EFFECT_ICON: Record<EffectKind, string> = { veneno: '🧪', queimadura: '🔥', atordoado: '💫', escudo: '🛡', anjo: '👼', sangramento: '🩸', lento: '🐌', congelado: '❄️', maldicao: '🕯️', imune: '⏳' };
const EFFECT_NAME: Record<EffectKind, string> = {
  veneno: 'envenenado',
  queimadura: 'em chamas',
  atordoado: 'atordoado',
  escudo: 'com escudo',
  anjo: 'protegido pelo Anjo da Guarda',
  sangramento: 'sangrando',
  lento: 'lento',
  congelado: 'congelado',
  maldicao: 'amaldiçoado',
  imune: 'imune até o fim do turno',
};
/** v0.30.0: efeitos ruins (Purificar tira um deles; Evasão falha com congelado, atordoado ou lento). */
export const BAD_EFFECTS: EffectKind[] = ['atordoado', 'congelado', 'lento', 'maldicao', 'veneno', 'queimadura', 'sangramento'];
export const isHindered = (u: Unit) => !!(effectOf(u, 'atordoado') || effectOf(u, 'congelado') || effectOf(u, 'lento'));
/** v0.30.0: Evasão — desvia de ataques à distância e feitiços de 1 alvo, se não estiver preso. */
export const evades = (u: Unit) => u.abilities.includes('evasao') && !isHindered(u);
const roll = (state: BattleState, pct: number) => nextRandom(state) * 100 < pct;
const usedOf = (u: Unit) => (u.used ??= {});

/**
 * Aplica um efeito com duração. Veneno/queimadura: fica o mais forte e a duração maior (não acumula).
 * Escudo: soma os pontos (teto 99) e fica a duração maior. Atordoar/anjo: só renova.
 */
export function addEffect(state: BattleState, ctx: Ctx, u: Unit, kind: EffectKind, amount: number, turns: number, stackTo = 0) {
  if (u.hp <= 0) return;
  u.effects ??= [];
  const cur = u.effects.find((e) => e.kind === kind);
  if (cur) {
    cur.amount = kind === 'escudo' ? Math.min(99, cur.amount + amount) : stackTo ? Math.min(stackTo, cur.amount + amount) : Math.max(cur.amount, amount);
    cur.turns = Math.max(cur.turns, turns);
  } else u.effects.push({ kind, amount, turns });
  const extra =
    kind === 'veneno' || kind === 'queimadura' || kind === 'sangramento'
      ? ` (${amount}/rodada, ${turns} rodada${turns > 1 ? 's' : ''})`
      : kind === 'escudo'
        ? turns >= 99 ? ` (${amount})` : ` (${amount}, ${turns} rodadas)`
        : '';
  ctx.emit(state, { type: 'effect', uid: u.uid, kind, text: `  ${EFFECT_ICON[kind]} ${nameOf(u)} fica ${EFFECT_NAME[kind]}${extra}.` });
}

function dropExpired(u: Unit) {
  if (u.effects) u.effects = u.effects.filter((e) => e.turns > 0 && (e.kind !== 'escudo' || e.amount > 0));
}

/** Início do lado: veneno (ignora resistência) e queimadura (reduzida pela resistência mágica) fazem dano. */
function tickDots(state: BattleState, ctx: Ctx, side: Side) {
  for (const u of state.units.filter((x) => x.side === side && x.hp > 0)) {
    for (const kind of ['veneno', 'queimadura', 'sangramento'] as const) {
      const e = effectOf(u, kind);
      if (!e || state.winner || u.hp <= 0) continue;
      const dmg = kind === 'queimadura' ? computeDamage(e.amount, 'magico', u) : e.amount;
      e.turns--;
      ctx.emit(state, { type: 'effect', uid: u.uid, kind, text: `${EFFECT_ICON[kind]} ${nameOf(u)} sofre ${dmg} de ${kind}.` });
      applyDamage(state, ctx, u, dmg, kind === 'queimadura' ? 'magico' : 'fisico', { side: enemyOf(side), dot: true });
    }
    dropExpired(u);
  }
}

/**
 * Fim do lado: o atordoar das unidades desse lado perde 1 rodada; o escudo temporário perde 1 rodada
 * no fim do turno do ADVERSÁRIO (v0.17.1: escudo de 2 rodadas protege contra 2 turnos inimigos).
 */
function tickEnd(state: BattleState, ctx: Ctx, side: Side) {
  for (const u of state.units) {
    for (const e of u.effects ?? []) {
      if ((e.kind === 'atordoado' || e.kind === 'congelado' || e.kind === 'maldicao') && u.side === side) e.turns--;
      // v0.30.0: Lentidão — perde o ataque no 1º turno lento (amount 1) e ataca no 2º (amount 0)
      if (e.kind === 'lento' && u.side === side) {
        e.turns--;
        e.amount = 0;
      }
      if ((e.kind === 'escudo' || e.kind === 'imune') && u.side !== side) e.turns--;
    }
    dropExpired(u);
    // v0.30.0: Regeneração no fim do turno do próprio lado
    const reg = u.side === side && u.hp > 0 ? pw(u, 'regeneracao') : 0;
    if (reg && u.hp < u.maxHp) {
      const h = Math.min(reg, u.maxHp - u.hp);
      u.hp += h;
      ctx.emit(state, { type: 'heal', uid: u.uid, amount: h, text: `💗 ${nameOf(u)} regenera ${h} de vida.` });
    }
  }
}

export interface DamageSource {
  side: Side;
  unit?: Unit;
  spell?: boolean;
  dot?: boolean;
  /** v0.30.0: Perfurar — ignora escudos */
  ignoreShield?: boolean;
  /** v0.30.0: já é a parte desviada pelo Protetor (não desvia de novo) */
  noProtect?: boolean;
}

/**
 * Aplica dano numa unidade: escudo temporário absorve primeiro; Reflexo de Magia devolve parte do dano mágico
 * ou de feitiço (só se ela continuar de pé); depois confere morte (Anjo da Guarda e Renascer salvam). Retorna true se a unidade caiu.
 */
export function applyDamage(state: BattleState, ctx: Ctx, target: Unit, dmg: number, type: 'fisico' | 'magico', src: DamageSource, note = ''): boolean {
  let amount = Math.max(0, dmg);
  // v0.30.0: Vontade Inquebrável — imune até o fim do turno inimigo
  if (amount > 0 && effectOf(target, 'imune')) {
    ctx.emit(state, { type: 'damage', uid: target.uid, amount: 0, damageType: type, text: `  ⏳ ${nameOf(target)} está imune: 0 de dano.` });
    return false;
  }
  // v0.30.0: Maldição — +25% de dano de todas as fontes
  if (amount > 0 && effectOf(target, 'maldicao')) amount = Math.round(amount * 1.25);
  // v0.30.0: Protetor — um aliado vizinho com Protetor recebe parte do dano (não em dano contínuo)
  if (amount > 0 && !src.dot && !src.noProtect) {
    const guard = state.units
      .filter((a) => a !== target && a.side === target.side && a.hp > 0 && a.abilities.includes('protetor') && Math.abs(a.row - target.row) <= 1 && Math.abs(a.col - target.col) <= 1)
      .sort((a, b) => a.uid - b.uid)[0];
    const share = guard ? Math.floor((amount * pw(guard, 'protetor')) / 100) : 0;
    if (guard && share > 0) {
      amount -= share;
      applyDamage(state, ctx, guard, share, type, { ...src, noProtect: true }, ` 🛡️ (${nameOf(guard)} protege ${nameOf(target)})`);
    }
  }
  // Reflexo de Magia (só contra dano mágico de ataque ou de feitiço; não reflete veneno/queimadura)
  const refl = !src.dot && (type === 'magico' || src.spell) ? pw(target, 'reflexo') : 0;
  let reflected = 0;
  if (refl && amount > 0) {
    reflected = Math.floor((amount * refl) / 100);
    amount -= reflected;
  }
  const sh = src.ignoreShield ? undefined : effectOf(target, 'escudo');
  let absorbed = 0;
  if (sh && amount > 0) {
    absorbed = Math.min(sh.amount, amount);
    sh.amount -= absorbed;
    amount -= absorbed;
    dropExpired(target);
  }
  target.hp -= amount;
  if (!src.dot || absorbed)
    ctx.emit(state, {
      type: 'damage',
      uid: target.uid,
      amount,
      damageType: type,
      text: `  → ${amount} de dano ${type === 'fisico' ? 'físico' : 'mágico'}${note}${absorbed ? ` (🛡 escudo absorve ${absorbed})` : ''}.`,
    });
  else ctx.emit(state, { type: 'damage', uid: target.uid, amount, damageType: type, text: `  → ${amount} de dano.` });
  const dead = target.hp <= 0 ? checkDeath(state, ctx, target, src.unit) : false;
  // v0.30.0: Couraça Adaptativa — cada golpe físico recebido cura 1 e soma +1 de resistência física (até 3)
  if (!dead && type === 'fisico' && !src.dot && target.abilities.includes('couracaAdaptativa') && target.hp > 0) {
    target.physRes = Math.min(RES_CAP, target.physRes + 1);
    if (target.hp < target.maxHp) target.hp += 1;
    ctx.emit(state, { type: 'effect', uid: target.uid, kind: 'habilidade', text: `  🛡️ ${nameOf(target)} se adapta: resistência física ${target.physRes}.` });
  }
  // v0.20.1: só reflete quem continua de pé (derrotada, a Nyx não devolve dano; salva pelo Anjo/Renascer, devolve)
  if (reflected > 0 && !dead) {
    ctx.emit(state, { type: 'effect', uid: target.uid, kind: 'reflexo', text: `  🪞 ${nameOf(target)} reflete ${reflected} de dano mágico!` });
    if (src.unit && !src.spell && src.unit.hp > 0 && state.units.includes(src.unit)) applyDamage(state, ctx, src.unit, reflected, 'magico', { side: target.side, unit: target, dot: false, spell: false });
    else if (src.spell) hitHero(state, ctx, src.side, reflected, `🪞 O reflexo atinge o Comandante ${src.side === 'player' ? 'aliado' : 'inimigo'}`);
  }
  return dead;
}

function hitHero(state: BattleState, ctx: Ctx, side: Side, amount: number, why: string) {
  if (state.winner) return;
  state.heroes[side].hp = Math.max(0, state.heroes[side].hp - amount);
  ctx.emit(state, { type: 'hero', side, amount, text: `${why}: ${amount} de dano (${state.heroes[side].hp}/${state.heroes[side].maxHp}).` });
  checkWinner(state, ctx);
  retaliate(state, ctx, side, amount);
}

/** v0.30.0: Protocolo de Retaliação — o Comandante do lado `side` sofreu dano: o inimigo mais próximo dele sofre o mesmo (até 5). */
function retaliate(state: BattleState, ctx: Ctx, side: Side, amount: number) {
  if (state.winner || amount <= 0) return;
  const guard = state.units.find((a) => a.side === side && a.hp > 0 && a.abilities.includes('retaliacao'));
  if (!guard) return;
  const foes = state.units.filter((e) => e.side !== side && e.hp > 0);
  if (!foes.length) return;
  // o Comandante fica atrás da coluna 0 (jogador) ou da última coluna (inimigo)
  const near = foes.sort((a, b) => (side === 'player' ? a.col - b.col : b.col - a.col) || a.row - b.row)[0];
  ctx.emit(state, { type: 'effect', uid: guard.uid, kind: 'habilidade', text: `⚖️ ${nameOf(guard)} ativa o Protocolo de Retaliação contra ${nameOf(near)}!` });
  applyDamage(state, ctx, near, Math.min(pw(guard, 'retaliacao'), amount), 'fisico', { side, unit: guard }, ' ⚖️');
}

/** A unidade chegou a 0: Anjo da Guarda (efeito do feitiço, depois a habilidade de um vizinho) e Renascer salvam. */
function checkDeath(state: BattleState, ctx: Ctx, victim: Unit, killer?: Unit): boolean {
  if (victim.hp > 0) return false;
  const shield = effectOf(victim, 'anjo');
  if (shield) {
    shield.turns = 0;
    dropExpired(victim);
    victim.hp = 1;
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'anjo', text: `  👼 O Anjo da Guarda salva ${nameOf(victim)} (fica com 1 de vida)!` });
    return false;
  }
  const angel = state.units.find((a) => a.side === victim.side && (a.hp > 0 || a === victim) && !a.angelUsed && a.abilities.includes('anjo') && Math.abs(a.row - victim.row) <= 1 && Math.abs(a.col - victim.col) <= 1);
  if (angel) {
    angel.angelUsed = true;
    victim.hp = 1;
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'anjo', text: angel === victim ? `  👼 ${nameOf(angel)} (Anjo da Guarda) se salva: fica com 1 de vida!` : `  👼 ${nameOf(angel)} (Anjo da Guarda) salva ${nameOf(victim)}: fica com 1 de vida!` });
    return false;
  }
  // v0.30.0: Vontade Inquebrável — fica com 1 de vida e imune até o fim do turno inimigo (uma vez)
  if (victim.abilities.includes('ultimaResistencia') && !victim.used?.lastStand) {
    usedOf(victim).lastStand = true;
    victim.hp = 1;
    victim.effects ??= [];
    victim.effects.push({ kind: 'imune', amount: 1, turns: 1 });
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'imune', text: `  ⏳ ${nameOf(victim)} se recusa a cair (Vontade Inquebrável): fica com 1 de vida e imune até o fim do turno!` });
    return false;
  }
  if (victim.abilities.includes('renascer') && !victim.revived && !victim.isMinion) {
    victim.revived = true;
    victim.effects = [];
    victim.hp = Math.max(1, Math.ceil((victim.maxHp * pw(victim, 'renascer')) / 100));
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'renascer', text: `  ♻ ${nameOf(victim)} renasce com ${victim.hp} de vida!` });
    return false;
  }
  kill(state, ctx, victim, killer);
  return true;
}

/** Empurra a unidade 1 casa para trás (do ponto de vista dela), se a casa estiver livre e ela não for Inabalável. */
export function pushBack(state: BattleState, ctx: Ctx, u: Unit): boolean {
  if (u.hp <= 0 || has(u.abilities, (a) => a.unpushable)) return false;
  const newCol = u.col - dir(u.side);
  if (!inBoard(state, u.row, newCol) || unitAt(state, u.row, newCol)) return false;
  const from: [number, number] = [u.row, u.col];
  u.col = newCol;
  ctx.emit(state, { type: 'push', uid: u.uid, from, to: [u.row, u.col], text: `  ${nameOf(u)} é empurrado para trás.` });
  return true;
}

export function attack(state: BattleState, ctx: Ctx, u: Unit, target: Unit | 'hero', opts: AttackOpts = {}) {
  let atk = opts.fixed ?? Math.round(effectiveAtk(state, u) * (opts.mult ?? 1)) + (opts.bonus ?? 0);
  if (opts.pct != null && opts.fixed == null) atk = Math.max(1, Math.ceil((atk * opts.pct) / 100));
  const verb = opts.label ?? (opts.counter ? 'contra-ataca' : 'ataca');
  if (target === 'hero') {
    if (!opts.counter && !opts.secondary) atk += pw(u, 'mare');
    const side = enemyOf(u.side);
    ctx.emit(state, { type: 'attack', uid: u.uid, target: 'hero', targetSide: side, ranged: true, damageType: u.damageType, text: `${nameOf(u)} ${verb} o Comandante ${side === 'enemy' ? 'inimigo' : 'aliado'}!` });
    state.heroes[side].hp = Math.max(0, state.heroes[side].hp - atk);
    ctx.emit(state, { type: 'hero', side, amount: atk, text: `Comandante ${side === 'enemy' ? 'inimigo' : 'aliado'} sofre ${atk} de dano (${state.heroes[side].hp}/${state.heroes[side].maxHp}).` });
    checkWinner(state, ctx);
    retaliate(state, ctx, side, atk);
    return;
  }
  // execução (Instinto Predador)
  if (!opts.counter && u.abilities.includes('menorVida') && target.hp * 2 <= target.maxHp) atk += pw(u, 'menorVida');
  const dist = Math.max(Math.abs(target.col - u.col), Math.abs(target.row - u.row));
  if (!opts.counter && !opts.secondary && opts.fixed == null) {
    // Olho de Águia (2+ casas), Caça-Conjuradores (alvo de longo alcance), Ataque Surpresa (vida cheia)
    if (dist >= 2) atk += pw(u, 'olhoAguia');
    if (hasRangeBonus(target)) atk += pw(u, 'cacaMagos');
    if (target.hp >= target.maxHp) atk += pw(u, 'surpresa');
  }
  // v0.30.0: Golpe pelas Costas (+1 em quem está atrás, na mesma fileira) e Golpe Crítico (dobro)
  const behind = target.row === u.row && (target.col - u.col) * dir(u.side) < 0;
  if (!opts.counter && behind) atk += pw(u, 'ataqueCostas');
  let crit = false;
  if (!opts.counter && !opts.secondary && opts.fixed == null && u.abilities.includes('critico') && roll(state, pw(u, 'critico'))) {
    atk *= 2;
    crit = true;
  }
  const piercing = u.abilities.includes('perfurar');
  const pierce = piercing ? 99 : pw(u, 'retaguarda') + pw(u, 'precisao');
  const ranged = !(u.damageType === 'fisico' && dist <= 1 && !hasRangeBonus(u));
  const dmg = computeDamage(atk, u.damageType, target, pierce);
  ctx.emit(state, { type: 'attack', uid: u.uid, target: target.uid, targetSide: target.side, ranged, damageType: u.damageType, text: `${nameOf(u)} ${verb} ${nameOf(target)}${crit ? ' — 🎯 CRÍTICO!' : ''}` });
  // v0.30.0: Evasão — desvia de ataques à distância
  if (ranged && evades(target)) {
    ctx.emit(state, { type: 'effect', uid: target.uid, kind: 'habilidade', text: `  💨 ${nameOf(target)} desvia do ataque à distância!` });
    return;
  }
  const resisted = atk - dmg;
  const front = isMeleeFrontAttack(u, target);
  const hpBefore = target.hp;
  const died = applyDamage(state, ctx, target, dmg, u.damageType, { side: u.side, unit: u, ignoreShield: piercing }, resisted > 0 ? ` (${resisted} resistido)` : '');
  // v0.30.0: Vampirismo — cura parte do dano causado
  const vamp = pw(u, 'vampirismo');
  if (vamp && u.hp > 0 && u.hp < u.maxHp && state.units.includes(u)) {
    const dealt = Math.min(dmg, Math.max(0, hpBefore));
    const h = Math.min(u.maxHp - u.hp, Math.max(dealt >= 2 ? 1 : 0, Math.round((dealt * vamp) / 100)));
    if (h > 0) {
      u.hp += h;
      ctx.emit(state, { type: 'heal', uid: u.uid, amount: h, text: `  🧛 ${nameOf(u)} drena ${h} de vida.` });
    }
  }
  if (died) return;
  if (state.winner || u.hp <= 0 || !state.units.includes(u)) return;
  if (!opts.counter && target.hp > 0 && state.units.includes(target)) onHit(state, ctx, u, target, !!opts.secondary);
  if (state.winner || u.hp <= 0 || !state.units.includes(u) || target.hp <= 0 || !state.units.includes(target)) return;
  // gancho: Couraça de Espinhos (só golpe principal, físico corpo a corpo de frente)
  if (!opts.counter && !opts.secondary && has(target.abilities, (a) => a.thorns) && front) {
    const back = pw(target, 'espinhos');
    if (applyDamage(state, ctx, u, back, 'fisico', { side: target.side, unit: target }, ` 🌵 dos espinhos de ${nameOf(target)} em ${nameOf(u)}`)) return;
  }
  // gancho: contra-golpe
  if (!opts.counter && !opts.secondary && u.hp > 0 && has(target.abilities, (a) => a.counter) && front) {
    ctx.emit(state, { type: 'counter', uid: target.uid, target: u.uid, text: `🔁 ${nameOf(target)} ativa ${ABILITIES.contraGolpe.name}!` });
    attack(state, ctx, target, u, { mult: pw(target, 'contraGolpe'), counter: true });
    if (u.hp > 0 && state.units.includes(u)) pushBack(state, ctx, u);
    return;
  }
  // v0.17.0 gancho: Ombrada (Gorath) — empurra o alvo ao acertar corpo a corpo de frente
  if (!opts.counter && !opts.secondary && front && has(u.abilities, (a) => a.pushOnHit) && target.hp > 0 && state.units.includes(target)) pushBack(state, ctx, target);
}

/** Habilidades que o Copiador não copia: as das cartas que começam no Mítico. */
let MYTHIC_ONLY: Set<string> | null = null;
const mythicOnly = () => (MYTHIC_ONLY ??= new Set(CHARACTERS.filter((c) => c.minStars >= 6).flatMap((c) => c.abilities)));

/** v0.30.0: efeitos ao acertar uma unidade (o alvo continua de pé). Golpes secundários só aplicam os efeitos de dano contínuo. */
function onHit(state: BattleState, ctx: Ctx, u: Unit, t: Unit, secondary: boolean) {
  if (u.abilities.includes('veneno')) addEffect(state, ctx, t, 'veneno', pw(u, 'veneno'), 3);
  if (u.abilities.includes('sangramento') && u.damageType === 'fisico') addEffect(state, ctx, t, 'sangramento', 1, 3);
  if (u.abilities.includes('queimadura')) addEffect(state, ctx, t, 'queimadura', 1, pw(u, 'queimadura'), 2);
  if (secondary) return;
  if (u.abilities.includes('maldicao')) addEffect(state, ctx, t, 'maldicao', 25, 2);
  if (u.abilities.includes('lentidao')) addEffect(state, ctx, t, 'lento', 1, 2);
  const tu = usedOf(t);
  if (u.abilities.includes('congelar') && (tu.frozenTurn == null || tu.frozenTurn < state.turn - 1) && roll(state, 50)) {
    tu.frozenTurn = state.turn;
    addEffect(state, ctx, t, 'congelado', 1, 1);
  }
  if (u.abilities.includes('atordoar') && (tu.stunTurn == null || tu.stunTurn < state.turn - 1) && roll(state, 50)) {
    tu.stunTurn = state.turn;
    addEffect(state, ctx, t, 'atordoado', 1, 1);
  }
  // Domínio Enfraquecedor: cada golpe tira 1 de ataque do alvo (até −3 por alvo)
  if (u.abilities.includes('dominio') && (tu.drained ?? 0) < 3) {
    tu.drained = (tu.drained ?? 0) + 1;
    t.atkMod = (t.atkMod ?? 0) - 1;
    ctx.emit(state, { type: 'effect', uid: t.uid, kind: 'habilidade', text: `  🌀 ${nameOf(t)} perde 1 de ataque.` });
  }
  // Copiador: no primeiro golpe, copia a 1ª habilidade do alvo
  const uu = usedOf(u);
  if (u.abilities.includes('copiador') && !uu.copied) {
    uu.copied = true;
    const copy = t.abilities.find((a) => !u.abilities.includes(a) && !mythicOnly().has(a));
    if (copy) {
      u.abilities.push(copy);
      ctx.emit(state, { type: 'effect', uid: u.uid, kind: 'habilidade', text: `  🪞 ${nameOf(u)} copia ${ABILITIES[copy].name} de ${nameOf(t)}!` });
    }
  }
  // Selo do Vazio: golpe físico tira todas as habilidades do alvo
  if (u.abilities.includes('anular') && u.damageType === 'fisico' && t.abilities.length) {
    t.abilities = [];
    t.physRes = 0;
    t.magRes = 0;
    ctx.emit(state, { type: 'effect', uid: t.uid, kind: 'habilidade', text: `  🚫 ${nameOf(t)} perde todas as habilidades (Selo do Vazio)!` });
  }
  // Sede Eterna / Marca da Sede: drena vida extra
  const drain = pw(u, 'sedeEterna') || pw(u, 'marcaSede');
  if (drain) {
    const real = Math.min(drain, t.hp);
    applyDamage(state, ctx, t, drain, 'magico', { side: u.side, unit: u }, ' 🧛 (sede)');
    if (u.hp > 0 && u.hp < u.maxHp && real > 0) {
      const h = Math.min(real, u.maxHp - u.hp);
      u.hp += h;
      ctx.emit(state, { type: 'heal', uid: u.uid, amount: h, text: `  🧛 ${nameOf(u)} se cura em ${h}.` });
    }
  }
  // Execução: derrota na hora quem ficar com 25% da vida ou menos
  if (u.abilities.includes('execucao') && t.hp > 0 && state.units.includes(t) && t.hp * 4 <= t.maxHp) {
    ctx.emit(state, { type: 'effect', uid: t.uid, kind: 'habilidade', text: `  ☠️ ${nameOf(u)} executa ${nameOf(t)}!` });
    t.hp = 0;
    checkDeath(state, ctx, t, u);
  }
}

function kill(state: BattleState, ctx: Ctx, victim: Unit, killer?: Unit) {
  victim.hp = 0;
  state.units = state.units.filter((x) => x !== victim);
  if (victim.slot != null) defeatCopy(state.decks[victim.side], victim.slot);
  // v0.28.0: personagem derrotado conta para o outro lado (a Cria Sombria não conta)
  const st = state.stats?.[enemyOf(victim.side)];
  if (st && !victim.isMinion) st.kills++;
  ctx.emit(state, { type: 'death', uid: victim.uid, text: `✖ ${nameOf(victim)} foi derrotado.` });
  // v0.30.0: Ressurreição guarda as cartas derrotadas; Fúria e Vingança somam ataque; Explosão ao morrer
  if (!victim.isMinion && victim.card) ((state.fallen ??= { player: [], enemy: [] })[victim.side] ??= []).push({ ...victim.card });
  for (const a of state.units) {
    if (a.hp <= 0) continue;
    const au = a.side !== victim.side && !victim.isMinion && a.abilities.includes('furia') ? usedOf(a) : null;
    if (au && (au.furia ?? 0) < pw(a, 'furia')) {
      au.furia = (au.furia ?? 0) + 1;
      a.atkMod = (a.atkMod ?? 0) + 1;
      ctx.emit(state, { type: 'effect', uid: a.uid, kind: 'habilidade', text: `  📈 Fúria: ${nameOf(a)} ganha +1 de ataque.` });
    }
    const av = a.side === victim.side && !victim.isMinion && a.abilities.includes('vinganca') ? usedOf(a) : null;
    if (av && (av.vinganca ?? 0) < pw(a, 'vinganca')) {
      av.vinganca = (av.vinganca ?? 0) + 1;
      a.atkMod = (a.atkMod ?? 0) + 1;
      ctx.emit(state, { type: 'effect', uid: a.uid, kind: 'habilidade', text: `  🕯️ Vingança: ${nameOf(a)} ganha +1 de ataque.` });
    }
  }
  const boom = pw(victim, 'explosao');
  if (boom) {
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'habilidade', text: `💥 ${nameOf(victim)} explode!` });
    for (const e of state.units.filter((e) => e.side !== victim.side && e.hp > 0 && Math.abs(e.row - victim.row) <= 1 && Math.abs(e.col - victim.col) <= 1)) {
      if (state.winner) break;
      applyDamage(state, ctx, e, boom, 'fisico', { side: victim.side }, ' 💥');
    }
  }
  if (!killer) return;
  // Sede Eterna: passa a Marca da Sede ao aliado mais próximo
  if (killer.side !== victim.side && killer.abilities.includes('sedeEterna') && killer.hp > 0) {
    const ally = state.units
      .filter((a) => a !== killer && a.side === killer.side && a.hp > 0 && !a.abilities.includes('sedeEterna') && !a.abilities.includes('marcaSede'))
      .sort((a, b) => Math.abs(a.col - killer.col) + Math.abs(a.row - killer.row) - (Math.abs(b.col - killer.col) + Math.abs(b.row - killer.row)) || a.uid - b.uid)[0];
    if (ally) {
      ally.abilities.push('marcaSede');
      ctx.emit(state, { type: 'effect', uid: ally.uid, kind: 'habilidade', text: `  🩸 ${nameOf(ally)} recebe a Marca da Sede!` });
    }
  }
  // v0.15.0: sem "passo da vitória" — quem derrota fica onde está.
  const oldPos: [number, number] = [killer.row, killer.col];
  // gancho: invocar ao derrotar
  const summon = has(killer.abilities, (a) => a.onKillSummon)?.onKillSummon;
  if (summon && killer.side !== victim.side) {
    const alive = state.units.filter((x) => x.side === killer.side && x.charId === summon).length;
    if (alive < MINION_CAP) {
      const spot = [[victim.row, victim.col], oldPos].find(([r, c]) => inBoard(state, r, c) && !unitAt(state, r, c));
      if (spot) {
        const atk = criaAtk(killer.stars);
        const hp = pw(killer, 'prole') || 1;
        const m = placeUnit(state, { charId: summon, stars: killer.stars, plus: killer.plus }, killer.side, spot[0], spot[1], { minion: true, atk, hp });
        ctx.emit(state, { type: 'spawn', uid: m.uid, text: `🥚 Uma ${getChar(summon).name} surge dos restos!` });
      }
    }
  }
}

/** Ataque da Cria Sombria: 2 com o Vorax Lendário (ou menos), 3 com o Vorax Mítico (o "+" não muda a Cria). */
export function criaAtk(stars: number): number {
  return stars >= 6 ? 3 : 2;
}

// ---------- movimento (v0.28.1: em battleMove.ts) ----------

/** Bênção do Lótus (v0.15.1): cura só os 2 aliados vizinhos mais feridos (mais vida perdida; empate: menos vida, depois quem entrou antes). */
export const LOTUS_TARGETS = 2;
function healNeighbors(state: BattleState, ctx: Ctx, u: Unit) {
  const amount = pw(u, 'lotus');
  if (!amount) return;
  const hurt = state.units
    .filter((a) => a !== u && a.side === u.side && a.hp > 0 && a.hp < a.maxHp && Math.abs(a.row - u.row) <= 1 && Math.abs(a.col - u.col) <= 1)
    .sort((a, b) => b.maxHp - b.hp - (a.maxHp - a.hp) || a.hp - b.hp || a.uid - b.uid)
    .slice(0, LOTUS_TARGETS);
  for (const a of hurt) {
    const h = Math.min(amount, a.maxHp - a.hp);
    a.hp += h;
    ctx.emit(state, { type: 'heal', uid: a.uid, amount: h, text: `✚ ${nameOf(u)} cura ${nameOf(a)} em ${h}.` });
  }
}

/** Sopro Restaurador: cura o aliado mais ferido da própria fileira. */
function healRow(state: BattleState, ctx: Ctx, u: Unit) {
  const amount = pw(u, 'sopro');
  if (!amount) return;
  const hurt = state.units
    .filter((a) => a !== u && a.side === u.side && a.hp > 0 && a.row === u.row && a.hp < a.maxHp)
    .sort((a, b) => b.maxHp - b.hp - (a.maxHp - a.hp) || a.hp - b.hp)[0];
  if (!hurt) return;
  const h = Math.min(amount, hurt.maxHp - hurt.hp);
  hurt.hp += h;
  ctx.emit(state, { type: 'heal', uid: hurt.uid, amount: h, text: `🍃 ${nameOf(u)} cura ${nameOf(hurt)} em ${h}.` });
}

/** Golpe completo de uma unidade: alvo principal + efeitos de habilidade. */
function strike(state: BattleState, ctx: Ctx, u: Unit, t: Unit | 'hero', bonus = 0) {
  if (t === 'hero') {
    attack(state, ctx, u, 'hero', { bonus });
    return;
  }
  const d = dir(u.side);
  const tRow = t.row;
  const tCol = t.col;
  attack(state, ctx, u, t, { bonus });
  if (state.winner || u.hp <= 0) return;
  // Corte Diagonal: ao bater em frente, também corta a diagonal
  const cleave = pw(u, 'diagFrente');
  if (cleave && tRow === u.row) {
    for (const e of state.units.filter((e) => e.side !== u.side && e.hp > 0 && Math.abs(e.row - u.row) === 1 && (e.col - u.col) * d === 1)) {
      attack(state, ctx, u, e, { pct: cleave, secondary: true, label: 'corta na diagonal' });
      if (state.winner || u.hp <= 0) return;
    }
  }
  // Feixe Perfurante: atinge os que estão atrás do alvo, na mesma fileira e no alcance
  if (u.abilities.includes('perfurante')) {
    const pct = pw(u, 'perfurante');
    const r = rangeOf(u);
    const behind = state.units.filter((e) => e.side !== u.side && e.hp > 0 && e.row === tRow && (e.col - tCol) * d > 0 && (e.col - u.col) * d <= r);
    for (const e of behind) {
      attack(state, ctx, u, e, { pct, secondary: true, label: 'atravessa e atinge' });
      if (state.winner || u.hp <= 0) return;
    }
  }
  // Explosão de Brasas: atinge o inimigo da mesma coluna na outra fileira
  const splash = pw(u, 'brasa');
  if (splash) {
    for (const e of state.units.filter((e) => e.side !== u.side && e.hp > 0 && e.col === tCol && e.row !== tRow)) {
      attack(state, ctx, u, e, { fixed: splash, secondary: true, label: 'explode em' });
      if (state.winner || u.hp <= 0) return;
    }
  }
  // Flecha Dupla
  const second = pw(u, 'flechaDupla');
  if (second && t.hp > 0 && state.units.includes(t)) attack(state, ctx, u, t, { fixed: second, secondary: true, label: 'dispara a 2ª flecha em' });
  if (state.winner || u.hp <= 0) return;
  // v0.30.0: Raio em Cadeia — salta para até 2 inimigos vizinhos (60% e 30%)
  if (u.abilities.includes('raioCadeia')) {
    const hit = new Set<number>([t.uid]);
    let at: [number, number] = [tRow, tCol];
    for (const pct of [60, 30]) {
      const next = state.units
        .filter((e) => e.side !== u.side && e.hp > 0 && !hit.has(e.uid) && Math.abs(e.row - at[0]) <= 1 && Math.abs(e.col - at[1]) <= 1)
        .sort((a, b) => Math.abs(a.col - at[1]) - Math.abs(b.col - at[1]) || a.uid - b.uid)[0];
      if (!next) break;
      hit.add(next.uid);
      at = [next.row, next.col];
      attack(state, ctx, u, next, { pct, secondary: true, label: '⚡ o raio salta para' });
      if (state.winner || u.hp <= 0) return;
    }
  }
}

/** v0.30.0: casa livre mais próxima de (row, col) — mesma coluna/fileira primeiro, depois as vizinhas. */
function nearestFree(state: BattleState, row: number, col: number, maxDist = state.cols): [number, number] | null {
  for (let d = 0; d <= maxDist; d++)
    for (const c of d ? [col - d, col + d] : [col])
      for (const r of [row, 1 - row])
        if (r >= 0 && r < state.rows && inBoard(state, r, c) && !unitAt(state, r, c)) return [r, c];
  return null;
}

/** v0.30.0: Purificar — tira um efeito ruim do aliado vizinho (ou dele mesmo) mais afetado. */
function purify(state: BattleState, ctx: Ctx, u: Unit) {
  const bad = (a: Unit) => (a.effects ?? []).filter((e) => e.turns > 0 && BAD_EFFECTS.includes(e.kind)).length;
  const who = state.units
    .filter((a) => a.side === u.side && a.hp > 0 && Math.abs(a.row - u.row) <= 1 && Math.abs(a.col - u.col) <= 1 && bad(a))
    .sort((a, b) => bad(b) - bad(a) || a.uid - b.uid)[0];
  if (!who) return;
  const e = BAD_EFFECTS.map((k) => effectOf(who, k)).find(Boolean)!;
  e.turns = 0;
  dropExpired(who);
  ctx.emit(state, { type: 'effect', uid: who.uid, kind: 'habilidade', text: `🌿 ${nameOf(u)} purifica ${nameOf(who)} (${EFFECT_NAME[e.kind]} some).` });
}

/** v0.30.0: Ressurreição — traz o último aliado derrotado com 50% da vida (rodada 3 em diante, 1 vez a cada 10 rodadas). */
function resurrect(state: BattleState, ctx: Ctx, u: Unit) {
  const uu = usedOf(u);
  if (state.turn < 3 || (uu.resTurn != null && state.turn - uu.resTurn < 10)) return;
  const list = state.fallen?.[u.side];
  if (!list?.length) return;
  const spot = nearestFree(state, u.row, u.col);
  if (!spot) return;
  const card = list.pop()!;
  uu.resTurn = state.turn;
  const r = placeUnit(state, card, u.side, spot[0], spot[1]);
  r.hp = Math.max(1, Math.ceil((r.maxHp * pw(u, 'ressurreicao')) / 100));
  ctx.emit(state, { type: 'spawn', uid: r.uid, text: `✨ ${nameOf(u)} ressuscita ${nameOf(r)} com ${r.hp} de vida!` });
}

/** v0.30.0: Teleporte — 1 vez por partida, pula para logo atrás do inimigo mais avançado da fileira e o ataca pelas costas. */
function teleport(state: BattleState, ctx: Ctx, u: Unit): boolean {
  const uu = usedOf(u);
  if (uu.teleport) return false;
  const d = dir(u.side);
  const foe = state.units
    .filter((e) => e.side !== u.side && e.hp > 0 && e.row === u.row && (e.col - u.col) * d >= 1)
    .sort((a, b) => (a.col - b.col) * d)[0];
  if (!foe) return false;
  const land = foe.col + d;
  if (!inBoard(state, u.row, land) || unitAt(state, u.row, land)) return false;
  uu.teleport = true;
  const from: [number, number] = [u.row, u.col];
  u.col = land;
  ctx.emit(state, { type: 'move', uid: u.uid, from, to: [u.row, land], jumped: true, through: [], text: `🌀 ${nameOf(u)} se teleporta para trás de ${nameOf(foe)}!` });
  attack(state, ctx, u, foe, { bonus: pw(u, 'teleporte'), label: 'ataca pelas costas' });
  return true;
}

/**
 * Salto Vendaval (v0.15.4): o alvo é o inimigo logo à frente (corpo a corpo) e existe casa de pouso livre
 * (3ª, senão 2ª) → o Riku salta por cima dele em vez de atacá-lo e ataca com investida quem estiver à frente ao cair.
 */
export function canLeapOver(state: BattleState, u: Unit, t: Unit | 'hero'): boolean {
  if (t === 'hero' || !has(u.abilities, (a) => a.jump)) return false;
  if (t.row !== u.row || t.col !== u.col + dir(u.side)) return false;
  return leapLanding(state, u) != null;
}

/** Ação automática: (cura) → ataca se houver alvo; senão anda e tenta atacar. */
export function act(state: BattleState, ctx: Ctx, u: Unit) {
  if (u.hp <= 0 || state.winner) return;
  if (isStunned(u)) {
    ctx.emit(state, { type: 'effect', uid: u.uid, kind: 'atordoado', text: `💫 ${nameOf(u)} está atordoado e perde a ação.` });
    return;
  }
  healNeighbors(state, ctx, u);
  healRow(state, ctx, u);
  // v0.30.0: habilidades no início da ação
  if (u.abilities.includes('purificar')) purify(state, ctx, u);
  if (u.abilities.includes('ressurreicao')) resurrect(state, ctx, u);
  if (state.winner || u.hp <= 0) return;
  if (u.abilities.includes('teleporte') && teleport(state, ctx, u)) return;
  // v0.30.0: congelado não ataca (ainda anda); lento anda 1 casa e perde o ataque no 1º turno lento
  const frozen = !!effectOf(u, 'congelado');
  const slow = effectOf(u, 'lento');
  const noAttack = frozen || !!slow?.amount;
  // v0.30.0: Investida — na primeira ação, anda 2 casas a mais e o primeiro golpe tem +1
  const uu = usedOf(u);
  const charge = u.abilities.includes('investida') && !uu.charged;
  uu.charged = true;
  const bonus0 = charge ? pw(u, 'investida') : 0;
  const moveOpts = { maxMove: slow ? 1 : charge ? u.move + 2 : undefined };
  const startCol = u.col;
  const bleedOnMove = () => {
    const b = effectOf(u, 'sangramento');
    if (b && u.col !== startCol && u.hp > 0) applyDamage(state, ctx, u, 1, 'fisico', { side: enemyOf(u.side), dot: true }, ' 🩸 (ferida abre ao andar)');
  };
  if (noAttack) {
    ctx.emit(state, { type: 'effect', uid: u.uid, kind: frozen ? 'congelado' : 'lento', text: frozen ? `❄️ ${nameOf(u)} está congelado e não ataca.` : `🐌 ${nameOf(u)} está lento e não ataca neste turno.` });
    if (!findTarget(state, u)) moveUnit(state, ctx, u, moveOpts);
    bleedOnMove();
    return;
  }
  let t = findTarget(state, u);
  if (t && canLeapOver(state, u, t)) {
    // Salto Vendaval (v0.15.2/v0.15.4): salta por cima do inimigo da frente e ataca com investida ao cair
    const jumped = moveUnit(state, ctx, u, { leapFront: true });
    t = findTarget(state, u);
    if (t) strike(state, ctx, u, t, (jumped ? pw(u, 'salto') : 0) + bonus0);
    return;
  }
  if (t) {
    strike(state, ctx, u, t, bonus0);
    return;
  }
  const jumped = moveUnit(state, ctx, u, moveOpts);
  bleedOnMove();
  if (u.hp <= 0 || state.winner || !state.units.includes(u)) return;
  t = findTarget(state, u);
  if (t) strike(state, ctx, u, t, (jumped ? pw(u, 'salto') : 0) + bonus0);
}

/**
 * Ordem de ação do lado: primeiro os Vigias (v0.17.0), do mais recuado para o mais avançado;
 * depois os demais, do mais avançado para o mais recuado. Desempate: fileira de cima primeiro.
 */
export function actionOrder(state: BattleState, side: Side): Unit[] {
  const mine = state.units.filter((u) => u.side === side && u.hp > 0);
  const alert = (u: Unit) => !!has(u.abilities, (a) => a.alert);
  const watch = mine.filter(alert).sort((a, b) => (a.col - b.col) * dir(side) || a.row - b.row);
  const rest = mine.filter((u) => !alert(u)).sort((a, b) => (b.col - a.col) * dir(side) || a.row - b.row);
  return [...watch, ...rest];
}

export function resolveSide(state: BattleState, ctx: Ctx, side: Side) {
  tickDots(state, ctx, side);
  if (state.winner) return;
  const order = actionOrder(state, side).map((u) => u.uid);
  for (const uid of order) {
    if (state.winner) return;
    const u = state.units.find((x) => x.uid === uid);
    if (u) act(state, ctx, u);
  }
  tickEnd(state, ctx, side);
}

export function deploy(state: BattleState, side: Side, handIndex: number, row: number, col: number, ctx = new Ctx()): { ok: boolean; reason?: string; events: RecordedEvent[] } {
  if (state.winner) return { ok: false, reason: 'Batalha encerrada', events: [] };
  if (state.active !== side) return { ok: false, reason: 'Não é sua vez', events: [] };
  const card = state.decks[side].hand[handIndex];
  if (!card) return { ok: false, reason: 'Carta inválida', events: [] };
  if (isSpell(card.charId)) return { ok: false, reason: 'Feitiço: toque num alvo destacado', events: [] };
  const def = getChar(card.charId);
  const w = waitOf(card);
  if (w > 0) return { ok: false, reason: `Carta ainda não está pronta (falta${w > 1 ? 'm' : ''} ${w} rodada${w > 1 ? 's' : ''})`, events: [] };
  if (!isDeployCell(state, side, row, col)) return { ok: false, reason: 'Fora da zona de invocação', events: [] };
  if (unitAt(state, row, col)) return { ok: false, reason: 'Casa ocupada', events: [] };
  playFromHand(state.decks[side], handIndex);
  if (state.stats) state.stats[side].cards++;
  const u = placeUnit(state, { charId: card.charId, stars: card.stars, plus: stepOf(card) }, side, row, col);
  u.slot = card.slot;
  ctx.emit(state, { type: 'deploy', uid: u.uid, text: `${side === 'player' ? 'Você invoca' : 'Inimigo invoca'} ${def.name} (${tierLabel(card.stars, stepOf(card))}).` });
  const aura = has(u.abilities, (a) => a.enemyAtkAura);
  if (aura) ctx.emit(state, { type: 'aura', uid: u.uid, text: `🌀 ${def.name} drena o ataque de todos os inimigos!` });
  if (has(u.abilities, (a) => a.necro)) bringBack(state, ctx, side, u.uid, def.name);
  onEnter(state, ctx, u);
  return { ok: true, events: ctx.events };
}

/** v0.30.0: habilidades ao entrar em campo — Escudo de Entrada e Clone. */
export function onEnter(state: BattleState, ctx: Ctx, u: Unit) {
  const sh = pw(u, 'escudoInicial');
  if (sh) addEffect(state, ctx, u, 'escudo', sh, 99);
  if (u.abilities.includes('clone')) {
    const spot = [
      [u.row, u.col + dir(u.side)],
      [u.row, u.col - dir(u.side)],
      [1 - u.row, u.col],
      [1 - u.row, u.col + dir(u.side)],
      [1 - u.row, u.col - dir(u.side)],
    ].find(([r, c]) => inBoard(state, r, c) && !unitAt(state, r, c));
    if (spot) {
      const c = placeUnit(state, { charId: u.charId, stars: u.stars, plus: u.plus }, u.side, spot[0], spot[1], { minion: true, atk: Math.max(1, Math.ceil(u.atk / 2)), hp: Math.max(1, Math.ceil(u.maxHp / 2)) });
      c.abilities = [];
      c.physRes = 0;
      c.magRes = 0;
      ctx.emit(state, { type: 'spawn', uid: c.uid, text: `👥 ${nameOf(u)} cria um clone!` });
    }
  }
}

export function bringBack(state: BattleState, ctx: Ctx, side: Side, uid: number, who: string) {
  const r = returnFromNecropolis(state.decks[side]);
  ctx.emit(state, {
    type: 'effect',
    uid,
    kind: 'necropolis',
    text: r ? `⚰️ ${who} traz ${getChar(r.card.charId).name} de volta da Necropolis${r.toHand ? ' para a mão (pronta)' : ' para o baralho'}.` : `⚰️ ${who}: a Necropolis está vazia.`,
  });
}

// ---------- v0.17.0: feitiços (v0.28.1: em battleSpells.ts) ----------
export { castSpell, spellCasters, spellTargets } from './battleSpells';

export function endRound(state: BattleState, ctx: Ctx) {
  if (state.winner) return;
  if (state.turn >= state.maxTurns) {
    const p = state.heroes.player.hp / state.heroes.player.maxHp;
    const e = state.heroes.enemy.hp / state.heroes.enemy.maxHp;
    state.winner = p > e ? 'player' : e > p ? 'enemy' : 'empate';
    ctx.emit(state, { type: 'end', winner: state.winner, text: `⏱ Limite de turnos! ${state.winner === 'player' ? 'Vitória por vida restante.' : state.winner === 'enemy' ? 'Derrota por vida restante.' : 'Empate.'}` });
  }
}

/**
 * Encerra o turno do jogador: suas unidades agem, a IA invoca e age,
 * e um novo turno começa. Retorna os eventos para animação.
 */
export function endPlayerTurn(state: BattleState, ai: (s: BattleState, ctx: Ctx, side: Side) => void): RecordedEvent[] {
  const ctx = new Ctx();
  if (state.winner || state.active !== 'player') return ctx.events;
  resolveSide(state, ctx, 'player');
  if (state.winner) return ctx.events;
  startTurn(state, ctx, 'enemy');
  ai(state, ctx, 'enemy');
  resolveSide(state, ctx, 'enemy');
  if (state.winner) return ctx.events;
  endRound(state, ctx);
  if (state.winner) return ctx.events;
  state.turn++;
  startTurn(state, ctx, 'player');
  return ctx.events;
}
