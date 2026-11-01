/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { cardHTML } from '../../src/ui/components';
import { CATEGORY_INFO, PLAYABLE, getChar } from '../../src/core/characters';
import { cardPower } from '../../src/core/power';
import dps from '../../src/assets/card/atk-dps.svg?raw';
import mago from '../../src/assets/card/atk-mago.svg?raw';
import arqueiro from '../../src/assets/card/atk-arqueiro.svg?raw';
import assassino from '../../src/assets/card/atk-assassino.svg?raw';
import tanque from '../../src/assets/card/atk-tanque.svg?raw';
import suporte from '../../src/assets/card/atk-suporte.svg?raw';
import drop from '../../src/assets/card/drop.svg?raw';
import heart from '../../src/assets/card/heart.svg?raw';

const ICONS: Record<string, string> = { dps, mago, arqueiro, assassino, tanque, suporte };

describe('v0.14 — padrão de carta', () => {
  it('Toru: espera 3 rodadas (v0.57.0) na gota (v0.16.0), ⚡47, sem estrela no degrau base (v0.23.0), nome, "Comum", raça + categoria, ATQ 1, VIDA 7', () => {
    const h = cardHTML({ charId: 'toru', stars: 1 });
    expect(h).toContain('<div class="ck-cost" title="Espera 3 rodada(s) na mão"><span>3</span></div>');
    expect(h).not.toContain('ck-pow'); // v0.42.2: o Poder saiu do topo da carta (fica ao lado do nome no detalhe)
    expect(h).not.toContain('ck-star');
    expect(h).not.toContain('Nv.');
    expect(h).toContain('Toru Sombra\u2011Reversa');
    expect(h).toContain('<div class="ck-rar">Comum</div>');
    expect(h).toContain('<span title="Androide"><img class="ico" src="/src/assets/icons/raca-androide.webp"');
    expect(h).toContain('<span title="Tanque"><img class="ico" src="/src/assets/icons/cat-tanque.webp"');
    expect(h).toMatch(/class="ck-atk fisico"[^>]*><span>1<\/span>/);
    expect(h).toMatch(/class="ck-hp"[^>]*><span>7<\/span>/);
    expect(h).toContain('cat-tanque');
  });
  it('sem os elementos antigos: medalhão de categoria, linha de status, linha de raça/cor, selo de tier no topo', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, stars: d.minStars });
      for (const old of ['card-cat', 'card-stats', 'card-rarity', 'card-top', 'card-orb-atk', 'card-orb-hp', 'card-ribbon', '👊']) expect(h, `${d.id} ${old}`).not.toContain(old);
    }
  });
  it('fileira de habilidades: 1 bolinha por habilidade, separadas por pontos', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, stars: d.minStars });
      const row = h.slice(h.indexOf('class="ck-abil'));
      expect((row.match(/class="ck-ab"/g) ?? []).length, d.id).toBe(d.abilities.length);
      expect((row.match(/class="ck-dot"/g) ?? []).length, d.id).toBe(Math.max(0, d.abilities.length - 1));
      for (const a of d.abilities) expect(row).toContain(`/src/assets/icons/ab-${a}.webp`); // v0.42.0: ícone desenhado de cada habilidade
    }
  });
  it('v0.42.2: o Poder não aparece mais no topo da carta (só visual; o valor continua o mesmo)', () => {
    const c = { charId: 'lyra', stars: 2, plus: true };
    expect(cardHTML(c, { power: cardPower(c) })).not.toContain('ck-pow');
    expect(cardPower(c)).toBeGreaterThan(0);
  });
  it('emblema de ataque por categoria: cada categoria tem o seu ícone', () => {
    expect(Object.keys(ICONS).sort()).toEqual(Object.keys(CATEGORY_INFO).sort());
    for (const d of PLAYABLE) expect(cardHTML({ charId: d.id, stars: d.minStars })).toContain(`cat-${d.category}`);
    for (const svg of Object.values(ICONS)) expect(svg).toContain('<svg');
    expect(new Set(Object.values(ICONS)).size).toBe(6);
  });
  it('espadas cruzadas (DPS): DUAS lâminas inteiras, cada uma com a ponta dentro da imagem', () => {
    const blades = dps.match(/<g transform="rotate\((-?\d+) 50 56\)"><path d="M50 2 L55 11 L55 66/g) ?? [];
    expect(blades.length).toBe(2);
    // ponta (50,2) girada ±42° em torno de (50,56) → dentro do quadro 0..100
    for (const ang of [42, -42]) {
      const r = (ang * Math.PI) / 180;
      const x = 50 - (2 - 56) * Math.sin(r);
      const y = 56 + (2 - 56) * Math.cos(r);
      expect(x).toBeGreaterThan(5);
      expect(x).toBeLessThan(95);
      expect(y).toBeGreaterThan(5);
    }
  });
  it('gota de custo e coração de vida são SVG estáticos (sem animação)', () => {
    for (const svg of [drop, heart, ...Object.values(ICONS)]) expect(svg).not.toMatch(/<animate|@keyframes|filter=/);
  });
  it('v0.14.3: cartas pequenas (compacta) também têm a fileira de habilidades', () => {
    expect(cardHTML({ charId: 'riku', stars: 1 }, { compact: true })).toContain('class="ck-abil n1"');
    expect(getChar('riku').abilities.length).toBeGreaterThan(0);
  });
  it('v0.14.1: fileira de habilidades fica DENTRO da moldura, depois da cápsula', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, stars: d.minStars });
      const frame = h.indexOf('class="card-frame"');
      const foot = h.indexOf('class="ck-foot"');
      expect(h.indexOf('class="ck-sep"'), d.id).toBeGreaterThan(foot);
      const abil = h.indexOf('class="ck-abil');
      expect(abil, d.id).toBeGreaterThan(foot);
      expect(foot).toBeGreaterThan(frame);
      // a moldura só fecha depois da fileira
      expect(h.indexOf('</div></div>', abil), d.id).toBeGreaterThan(abil);
      expect(h.slice(abil).match(/<\/div><\/div>\s*<\/div>\s*$/), d.id).not.toBeNull();
      expect(h).toMatch(/class="card [^"]*\bab\b/);
    }
    expect(cardHTML({ charId: 'riku', stars: 1 }, { compact: true })).not.toMatch(/class="card [^"]*\bab\b/);
  });
});
