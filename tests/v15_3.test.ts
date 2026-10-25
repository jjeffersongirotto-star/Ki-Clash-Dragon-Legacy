import { describe, expect, it } from 'vitest';
import { act, createBattle, Ctx, moveUnit, placeUnit } from '../src/core/battle';
import { getChar } from '../src/core/characters';
import { maxLevel } from '../src/core/progression';
import type { BattleState, CardInstance, RecordedEvent } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const moves = (ctx: Ctx) => ctx.events.filter((e): e is Extract<RecordedEvent, { type: 'move' }> => e.type === 'move');

describe('v0.15.3 — Riku: salto = 2 casas e para; caminho livre = 3 casas', () => {
  it('saltou o inimigo: para 2 casas à frente mesmo sem alvo (em todas as cores e níveis)', () => {
    const def = getChar('riku');
    for (let st = def.minStars; st <= def.maxStars; st++)
      for (const pl of [false, true]) {
        const s = empty();
        const r = placeUnit(s, c('riku', maxLevel(st, pl), st), 'player', 1, 0);
        placeUnit(s, c('nara'), 'enemy', 1, 1, { hp: 99 });
        const ctx = new Ctx();
        act(s, ctx, r);
        expect(r.col).toBe(2);
        expect(moves(ctx)).toHaveLength(1);
        expect(moves(ctx)[0].jumped).toBe(true);
      }
  });
  it('saltou e tem alvo ao cair: ataca com investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 0, { atk: 5 });
    placeUnit(s, c('nara'), 'enemy', 0, 1, { hp: 99 });
    const t = placeUnit(s, c('nara'), 'enemy', 0, 3, { hp: 50 });
    act(s, new Ctx(), r);
    expect(r.col).toBe(2);
    expect(t.hp).toBe(50 - 5 - 2);
  });
  it('caminho livre: anda as 3 casas (fixo em todas as cores)', () => {
    const def = getChar('riku');
    for (let st = def.minStars; st <= def.maxStars; st++) {
      const s = empty();
      const r = placeUnit(s, c('riku', maxLevel(st), st), 'player', 0, 0);
      moveUnit(s, new Ctx(), r);
      expect(r.col).toBe(3);
    }
  });
  it('passar por aliado não é salto: continua podendo andar as 3 casas', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 0);
    placeUnit(s, c('toru'), 'player', 0, 1);
    const ctx = new Ctx();
    moveUnit(s, ctx, r);
    expect(r.col).toBe(3);
    expect(moves(ctx)[0].jumped).toBe(false);
  });
});
