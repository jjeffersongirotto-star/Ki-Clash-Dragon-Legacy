/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { cardHTML } from '../src/ui/components';
import { ABILITIES } from '../src/core/abilities';
import { CATEGORY_INFO, PLAYABLE, RACE_INFO, getChar } from '../src/core/characters';
import { cardPower } from '../src/core/power';
import dps from '../src/assets/card/atk-dps.svg?raw';
import mago from '../src/assets/card/atk-mago.svg?raw';
import arqueiro from '../src/assets/card/atk-arqueiro.svg?raw';
import assassino from '../src/assets/card/atk-assassino.svg?raw';
import tanque from '../src/assets/card/atk-tanque.svg?raw';
import suporte from '../src/assets/card/atk-suporte.svg?raw';
import drop from '../src/assets/card/drop.svg?raw';
import heart from '../src/assets/card/heart.svg?raw';

const ICONS: Record<string, string> = { dps, mago, arqueiro, assassino, tanque, suporte };

describe('v0.14 — padrão de carta', () => {
  it('Toru: custo 3 na gota, Nv 1 | ⚡47, nome, "Comum", raça + categoria, ATQ 2, VIDA 11', () => {
    const h = cardHTML({ charId: 'toru', level: 1, stars: 1 });
    expect(h).toContain('<div class="ck-cost" title="Custo de energia"><span>3</span></div>');
    expect(h).toContain('<small>Nv</small> 1</span><span class="ck-pow" title="Poder">⚡47</span>');
    expect(h).toContain('Toru Sombra\u2011Reversa');
    expect(h).toContain('<div class="ck-rar">Comum</div>');
    expect(h).toContain(`<span title="Androide">${RACE_INFO.androide.icon}</span><span title="Tanque">${CATEGORY_INFO.tanque.icon}</span>`);
    expect(h).toMatch(/class="ck-atk fisico"[^>]*><span>2<\/span>/);
    expect(h).toMatch(/class="ck-hp"[^>]*><span>11<\/span>/);
    expect(h).toContain('cat-tanque');
  });
  it('sem os elementos antigos: medalhão de categoria, linha de status, linha de raça/cor, selo de tier no topo', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, level: 1, stars: d.minStars });
      for (const old of ['card-cat', 'card-stats', 'card-rarity', 'card-top', 'card-orb-atk', 'card-orb-hp', 'card-ribbon', '👊']) expect(h, `${d.id} ${old}`).not.toContain(old);
    }
  });
  it('fileira de habilidades: 1 bolinha por habilidade, separadas por pontos', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, level: 1, stars: d.minStars });
      const row = h.slice(h.indexOf('class="ck-abil"'));
      expect((row.match(/class="ck-ab"/g) ?? []).length, d.id).toBe(d.abilities.length);
      expect((row.match(/class="ck-dot"/g) ?? []).length, d.id).toBe(Math.max(0, d.abilities.length - 1));
      for (const a of d.abilities) expect(row).toContain(ABILITIES[a].icon);
    }
  });
  it('Poder no topo é o Poder da carta (nível, cor e "+")', () => {
    const c = { charId: 'lyra', level: 11, stars: 2, plus: true };
    expect(cardHTML(c)).toContain(`⚡${cardPower(c)}`);
  });
  it('emblema de ataque por categoria: cada categoria tem o seu ícone', () => {
    expect(Object.keys(ICONS).sort()).toEqual(Object.keys(CATEGORY_INFO).sort());
    for (const d of PLAYABLE) expect(cardHTML({ charId: d.id, level: 1, stars: d.minStars })).toContain(`cat-${d.category}`);
    for (const svg of Object.values(ICONS)) {
      expect(svg).toContain('<svg');
      expect(svg).toContain('polygon'); // explosão laranja
      expect(svg).toContain('scale(.74)'); // escudo menor, armas aparecem
    }
    expect(new Set(Object.values(ICONS)).size).toBe(6);
  });
  it('espadas cruzadas (DPS): DUAS lâminas inteiras, cada uma com a ponta dentro da imagem', () => {
    const blades = dps.match(/<g transform="rotate\((-?\d+) 50 50\)"><path d="M50 1 L54\.2 9 L54\.2 66/g) ?? [];
    expect(blades.length).toBe(2);
    expect(dps).toContain('rotate(45 50 50)');
    expect(dps).toContain('rotate(-45 50 50)');
    // ponta em (50,1) girada 45° em torno do centro → (84.6,15.4) e (15.4,15.4): dentro do quadro 0..100
    for (const ang of [45, -45]) {
      const r = (ang * Math.PI) / 180;
      const x = 50 + (50 - 50) * Math.cos(r) - (1 - 50) * Math.sin(r);
      const y = 50 + (50 - 50) * Math.sin(r) + (1 - 50) * Math.cos(r);
      expect(x).toBeGreaterThan(5);
      expect(x).toBeLessThan(95);
      expect(y).toBeGreaterThan(5);
    }
  });
  it('gota de custo e coração de vida são SVG estáticos (sem animação)', () => {
    for (const svg of [drop, heart, ...Object.values(ICONS)]) expect(svg).not.toMatch(/<animate|@keyframes|filter=/);
  });
  it('cartas pequenas (compacta) sem fileira de habilidades', () => {
    expect(cardHTML({ charId: 'riku', level: 1, stars: 1 }, { compact: true })).not.toContain('ck-abil');
    expect(getChar('riku').abilities.length).toBeGreaterThan(0);
  });
  it('v0.14.1: fileira de habilidades fica DENTRO da moldura, depois da cápsula', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, level: 1, stars: d.minStars });
      const frame = h.indexOf('class="card-frame"');
      const foot = h.indexOf('class="ck-foot"');
      const abil = h.indexOf('class="ck-abil"');
      expect(abil, d.id).toBeGreaterThan(foot);
      expect(foot).toBeGreaterThan(frame);
      // a moldura só fecha depois da fileira
      expect(h.indexOf('</div></div>', abil), d.id).toBeGreaterThan(abil);
      expect(h.slice(abil).match(/<\/div><\/div>\s*<\/div>\s*$/), d.id).not.toBeNull();
      expect(h).toMatch(/class="card [^"]*\bab\b/);
    }
    expect(cardHTML({ charId: 'riku', level: 1, stars: 1 }, { compact: true })).not.toMatch(/class="card [^"]*\bab\b/);
  });
});
