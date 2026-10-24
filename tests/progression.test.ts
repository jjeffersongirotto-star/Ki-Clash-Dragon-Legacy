import { describe, expect, it } from 'vitest';
import { ascend, feedXp, maxLevel, newOwned, statsFor, xpProgress, xpToNext } from '../src/core/progression';
import { getChar, PLAYABLE } from '../src/core/characters';

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
  it('despertar exige nível máximo e respeita o limite de estrelas', () => {
    const card = newOwned('riku');
    expect(ascend(card, 999).ok).toBe(false);
    for (let s = 1; s < 4; s++) {
      feedXp(card, 1e7);
      expect(ascend(card, 999).ok).toBe(true);
    }
    expect(card.stars).toBe(4);
    feedXp(card, 1e7);
    expect(ascend(card, 999).ok).toBe(false);
  });
  it('fracos vão até 4-5★, fortes começam em 4★', () => {
    for (const d of PLAYABLE) {
      if (d.rarity === 'lendario' || d.rarity === 'mitico') expect(d.minStars).toBe(4);
      else expect(d.maxStars).toBeLessThanOrEqual(5);
      expect(d.maxStars).toBeLessThanOrEqual(6);
    }
  });
});
