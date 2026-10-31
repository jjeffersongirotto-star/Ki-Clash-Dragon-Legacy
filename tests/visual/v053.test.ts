import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { goalText, goalPlain, starGoals, DIFFICULTIES } from '../../src/core/adventure';

const adv = readFileSync('src/app/adventure.ts', 'utf8');
const tut = readFileSync('src/app/tutorial.ts', 'utf8');

describe('v0.53.0 vitória, escolha de carta e tutorial', () => {
  it('os 3 objetivos de estrela começam com "Vencer"', () => {
    for (const d of DIFFICULTIES) for (let id = 1; id <= 100; id++) for (const g of starGoals(d, id)) expect(goalPlain(g.text)).toMatch(/^Vencer/);
    expect(goalPlain(goalText({ kind: 'kills', n: 3 } as never))).toBe('Vencer derrotando pelo menos 3 personagens inimigos');
  });
  it('a escolha da 1ª vitória vem no começo, seleciona ao tocar e Continuar confirma', () => {
    expect(adv).toContain('Vitória!</h2>${pickLine}${unlocked}');
    expect(adv).toContain("o.classList.toggle('on', o === el)");
    expect(adv).toMatch(/if \(!chosen\) return;\n\s*grantOne\(chosen\);/);
    expect(adv).toContain('onLongPress(el, () => cardDetails(');
  });
  it('tutorial: cartas da tela abrem os detalhes; descrição destacada sem escurecer; Banner com a carta em destaque', () => {
    expect(tut).toContain('data-tc=');
    expect(tut).toMatch(/cardDetails\(isSpell\(id\)/);
    expect(tut).toMatch(/spotlight\(infoWrap,[^\n]*light: true/);
    expect(tut).toMatch(/area: reveal, light: true/);
    expect(readFileSync('src/app/shop.ts', 'utf8')).toContain("onLongPress(el, () => cardDetails(got[i]))");
    expect(readFileSync('src/ui/spotlight.ts', 'utf8')).toContain('if (opts.light)');
  });
});

describe('v0.53.1 rostos ajustados à mão', () => {
  it('os 27 pedidos têm corte próprio e o Fen é girado', () => {
    const py = readFileSync('scripts/art/build_thumbs.py', 'utf8');
    for (const id of 'borgo trokk skarr oculus grendar razorv thessa orun velka fenra zynna gorm vexar bolt goro hayato tobi ren sylith kraz9 vex4 fen bram vesna dorian lamenta drakon'.split(' '))
      expect(py).toMatch(new RegExp(`FACE_FIX = \\{[\\s\\S]*'${id}': \\(`));
    expect(py).toContain("'fen': (0.44, 0.75, 0.28, 'flip')");
    expect(py).toContain('face.rotate(180)');
  });
});
