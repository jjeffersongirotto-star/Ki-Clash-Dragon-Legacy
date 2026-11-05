import { describe, expect, it } from 'vitest';
import { ascend, cardBarXp, feedXp, newOwned, statsFor, xpProgress } from '../../src/core/progression';
import { expectedMaxStars, getChar, PLAYABLE, UNIQUE_5STAR } from '../../src/core/characters';

describe('progressão por XP (v0.23.0: barra por degrau, sem nível)', () => {
  it('a barra enche com XP e o que passa do cheio se perde', () => {
    const card = newOwned('riku');
    feedXp(card, cardBarXp(card) - 1);
    expect(xpProgress(card)).toBeCloseTo((cardBarXp(card) - 1) / cardBarXp(card));
    expect(feedXp(card, 1).filled).toBe(true);
    const r = feedXp(card, 1e7);
    expect(card.xp).toBe(cardBarXp(card));
    expect(r.wasted).toBe(1e7);
  });
  it('status crescem com o degrau e a raridade (v0.62.0: tabela do balanceamento v2.0)', () => {
    const def = getChar('riku');
    expect(statsFor(def, 1, 1).hp).toBe(statsFor(def, 1, 0).hp + 1); // "+" = +1 de vida
    expect(statsFor(def, 1, 2)).toEqual(statsFor(def, 1, 1)); // "++" fora da raridade máxima: só a habilidade melhora
    expect(statsFor(def, 4, 2).atk).toBe(statsFor(def, 4, 0).atk + 1); // "++" na raridade máxima: +1 de ataque
    expect(statsFor(def, 4, 0).atk + statsFor(def, 4, 0).hp).toBeGreaterThan(statsFor(def, 1, 0).atk + statsFor(def, 1, 0).hp);
  });
  it('despertar exige a barra cheia e respeita o topo (raridade máxima "++")', () => {
    const card = newOwned('riku');
    expect(ascend(card, 999).ok).toBe(false);
    // Comum → … → Épico++ = 11 despertares
    for (let i = 0; i < 11; i++) {
      feedXp(card, 1e8);
      expect(ascend(card, 999).ok).toBe(true);
    }
    expect(card.stars).toBe(4);
    expect(card.plus).toBe(2);
    feedXp(card, 1e8);
    expect(ascend(card, 999).ok).toBe(false);
  });
  it('faixa de cores: Comum/Incomum→Épico, Raro→Lendário, Épico/Lendário→Mítico; únicos começam em Lendário', () => {
    // v0.62.0 (balanceamento v2.0): 7 cartas que nascem Comuns vão só até Raro
    const capped = ['taro', 'hana', 'nara', 'pip', 'suri', 'daichi', 'sora'];
    for (const d of PLAYABLE) {
      expect(d.maxStars, d.id).toBe(capped.includes(d.id) ? 3 : expectedMaxStars(d.minStars));
      if (UNIQUE_5STAR.includes(d.id)) expect(d.minStars).toBe(5);
    }
    expect(expectedMaxStars(1)).toBe(4);
    expect(expectedMaxStars(2)).toBe(4);
    expect(expectedMaxStars(3)).toBe(5);
    expect(expectedMaxStars(4)).toBe(6);
    expect(expectedMaxStars(5)).toBe(6);
    expect(UNIQUE_5STAR.sort()).toEqual(['kenji', 'pira']);
  });
});
