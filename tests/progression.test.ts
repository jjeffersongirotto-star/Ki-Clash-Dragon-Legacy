import { describe, expect, it } from 'vitest';
import { ascend, feedXp, maxLevel, newOwned, statsFor, xpProgress, xpToNext } from '../src/core/progression';
import { expectedMaxStars, getChar, PLAYABLE, UNIQUE_5STAR } from '../src/core/characters';

describe('progressão por XP', () => {
  it('cada nível exige mais XP', () => {
    for (let l = 1; l < 30; l++) expect(xpToNext(l + 1)).toBeGreaterThan(xpToNext(l));
  });
  it('encher 100% da barra sobe de nível', () => {
    const card = newOwned('riku');
    feedXp(card, xpToNext(1) - 1);
    expect(card.level).toBe(1);
    expect(xpProgress(card)).toBeCloseTo((xpToNext(1) - 1) / xpToNext(1));
    feedXp(card, 1);
    expect(card.level).toBe(2);
    expect(card.xp).toBe(0);
  });
  it('não passa do nível máximo das estrelas', () => {
    const card = newOwned('riku');
    const r = feedXp(card, 1e7);
    expect(card.level).toBe(maxLevel(card.stars));
    expect(r.wasted).toBeGreaterThan(0);
  });
  it('status crescem com nível e estrelas', () => {
    const def = getChar('kenji');
    expect(statsFor(def, 10, 4).hp).toBeGreaterThan(statsFor(def, 1, 4).hp);
    expect(statsFor(def, 1, 6).atk).toBeGreaterThan(statsFor(def, 1, 4).atk);
  });
  it('despertar exige nível máximo do degrau e respeita o limite de cor (com o "+" final)', () => {
    const card = newOwned('riku');
    expect(ascend(card, 999).ok).toBe(false);
    // Comum → Comum+ → Incomum → ... → Épico → Épico+ = 7 despertares
    for (let i = 0; i < 7; i++) {
      feedXp(card, 1e8);
      expect(ascend(card, 999).ok).toBe(true);
    }
    expect(card.stars).toBe(4);
    expect(card.plus).toBe(true);
    feedXp(card, 1e8);
    expect(ascend(card, 999).ok).toBe(false);
  });
  it('faixa de cores: Comum/Incomum→Épico, Raro→Lendário, Épico/Lendário→Mítico; únicos começam em Lendário', () => {
    for (const d of PLAYABLE) {
      expect(d.maxStars).toBe(expectedMaxStars(d.minStars));
      if (UNIQUE_5STAR.includes(d.id)) expect(d.minStars).toBe(5);
    }
    expect(expectedMaxStars(1)).toBe(4);
    expect(expectedMaxStars(2)).toBe(4);
    expect(expectedMaxStars(3)).toBe(5);
    expect(expectedMaxStars(4)).toBe(6);
    expect(expectedMaxStars(5)).toBe(6);
    expect(UNIQUE_5STAR.sort()).toEqual(['kenji', 'vorax']);
  });
});
