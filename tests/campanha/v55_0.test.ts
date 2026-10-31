import { describe, expect, it } from 'vitest';
import { holdPhase, newGuideMemo } from '../../src/core/tutorial';

describe('v0.55.0 — passo "segure a carta" do tutorial', () => {
  it('antes de segurar, segue o roteiro normal', () => {
    const m = newGuideMemo();
    expect(holdPhase(m, false)).toBe('guide');
    expect(m.infoDone).toBe(false);
  });
  it('com a descrição aberta, só ela fica destacada', () => {
    const m = newGuideMemo();
    m.held = true;
    expect(holdPhase(m, true)).toBe('info');
    expect(m.infoDone).toBe(false);
  });
  it('ao fechar a descrição, avança (não pede para abrir de novo)', () => {
    const m = newGuideMemo();
    m.held = true;
    holdPhase(m, true);
    expect(holdPhase(m, false)).toBe('guide');
    expect(m.infoDone).toBe(true);
    // abrir de novo depois não volta ao passo da descrição
    expect(holdPhase(m, true)).toBe('guide');
  });
});

import { readFileSync } from 'node:fs';
const tut = readFileSync('src/app/tutorial.ts', 'utf8');
const spot = readFileSync('src/ui/spotlight.ts', 'utf8');
const adv = readFileSync('src/app/adventure.ts', 'utf8');
describe('v0.55.0 — tutorial sem ação fora de hora', () => {
  it('a explicação das casas trava os toques e só sai pelo Continuar', () => {
    expect(tut).toMatch(/lock: intro, onNext: intro/);
    expect(spot).toMatch(/spot-lock/);
  });
  it('Banner: primeiro a explicação destacada, depois o Comprar 1 carta', () => {
    expect(tut).toMatch(/onNext: \(\) => \(introDone = true\)/);
  });
  it('carta ganha sem moldura/pontilhado por cima e sem texto do tutorial nos detalhes', () => {
    expect(tut).not.toMatch(/area: reveal/);
    expect(tut).toMatch(/battle-card-modal-bg'\)\) return clearSpotlight\(\)/);
  });
  it('fase: sem o texto de recompensa em dobro', () => {
    expect(adv).not.toMatch(/em dobro na primeira vitória\)<\/small>/);
  });
});
