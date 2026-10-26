import { describe, expect, it } from 'vitest';
import { GEAR, GEAR_CATEGORIES, GEAR_DROP, GEAR_RARE_CHANCE, GEAR_SETS, STAGE_GEAR, addGear, ascendWithGear, charGear, gearCount, gearNeeded, hasGearFor, normalizeGear, stageGearDrop, type GearBag } from '../src/core/gear';
import { CHAR_BY_ID, PLAYABLE, getChar } from '../src/core/characters';
import { FIRST_WIN_XP_MULT, rewardsFor } from '../src/core/adventure';
import { STEP_BAR, cardBarXp, migrateBarV24, newOwned, stepXp } from '../src/core/progression';
import { STAGES } from '../src/core/campaign';
import { adminSave } from '../src/ui/accounts';
import { defaultSave } from '../src/ui/save';

describe('v0.24.0 — itens de ascensão', () => {
  it('30 itens: 6 categorias × 5, ids únicos', () => {
    expect(GEAR_CATEGORIES).toHaveLength(6);
    for (const c of GEAR_CATEGORIES) expect(GEAR_SETS[c]).toHaveLength(5);
    expect(new Set(GEAR.map((g) => g.id)).size).toBe(30);
    expect(GEAR_SETS.tanque.map((g) => g.name)).toEqual(['Elmo', 'Armadura', 'Escudo', 'Manoplas', 'Botas de ferro']);
    expect(GEAR_SETS.assassino.map((g) => g.name)).toContain('Diamante negro');
  });

  it('cada personagem: 3 itens no "+" (1 de cima), 4 no "++" (2 de cima), os 5 no Despertar (3 de cima)', () => {
    for (const def of PLAYABLE) {
      const g = charGear(def.id);
      const set = GEAR_SETS[def.category].map((x) => x.id);
      const steps = [g.plus, g.plus2, g.awaken];
      steps.forEach((reqs, i) => {
        expect(reqs).toHaveLength(3 + i);
        expect(reqs.filter((r) => r.above)).toHaveLength(1 + i);
        expect(reqs.filter((r) => !r.above)).toHaveLength(2);
        expect(new Set(reqs.map((r) => r.id)).size).toBe(reqs.length);
        for (const r of reqs) expect(set).toContain(r.id);
      });
      expect(new Set(g.awaken.map((r) => r.id)).size).toBe(5);
      expect(charGear(def.id)).toEqual(g); // fixo
    }
    // varia de um personagem para outro da mesma categoria
    const mages = PLAYABLE.filter((d) => d.category === 'mago').map((d) => charGear(d.id).plus.map((r) => r.id).join());
    expect(new Set(mages).size).toBeGreaterThan(1);
  });

  it('carta Comum: "+" 2 cinza + 1 verde · "++" 2 cinza + 2 verde · Despertar 2 cinza + 3 verde; Lendária e Mítica só laranja', () => {
    const c = { charId: 'riku', stars: 1, plus: 0 };
    const count = (n: { rarity: number }[], r: number) => n.filter((x) => x.rarity === r).length;
    for (const [plus, green] of [[0, 1], [1, 2], [2, 3]]) {
      const n = gearNeeded({ ...c, plus });
      expect(count(n, 1)).toBe(2);
      expect(count(n, 2)).toBe(green);
    }
    const raro = gearNeeded({ ...c, stars: 3, plus: 2 });
    expect(count(raro, 3)).toBe(2);
    expect(count(raro, 4)).toBe(3);
    expect(gearNeeded({ charId: 'kenji', stars: 5, plus: 2 }).every((n) => n.rarity === 5)).toBe(true);
    expect(gearNeeded({ charId: 'kenji', stars: 6, plus: 0 }).every((n) => n.rarity === 5)).toBe(true);
    const top = getChar('riku');
    expect(gearNeeded({ charId: 'riku', stars: top.maxStars, plus: 2 })).toEqual([]);
  });

  it('Despertar pede barra cheia, Essências e os itens; gasta os itens', () => {
    const card = newOwned('riku');
    const bag: GearBag = {};
    expect(ascendWithGear(card, 999, bag).reason).toBe('barra');
    card.xp = cardBarXp(card);
    expect(ascendWithGear(card, 0, bag).reason).toBe('essencias');
    expect(ascendWithGear(card, 999, bag).reason).toBe('itens');
    for (const n of gearNeeded(card)) addGear(bag, n.id, n.rarity);
    expect(hasGearFor(bag, card)).toBe(true);
    const need = gearNeeded(card);
    expect(ascendWithGear(card, 999, bag).ok).toBe(true);
    expect(card.plus).toBe(1);
    for (const n of need) expect(gearCount(bag, n.id, n.rarity)).toBe(0);
  });

  it('item de outra cor não serve', () => {
    const card = { ...newOwned('riku') };
    card.xp = cardBarXp(card);
    const bag: GearBag = {};
    for (const n of gearNeeded(card)) addGear(bag, n.id, 3);
    expect(ascendWithGear(card, 999, bag).ok).toBe(false);
  });

  it('cada fase dá 3 itens fixos de categorias diferentes; as 10 fases cobrem os 30', () => {
    expect(STAGE_GEAR).toHaveLength(STAGES.length);
    const all = STAGE_GEAR.flat();
    expect(new Set(all).size).toBe(30);
    for (const ids of STAGE_GEAR) {
      expect(ids).toHaveLength(3);
      const cats = ids.map((id) => GEAR.find((g) => g.id === id)!.category);
      expect(new Set(cats).size).toBe(3);
    }
  });

  it('cor do item: Fácil cinza/verde 60/40 · Normal azul/roxo 80/20 · Difícil roxo/laranja 80/20', () => {
    expect(GEAR_DROP).toEqual({ facil: [1, 2], normal: [3, 4], dificil: [4, 5] });
    for (const d of ['facil', 'normal', 'dificil'] as const) {
      const [lo, hi] = GEAR_DROP[d];
      expect(stageGearDrop(1, d, () => 0.7).map((g) => g.rarity)).toEqual([lo, lo, lo]);
      expect(stageGearDrop(1, d, () => 0.1).map((g) => g.rarity)).toEqual([hi, hi, hi]);
    }
    expect(GEAR_RARE_CHANCE).toEqual({ facil: 0.4, normal: 0.2, dificil: 0.2 });
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let rare = 0;
    for (let i = 0; i < 3000; i++) rare += stageGearDrop(2, 'normal', rng).filter((g) => g.rarity === GEAR_DROP.normal[1]).length;
    expect(rare / 9000).toBeGreaterThan(0.17);
    expect(rare / 9000).toBeLessThan(0.23);
  });

  it('rewardsFor traz os 3 itens da fase (vitória e Repetir)', () => {
    for (const s of STAGES) {
      const r = rewardsFor(s.id, 'facil', () => 0.5);
      expect(r.gear.map((g) => g.id)).toEqual(STAGE_GEAR[s.id - 1]);
    }
  });

  it('save novo e saves antigos começam sem itens; mochila inválida é limpa', () => {
    expect(defaultSave().gear).toEqual({});
    expect(normalizeGear(undefined)).toEqual({});
    expect(normalizeGear({ 'elmo:1': 2, 'xx:1': 3, 'elmo:9': 1, 'arco:2': -1, 'arco:3': 1.7, 'capa:6': 1 })).toEqual({ 'elmo:1': 2, 'arco:3': 1 });
  });

  it('ADM tem itens de sobra (99 de cada item em cada cor)', () => {
    const d = adminSave();
    for (const g of GEAR) for (const r of [1, 2, 3, 4, 5]) expect(gearCount(d.gear, g.id, r)).toBe(99);
    expect(Object.keys(CHAR_BY_ID).length).toBeGreaterThan(0);
  });
});

