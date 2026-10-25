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
