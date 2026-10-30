import { describe, it, expect } from 'vitest';
import { firstClearOffer } from '../../src/core/firstPick';
import { PLAYABLE } from '../../src/core/characters';
import { BANNER_EXCLUSIVE } from '../../src/core/banner';

const seq = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const chars = PLAYABLE.filter((c) => !BANNER_EXCLUSIVE.includes(c.id));

describe('v0.52.1 escolha de 1 entre 3 cartas do rival na primeira vitória', () => {
  it('oferece 3 personagens diferentes, todos do baralho do rival', () => {
    const deck = chars.slice(0, 6).map((c) => ({ charId: c.id, stars: c.minStars }));
    for (let s = 1; s < 50; s++) {
      const o = firstClearOffer(deck, seq(s));
      expect(o).toHaveLength(3);
      expect(new Set(o).size).toBe(3);
      for (const id of o) expect(deck.some((d) => d.charId === id)).toBe(true);
    }
  });
  it('rival com menos de 3 personagens: oferece só os que tem; feitiços e exclusivos do Banner ficam de fora', () => {
    const deck = [{ charId: chars[0].id, stars: 1 }, { charId: chars[0].id, stars: 2 }, { charId: 'kenji', stars: 5 }];
    expect(firstClearOffer(deck, seq(3))).toEqual([chars[0].id]);
  });
  it('mesmo tipo: a carta mais forte do rival aparece menos', () => {
    const r = chars[0].minStars;
    const same = chars.filter((c) => c.minStars === r).slice(0, 4);
    const deck = same.map((c, i) => ({ charId: c.id, stars: i === 0 ? 6 : 1 }));
    let strong = 0;
    for (let s = 1; s < 2000; s++) if (firstClearOffer(deck, seq(s))[0] === same[0].id) strong++;
    expect(strong / 2000).toBeLessThan(0.2); // sem peso seria ~25%
  });
});
