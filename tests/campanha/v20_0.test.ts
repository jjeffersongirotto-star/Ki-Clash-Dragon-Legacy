import { describe, expect, it } from 'vitest';
import {
  DAILY_LIMIT, DIFFICULTIES, DIFFICULTY_RULES, brasiliaDay, canPlay, canRepeat, dailyLeft, difficultyUnlocked,
  freshDaily, isCleared, markCleared, stageFor, stageUnlocked, useDaily, type AdventureProgress,
} from '../../src/core/adventure';
import { STAGES } from '../../src/core/campaign';
import { createBattle } from '../../src/core/battle';
import { stepIndex, stepOf } from '../../src/core/progression';
import { getChar } from '../../src/core/characters';
import { isSpell } from '../../src/core/spells';
import { defaultSave, normalizeV20 } from '../../src/ui/save';
import { adminSave } from '../../src/ui/accounts';

const fresh = (): AdventureProgress => ({ cleared: [], clearedDiff: {} });
const all = STAGES.map((s) => s.id);
// 26/10/2026 12:00 em Brasília = 15:00 UTC
const NOON = Date.UTC(2026, 9, 26, 15, 0);

describe('v0.20.0 — dificuldades da Aventura', () => {
  it('3 dificuldades; o Fácil é a campanha de sempre', () => {
    expect(DIFFICULTIES).toEqual(['facil', 'normal', 'dificil']);
    for (const s of STAGES) expect(stageFor(s.id, 'facil')).toBe(s);
  });
  it('Normal e Difícil: mesma fase, mesmos personagens e feitiços, inimigos com mais nível (limitado pela cor)', () => {
    for (const s of STAGES) {
      const n = stageFor(s.id, 'normal');
      const d = stageFor(s.id, 'dificil');
      expect(n.name).toBe(s.name);
      expect(n.rewards).toEqual(s.rewards);
      expect(n.enemyDeck.map((c) => c.charId)).toEqual(s.enemyDeck.map((c) => c.charId));
      s.enemyDeck.forEach((c, k) => {
        if (isSpell(c.charId)) return;
        // v0.23.0: degraus a mais (limitados ao topo do personagem); até a v0.22.0 eram níveis
        const g = (x: typeof c) => stepIndex(x.stars, stepOf(x));
        const top = stepIndex(getChar(c.charId).maxStars, 2);
        expect(g(n.enemyDeck[k])).toBe(Math.min(top, g(c) + DIFFICULTY_RULES.normal.stepBonus));
        expect(g(d.enemyDeck[k])).toBe(Math.min(top, g(c) + DIFFICULTY_RULES.dificil.stepBonus));
        expect(g(d.enemyDeck[k])).toBeGreaterThanOrEqual(g(n.enemyDeck[k]));
      });
      // baralho válido para a batalha
      expect(() => createBattle({ playerDeck: [], enemyDeck: d.enemyDeck, playerHeroHp: 20, enemyHeroHp: d.enemyHeroHp, seed: 1 })).not.toThrow();
    }
  });
  it('trocas de carta configuradas por fase são aplicadas', () => {
    const before = DIFFICULTY_RULES.dificil.swaps;
    const out = STAGES[0].enemyDeck.find((c) => !isSpell(c.charId))!.charId;
    const inn = 'gorath';
    DIFFICULTY_RULES.dificil.swaps = { 0: [[out, inn]] };
    try {
      const d = stageFor(1, 'dificil').enemyDeck.map((c) => c.charId);
      expect(d).toContain(inn);
      expect(d).not.toContain(out);
      expect(getChar(inn)).toBeTruthy();
    } finally {
      DIFFICULTY_RULES.dificil.swaps = before;
    }
  });
  // v0.28.0: a fase N do Normal abre com a fase N do Fácil (e a N−1 do Normal); antes o Normal abria só com a fase 10
  it('progresso separado; cada fase do Normal abre com a mesma fase do Fácil', () => {
    const p = fresh();
    expect(difficultyUnlocked(p, 'facil')).toBe(true);
    expect(difficultyUnlocked(p, 'normal')).toBe(false);
    expect(stageUnlocked(p, 'facil', 1)).toBe(true);
    expect(stageUnlocked(p, 'facil', 2)).toBe(false);
    for (const id of all) markCleared(p, 'facil', id);
    expect(p.cleared).toEqual(all);
    expect(difficultyUnlocked(p, 'normal')).toBe(true);
    expect(difficultyUnlocked(p, 'dificil')).toBe(false);
    expect(isCleared(p, 'normal', 1)).toBe(false);
    markCleared(p, 'normal', 1);
    markCleared(p, 'normal', 1);
    expect(p.clearedDiff?.normal).toEqual([1]);
    expect(stageUnlocked(p, 'normal', 2)).toBe(true);
    expect(stageUnlocked(p, 'normal', 3)).toBe(false);
  });
});

