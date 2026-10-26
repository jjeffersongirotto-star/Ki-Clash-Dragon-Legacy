/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { abilityIconHTML, abilityListHTML, cardHTML } from '../src/ui/components';
import { CATEGORY_INFO, PLAYABLE, getChar } from '../src/core/characters';
import dps from '../src/assets/card/atk-dps.svg?raw';
import mago from '../src/assets/card/atk-mago.svg?raw';
import arqueiro from '../src/assets/card/atk-arqueiro.svg?raw';
import assassino from '../src/assets/card/atk-assassino.svg?raw';
import tanque from '../src/assets/card/atk-tanque.svg?raw';
import suporte from '../src/assets/card/atk-suporte.svg?raw';
import star from '../src/assets/card/lv-star.svg?raw';
import peitoral from '../src/assets/card/ab-peitoral.svg?raw';

const EMB: Record<string, string> = { dps, mago, arqueiro, assassino, tanque, suporte };

describe('v0.14.2 — acabamento da carta (prévia v14.2f)', () => {
  it('topo: ⚡Poder sozinho na pílula e nível na estrela dourada ("Nv." em cima do número)', () => {
    const h = cardHTML({ charId: 'lyra', level: 10, stars: 2 }, { power: 10000 });
    expect(h).toContain('<div class="ck-pow" title="Poder">⚡10000</div>');
    expect(h).toContain('<div class="ck-star" title="Nível"><small>Nv.</small><b>10</b></div>');
    expect(h).not.toContain('ck-lvp');
    expect(h).not.toContain('ck-lv"');
  });
  it('painel de baixo: ataque e vida dentro do painel, cápsula, linha com pontinhos e habilidades', () => {
    for (const d of PLAYABLE) {
      const h = cardHTML({ charId: d.id, level: 1, stars: d.minStars });
      const panel = h.indexOf('class="ck-panel"');
      expect(panel, d.id).toBeGreaterThan(h.indexOf('class="ck-banner"'));
      for (const c of ['ck-atk', 'ck-rar', 'ck-foot', 'ck-sep', 'ck-abil', 'ck-hp']) expect(h.indexOf(`class="${c}`, panel), `${d.id} ${c}`).toBeGreaterThan(panel);
      expect((h.match(/class="ck-sep"><i><\/i><i><\/i><i><\/i>/g) ?? []).length).toBe(1);
    }
    expect(cardHTML({ charId: 'riku', level: 1, stars: 1 }, { compact: true })).not.toContain('ck-sep');
  });
  it('emblemas de ataque: um formato por categoria, sem explosão de pontas, armas NA FRENTE da base', () => {
    expect(Object.keys(EMB).sort()).toEqual(Object.keys(CATEGORY_INFO).sort());
    expect(new Set(Object.values(EMB)).size).toBe(6);
    for (const [k, svg] of Object.entries(EMB)) {
      // a antiga explosão era um polígono de 24 pontas
      const polys = svg.match(/<polygon points="([^"]+)"/g) ?? [];
      for (const p of polys) expect(p.split(' ').length, k).toBeLessThan(20);
      // base (contorno preto grosso) vem antes das armas giradas → armas desenhadas por cima
      const base = svg.search(/stroke="#000" stroke-linejoin="round" stroke-width="4\.4"/);
      const arma = svg.indexOf('<g transform="rotate(-42 50 56)">');
      expect(base, k).toBeGreaterThan(0);
      expect(arma, k).toBeGreaterThan(base);
      expect(svg).toContain('<g transform="rotate(42 50 56)">');
      expect(svg).not.toMatch(/<animate|@keyframes|filter=/);
    }
  });
  it('estrela de nível e peitoral são SVG estáticos', () => {
    for (const svg of [star, peitoral]) {
      expect(svg).toContain('<svg');
      expect(svg).not.toMatch(/<animate|@keyframes|filter=/);
    }
  });
  it('Resistência Física (Postura de Guarda) usa o peitoral na carta e na lista de habilidades', () => {
    expect(abilityIconHTML('guarda')).toContain('class="ab-svg"');
    const toru = getChar('toru');
    expect(cardHTML({ charId: 'toru', level: 1, stars: 1 })).toContain('<span class="ck-ab" title="Postura de Guarda"><img class="ab-svg"');
    const list = abilityListHTML(toru, 1, 1);
    expect(list).toContain('<img class="ab-svg"');
    expect(list).not.toContain('🛡 Postura');
    // v0.17: ninguém tem mais resistência de atributo (só por habilidade); a lista não mostra linha extra
    expect(PLAYABLE.every((d) => !d.physRes && !d.magRes)).toBe(true);
  });
  it('nomes com palavra comprida encolhem para caber (Tobi Tambor-de-Guerra, Gorath Muralha-de-Ferro)', () => {
    expect(cardHTML({ charId: 'tobi', level: 1, stars: getChar('tobi').minStars })).toMatch(/class="ck-name" style="--nfit:0\.\d+"/);
    expect(cardHTML({ charId: 'gorath', level: 1, stars: getChar('gorath').minStars })).toMatch(/--nfit:/);
    // v0.20.1: palavras a partir de 13 letras também encolhem ("Sombra-Reversa" e "Punho-de-Rocha" eram cortadas)
    expect(cardHTML({ charId: 'toru', level: 1, stars: 1 })).toMatch(/--nfit:/);
    expect(cardHTML({ charId: 'riku', level: 1, stars: 1 })).not.toMatch(/--nfit:/);
  });
});
