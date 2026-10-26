import { getChar } from './characters';
import { castSpell, Ctx, deploy, DEPLOY_DEPTH, effectOf, enemyOf, spellTargets, unitAt, waitOf } from './battle';
import { getSpell, isSpell } from './spells';
import { has } from './abilities';
import { nextRandom } from './rng';
import type { BattleState, Side, Unit } from './types';

/** IA simples: invoca TODAS as cartas prontas (contagem 0), as mais caras primeiro, reforçando as fileiras ameaçadas. */
export function aiDeploy(state: BattleState, ctx: Ctx, side: Side) {
  for (let guard = 0; guard < 12; guard++) {
    const hand = state.decks[side].hand;
    const options = hand
      .map((c, i) => ({ c, i }))
      .filter((o) => !isSpell(o.c.charId) && waitOf(o.c) === 0)
      .map((o) => ({ ...o, def: getChar(o.c.charId) }))
      .sort((a, b) => b.def.cost - a.def.cost || nextRandom(state) - 0.5);
    if (!options.length) break;
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
    if (!best) break;
    const res = deploy(state, side, pick.i, best.r, best.c, ctx);
    if (!res.ok) break;
  }
  aiCast(state, ctx, side);
}

/** v0.17.0: depois de invocar, a IA lança os feitiços prontos que tenham conjurador e um alvo que valha a pena. */
export function aiCast(state: BattleState, ctx: Ctx, side: Side) {
  const tried = new Set<string>();
  for (let guard = 0; guard < 8 && !state.winner; guard++) {
    const hand = state.decks[side].hand;
    const i = hand.findIndex((c) => isSpell(c.charId) && waitOf(c) === 0 && !tried.has(c.charId));
    if (i < 0) return;
    const id = hand[i].charId;
    tried.add(id);
    const t = pickSpellTarget(state, side, id);
    if (!t) continue;
    const res = castSpell(state, side, i, t[0], t[1], ctx);
    if (res.ok) tried.delete(id);
  }
}

/** alvo heurístico do feitiço (null = segurar a carta) */
export function pickSpellTarget(state: BattleState, side: Side, spellId: string): [number, number] | null {
  const cells = spellTargets(state, side, spellId);
  if (!cells.length) return null;
  const sp = getSpell(spellId);
  const foe = enemyOf(side);
  const adv = (u: Unit) => (u.side === 'player' ? u.col : state.cols - 1 - u.col);
  const at = (r: number, c: number) => unitAt(state, r, c)!;
  if (sp.target === 'enemy') {
    const foes = cells.map(([r, c]) => at(r, c));
    const score = (u: Unit) =>
      spellId === 'f-veneno' || spellId === 'f-flecha-veneno'
        ? (effectOf(u, 'veneno') ? -100 : 0) + u.hp + adv(u)
        : adv(u) * 3 + u.atk - u.hp / 4;
    const best = foes.sort((a, b) => score(b) - score(a))[0];
    return [best.row, best.col];
  }
  if (sp.target === 'ally') {
    const mine = cells.map(([r, c]) => at(r, c));
    const pool = spellId === 'f-anjo' ? mine.filter((u) => !effectOf(u, 'anjo')) : mine;
    if (!pool.length) return null;
    const best = pool.sort((a, b) => (spellId === 'f-anjo' ? b.atk + b.maxHp / 4 - (a.atk + a.maxHp / 4) : adv(b) - adv(a) || a.hp - b.hp))[0];
    return [best.row, best.col];
  }
  if (sp.target === 'row') {
    let bestRow = -1;
    let bestScore = 0;
    for (let r = 0; r < state.rows; r++) {
      const sc =
        spellId === 'f-cura'
          ? state.units.filter((u) => u.side === side && u.row === r).reduce((s, u) => s + Math.min(u.maxHp - u.hp, Math.ceil(u.maxHp / 5)), 0)
          : state.units.filter((u) => u.side === foe && u.row === r).length;
      if (sc > bestScore) {
        bestScore = sc;
        bestRow = r;
      }
    }
    if (bestRow < 0 || (spellId === 'f-cura' && bestScore < 3)) return null;
    return [bestRow, 0];
  }
  // sem alvo (Necropolis): toca em qualquer casa da própria zona
  return cells[0];
}
