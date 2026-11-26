import { describe, expect, it } from 'vitest';
import { FUSE_COST, addGear, fuseGear, gearCount, gearSources, isGearUnlocked, markGearSeen, stageGearChance, stageGearRarity, type GearBag } from '../../src/core/gear';

describe('v0.69.0 — cores dos itens por faixa', () => {
  it('Fácil tem teto: cinza → azul, roxo só no fim; Normal azul+; Difícil roxo+', () => {
    expect(stageGearRarity(20, 'facil')).toEqual([1, 2]);
    expect(stageGearRarity(21, 'facil')).toEqual([2, 3]);
    expect(stageGearRarity(51, 'facil')).toEqual([3, 4]);
    expect(stageGearChance(51, 'facil')).toBe(0.1);
    expect(stageGearChance(81, 'facil')).toBe(0.4);
    for (let s = 1; s <= 100; s++) {
      expect(Math.max(...stageGearRarity(s, 'facil'))).toBeLessThanOrEqual(4);
      expect(Math.min(...stageGearRarity(s, 'normal'))).toBeGreaterThanOrEqual(3);
      expect(Math.min(...stageGearRarity(s, 'dificil'))).toBeGreaterThanOrEqual(4);
    }
    // v0.71.0: laranja só no Difícil
    for (let s = 1; s <= 100; s++) expect(Math.max(...stageGearRarity(s, 'normal'))).toBeLessThanOrEqual(4);
    expect(stageGearChance(71, 'normal')).toBe(0.5);
  });

  it('onde conseguir: item da fase 1 em cinza sai no Fácil 1 e 11', () => {
    const src = gearSources('elmo', 1);
    expect(src).toEqual([{ diff: 'facil', stages: [1, 11] }]);
    expect(gearSources('elmo', 5).map((s) => s.diff)).toEqual(['dificil']);
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
