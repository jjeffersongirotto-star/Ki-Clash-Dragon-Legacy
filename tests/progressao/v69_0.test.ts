import { describe, expect, it } from 'vitest';
import { FUSE_COST, addGear, fuseGear, gearCount, gearSources, isGearUnlocked, markGearSeen, stageGearChance, stageGearOdds, stageGearRarity, type GearBag } from '../../src/core/gear';

describe('v0.69.0 — cores dos itens por faixa', () => {
  it('v0.72.0: cor da fase sobe aos poucos; a cor acima começa com 94,9 / 4 / 1 / 0,1% e chega a ~35% (não inverte)', () => {
    // começo de cada cor: chance pequena (nem jogando 10 vezes é garantido)
    expect(stageGearOdds(30, 'facil')).toEqual({ low: 3, high: 4, odds: [0.949, 0.04, 0.01, 0.001] });
    // perto de onde a cor faz falta: ~35% dos itens na cor nova; nunca mais que isso
    expect(stageGearRarity(16, 'facil')).toEqual([2, 3]);
    expect(stageGearChance(16, 'facil')).toBeGreaterThan(0.33);
    expect(stageGearChance(59, 'facil')).toBeGreaterThan(0.33);
    expect(stageGearRarity(20, 'facil')[0]).toBe(3);
    expect(stageGearRarity(63, 'facil')[0]).toBe(4);
    for (const d of ['facil', 'normal', 'dificil'] as const)
      for (let s = 1; s <= 100; s++) {
        expect(stageGearChance(s, d)).toBeLessThanOrEqual(0.36);
        expect(stageGearOdds(s, d).odds.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 3);
        if (s === 1) continue;
        // a cor da fase nunca desce; dentro da mesma cor, a chance nunca desce
        const a = stageGearOdds(s - 1, d), b = stageGearOdds(s, d);
        expect(b.low).toBeGreaterThanOrEqual(a.low);
        if (a.low === b.low) expect(stageGearChance(s, d)).toBeGreaterThanOrEqual(stageGearChance(s - 1, d));
      }
    // laranja: raro no Fácil e no Normal (o lugar dele é o Difícil, que fica só laranja)
    for (let s = 1; s <= 100; s++) {
      expect(stageGearRarity(s, 'facil')[0]).toBeLessThanOrEqual(4);
      expect(stageGearRarity(s, 'normal')[0]).toBeLessThanOrEqual(4);
      expect(stageGearRarity(s, 'normal')[0]).toBeGreaterThanOrEqual(3);
      expect(stageGearRarity(s, 'dificil')[0]).toBeGreaterThanOrEqual(4);
    }
    expect(stageGearChance(100, 'facil')).toBeLessThan(0.16);
    expect(stageGearChance(100, 'normal')).toBeLessThan(0.21);
    expect(stageGearRarity(40, 'dificil')).toEqual([5, 5]);
  });

  it('onde conseguir: cor da fase × só com chance', () => {
    const src = gearSources('elmo', 1);
    expect(src).toEqual([{ diff: 'facil', stages: [1, 11], chance: [] }]);
    const az = gearSources('elmo', 3).find((s) => s.diff === 'facil')!;
    expect(az.chance).toEqual([]); // v0.72.0: o azul só tem chance nas fases 12–19 (o elmo cai na 1, 11, 21…)
    expect(az.stages).toContain(21);
    expect(gearSources('elmo', 5).map((s) => s.diff)).toEqual(['facil', 'normal', 'dificil']);
  });
});

describe('v0.69.0 — fusão e cadeado', () => {
  it('3 iguais → 1 da cor acima, pagando Essências; precisa ter ganho o item nessa cor', () => {
    const bag: GearBag = {};
    addGear(bag, 'elmo', 1, 4);
    const w = { essencias: 100 };
    const seen: string[] = [];
    expect(fuseGear(bag, w, seen, 'elmo', 2)).toMatchObject({ ok: false, reason: 'cadeado' });
    markGearSeen(seen, 'elmo', 2);
    expect(isGearUnlocked(seen, 'elmo', 2)).toBe(true);
    expect(isGearUnlocked(seen, 'armadura', 2)).toBe(false); // por item, não por cor
    expect(fuseGear(bag, w, seen, 'elmo', 2)).toEqual({ ok: true, cost: FUSE_COST[2] });
    expect(gearCount(bag, 'elmo', 1)).toBe(1);
    expect(gearCount(bag, 'elmo', 2)).toBe(1);
    expect(w.essencias).toBe(95);
    expect(fuseGear(bag, w, seen, 'elmo', 2)).toMatchObject({ ok: false, reason: 'itens' });
    expect(FUSE_COST).toEqual({ 2: 5, 3: 10, 4: 20, 5: 40 });
  });
});
