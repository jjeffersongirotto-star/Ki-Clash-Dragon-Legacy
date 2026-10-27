import { describe, expect, it } from 'vitest';
import { BANNERS, BANNER_EXCLUSIVE, bannerPrice, drawAt, dupBaseXp, dupMultiplier, grantCard, poolFor, pull, rollRarity } from '../../src/core/banner';
import { getChar } from '../../src/core/characters';
import { STAGES } from '../../src/core/campaign';
import { cardBarXp, newOwned, type OwnedCard } from '../../src/core/progression';

const lcg = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const B = BANNERS[0];

describe('v0.27.0 — Banner de cartas', () => {
  it('preços 300 / 2.700 e chances 40/27/20/10/3', () => {
    expect(bannerPrice(B, 1)).toBe(300);
    expect(bannerPrice(B, 10)).toBe(2700);
    expect(B.odds).toEqual({ 1: 0.4, 2: 0.27, 3: 0.2, 4: 0.1, 5: 0.03 });
    expect(Object.values(B.odds).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });

  it('a raridade sorteada segue as chances', () => {
    const rng = lcg(7);
    const n = 40000;
    const count: Record<number, number> = {};
    for (let i = 0; i < n; i++) {
      const r = rollRarity(B.odds, rng);
      count[r] = (count[r] ?? 0) + 1;
    }
    for (const [r, p] of Object.entries(B.odds)) expect(Math.abs(count[Number(r)] / n - p)).toBeLessThan(0.01);
  });

  it('cada carta é um personagem que pode estar na raridade sorteada', () => {
    const rng = lcg(3);
    for (let r = 1; r <= 5; r++)
      for (let i = 0; i < 200; i++) {
        const c = drawAt(B, r, rng);
        const def = getChar(c.charId);
        expect(c.stars).toBe(r);
        expect(def.minStars).toBeLessThanOrEqual(r);
        expect(def.maxStars).toBeGreaterThanOrEqual(r);
        expect(def.summonOnly).toBeFalsy();
      }
  });

  it('Kenji e Vorax: só no Lendário do banner, metade das cartas Lendárias', () => {
    expect(poolFor(5)).toEqual(expect.arrayContaining(['kenji', 'vorax']));
    for (let r = 1; r <= 4; r++) for (const id of BANNER_EXCLUSIVE) expect(poolFor(r)).not.toContain(id);
    const rng = lcg(11);
    let feat = 0;
    for (let i = 0; i < 4000; i++) if (BANNER_EXCLUSIVE.includes(drawAt(B, 5, rng).charId)) feat++;
    expect(feat / 4000).toBeGreaterThan(0.45);
    expect(feat / 4000).toBeLessThan(0.55);
    // não vêm em pacote de fase
    for (const st of STAGES) for (const id of BANNER_EXCLUSIVE) expect(st.pack).not.toContain(id);
  });

  it('pacote de 10: 10 cartas e pelo menos 1 Rara ou melhor', () => {
    const rng = lcg(5);
    for (let k = 0; k < 500; k++) {
      const got = pull(B, 10, rng);
      expect(got).toHaveLength(10);
      expect(got.some((c) => c.stars >= 3)).toBe(true);
    }
    expect(pull(B, 1, rng)).toHaveLength(1);
  });
});

describe('v0.27.0 — cópias repetidas viram XP', () => {
  it('XP base = Orbe da raridade + 20% por "+"', () => {
    expect([1, 2, 3, 4, 5, 6].map((s) => dupBaseXp(s))).toEqual([100, 250, 400, 800, 1500, 3000]);
    expect(dupBaseXp(3, 1)).toBe(480);
    expect(dupBaseXp(3, 2)).toBe(560);
  });

  it('sorte: 12% ×2 · 5% ×5 · 1% ×10, senão ×1', () => {
    expect(dupMultiplier(() => 0.005)).toBe(10);
    expect(dupMultiplier(() => 0.03)).toBe(5);
    expect(dupMultiplier(() => 0.1)).toBe(2);
    expect(dupMultiplier(() => 0.5)).toBe(1);
    const rng = lcg(9);
    const n = 50000;
    const c: Record<number, number> = { 1: 0, 2: 0, 5: 0, 10: 0 };
    for (let i = 0; i < n; i++) c[dupMultiplier(rng)]++;
    expect(c[2] / n).toBeCloseTo(0.12, 1);
    expect(c[5] / n).toBeCloseTo(0.05, 1);
    expect(c[10] / n).toBeCloseTo(0.01, 1);
  });

  it('personagem novo entra na raridade da carta; repetido vira XP e não sobe a raridade', () => {
    const cards: Record<string, OwnedCard> = {};
    const a = grantCard(cards, { charId: 'riku', stars: 3 }, () => 0.9);
    expect(a.isNew).toBe(true);
    expect(cards.riku).toMatchObject({ stars: 3, plus: 0, xp: 0 });
    const b = grantCard(cards, { charId: 'riku', stars: 4 }, () => 0.9);
    expect(b.isNew).toBe(false);
    if (!b.isNew) expect(b.xp).toBe(800);
    expect(cards.riku.stars).toBe(3);
    expect(cards.riku.xp).toBe(Math.min(800, cardBarXp(cards.riku)));
  });

  it('cópia com sorte ×10 e XP que passa da barra é perdido (regra de sempre)', () => {
    const cards = { daichi: newOwned('daichi') };
    const r = grantCard(cards, { charId: 'daichi', stars: 1 }, () => 0.001);
    expect(r.isNew).toBe(false);
    if (!r.isNew) {
      expect(r.mult).toBe(10);
      expect(r.xp).toBe(1000);
      expect(cards.daichi.xp).toBe(Math.min(1000, cardBarXp(cards.daichi)));
      expect(r.wasted).toBe(Math.max(0, 1000 - cardBarXp(cards.daichi)));
    }
  });
});
