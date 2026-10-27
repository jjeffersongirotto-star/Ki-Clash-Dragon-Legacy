import { describe, expect, it } from 'vitest';
import { auditHair } from '../../src/core/hairAudit';
import { hairPath, portraitSVG, unitSpriteSVG } from '../../src/ui/art';
import { CHARACTERS } from '../../src/core/characters';

const HEAD = { cx: 50, top: 28, w: 40 };

describe('v0.11.2 — cabelo preso à cabeça', () => {
  for (const st of [0, 1, 2, 3, 4, 5, 6, 7]) {
    it(`penteado ${st}: no couro cabeludo, largura e centro proporcionais à cabeça, dentro da moldura`, () => {
      const a = auditHair(hairPath(st), HEAD);
      expect(a.onScalp).toBe(true);
      expect(a.topInFrame).toBe(true);
      expect(a.width).toBeLessThanOrEqual(st === 7 ? 1.9 : 1.6);
      expect(Math.abs(a.offset)).toBeLessThanOrEqual(st === 2 ? 0.15 : 0.06);
    });
  }

  it('o cabelo não cresce com a cor (sem escala) e na arena fica dentro do grupo da cabeça', () => {
    for (const d of CHARACTERS) {
      for (let t = d.minStars; t <= d.maxStars; t++) {
        const card = portraitSVG(d, { stars: t });
        const hp = hairPath(d.hairStyle);
        expect(card).toContain(`<path d="${hp}" fill=`);
        expect(card).not.toMatch(/translate\(50 34\) scale/);
        const spr = unitSpriteSVG(d, { stars: t });
        const head = spr.slice(spr.indexOf('<g class="spr-head"'), spr.indexOf('<g class="spr-arm-f"'));
        expect(head).toContain(`<path d="${hp}"`);
        expect(spr).not.toMatch(/translate\(50 34\) scale/);
      }
    }
  });
});
