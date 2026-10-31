import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cellOnly } from '../../src/core/tutorial';

describe('v0.55.2 tutorial', () => {
  it('só a casa indicada aceita a carta', () => {
    const g = cellOnly(1, 2);
    expect(g(1, 2)).toBe(true);
    expect(g(0, 2)).toBe(false);
    expect(g(1, 3)).toBe(false);
  });
  it('BattleView respeita o cellGate no toque e no arrasto', () => {
    const src = readFileSync('src/ui/battleView.ts', 'utf8');
    expect(src.match(/this\.cellGate && !this\.cellGate\(r, c\)/g)?.length).toBe(2);
  });
  it('detalhe da carta sem rolagem quando cabe', () => {
    const src = readFileSync('src/ui/battleModals.ts', 'utf8');
    expect(src).toContain('fitNoScroll(bg)');
    expect(readFileSync('src/ui/style.css', 'utf8')).toContain('.bcm-body.fits { overflow: hidden');
  });
  it('dica sobe para a faixa acima da arena enquanto os personagens agem', () => {
    const src = readFileSync('src/app/tutorial.ts', 'utf8');
    expect(src).toContain('clear: true, strip: topStrip(view.root)');
  });
});
