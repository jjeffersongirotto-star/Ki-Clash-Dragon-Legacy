import { describe, expect, it } from 'vitest';
import { hpStatClass } from '../../src/ui/statColor';

describe('v0.45.1 cor da vida', () => {
  it('branca no normal, mesmo com vida baixa por dano', () => {
    expect(hpStatClass({ maxHp: 10 })).toBe('');
  });
  it('verde com escudo ativo ou vida máxima acima da base', () => {
    expect(hpStatClass({ maxHp: 10, effects: [{ kind: 'escudo', amount: 3, turns: 2 }] })).toBe('buff');
    expect(hpStatClass({ maxHp: 12, baseMaxHp: 10 })).toBe('buff');
  });
  it('vermelha só enquanto um debuff reduz a vida máxima; volta a branca quando acaba', () => {
    expect(hpStatClass({ maxHp: 8, baseMaxHp: 10 })).toBe('debuff');
    expect(hpStatClass({ maxHp: 10, baseMaxHp: 10 })).toBe('');
  });
});
