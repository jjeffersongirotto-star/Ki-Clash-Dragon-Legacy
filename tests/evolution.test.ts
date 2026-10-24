import { describe, expect, it } from 'vitest';
import { PLAYABLE } from '../src/core/characters';
import { abilityPower, ABILITIES } from '../src/core/abilities';
import { portraitSVG } from '../src/ui/art';

describe('evolução visual por estrela', () => {
  it('cada estrela alcançável gera um retrato diferente e mais carregado', () => {
    for (const d of PLAYABLE) {
      let prev = '';
      for (let s = d.minStars; s <= d.maxStars; s++) {
        const svg = portraitSVG(d, { stars: s });
        expect(svg).toContain(`tier-${s}`);
        expect(svg).toContain(`g-${d.id}-${s}`);
        if (prev) {
          expect(svg).not.toBe(prev);
          expect(svg.length).toBeGreaterThan(prev.length);
        }
        prev = svg;
      }
    }
  });
  it('elementos marcantes: ombreiras 3★, peitoral/capa 4★, coroa 5★, halo 6★', () => {
    const d = PLAYABLE.find((c) => c.id === 'riku')!;
    const count = (s: number) => (portraitSVG(d, { stars: s }).match(/-metal\)/g) ?? []).length;
    expect(count(1)).toBe(0);
    expect(count(3)).toBeGreaterThan(0);
    expect(count(4)).toBeGreaterThan(count(3));
    const k = PLAYABLE.find((c) => c.id === 'kenji')!;
    expect(portraitSVG(k, { stars: 6 })).toContain('<polyline');
    expect(portraitSVG(k, { stars: 5 })).not.toContain('<polyline');
  });
});

describe('habilidades escalam dentro da faixa de estrelas de cada personagem', () => {
  it('poder nunca diminui ao subir estrelas', () => {
    for (const d of PLAYABLE) {
      for (const ab of d.abilities) {
        if (!ABILITIES[ab].power) continue;
        const vals: number[] = [];
        for (let s = d.minStars; s <= d.maxStars; s++) vals.push(abilityPower(ab, s, 1));
        for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
      }
    }
  });
});
