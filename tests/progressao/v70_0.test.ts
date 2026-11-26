import { describe, expect, it } from 'vitest';
import { LEADERS, LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';
import { defaultSave, migrateV70, type SaveData } from '../../src/ui/save';

describe('v0.70.0 — Comandante com 30 níveis', () => {
  it('30 níveis, requisitos crescentes, nível 30 = baralho máximo', () => {
    expect(LEADERS[0].hpByLevel).toBe(LEADER_HP);
    expect(LEADER_THRESHOLDS.length).toBe(30);
    for (let i = 1; i < 30; i++) expect(LEADER_THRESHOLDS[i]).toBeGreaterThan(LEADER_THRESHOLDS[i - 1]);
  });

  it('save antigo: nível pelo Poder atual, sem passar da vida que tinha', () => {
    const s = defaultSave() as SaveData;
    s.leaders = { barbaro: { level: 10 } }; // vida 64 na escala antiga
    migrateV70(s, {});
    expect(s.leaders!.barbaro.level).toBe(1); // baralho do save novo (só o Riku) não alcança o Nv.2
    const t = defaultSave() as SaveData;
    t.leaders = { barbaro: { level: 2 } }; // vida 26 na escala antiga
    migrateV70(t, { v70: true });
    expect(t.leaders!.barbaro.level).toBe(2); // já convertido: não mexe
  });
});
