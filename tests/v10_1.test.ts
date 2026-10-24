import { describe, expect, it } from 'vitest';
import { PLAYABLE, getChar } from '../src/core/characters';
import { portraitImg, portraitSVG } from '../src/ui/art';
import { cardHTML } from '../src/ui/components';

const srcOf = (html: string) => html.slice(html.indexOf('src="') + 5, html.indexOf('" alt'));

describe('v0.10.1 — retratos em cache (desempenho)', () => {
  it('a imagem em cache é exatamente o mesmo SVG do retrato (visual idêntico)', () => {
    for (const def of PLAYABLE) {
      for (let t = def.minStars; t <= def.maxStars; t++) {
        for (const layer of ['bg', 'fg'] as const) {
          const svg = decodeURIComponent(srcOf(portraitImg(def, { stars: t, layer })).replace('data:image/svg+xml;charset=utf-8,', ''));
          expect(svg).toBe(portraitSVG(def, { stars: t, layer }).replace(/>\s+</g, '><').trim());
          expect(svg.startsWith('<svg')).toBe(true);
          expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
        }
      }
    }
  });

  it('a mesma (personagem, cor, camada) reaproveita a mesma string (gera uma vez só)', () => {
    const riku = getChar('riku');
    const a = srcOf(portraitImg(riku, { stars: 3, layer: 'fg' }));
    const b = srcOf(portraitImg(riku, { stars: 3, layer: 'fg' }));
    expect(a).toBe(b);
    expect(srcOf(portraitImg(riku, { stars: 4, layer: 'fg' }))).not.toBe(a);
    expect(srcOf(portraitImg(riku, { stars: 3, layer: 'bg' }))).not.toBe(a);
  });

  it('a carta usa 2 imagens (fundo e personagem) e nenhum SVG em linha', () => {
    const html = cardHTML({ charId: 'nyx', level: 65, stars: 6, plus: true });
    expect((html.match(/<img class="portrait/g) ?? []).length).toBe(2);
    expect(html).not.toContain('<svg');
    // efeitos premium continuam na carta (faíscas e reflexo)
    expect(html).toContain('class="spk"');
    expect(html).toContain('card-shine');
  });
});
