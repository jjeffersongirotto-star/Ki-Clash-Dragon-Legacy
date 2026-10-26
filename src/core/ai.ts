import { getChar } from './characters';
import { Ctx, deploy, DEPLOY_DEPTH, enemyOf, unitAt, waitOf } from './battle';
import { has } from './abilities';
import { nextRandom } from './rng';
import type { BattleState, Side } from './types';

/** IA simples: invoca TODAS as cartas prontas (contagem 0), as mais caras primeiro, reforçando as fileiras ameaçadas. */
export function aiDeploy(state: BattleState, ctx: Ctx, side: Side) {
  for (let guard = 0; guard < 12; guard++) {
    const hand = state.decks[side].hand;
    const options = hand
      .map((c, i) => ({ c, i, def: getChar(c.charId) }))
      .filter((o) => waitOf(o.c) === 0)
      .sort((a, b) => b.def.cost - a.def.cost || nextRandom(state) - 0.5);
    if (!options.length) return;
    const pick = options[0];
    const backline = !!has(pick.def.abilities, (a) => a.rangeBonus);
    const front = side === 'enemy' ? state.cols - DEPLOY_DEPTH : DEPLOY_DEPTH - 1;
    const back = side === 'enemy' ? state.cols - 1 : 0;
    const mid = Array.from({ length: Math.max(0, DEPLOY_DEPTH - 2) }, (_, k) => (side === 'enemy' ? state.cols - 2 - k : 1 + k));
    const colsPref = backline ? [back, front, ...mid] : [front, back, ...mid];
    const foe = enemyOf(side);
    let best: { r: number; c: number; score: number } | null = null;
    for (let r = 0; r < state.rows; r++) {
      const threat = state.units
        .filter((u) => u.side === foe && u.row === r)
        .reduce((s, u) => s + u.atk + (side === 'enemy' ? u.col : state.cols - u.col), 0);
      const mine = state.units.filter((u) => u.side === side && u.row === r).length;
      for (const c of colsPref) {
        if (unitAt(state, r, c)) continue;
        const score = threat * 2 - mine * 3 + (c === colsPref[0] ? 2 : 0) - (mid.includes(c) ? 50 : 0) + nextRandom(state) * 2;
        if (!best || score > best.score) best = { r, c, score };
      }
    }
    if (!best) return;
    const res = deploy(state, side, pick.i, best.r, best.c, ctx);
    if (!res.ok) return;
  }
}