describe('v0.20.0 — limite de 5 por dia, por fase', () => {
  it('dia de Brasília (UTC−3)', () => {
    expect(brasiliaDay(Date.UTC(2026, 9, 27, 2, 59))).toBe('2026-10-26'); // 23:59 em Brasília
    expect(brasiliaDay(Date.UTC(2026, 9, 27, 3, 0))).toBe('2026-10-27'); // meia-noite em Brasília
  });
  it('fase nova: Jogar sempre liberado e sem Repetir; fase vencida: 5 vezes por dia, depois bloqueia', () => {
    const p = fresh();
    expect(canPlay(p, undefined, 'facil', 1, NOON)).toBe(true);
    expect(canRepeat(p, undefined, 'facil', 1, NOON)).toBe(false);
    markCleared(p, 'facil', 1);
    // v0.21.0: o Repetir pede as 3 ⭐ da fase
    (p as AdventureProgress & { stars?: Record<string, number> }).stars = { 'facil:1': 7 };
    let d = freshDaily(undefined, NOON);
    expect(dailyLeft(d, 'facil', 1, NOON)).toBe(DAILY_LIMIT);
    for (let k = 0; k < DAILY_LIMIT; k++) {
      expect(canRepeat(p, d, 'facil', 1, NOON)).toBe(true);
      d = useDaily(d, 'facil', 1, NOON);
    }
    expect(dailyLeft(d, 'facil', 1, NOON)).toBe(0);
    expect(canPlay(p, d, 'facil', 1, NOON)).toBe(false);
    expect(canRepeat(p, d, 'facil', 1, NOON)).toBe(false);
    // outra fase e outra dificuldade têm contagem própria
    markCleared(p, 'facil', 2);
    expect(dailyLeft(d, 'facil', 2, NOON)).toBe(DAILY_LIMIT);
    expect(dailyLeft(d, 'normal', 1, NOON)).toBe(DAILY_LIMIT);
    // no dia seguinte (meia-noite de Brasília) volta a 5
    const tomorrow = Date.UTC(2026, 9, 27, 3, 1);
    expect(dailyLeft(d, 'facil', 1, tomorrow)).toBe(DAILY_LIMIT);
    expect(canPlay(p, d, 'facil', 1, tomorrow)).toBe(true);
    expect(useDaily(d, 'facil', 1, tomorrow).used).toEqual({ 'facil:1': 1 });
  });
});

describe('v0.20.0 — save', () => {
  it('save novo e save antigo ganham os campos da Aventura; lixo é limpo', () => {
    const d = defaultSave();
    expect(d.difficulty).toBe('facil');
    expect(d.clearedDiff).toEqual({ normal: [], dificil: [] });
    const old = { ...defaultSave(), clearedDiff: { normal: [1, 'x', -2, 3] }, daily: { day: 5 }, difficulty: 'impossivel' } as never;
    const n = normalizeV20(old);
    expect(n.clearedDiff).toEqual({ normal: [1, 3], dificil: [] });
    expect(n.daily).toBeUndefined();
    expect(n.difficulty).toBe('facil');
  });
  it('a conta ADM tem todas as fases vencidas nas 3 dificuldades', () => {
    const a = adminSave();
    expect(a.cleared).toEqual(all);
    expect(a.clearedDiff).toEqual({ normal: all, dificil: all });
  });
});
