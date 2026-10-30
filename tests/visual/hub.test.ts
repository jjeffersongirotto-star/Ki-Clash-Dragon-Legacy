import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { HUB_SPOTS, hitBox } from '../../src/app/hubConfig';
import { HUB_BOXES } from '../../src/ui/hubLayers';

describe('v0.46.0 hub', () => {
  it('14 locais: 1–7 abrem telas, 8–14 ficam trancados', () => {
    expect(HUB_SPOTS).toHaveLength(14);
    expect(HUB_SPOTS.slice(0, 7).map((s) => s.nav)).toEqual(['adventure', 'collection', 'train', 'shop', 'shop', 'inventory', 'help']);
    expect(HUB_SPOTS.slice(7).every((s) => s.nav === null && !!s.soon)).toBe(true);
  });
  it('cada local tem caixa, camada normal e brilho; os trancados têm camada com cadeado', () => {
    for (const s of HUB_SPOTS) {
      for (const k of [s.key, `${s.key}-glow`, ...(s.nav ? [] : [`${s.key}-locked`])]) {
        expect(HUB_BOXES[k], k).toBeDefined();
        expect(existsSync(`src/assets/hub/${k}.webp`), k).toBe(true);
      }
    }
    expect(existsSync('src/assets/hub/vazio.webp')).toBe(true);
  });
  it('a Mina tem área de toque maior que a arte, sem sair do mapa', () => {
    const mina = HUB_SPOTS.find((s) => s.key === '14-mina')!;
    const art = hitBox(HUB_BOXES['14-mina']);
    const hit = hitBox(HUB_BOXES['14-mina'], mina.pad);
    expect(hit.width).toBeGreaterThan(art.width);
    expect(hit.left + hit.width).toBeLessThanOrEqual(100.0001);
    expect(hit.top + hit.height).toBeLessThanOrEqual(100.0001);
  });
});

describe('v0.46.1 tela deitada sem aviso', () => {
  it('não existe mais o aviso "Vire o celular" nem "Deitar a tela"', async () => {
    const { readFileSync } = await import('node:fs');
    for (const f of ['src/ui/orientation.ts', 'src/ui/battleView.ts', 'src/app/home.ts']) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toContain('Vire o celular');
      expect(src, f).not.toContain('Deitar a tela');
    }
    expect(readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8')).toContain('android:screenOrientation="sensorLandscape"');
  });
});

describe('v0.47.0 hub espalhado, trancados e cartas assadas', () => {
  it('prédios movidos ficam dentro do mapa', async () => {
    const { moved, HUB_W, HUB_H } = await import('../../src/app/hubConfig');
    for (const s of HUB_SPOTS) {
      const b = moved(HUB_BOXES[s.key], s);
      expect(b[0], s.key).toBeGreaterThanOrEqual(0);
      expect(b[1], s.key).toBeGreaterThanOrEqual(0);
      expect(b[2], s.key).toBeLessThanOrEqual(HUB_W);
      expect(b[3], s.key).toBeLessThanOrEqual(HUB_H);
    }
  });
  it('local trancado acende só a arte com cadeado; nomes em faixa', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('src/app/home.ts', 'utf8');
    expect(src).toContain('-locked"]`');
    expect(src).toContain('hub-ribbon');
    expect(src).toContain("HUB_SPOTS.filter((s) => s.nav).map((s) => lay(`${s.key}-glow`");
  });
  it('Coleção e Baralho usam a carta assada numa imagem só', async () => {
    const { readFileSync } = await import('node:fs');
    expect(readFileSync('src/app/collection.ts', 'utf8')).toContain('bakeCards(app)');
    const { BAKE_SEL } = await import('../../src/ui/cardBake');
    expect(BAKE_SEL).toContain('.card-grid .card');
    expect(BAKE_SEL).toContain('.deck-slots .card');
  });
});

describe('v0.49.1 nomes curtos do hub', () => {
  it('nomes curtos e Invasão de Chefe em 2 linhas', () => {
    const by = Object.fromEntries(HUB_SPOTS.map((s) => [s.key, s]));
    expect(by['14-mina'].label).toBe('Mina');
    expect(by['13-eventos'].label).toBe('Eventos');
    expect(by['02-colecao'].label).toBe('Baralho');
    expect(by['07-tutorial'].label).toBe('Acampamento');
    expect(by['05-invocacao'].label).toBe('Altar');
    expect(by['03-treinar'].label).toBe('Treinar');
    expect(by['12-desejos'].label).toBe('Santuário');
    const inv = by['09-invasao'];
    expect(inv.label.slice(0, inv.br)).toBe('Invasão');
  });
});

describe('v0.50.1 limpeza', () => {
  it('Como jogar usa o tamanho real da arena; manifesto deitado; sem CSS do aviso de girar', async () => {
    const { readFileSync } = await import('node:fs');
    const help = readFileSync('src/app/help.ts', 'utf8');
    expect(help).not.toContain('2 fileiras × 12 colunas');
    expect(help).toContain('${COLS} colunas');
    expect(JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')).orientation).toBe('landscape');
    const css = readFileSync('src/ui/style.css', 'utf8');
    expect(css).not.toContain('rotate-prompt');
    expect(css).not.toContain('rotate-all');
  });
});

describe('v0.51.0 Loja em abas e hub enxuto', () => {
  it('Loja: título central só com Ouro, ⓘ do banner, abas Itens de Ascensão / Orbes', async () => {
    const { readFileSync } = await import('node:fs');
    const shop = readFileSync('src/app/shop.ts', 'utf8');
    expect(shop).toContain('data-binfo');
    expect(shop).toContain('export function bannerInfo');
    expect(shop).toContain('data-tab="gear"');
    expect(shop).toContain('data-tab="orbs"');
    expect(shop).not.toContain('<div class="banner-odds">${odds}</div>\n    <div class="pity-mark"');
    const home = readFileSync('src/app/home.ts', 'utf8');
    expect(home).toContain('hub-res');
    expect(home).not.toContain('essIcon()');
  });
});
