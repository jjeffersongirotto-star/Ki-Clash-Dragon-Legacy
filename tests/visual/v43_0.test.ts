/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { PLAYABLE } from '../../src/core/characters';
import { faceUrl, hasCharArt } from '../../src/ui/art';

describe('v0.43.0 — foto de perfil', () => {
  it('todo personagem com arte tem o rosto recortado para a foto de perfil', () => {
    const missing = PLAYABLE.filter((d) => hasCharArt(d.id) && !faceUrl(d.id)).map((d) => d.id);
    expect(missing).toEqual([]);
  });
});

describe('v0.43.0 — opções do aparelho', () => {
  it('vibração começa ligada e a linguagem é Português', async () => {
    const { settings } = await import('../../src/ui/settings');
    expect(settings()).toEqual({ vibrate: true, lang: 'pt' });
  });
});
