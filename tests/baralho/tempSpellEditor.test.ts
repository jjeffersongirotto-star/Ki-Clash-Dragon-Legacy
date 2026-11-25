import { beforeEach, describe, expect, it } from 'vitest';
import { applySpellEdits, exportSpells, SPELL_FIELDS, SPELL_KEY, swapNumber } from '../../src/app/tempSpellEditor';
import { SPELLS, SPELL_BY_ID, SPELL_NUM } from '../../src/core/spells';
import { waitFor } from '../../src/core/battle';

const mem: Record<string, string> = {};
(globalThis as { localStorage?: unknown }).localStorage ??= {
  getItem: (k: string) => mem[k] ?? null,
  setItem: (k: string, v: string) => void (mem[k] = v),
  removeItem: (k: string) => void delete mem[k],
};

describe('v0.67.8 — editor TEMP dos feitiços', () => {
  beforeEach(() => {
    localStorage.removeItem(SPELL_KEY);
    applySpellEdits({});
  });
  it('todo feitiço tem a lista de números, e cada número do jogo pertence a um feitiço só', () => {
    for (const s of SPELLS) expect(SPELL_FIELDS[s.id], s.id).toBeDefined();
    const keys = Object.values(SPELL_FIELDS).flat().map(([k]) => k);
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual(Object.keys(SPELL_NUM).sort());
  });
  it('mudanças salvas valem no jogo e "Restaurar" volta ao código', () => {
    applySpellEdits({ 'f-investida': { wait: 4, rarity: 3, categories: ['dps', 'tanque'], description: 'x', num: { investida: 300 } } });
    expect(SPELL_NUM.investida).toBe(300);
    expect(waitFor('f-investida')).toBe(4);
    expect(SPELL_BY_ID['f-investida'].rarity).toBe(3);
    expect(SPELL_BY_ID['f-investida'].categories).toEqual(['dps', 'tanque']);
    applySpellEdits({});
    expect(SPELL_NUM.investida).toBe(250);
    expect(waitFor('f-investida')).toBe(2);
    expect(SPELL_BY_ID['f-investida'].rarity).toBe(2);
    expect(SPELL_BY_ID['f-investida'].categories).toEqual(['dps']);
  });
  it('o arquivo traz só os feitiços mudados, com o original', () => {
    expect(exportSpells({})).toBeNull();
    const out = exportSpells({ 'f-chuva': { num: { chuva: 90 } } }) as Record<string, { original: { num: Record<string, number> } }>;
    expect(Object.keys(out)).toEqual(['f-chuva']);
    expect(out['f-chuva'].original.num.chuva).toBe(100);
  });
  it('a descrição acompanha o número trocado', () => {
    expect(swapNumber('sofre 250% do ataque', 250, 300)).toBe('sofre 300% do ataque');
    expect(swapNumber('ganha +5 de ataque, 2 de dano, por 3 rodadas', 3, 4)).toBe('ganha +5 de ataque, 2 de dano, por 4 rodadas');
  });
  it('raridade inicial e final: a inicial vale no jogo, a final é guardada e volta ao restaurar', () => {
    applySpellEdits({ 'f-cura': { rarity: 2, maxRarity: 4 } });
    expect(SPELL_BY_ID['f-cura'].rarity).toBe(2);
    expect(SPELL_BY_ID['f-cura'].maxRarity).toBe(4);
    applySpellEdits({ 'f-cura': { rarity: 3, maxRarity: 2 } }); // final abaixo da inicial = sem final
    expect(SPELL_BY_ID['f-cura'].maxRarity).toBeUndefined();
    applySpellEdits({});
    expect(SPELL_BY_ID['f-cura'].rarity).toBe(1);
    expect(SPELL_BY_ID['f-cura'].maxRarity).toBeUndefined();
  });
});
