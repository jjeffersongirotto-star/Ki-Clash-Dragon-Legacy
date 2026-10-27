import { describe, expect, it } from 'vitest';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { portraitImg, portraitSVG } from '../../src/ui/art';
import { cardHTML } from '../../src/ui/components';

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

  it('a carta usa imagens (sem SVG em linha): 1 camada com a arte ilustrada (v0.29.0; v0.30.2: inclusive a Cria Sombria)', () => {
    expect((cardHTML({ charId: 'cria', stars: 1 }).match(/<img class="portrait/g) ?? []).length).toBe(1);
    const html = cardHTML({ charId: 'nyx', stars: 6, plus: true });
    expect((html.match(/<img class="portrait/g) ?? []).length).toBe(1);
    expect(html).toContain('char-art');
    expect(html).not.toContain('<svg');
    // efeitos premium continuam na carta (faíscas e reflexo)
    expect(html).toContain('class="spk"');
    expect(html).toContain('card-shine');
  });
});

describe('v0.10.2 — cartas de grade congeladas (rolagem fluida)', () => {
  it('carta de grade: marcada como grid-card, sem reflexo animado e com imagens assíncronas/preguiçosas', () => {
    const html = cardHTML({ charId: 'nyx', stars: 6, plus: true }, { grid: true });
    expect(html).toContain('grid-card');
    expect(html).not.toContain('card-shine');
    expect(html).not.toContain('<svg');
    // v0.29.0: com a arte ilustrada (WebP pronto) a carta de grade tem 1 imagem (v0.30.2: a Cria Sombria também)
    expect((html.match(/decoding="async"/g) ?? []).length).toBe(1);
    expect(html).toContain('data-gk="nyx|6||bg"');
    const criaCard = cardHTML({ charId: 'cria', stars: 1 }, { grid: true });
    expect((criaCard.match(/decoding="async"/g) ?? []).length).toBe(1);
    expect(criaCard).not.toContain('data-gk="cria|1||fg"');
  });

  it('carta em foco (detalhes, mão) continua com todos os efeitos', () => {
    const html = cardHTML({ charId: 'nyx', stars: 6, plus: true });
    expect(html).not.toContain('grid-card');
    expect(html).toContain('card-shine');
  });

  it('carta bloqueada de grade usa chave própria (arte escurecida no bitmap)', () => {
    const html = cardHTML({ charId: 'kenji', stars: 5 }, { grid: true, locked: true });
    expect(html).toContain('data-gk="kenji|5|L|bg"');
    expect(html).toContain('locked');
  });
});
