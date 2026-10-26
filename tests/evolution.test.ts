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
        for (let s = d.minStars; s <= d.maxStars; s++) vals.push(abilityPower(ab, s, 0));
        for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
      }
    }
  });
});

describe('fundos temáticos dos retratos', () => {
  it('cada personagem tem cena própria (Cria usa a do Vorax)', async () => {
    const { SCENE_IDS, sceneSVG } = await import('../src/ui/scenes');
    for (const d of PLAYABLE) expect(SCENE_IDS).toContain(d.id);
    const scenes = PLAYABLE.map((d) => sceneSVG(d.id, d.minStars, 'x', '#000'));
    expect(new Set(scenes).size).toBe(PLAYABLE.length);
    expect(sceneSVG('cria', 5, 'x', '#000')).toBe(sceneSVG('vorax', 5, 'x', '#000'));
  });
  it('a cena fica mais rica a cada estrela e continua leve', async () => {
    const { sceneSVG } = await import('../src/ui/scenes');
    for (const d of PLAYABLE) {
      let prev = -1;
      for (let s = d.minStars; s <= d.maxStars; s++) {
        const svg = sceneSVG(d.id, s, 'x', '#000');
        const n = (svg.match(/<(circle|ellipse|rect|path|polyline)/g) ?? []).length;
        expect(n).toBeGreaterThan(prev);
        expect(svg.length).toBeLessThan(9000);
        prev = n;
      }
    }
  });
});
