import { describe, expect, it } from 'vitest';
import { cardHTML, raceHTML } from '../../src/ui/components';
import { portraitSVG, unitSpriteSVG } from '../../src/ui/art';
import { PLAYABLE, RACE_INFO, getChar } from '../../src/core/characters';

describe('visual das cartas', () => {
  it('tem moldura, cenário, personagem separado, custo, nível/Poder, faixa com o nome, ataque e vida (padrão v0.14)', () => {
    const h = cardHTML({ charId: 'riku', stars: 2, plus: 1 }); // v0.23.0: a estrela mostra o degrau (só com "+" ou "++")
    for (const cls of ['card-metal', 'card-frame', 'card-bg', 'card-fig', 'ck-cost', 'ck-cat', 'ck-banner', 'ck-rar', 'ck-icons', 'ck-atk', 'ck-hp', 'ck-abil']) expect(h).toContain(cls);
    expect(h).toContain('Riku Vendaval');
    expect(h).toMatch(/class="card s2/);
  });
  it('mais estrelas = mais brilho: reflexo a partir de 3★ (v0.40.0: sem aura colorida e sem estrelinhas)', () => {
    const at = (s: number) => cardHTML({ charId: 'kenji', stars: s });
    expect(at(2)).not.toContain('card-shine');
    expect(at(3)).toContain('card-shine');
    for (const s of [1, 2, 3, 4, 5, 6]) {
      expect(at(s)).not.toContain('class="spk"');
      expect(at(s)).not.toContain('card-aura');
    }
  });
  it('carta bloqueada não tem faíscas; versão compacta não mostra status', () => {
    expect(cardHTML({ charId: 'vorax', stars: 6 }, { locked: true })).not.toContain('class="spk"');
    expect(cardHTML({ charId: 'riku', stars: 1 }, { compact: true })).toContain('ck-abil'); // v0.14.3: a compacta também mostra as habilidades
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
  it('todos os personagens possuem raça válida (humano, extraterrestre, monstro, mago, androide, necromante) e sprite de arena', () => {
    const races = new Set<string>();
    for (const d of PLAYABLE) {
      expect(RACE_INFO[d.race]).toBeTruthy();
      races.add(d.race);
      expect(raceHTML(d)).toContain(RACE_INFO[d.race].label);
      const spr = unitSpriteSVG(d, { stars: d.minStars, side: 'player' });
      expect(spr).toContain('unit-sprite');
      expect(spr).toContain('spr-legs');
      expect(spr).toContain('spr-arm-f');
    }
    expect(races.size).toBe(6);
  });
});
