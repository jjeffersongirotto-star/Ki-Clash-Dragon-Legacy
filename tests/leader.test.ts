/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { playerLeaderImg, LEADER_PLAYER_URL } from '../src/ui/art';

describe('v0.12.0 — Líder do jogador (bárbaro)', () => {
  it('usa a imagem animada própria, com tamanho declarado e sem filtro inline', () => {
    const html = playerLeaderImg();
    expect(html).toContain('<img');
    expect(html).toContain('hero-img');
    expect(html).toContain('width="271" height="512"');
    expect(html).not.toContain('style=');
    expect(LEADER_PLAYER_URL).toMatch(/leader-player.*\.webp/);
  });
});

import { enemyLeaderImg, LEADER_ENEMY_URL } from '../src/ui/art';
import battleSrc from '../src/ui/battleView.ts?raw';

describe('v0.12.1 — Líder adversário (minotauro) e aura', () => {
  it('usa a imagem animada do minotauro, sem espelhar e sem filtro inline', () => {
    const html = enemyLeaderImg();
    expect(html).toContain('width="463" height="512"');
    expect(html).not.toContain('style=');
    expect(LEADER_ENEMY_URL).toMatch(/leader-enemy.*\.webp/);
  });
  it('sem os textos de Líder; aura fixa atrás de cada Líder como elemento separado', () => {
    expect(battleSrc).not.toContain('Líder Aliado</div>');
    expect(battleSrc).not.toContain('Líder Inimigo</div>');
    expect((battleSrc.match(/<div class="hero-aura"><\/div>/g) ?? []).length).toBe(2);
  });
});
