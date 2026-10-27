import { describe, expect, it } from 'vitest';
import { DUP_OVERFLOW_REFUND, dupBaseXp, feedCopy, overflowRefund, xpToOrbs } from '../../src/core/banner';
import { bagXp, cardBarXp, newOwned, type OwnedCard, type XpItemId } from '../../src/core/progression';

describe('v0.28.3 — XP de cópia que passa da barra cheia vira Orbe (25%)', () => {
  it('converte XP em Orbes do maior para o menor e descarta o resto abaixo de 100', () => {
    expect(xpToOrbs(0)).toEqual({});
    expect(xpToOrbs(99)).toEqual({});
    expect(xpToOrbs(100)).toEqual({ orbe1: 1 });
    expect(xpToOrbs(250)).toEqual({ orbe2: 1 });
    expect(xpToOrbs(4650)).toEqual({ orbe6: 1, orbe5: 1, orbe1: 1 });
    expect(xpToOrbs(1299)).toEqual({ orbe4: 1, orbe3: 1 });
    // nunca devolve mais XP do que o valor informado, e perde menos de 100
    for (const xp of [0, 57, 100, 349, 999, 2500, 7777, 12345]) {
      const back = bagXp(xpToOrbs(xp));
      expect(back).toBeLessThanOrEqual(xp);
      expect(xp - back).toBeLessThan(100);
    }
  });

  it('devolve 25% do XP que passou da barra', () => {
    expect(DUP_OVERFLOW_REFUND).toBe(0.25);
    expect(overflowRefund(400)).toEqual({ orbe1: 1 });
    expect(overflowRefund(1600)).toEqual({ orbe3: 1 });
    expect(overflowRefund(300)).toEqual({});
  });

  it('cópia desmanchada (direcionado, v0.32.0) com a barra cheia: o XP que passou volta em Orbes na bolsa', () => {
    const owned: OwnedCard = { ...newOwned('riku') };
    owned.xp = cardBarXp(owned);
    const items: Partial<Record<XpItemId, number>> = { orbe1: 2 };
    const g = feedCopy(owned, 3, 0, () => 0.99, items);
    expect(g.wasted).toBe(dupBaseXp(3)); // barra já cheia: tudo passou
    expect(g.refund).toEqual(xpToOrbs(dupBaseXp(3) * 0.25));
    expect(items.orbe1).toBe(2 + (g.refund.orbe1 ?? 0));
    expect(bagXp(g.refund)).toBeGreaterThan(0);
  });

  it('sem XP passando, nada é devolvido; sem bolsa informada, a bolsa não muda', () => {
    const g = feedCopy({ ...newOwned('riku') }, 1, 0, () => 0.99);
    expect(g.wasted).toBe(0);
    expect(g.refund).toEqual({});
  });
});
