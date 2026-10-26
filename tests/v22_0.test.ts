import { describe, expect, it } from 'vitest';
import { HARD_LEGENDARY_CHANCE, HARD_MYTHIC_CHANCE, rewardsFor } from '../src/core/adventure';
import { STAGES } from '../src/core/campaign';
import { XP_ITEMS, bagXp, playXp } from '../src/core/progression';
import { defaultSave, migrateOrbs } from '../src/ui/save';
import { adminSave } from '../src/ui/accounts';

describe('v0.22.0 — Orbes por raridade', () => {
  it('6 Orbes, um por raridade, com o XP decidido', () => {
    expect(XP_ITEMS.map((o) => [o.rarity, o.xp])).toEqual([[1, 100], [2, 250], [3, 400], [4, 800], [5, 1500], [6, 3000]]);
  });
  it('itens antigos viram Orbes sem perder XP; lixo vira 0', () => {
    const m = migrateOrbs({ pergaminho: 10, cristal: 3, orbe: 2, lixo: 5, orbe4: 1, orbe2: -3 });
    expect(m).toEqual({ orbe1: 10, orbe2: 0, orbe3: 3, orbe4: 1, orbe5: 2, orbe6: 0 });
    expect(bagXp(m)).toBe(10 * 100 + 3 * 400 + 2 * 1500 + 800);
    expect(migrateOrbs(undefined)).toEqual({ orbe1: 0, orbe2: 0, orbe3: 0, orbe4: 0, orbe5: 0, orbe6: 0 });
  });
  it('save novo começa com o mesmo XP de antes (10 📜 + 3 💎 = 10 Orbes Comuns + 3 Raros); ADM com 999 de cada', () => {
    expect(defaultSave().items).toEqual({ orbe1: 10, orbe2: 0, orbe3: 3, orbe4: 0, orbe5: 0, orbe6: 0 });
    expect(Object.values(adminSave().items).every((v) => v === 999)).toBe(true);
  });
  it('Fácil: Orbes Comum e Incomum com o XP de antes (±150)', () => {
    STAGES.forEach((s, i) => {
      const old = (4 + 2 * i) * 100 + (1 + Math.floor(i / 2)) * 400 + (i >= 5 ? 1500 : 0);
      const r = rewardsFor(s.id, 'facil');
      expect(Object.keys(r.orbs).sort()).toEqual(['orbe1', 'orbe2']);
      expect(Math.abs(bagXp(r.orbs) - old)).toBeLessThanOrEqual(150);
    });
  });
  it('Normal: Raro e Épico; Difícil: Épicos + chances de Lendário (10%) e Mítico (2%); XP parecido nas três (±500, arredondamento nas fases iniciais)', () => {
    for (const s of STAGES) {
      const f = bagXp(rewardsFor(s.id, 'facil').orbs);
      const n = rewardsFor(s.id, 'normal').orbs;
      expect(Object.keys(n).sort()).toEqual(['orbe3', 'orbe4']);
      expect(Math.abs(bagXp(n) - f)).toBeLessThanOrEqual(500);
      const none = rewardsFor(s.id, 'dificil', () => 0.99).orbs;
      expect(Object.keys(none)).toEqual(['orbe4']);
      expect(Math.abs(bagXp(none) - f)).toBeLessThanOrEqual(500);
      const both = rewardsFor(s.id, 'dificil', () => 0).orbs;
      expect(both.orbe5).toBe(1);
      expect(both.orbe6).toBe(1);
    }
    expect([HARD_LEGENDARY_CHANCE, HARD_MYTHIC_CHANCE]).toEqual([0.1, 0.02]);
    // só Lendário (entre 2% e 10%)
    const leg = rewardsFor(5, 'dificil', () => 0.05).orbs;
    expect([leg.orbe5, leg.orbe6]).toEqual([1, undefined]);
  });
  it('XP por jogar: 15 + 5 × fase', () => {
    expect(playXp(1)).toBe(20);
    expect(playXp(10)).toBe(65);
  });
});
