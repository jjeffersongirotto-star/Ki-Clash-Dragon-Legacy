import { describe, expect, it } from 'vitest';
import { CHARACTERS, PLAYABLE, getChar } from '../../src/core/characters';
import { cardArtImg, charArtUrl, hasCharArt, unitSpriteHTML } from '../../src/ui/art';
import { cardHTML } from '../../src/ui/components';

describe('v0.29.0 — artes ilustradas dos personagens', () => {
  it('todos os personagens jogáveis têm arte; v0.30.2: a Cria Sombria também', () => {
    for (const d of PLAYABLE) expect(hasCharArt(d.id), d.id).toBe(true);
    expect(hasCharArt('cria')).toBe(true);
    for (const d of CHARACTERS) expect(hasCharArt(d.id), d.id).toBe(true);
    expect(CHARACTERS.length).toBeGreaterThan(0);
  });

  it('carta com arte: a imagem é o fundo inteiro e não há camada separada do personagem', () => {
    const riku = getChar('riku');
    expect(cardArtImg(riku, { layer: 'fg' })).toBe('');
    expect(cardArtImg(riku, { layer: 'bg' })).toContain(charArtUrl('riku')!);
    const html = cardHTML({ charId: 'riku', stars: 1 });
    expect(html).toContain('char-art');
    expect(html).toContain('<div class="card-fig"></div>');
  });

  it('na arena a unidade com arte vira retrato emoldurado, virado para o lado do inimigo', () => {
    const spr = unitSpriteHTML(getChar('kael'), { stars: 2, side: 'enemy', flip: true });
    expect(spr).toContain('art-sprite');
    expect(spr).toContain('art-img flip');
    expect(spr).not.toContain('<svg');
    // v0.30.2: a Cria Sombria (invocação do Vorax) também vira retrato com a arte nova
    const cria = unitSpriteHTML(getChar('cria'), { stars: 1 });
    expect(cria).toContain('art-sprite');
    expect(cria).toContain(charArtUrl('cria')!);
    expect(cria).not.toContain('<svg');
  });
});
