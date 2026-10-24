import { getChar } from './characters';
import { Ctx, deploy, DEPLOY_DEPTH, enemyOf, unitAt } from './battle';
import { has } from './abilities';
import { nextRandom } from './rng';
import type { BattleState, Side } from './types';

/** IA simples: invoca as cartas mais caras que couberem, reforçando as fileiras ameaçadas. */
export function aiDeploy(state: BattleState, ctx: Ctx, side: Side) {
  for (let guard = 0; guard < 10; guard++) {
    const hand = state.decks[side].hand;
    const options = hand
      .map((c, i) => ({ c, i, def: getChar(c.charId) }))
      .filter((o) => o.def.cost <= state.energy[side])
      .sort((a, b) => b.def.cost - a.def.cost || nextRandom(state) - 0.5);
    if (!options.length) return;
    const pick = options[0];
    const backline = !!has(pick.def.abilities, (a) => a.rangeBonus);
    const front = side === 'enemy' ? state.cols - DEPLOY_DEPTH : DEPLOY_DEPTH - 1;
    const back = side === 'enemy' ? state.cols - 1 : 0;
    const colsPref = backline ? [back, front] : [front, back];
    const foe = enemyOf(side);
    let best: { r: number; c: number; score: number } | null = null;
    for (let r = 0; r < state.rows; r++) {
      const threat = state.units
        .filter((u) => u.side === foe && u.row === r)
        .reduce((s, u) => s + u.atk + (side === 'enemy' ? u.col : state.cols - u.col), 0);
      const mine = state.units.filter((u) => u.side === side && u.row === r).length;
      for (const c of colsPref) {
        if (unitAt(state, r, c)) continue;
        const score = threat * 2 - mine * 3 + (c === colsPref[0] ? 2 : 0) + nextRandom(state) * 2;
        if (!best || score > best.score) best = { r, c, score };
      }
    }
    if (!best) return;
    const res = deploy(state, side, pick.i, best.r, best.c, ctx);
    if (!res.ok) return;
  }
}
