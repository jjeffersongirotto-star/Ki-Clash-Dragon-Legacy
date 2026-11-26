import { describe, expect, it } from 'vitest';
import { PROFILE_MAX, convertOldXp, levelFromXp, oldTotalXpFor, totalXpFor, xpToNext } from '../../src/core/profile';
import { DAILY_LIMIT } from '../../src/core/adventure';

describe('v0.68.0 — economia', () => {
  it('limite diário por fase: 10', () => expect(DAILY_LIMIT).toBe(10));

  it('converter XP da curva antiga mantém o nível e a fração da barra', () => {
    for (const lv of [1, 2, 10, 23, 50, 99]) {
      const half = oldTotalXpFor(lv) + Math.floor((oldTotalXpFor(lv + 1) - oldTotalXpFor(lv)) / 2);
      const x = convertOldXp(half);
      expect(levelFromXp(x)).toBe(lv);
      expect(x - totalXpFor(lv)).toBeLessThanOrEqual(Math.ceil(xpToNext(lv) / 2));
    }
    expect(levelFromXp(convertOldXp(oldTotalXpFor(PROFILE_MAX)))).toBe(PROFILE_MAX);
  });
});
