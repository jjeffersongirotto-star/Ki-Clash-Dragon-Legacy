/// <reference types="vite/client" />
import manifestRaw from '../public/manifest.webmanifest?raw';
import indexHtml from '../index.html?raw';
import battleSrc from '../src/ui/battleView.ts?raw';
import { describe, expect, it } from 'vitest';
import { requestLandscape, enterBattleMode, leaveBattleMode } from '../src/ui/orientation';

describe('v0.11.0 — batalha deitada', () => {
  it('manifesto do app: tela cheia, ícones e SEM travar orientação global (menus são em pé)', () => {
    const m = JSON.parse(manifestRaw);
    expect(m.display).toBe('fullscreen');
    expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(m.orientation).toBeUndefined();
    expect(indexHtml).toContain('rel="manifest"');
  });

  it('API de orientação falha sem quebrar fora do navegador', async () => {
    await expect(requestLandscape()).resolves.toBe(false);
    expect(() => enterBattleMode()).not.toThrow();
    expect(() => leaveBattleMode()).not.toThrow();
  });

  it('aviso de girar o celular é uma janela do jogo (não diálogo nativo)', () => {
    expect(battleSrc).toContain('Gire o celular para jogar deitado');
    expect(battleSrc).toContain('data-act="rotate-dismiss"');
    expect(battleSrc).not.toMatch(/\balert\(|\bconfirm\(/);
  });
});