describe('v0.24.0 — barras de XP 3 / 6 / 10', () => {
  it('"+" = 30% e "++" = 60% do XP do Despertar; XP total da raridade igual ao da v0.23.0', () => {
    expect(STEP_BAR[0] / STEP_BAR[2]).toBeCloseTo(0.3);
    expect(STEP_BAR[1] / STEP_BAR[2]).toBeCloseTo(0.6);
    expect(STEP_BAR.reduce((a, b) => a + b, 0)).toBeCloseTo(3.75);
    for (const s of [1, 2, 3, 4, 5]) expect(stepXp(s, 0) / stepXp(s, 2)).toBeCloseTo(0.3, 2);
  });

  it('carta da v0.23.0 mantém a fração da barra', () => {
    const c = migrateBarV24({ charId: 'riku', stars: 1, plus: 0, xp: 0 });
    expect(c.xp).toBe(0);
    const old = Math.round(stepXp(1, 2) / STEP_BAR[2] * 1); // barra base antiga = 1 × custo base
    const half = migrateBarV24({ charId: 'riku', stars: 1, plus: 0, xp: Math.round(old / 2) });
    expect(half.xp / cardBarXp(half)).toBeCloseTo(0.5, 2);
    const full = migrateBarV24({ charId: 'riku', stars: 1, plus: 0, xp: old });
    expect(full.xp).toBe(cardBarXp(full));
  });
});

describe('v0.24.1 — bônus da primeira vitória', () => {
  it('primeira vitória: XP por jogar em dobro e itens da fase 2 vezes (recompensa + bônus)', () => {
    expect(FIRST_WIN_XP_MULT).toBe(2);
    const bag: GearBag = {};
    for (const g of [...rewardsFor(3, 'facil', () => 0.9).gear, ...stageGearDrop(3, 'facil', () => 0.9)]) addGear(bag, g.id, g.rarity);
    for (const id of STAGE_GEAR[2]) expect(gearCount(bag, id, 1)).toBe(2);
  });
});
