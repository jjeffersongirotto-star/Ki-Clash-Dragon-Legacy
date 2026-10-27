import { describe, expect, it } from 'vitest';
import { BANNERS, PITY_EVERY, pityCount, pull } from '../../src/core/banner';

const lcg = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const B = BANNERS[0];

describe('v0.31.0 — banner: chances novas, Épico no pacote de 10 e Lendária a cada 80', () => {
  it('chances: Comum 25 · Incomum 30 · Raro 25 · Épico 15 · Lendário 4 · Mítico 1', () => {
    expect(B.odds).toEqual({ 1: 0.25, 2: 0.3, 3: 0.25, 4: 0.15, 5: 0.04, 6: 0.01 });
    expect(B.guarantee10).toBe(4);
  });

  it('pacote de 10 sempre traz uma Épica ou melhor', () => {
    const rng = lcg(11);
    for (let k = 0; k < 400; k++) expect(pull(B, 10, rng).some((c) => c.stars >= 4)).toBe(true);
  });

  it('a 80ª carta sem Lendária vem Lendária ou Mítica, e o contador volta a 0', () => {
    // sorte "ruim": sempre o número mais alto (raridade mais baixa do sorteio)
    const pity: Record<string, number> = {};
    const bad = () => 0.0001;
    for (let i = 1; i < PITY_EVERY; i++) {
      const [c] = pull(B, 1, bad, pity);
      expect(c.stars).toBe(1);
      expect(pityCount(B, pity)).toBe(i);
    }
    const [c80] = pull(B, 1, bad, pity);
    expect(c80.stars).toBeGreaterThanOrEqual(5);
    expect(pityCount(B, pity)).toBe(0);
  });

  it('o pacote de 10 conta 10 cartas no contador; sair Lendária por sorte também zera', () => {
    const pity: Record<string, number> = { [B.id]: 3 };
    pull(B, 10, () => 0.0001, pity);
    expect(pityCount(B, pity)).toBe(13);
    const p2: Record<string, number> = { [B.id]: 40 };
    pull(B, 1, () => 0.9999, p2); // sorteia a raridade mais alta (Mítico)
    expect(pityCount(B, p2)).toBe(0);
  });

  it('com sorte normal, nunca passa de 80 cartas sem uma Lendária ou Mítica', () => {
    const rng = lcg(99);
    const pity: Record<string, number> = {};
    let since = 0;
    for (let k = 0; k < 300; k++)
      for (const c of pull(B, 10, rng, pity)) {
        since = c.stars >= 5 ? 0 : since + 1;
        expect(since).toBeLessThan(PITY_EVERY);
      }
  });
});
