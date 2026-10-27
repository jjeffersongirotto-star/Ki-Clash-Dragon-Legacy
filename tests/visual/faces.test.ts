import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '../../src/core/characters';
import { faceParts, portraitSVG, unitSpriteSVG } from '../../src/ui/art';

// únicas diferenças permitidas no tamanho pequeno: íris (r 2.6 em vez de 2.2) e sem a piscada <animate> do visor
const toCard = (s: string) => s.replace(/(<circle cx="(?:42|58)" cy="56\.2" )r="2\.6"/g, '$1r="2.2"');
const strip = (s: string) => s.replace(/<animate [^>]*\/>/g, '').replace(/\s+/g, ' ');
const eyeShapes = (s: string) => (s.match(/<path d="M3\d 5\d[^"]*"|<rect x="3\d" y="5\d" width="3\d"/g) ?? []).join('|');

describe('v0.11.3 — mesmo rosto na carta e na arena', () => {
  for (const d of CHARACTERS) {
    it(`${d.id}: o lutador da arena usa a definição de rosto da carta em todas as cores`, () => {
      for (let t = d.minStars; t <= d.maxStars; t++) {
        const card = faceParts(d, t);
        const arena = faceParts(d, t, { arena: true });
        expect(portraitSVG(d, { stars: t })).toContain(card.under);
        const spr = unitSpriteSVG(d, { stars: t });
        const head = spr.slice(spr.indexOf('<g class="spr-head"'), spr.indexOf('<g class="spr-arm-f"'));
        expect(head).toContain(arena.under);
        expect(head).toContain(arena.over);
        expect(head).toContain(arena.wear);
        // mesmo formato de olho, sobrancelhas e boca (só o raio da íris muda no tamanho pequeno)
        expect(eyeShapes(arena.under)).toBe(eyeShapes(card.under));
        expect(eyeShapes(card.under).length).toBeGreaterThan(0);
        expect(strip(toCard(arena.under))).toBe(strip(card.under));
        // sem animação contínua nova na arena (a piscada do visor fica só na carta)
        expect(head).not.toContain('<animate');
      }
    });
  }
});
