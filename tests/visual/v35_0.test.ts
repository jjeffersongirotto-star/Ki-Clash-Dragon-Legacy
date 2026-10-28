import { describe, expect, it } from 'vitest';
import { ABILITIES } from '../../src/core/abilities';
import { SPELLS } from '../../src/core/spells';
import { PLAYABLE } from '../../src/core/characters';
import { abilityListHTML } from '../../src/ui/components';
import { COMMANDER_LOOK } from '../../src/ui/art';

describe('v0.35.0 — textos limpos, segurar para ver e Comandantes inteiros', () => {
  it('as descrições não falam de versões nem de regras internas', () => {
    for (const ab of Object.values(ABILITIES)) expect(ab.description).not.toMatch(/v\d+\.\d+|até a v|decisão \d/);
    for (const sp of SPELLS) expect(sp.description).not.toMatch(/v\d+\.\d+|até a v/);
  });
  it('a lista de habilidades da carta não mostra mais a linha "Por raridade"', () => {
    for (const def of PLAYABLE) {
      const h = abilityListHTML(def, def.maxStars, 2);
      expect(h).not.toContain('Por raridade');
      expect(h).not.toContain('ab-scale');
    }
  });
  // v0.38.0: em vez de desenhar o redemoinho por cima, a Nyx deixou de ser Comandante (ver v38_0.test.ts)
  it('a Nyx não está mais na tabela de Comandantes (o redemoinho da arte saía pela metade)', () => {
    expect(COMMANDER_LOOK.nyx).toBeUndefined();
  });
});
