import { describe, expect, it } from 'vitest';
import { rewardListHTML } from '../../src/ui/rewardList';

/** Texto visível (o que o jogador lê): tira as tags e decodifica entidades. */
const visible = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

describe('v0.59.4 — janela de prêmios em tópicos', () => {
  const html = rewardListHTML({ gold: 20100, gems: 291, xp: 3250, orbs: { orbe3: 71, orbe4: 5 }, count: 386 });
  it('não mostra HTML cru como texto', () => {
    expect(visible(html)).not.toContain('<span');
    expect(visible(html)).not.toContain('<img');
    expect(html).not.toContain('&lt;');
  });
  it('uma linha por tipo, só o que não é zero', () => {
    expect((html.match(/class="rw-row"/g) ?? []).length).toBe(5);
    const t = visible(html);
    for (const s of ['Ouro de Dragão', '+20100', 'Gemas', '+291', '+3250', 'Orbe Raro', 'x71', 'x5', '386 prêmios']) expect(t).toContain(s);
    expect((rewardListHTML({ gold: 100, gems: 0, xp: 0 }).match(/class="rw-row"/g) ?? []).length).toBe(1);
  });
  it('tela Heróis manda o HTML pelo campo html (não message, que é escapado)', async () => {
    const fs = await import('node:fs');
    const src = fs.readFileSync('src/app/heroes.ts', 'utf8');
    expect(src).not.toMatch(/gameAlert\([^)]*rewardHTML/);
    expect(src).toContain('rewardListHTML');
  });
});
