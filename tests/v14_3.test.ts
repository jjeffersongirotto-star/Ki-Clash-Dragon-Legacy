import { describe, expect, it } from 'vitest';
import { cardHTML } from '../src/ui/components';
import { PLAYABLE } from '../src/core/characters';

describe('v0.14.3 — habilidades nas cartas pequenas (mão, equipe, Treinar)', () => {
  it('carta compacta tem a fileira de habilidades (mesmos ícones da carta grande, com pontinhos), sem a linha separadora', () => {
    for (const d of PLAYABLE) {
      const big = cardHTML({ charId: d.id, stars: d.minStars });
      const small = cardHTML({ charId: d.id, stars: d.minStars }, { compact: true, grid: true });
      const row = (h: string) => h.slice(h.indexOf('<div class="ck-abil'), h.indexOf('</div>', h.indexOf('<div class="ck-abil')));
      expect(row(small), d.id).toBe(row(big));
      expect(small).toContain(`class="ck-abil n${d.abilities.length}"`);
      expect((row(small).match(/class="ck-ab"/g) ?? []).length, d.id).toBe(d.abilities.length);
      expect((row(small).match(/class="ck-dot"/g) ?? []).length, d.id).toBe(d.abilities.length - 1);
      expect(small, d.id).not.toContain('ck-sep');
    }
  });
  it('a fileira fica no painel de baixo, entre o ataque e a vida', () => {
    const h = cardHTML({ charId: 'toru', stars: 1 }, { compact: true });
    const atk = h.indexOf('class="ck-atk'), ab = h.indexOf('class="ck-abil'), hp = h.indexOf('class="ck-hp"');
    expect(atk).toBeGreaterThan(h.indexOf('class="ck-panel"'));
    expect(ab).toBeGreaterThan(atk);
    expect(hp).toBeGreaterThan(ab);
    expect(h).toContain('class="ab-svg"'); // peitoral da Resistência Física
  });
});
