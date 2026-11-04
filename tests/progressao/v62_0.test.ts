import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSave, loadSave } from '../../src/ui/save';
import { getChar } from '../../src/core/characters';
import { ascendCostFor } from '../../src/core/progression';
import { gearCount, charGear, reqRarity } from '../../src/core/gear';
import { furyBonus } from '../../src/core/battle';
import { LEADER_HP } from '../../src/core/leaders';
import { BALANCE_V2 } from '../../src/core/balanceV2';
import { PLAYABLE } from '../../src/core/characters';

const KEY = 'kicdl-save-v1';

describe('v0.62.0 — balanceamento v2.0 (escala enxuta)', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage;
  });
  it('toda carta jogável está na tabela, com ATQ 1–9, vida 1–16 e Espera 1–8', () => {
    for (const d of PLAYABLE) {
      const b = BALANCE_V2[d.id];
      expect(b, d.id).toBeTruthy();
      expect([d.minStars, d.maxStars, d.wait]).toEqual([b.min, b.max, b.wait]);
      for (const [atk, hp] of Object.values(b.stats)) {
        expect(atk).toBeGreaterThanOrEqual(1);
        expect(atk).toBeLessThanOrEqual(9);
        expect(hp).toBeGreaterThanOrEqual(1);
        expect(hp).toBeLessThanOrEqual(16);
      }
    }
  });
  it('Nara em Épico+ volta para Raro++ e devolve Essências e itens dos Despertares acima do topo', () => {
    const s = defaultSave();
    s.cards.nara = { charId: 'nara', stars: 4, plus: 1, xp: 10 };
    s.dupes = { nara: { 4: 2, 3: 1 } };
    s.essencias = 0;
    delete (s as Partial<typeof s>).v62;
    localStorage.setItem(KEY, JSON.stringify(s));
    const d = loadSave();
    expect(getChar('nara').maxStars).toBe(3);
    expect(d.cards.nara).toMatchObject({ stars: 3, plus: 2 });
    // Despertares feitos acima do topo: Raro++ → Épico e Épico → Épico+
    expect(d.essencias).toBe(ascendCostFor(3, 2) + ascendCostFor(4, 0));
    const g = charGear('nara');
    for (const r of g.awaken) expect(gearCount(d.gear, r.id, reqRarity(r, 3)), r.id).toBeGreaterThanOrEqual(1);
    expect(d.dupes!.nara).toEqual({ 3: 3 });
  });
  it('save já convertido não ganha reembolso de novo', () => {
    const s = defaultSave();
    s.cards.nara = { charId: 'nara', stars: 3, plus: 2, xp: 0 };
    s.essencias = 5;
    localStorage.setItem(KEY, JSON.stringify(s));
    expect(loadSave().essencias).toBe(5);
  });
  it('Fúria de batalha a cada 5 turnos e vida do Comandante na escala nova', () => {
    expect(furyBonus(13)).toBe(2);
    expect(LEADER_HP[LEADER_HP.length - 1]).toBe(64);
  });
});
