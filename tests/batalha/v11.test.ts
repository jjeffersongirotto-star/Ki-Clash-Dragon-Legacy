/// <reference types="vite/client" />
import manifestRaw from '../../public/manifest.webmanifest?raw';
import indexHtml from '../../index.html?raw';
import battleSrc from '../../src/ui/battleView.ts?raw';
import { describe, expect, it } from 'vitest';
import { requestLandscape, enterBattleMode, leaveBattleMode } from '../../src/ui/orientation';

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

  it('v0.46.1: sem aviso de girar o celular (a tela deita sozinha)', () => {
    expect(battleSrc).not.toContain('Gire o celular');
    expect(battleSrc).not.toContain('rotate-prompt');
    expect(battleSrc).not.toMatch(/\balert\(|\bconfirm\(/);
  });
});

describe('v0.11.1 — proporção Líder × unidades', () => {
  it('Líder continua na ponta com a figura de corpo inteiro', () => {
    expect(battleSrc).toContain('id="hero-player"');
    expect(battleSrc).toContain('id="hero-enemy"');
    expect(battleSrc).toContain('playerLeaderImg()');
    expect(battleSrc).toContain('enemyCommanderBattle('); // v0.30.1: Comandante adversário recortado (minotauro quando a fase não tem personagem)
    expect(battleSrc).not.toContain('hero-name');
  });
});
