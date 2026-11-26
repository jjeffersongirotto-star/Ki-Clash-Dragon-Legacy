/**
 * v0.70.0 — Fases-portão: a região onde cada cor de item aparece pela primeira vez (cadeado por item e cor).
 * Um baralho cheio de cartas da raridade que PRECISA dessa cor, no máximo a que dá para chegar sem ela (raridade base,
 * sem "+"), tem que vencer pelo menos 30% das vezes (pedido do jogador).
 * npx vite-node scripts/balance/gates.ts [batalhas por fase]
 */
import { simulate } from './sim';
import { PLAYABLE } from '../../src/core/characters';
import { autoDeck } from '../../src/core/deckbuild';
import { cardPower, deckPower } from '../../src/core/power';
import { stageFor, type Difficulty } from '../../src/core/adventure';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';
import type { CardInstance } from '../../src/core/types';

const N = Number(process.argv[2] ?? 40);
export const GATES: { diff: Difficulty; from: number; to: number; rarity: number; color: string }[] = [
  { diff: 'facil', from: 21, to: 30, rarity: 2, color: 'azul (cartas Incomuns)' },
  { diff: 'facil', from: 51, to: 60, rarity: 3, color: 'roxo (cartas Raras)' },
  { diff: 'facil', from: 81, to: 90, rarity: 3, color: 'roxo (cartas Raras)' },
  { diff: 'normal', from: 1, to: 10, rarity: 3, color: 'roxo (cartas Raras)' },
  { diff: 'normal', from: 31, to: 40, rarity: 4, color: 'laranja (cartas Épicas)' },
  { diff: 'dificil', from: 1, to: 10, rarity: 4, color: 'laranja (cartas Épicas)' },
];

/** Baralho de referência: os personagens que existem na raridade, nela (base), os mais fortes, 40 cartas. */
export function refDeck(rarity: number): CardInstance[] {
  const owned = PLAYABLE.filter((d) => d.minStars <= rarity && d.maxStars >= rarity).map((d) => ({ charId: d.id, stars: rarity, plus: 0 }));
  return autoDeck(owned.sort((a, b) => cardPower(b) - cardPower(a)), 40, 4);
}
/** Nível do Comandante que esse baralho alcança (pode evoluir com ele). */
export function refLeaderHp(deck: CardInstance[]): number {
  const p = deckPower(deck.filter((c) => !c.charId.startsWith('f-')));
  let l = 1;
  while (l < LEADER_HP.length && LEADER_THRESHOLDS[l] != null && p >= LEADER_THRESHOLDS[l]) l++;
  return LEADER_HP[l - 1];
}

export function gateWin(diff: Difficulty, stageId: number, rarity: number, n = N): number {
  const deck = refDeck(rarity);
  const hp = refLeaderHp(deck);
  const st = stageFor(stageId, diff);
  let w = 0;
  for (let k = 0; k < n; k++) if (simulate(deck, st.enemyDeck, hp, st.enemyHeroHp, 70000 + stageId * 97 + k, st.aiLevel).winner === 'player') w++;
  return w / n;
}

if (process.env.GATES_RUN !== '0') {
  for (const g of GATES) {
    const deck = refDeck(g.rarity);
    const res: string[] = [];
    let min = 1;
    for (let s = g.from; s <= g.to; s++) {
      const w = gateWin(g.diff, s, g.rarity);
      min = Math.min(min, w);
      res.push(`${s}:${Math.round(w * 100)}%`);
    }
    console.log(`${g.diff} ${g.from}–${g.to} · ${g.color} · Poder ${deckPower(deck.filter((c) => !c.charId.startsWith('f-')))} · vida ${refLeaderHp(deck)} · mín ${Math.round(min * 100)}% ${min >= 0.3 ? 'OK' : 'ABAIXO'}\n  ${res.join(' ')}`);
  }
}
