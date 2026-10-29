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
    expect(existsSync('src/assets/hub/mapa.webp')).toBe(true);
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
