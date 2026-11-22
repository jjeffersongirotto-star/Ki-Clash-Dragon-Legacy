/**
 * v0.67.2 — Gerador dos baralhos inimigos do Normal e do Difícil.
 * npx vite-node scripts/balance/decks.ts [faixaInicial] [faixaFinal] [saida.json]
 *
 * Para cada FAIXA de dificuldade (degrau 0 = Comum … 17 = Mítico++):
 *  1. monta candidatos de várias ESTRATÉGIAS com cartas que chegam (ou quase chegam) à raridade da faixa:
 *     raça com aura, muralha (tanques + longe), pressão rápida (espera 1–2), desgaste (efeitos + cura) e sorteio;
 *  2. mede cada um em batalhas (os dois lados no Auto) contra um baralho de jogador forte da mesma faixa;
 *  3. melhora os melhores trocando 1 ou 2 cartas (fica com a variação se a vitória sobe);
 *  4. guarda todos com a nota (vitória do baralho inimigo), do iniciante ao forte.
 * Uma Épica pode entrar numa faixa Mítica se a estratégia pedir (cartas até 1 raridade abaixo da faixa).
 */
import { writeFileSync } from 'node:fs';
import { Ctx, createBattle, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy } from '../../src/core/ai';
import { BALANCE_V2 } from '../../src/core/balanceV2';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { enemyCard } from '../../src/core/campaign';
import { cardPower } from '../../src/core/power';
import { shuffle } from '../../src/core/rng';
import type { CardInstance, CharacterDef } from '../../src/core/types';

const from = Number(process.argv[2] ?? 0);
const to = Number(process.argv[3] ?? 17);
const out = process.argv[4];
const GAMES = Number(process.env.GAMES ?? 30);
const CANDS = Number(process.env.CANDS ?? 28);
const TOP = Number(process.env.TOP ?? 6);
const MUT = Number(process.env.MUT ?? 10);

const rarityOf = (s: number) => Math.max(1, Math.min(6, Math.floor(s / 3) + 1));
const RACES = ['humano', 'androide', 'extraterrestre', 'mago', 'monstro', 'necromante'];
const ATTRITION = new Set(['veneno', 'queimadura', 'maldicao', 'lentidao', 'sangramento', 'sopro', 'lotus', 'ondaCurativa', 'regeneracao', 'dominio', 'sifao', 'pressao']);
const WALL = new Set(['provocar', 'protetor', 'guarda', 'inabalavel', 'espinhos', 'cascaReativa', 'couracaAdaptativa']);

export interface DeckResult { ids: string[]; score: number; arche: string }

const deckAt = (ids: string[], s: number): CardInstance[] => ids.map((id) => ({ ...enemyCard(id, s), copies: 3 }));
const powAt = (d: CharacterDef, s: number) => cardPower(enemyCard(d.id, s));

/** Vitória (0–1) do baralho inimigo contra o baralho de referência do jogador, os dois no Auto. */
function evaluate(ids: string[], ref: CardInstance[], s: number, seed0: number): number {
  const enemy = deckAt(ids, s);
  let w = 0;
  for (let g = 0; g < GAMES; g++) {
    const st = createBattle({ playerDeck: ref, enemyDeck: enemy, playerHeroHp: 40, enemyHeroHp: 40, seed: seed0 + g * 7919 });
    for (let t = 0; !st.winner && t < 200; t++) {
      aiDeploy(st, new Ctx(), 'player');
      endPlayerTurn(st, aiDeploy);
    }
    if (st.winner === 'enemy') w++;
    else if (st.winner === 'empate') w += 0.5;
  }
  return w / GAMES;
}

function band(s: number): DeckResult[] {
  const r = rarityOf(s);
  const pool = PLAYABLE.filter((d) => d.minStars <= r && d.maxStars >= r - 1);
  const top = (list: CharacterDef[], n: number) => list.slice().sort((a, b) => powAt(b, s) - powAt(a, s)).slice(0, n);
  const fill = (ids: string[], from: CharacterDef[]) => {
    for (const d of top(from, 40)) if (ids.length < 10 && !ids.includes(d.id)) ids.push(d.id);
    for (const d of top(pool, 40)) if (ids.length < 10 && !ids.includes(d.id)) ids.push(d.id);
    return ids.slice(0, 10);
  };
  // referência do jogador: os 10 mais fortes da faixa (um jogador bem montado)
  const ref = deckAt(top(pool, 10).map((d) => d.id), s);
  const cands: DeckResult[] = [];
  const add = (ids: string[], arche: string) => {
    const key = [...ids].sort().join(',');
    if (ids.length === 10 && !cands.some((c) => [...c.ids].sort().join(',') === key)) cands.push({ ids, score: -1, arche });
  };
  let k = 0;
  for (const race of RACES) {
    const mine = pool.filter((d) => d.race === race);
    const aura = mine.filter((d) => BALANCE_V2[d.id]?.aura).map((d) => d.id);
    const cross = pool.filter((d) => BALANCE_V2[d.id]?.aura?.race === race).map((d) => d.id);
    add(fill([...new Set([...aura, ...cross])], mine), `raça ${race}`);
  }
  add(fill([...top(pool.filter((d) => d.category === 'tanque' && d.abilities.some((a) => WALL.has(a))), 3), ...top(pool.filter((d) => d.range >= 3), 4)].map((d) => d.id), []), 'muralha');
  add(fill(top(pool.filter((d) => (d.wait ?? 3) <= 2), 10).map((d) => d.id), []), 'pressão');
  add(fill(top(pool.filter((d) => d.abilities.some((a) => ATTRITION.has(a))), 10).map((d) => d.id), []), 'desgaste');
  add(top(pool, 10).map((d) => d.id), 'mais fortes');
  while (cands.length < CANDS && k < 200) {
    const rnd = shuffle(pool.map((d) => d.id), { seed: 1000 * s + k++ });
    add(rnd.slice(0, 10), 'sorteio');
  }
  for (const c of cands) c.score = evaluate(c.ids, ref, s, 11 + s);
  // melhora os melhores trocando 1–2 cartas
  const best = cands.slice().sort((a, b) => b.score - a.score).slice(0, TOP);
  for (const b of best) {
    let cur = b;
    for (let m = 0; m < MUT; m++) {
      const rng = { seed: 50000 * s + 97 * m + cur.ids.length + Math.round(cur.score * 1000) };
      const ids = [...cur.ids];
      const outside = shuffle(pool.map((d) => d.id).filter((id) => !ids.includes(id)), rng);
      const swaps = 1 + (m % 2);
      for (let q = 0; q < swaps && outside.length; q++) ids[Math.floor(((m + q) * 7) % 10)] = outside.pop()!;
      const sc = evaluate(ids, ref, s, 11 + s);
      if (sc > cur.score + 0.02) {
        cur = { ids, score: sc, arche: `${b.arche}*` };
        cands.push(cur);
      }
    }
  }
  return cands.sort((a, b) => a.score - b.score);
}

const res: Record<number, DeckResult[]> = {};
for (let s = from; s <= to; s++) {
  const t0 = Date.now();
  res[s] = band(s);
  const sc = res[s].map((c) => Math.round(c.score * 100));
  console.error(`faixa ${s}: ${res[s].length} baralhos, vitória ${Math.min(...sc)}–${Math.max(...sc)}% (${Math.round((Date.now() - t0) / 1000)} s)`);
  if (out) writeFileSync(out, JSON.stringify(res));
}
