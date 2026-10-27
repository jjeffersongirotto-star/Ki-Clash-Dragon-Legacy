import { describe, expect, it } from 'vitest';
import { STAR_COUNT, starGoals, addStars, canRepeat, markCleared, starCount, starsForWin, starsOf, type AdventureProgress, type StarProgress } from '../../src/core/adventure';
import { STAGES } from '../../src/core/campaign';
import { defaultSave, normalizeV20 } from '../../src/ui/save';
import { adminSave } from '../../src/ui/accounts';

const NOON = Date.UTC(2026, 9, 26, 15, 0);
const prog = (): AdventureProgress & StarProgress => ({ cleared: [], clearedDiff: {}, stars: {} });

describe('v0.21.0 — estrelas por fase', () => {
  // v0.28.0: os objetivos passaram a ser por fase (fase 1 do Fácil: vida ≥ 50% e no máximo 12 cartas; o de turnos saiu)
  it('3 objetivos: vencer + os 2 da fase', () => {
    expect(STAR_COUNT).toBe(3);
    expect(starGoals('facil', 1)).toHaveLength(3);
    const st = (cards: number) => ({ cards, spells: 0, kills: 0 });
    expect(starsForWin({ playerHp: 10, playerMaxHp: 20, turn: 15, stats: st(12) })).toBe(7);
    expect(starsForWin({ playerHp: 9, playerMaxHp: 20, turn: 15, stats: st(12) })).toBe(5);
    expect(starsForWin({ playerHp: 20, playerMaxHp: 20, turn: 16, stats: st(13) })).toBe(3);
    expect(starsForWin({ playerHp: 1, playerMaxHp: 20, turn: 30, stats: st(20) })).toBe(1);
    expect(starCount(7)).toBe(3);
    expect(starCount(5)).toBe(2);
  });
  it('estrelas somam entre vitórias e são separadas por dificuldade', () => {
    const p = prog();
    expect(addStars(p, 'facil', 3, 3)).toBe(3); // vencer + vida
    expect(addStars(p, 'facil', 3, 5)).toBe(4); // turnos é nova; vencer já tinha
    expect(starsOf(p, 'facil', 3)).toBe(7);
    expect(starsOf(p, 'normal', 3)).toBe(0);
    expect(addStars(p, 'facil', 3, 7)).toBe(0);
  });
  it('Repetir só com 3 ⭐ (e com vezes no dia)', () => {
    const p = prog();
    markCleared(p, 'facil', 1);
    addStars(p, 'facil', 1, 3);
    expect(canRepeat(p, undefined, 'facil', 1, NOON)).toBe(false);
    addStars(p, 'facil', 1, 4);
    expect(canRepeat(p, undefined, 'facil', 1, NOON)).toBe(true);
  });
  it('save antigo: fases vencidas começam com 1 ⭐; lixo é limpo', () => {
    const d = { ...defaultSave(), cleared: [1, 2], clearedDiff: { normal: [1] }, stars: { 'facil:2': 6, 'x:9': 99 } } as never;
    const n = normalizeV20(d);
    expect(n.stars).toEqual({ 'facil:1': 1, 'facil:2': 7, 'normal:1': 1 });
  });
  it('ADM: 3 ⭐ em todas as fases nas 3 dificuldades', () => {
    const a = adminSave();
    expect(Object.keys(a.stars!)).toHaveLength(3 * STAGES.length);
    expect(Object.values(a.stars!).every((v) => v === 7)).toBe(true);
  });
});
