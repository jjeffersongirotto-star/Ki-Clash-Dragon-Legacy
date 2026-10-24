import { describe, expect, it } from 'vitest';
import { cardHTML } from '../src/ui/components';
import { portraitSVG } from '../src/ui/art';
import { getChar } from '../src/core/characters';

describe('visual das cartas', () => {
  it('tem moldura, cenário, personagem separado, medalhões, estrelas e faixa com o nome', () => {
    const h = cardHTML({ charId: 'riku', level: 7, stars: 2 });
    for (const cls of ['card-metal', 'card-frame', 'card-bg', 'card-aura', 'card-fig', 'card-cost', 'card-cat', 'card-lvl', 'card-ribbon', 'card-top']) expect(h).toContain(cls);
    expect(h).toContain('Riku Vendaval');
    expect(h).toMatch(/class="card s2/);
  });
  it('mais estrelas = mais brilho: reflexo a partir de 3★, faíscas em 5★ e 6★', () => {
    const at = (s: number) => cardHTML({ charId: 'kenji', level: 1, stars: s });
    expect(at(2)).not.toContain('card-shine');
    expect(at(3)).toContain('card-shine');
    expect(at(4)).not.toContain('class="spk"');
    expect((at(5).match(/class="spk"/g) ?? []).length).toBe(4);
    expect((at(6).match(/class="spk"/g) ?? []).length).toBe(7);
  });
  it('carta bloqueada não tem faíscas; versão compacta não mostra status', () => {
    expect(cardHTML({ charId: 'vorax', level: 1, stars: 6 }, { locked: true })).not.toContain('class="spk"');
    expect(cardHTML({ charId: 'riku', level: 1, stars: 1 }, { compact: true })).not.toContain('card-stats');
  });
  it('camadas do retrato: fundo sem personagem e personagem sem fundo', () => {
    const d = getChar('nara');
    const bg = portraitSVG(d, { stars: 4, layer: 'bg' });
    const fg = portraitSVG(d, { stars: 4, layer: 'fg' });
    const all = portraitSVG(d, { stars: 4 });
    expect(bg).not.toContain('Q30 70 50 72'); // rosto
    expect(fg).toContain('Q30 70 50 72');
    expect(fg).not.toContain('-vig)"/>');
    expect(all).toContain('Q30 70 50 72');
    for (const svg of [bg, fg, all]) expect((svg.match(/<svg/g) ?? []).length).toBe((svg.match(/<\/svg>/g) ?? []).length);
  });
});
