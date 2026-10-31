import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { goalPlain } from '../../src/core/adventure';

const src = readFileSync('src/app/adventure.ts', 'utf8');

describe('v0.52.1 janela da fase', () => {
  it('objetivos de estrela só em texto, iguais nos três', () => {
    expect(goalPlain('❤️ Vencer com o seu Comandante com 70% ou mais da vida')).toBe('Vencer com o seu Comandante com 70% ou mais da vida');
    expect(goalPlain('🪄 Vencer usando pelo menos 2 feitiços')).toBe('Vencer usando pelo menos 2 feitiços');
    expect(goalPlain('Vencer a fase')).toBe('Vencer a fase');
    expect(src).not.toContain('goalHTML(');
  });
  it('itens sem % na frente; ⓘ com as chances; sem vida do comandante nem "Inimigos até"', () => {
    expect(src).toContain('data-dropinfo');
    expect(src).toContain('function dropInfo');
    expect(src).not.toContain('Comandante inimigo ${');
    expect(src).not.toContain('Inimigos até');
    expect(src).toContain('Destaques do rival');
    expect(src).toContain('.slice(0, 2)');
  });
});

describe('v0.52.1 tutorial e topo', () => {
  it('durante a animação a tela do tutorial fica clara', () => {
    const tut = readFileSync('src/app/tutorial.ts', 'utf8');
    expect(tut).toMatch(/if \(view\.busy\) \{[^}]*spotlight\(null,[^\n]*clear: true/);
    expect(readFileSync('src/ui/spotlight.ts', 'utf8')).toContain('if (opts.clear)');
  });
  it('topo das telas com margem segura', () => {
    expect(readFileSync('src/ui/style.css', 'utf8')).toMatch(/\.screen \{ padding-top: max\(18px, calc\(env\(safe-area-inset-top\)/);
  });
});

describe('v0.52.1 botão Ir ao Banner', () => {
  it('usa o ícone atual do Banner', () => {
    const tut = readFileSync('src/app/tutorial.ts', 'utf8');
    expect(tut).toContain("label: `${ico('banner', '🎴')} Ir ao Banner`");
    expect(tut).not.toContain("'🎴 Ir ao Banner'");
  });
});

describe('v0.52.1 Loja com Gemas ou Ouro e ícones atuais', () => {
  it('cada compra do Banner tem as duas opções e a Loja mostra as Gemas', () => {
    const shop = readFileSync('src/app/shop.ts', 'utf8');
    expect(shop).toContain('export function buyPair');
    expect(shop).toContain('data-pay="${kind}"');
    expect(shop).toContain("${one('gem')}${one('gold')}");
    expect(shop).toMatch(/topbar\([^\n]*gemHTML\(fmt\(save\.gems/);
  });
  it('tutorial do Banner aponta o botão de Gema e o ✕ do canto (a tela não trava)', () => {
    const tut = readFileSync('src/app/tutorial.ts', 'utf8');
    expect(tut).toContain('[data-pull="1"][data-pay="gem"]');
    expect(tut).toContain("'.modal-bg .modal-x'");
    expect(tut).not.toContain("'.pull-x'");
  });
  it('sem emoji antigo de Banner/Gema nos textos das telas', () => {
    for (const f of ['tutorial', 'shop', 'collection', 'inventory', 'help', 'adventure']) {
      const src = readFileSync(`src/app/${f}.ts`, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*\*)/.test(l)).join('\n');
      expect(src.replace(/ico\('[a-z-]+', '[^']*'\)/g, '').replace(/\/\/.*$/gm, '')).not.toMatch(/🎴 Banner|💠 Gema/);
    }
  });
});

describe('v0.52.2 fechar a vitória volta para as fases', () => {
  it('o ✕ do resultado leva à seleção de fases e espera a escolha de carta', () => {
    const src = readFileSync('src/app/adventure.ts', 'utf8');
    expect(src).toContain('<button data-m="close" hidden></button>');
    expect(src).toMatch(/\[data-m=close\]'\)!\.addEventListener\('click', \(\) => \{\n\s*closeModal\(\);\n\s*adventure\(save\.region\);/);
    expect(src).toContain("'[data-m=adv], [data-m=train], [data-m=close]'");
  });
});
