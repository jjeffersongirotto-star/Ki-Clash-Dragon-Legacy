import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { goalPlain } from '../../src/core/adventure';

const src = readFileSync('src/app/adventure.ts', 'utf8');

describe('v0.52.1 janela da fase', () => {
  it('objetivos de estrela só em texto, iguais nos três', () => {
    expect(goalPlain('❤️ Vencer com o seu Comandante com 70% ou mais da vida')).toBe('Vencer com o seu Comandante com 70% ou mais da vida');
    expect(goalPlain('🪄 Vencer usando pelo menos 2 feitiços')).toBe('Vencer usando pelo menos 2 feitiços');
    expect(goalPlain('Vencer a fase')).toBe('Vencer a fase');
    expect(src).not.toContain('goalHTML(');
  });
  it('itens sem % na frente; ⓘ com as chances; sem vida do comandante nem "Inimigos até"', () => {
    expect(src).toContain('data-dropinfo');
    expect(src).toContain('function dropInfo');
    expect(src).not.toContain('Comandante inimigo ${');
    expect(src).not.toContain('Inimigos até');
    expect(src).toContain('Destaques do rival');
    expect(src).toContain('.slice(0, 2)');
  });
});
