import { describe, expect, it } from 'vitest';
import { ABILITIES, abilityPower } from '../src/core/abilities';
import { createBattle, placeUnit } from '../src/core/battle';
import { PLAYABLE } from '../src/core/characters';
import {
  ascend,
  ascendCost,
  ascendCostFor,
  feedXp,
  newOwned,
  nextTier,
  statsFor,
  stepXp,
  tierLabel,
  type OwnedCard,
} from '../src/core/progression';
import { migrateV10, type SaveData } from '../src/ui/save';

const empty = () => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.10 — cores com "+" no lugar das estrelas', () => {
  it('nome do tier segue a cor: Comum, Incomum, Raro, Épico, Lendário, Mítico, com "+"', () => {
    expect([1, 2, 3, 4, 5, 6].map((n) => tierLabel(n))).toEqual(['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico']);
    expect(tierLabel(3, 1)).toBe('Raro+');
    expect(tierLabel(6, 2)).toBe('Mítico++'); // v0.23.0: degrau "++"
  });

  it('escada (v0.23.0): raridade → "+" → "++" → próxima raridade; a raridade máxima também tem "++"', () => {
    const c: OwnedCard = { charId: 'aiko', xp: 0, stars: 2, plus: 0 };
    expect(nextTier(c)).toEqual({ stars: 2, plus: 1 });
    c.plus = 1;
    expect(nextTier(c)).toEqual({ stars: 2, plus: 2 });
    c.plus = 2;
    expect(nextTier(c)).toEqual({ stars: 3, plus: 0 });
    const top: OwnedCard = { charId: 'aiko', xp: 0, stars: 4, plus: 2 };
    expect(nextTier(top)).toBeNull();
  });

  it('custos do Despertar (v0.23.0): 4 × raridade, 5 × raridade no "++" e 6 × raridade na troca de raridade', () => {
    for (let s = 1; s <= 6; s++) {
      expect(ascendCostFor(s, 0)).toBe(4 * s);
      expect(ascendCostFor(s, 1)).toBe(5 * s);
      expect(ascendCostFor(s, 2)).toBe(6 * s);
      expect(stepXp(s, 2)).toBeGreaterThan(stepXp(s, 1));
      expect(stepXp(s, 1)).toBeGreaterThan(stepXp(s, 0));
    }
  });

  it('v0.23.0: cada degrau dá +17% de ataque e de vida; habilidades dependem da raridade e do degrau', () => {
    for (const d of PLAYABLE) {
      const a = statsFor(d, 2, 0);
      const b = statsFor(d, 2, 1);
      expect(b.atk).toBeGreaterThanOrEqual(a.atk);
      expect(b.hp).toBeGreaterThan(a.hp);
    }
    const s = empty();
    const base = placeUnit(s, { charId: 'aiko', stars: 3 }, 'player', 0, 0);
    const plus = placeUnit(s, { charId: 'aiko', stars: 3, plus: 1 }, 'player', 1, 0);
    expect(plus.stars).toBe(base.stars);
    expect(abilityPower('flechaDupla', plus.stars, plus.plus)).toBeGreaterThanOrEqual(abilityPower('flechaDupla', base.stars, base.plus));
    expect(plus.hp).toBeGreaterThan(base.hp);
    expect(ABILITIES.flechaDupla.scaling).not.toContain('★');
  });

  it('despertar (v0.23.0): só com a barra cheia, cobrando o custo certo', () => {
    const c = newOwned('riku');
    expect(ascend(c, 999).ok).toBe(false);
    feedXp(c, 1e8);
    expect(ascendCost(c)).toBe(4);
    expect(ascend(c, 4).ok).toBe(true);
    expect([c.stars, c.plus, c.xp]).toEqual([1, 1, 0]);
    feedXp(c, 1e8);
    expect(ascendCost(c)).toBe(5);
    expect(ascend(c, 5).ok).toBe(true);
    expect([c.stars, c.plus]).toEqual([1, 2]);
    feedXp(c, 1e8);
    expect(ascendCost(c)).toBe(6);
    expect(ascend(c, 5).ok).toBe(false);
    expect(ascend(c, 6).ok).toBe(true);
    expect([c.stars, c.plus]).toEqual([2, 0]);
  });

  it('migração: estrelas antigas viram a cor BASE correspondente, mantendo nível', () => {
    const old = {
      version: 1,
      cards: { riku: { charId: 'riku', level: 27, xp: 50, stars: 3 }, kenji: { charId: 'kenji', level: 50, xp: 0, stars: 5 } },
      deck: ['riku', 'kenji'],
      items: { pergaminho: 0, cristal: 0, orbe: 0 },
      essencias: 0,
      cleared: [],
      speed: 1,
      team10: true,
      v8: true,
    } as unknown as SaveData;
    const m = migrateV10(old);
    expect(m.cards.riku).toMatchObject({ stars: 3, plus: false, level: 27, xp: 50 });
    expect(tierLabel(m.cards.riku.stars, m.cards.riku.plus)).toBe('Raro');
    expect(m.cards.kenji).toMatchObject({ stars: 5, plus: false, level: 50 });
    expect(m.v10).toBe(true);
  });

  it('topo (Mítico++) continua vencível: dano mínimo 1 e resistência limitada', () => {
    const s = empty();
    const k = placeUnit(s, { charId: 'kenji', stars: 6, plus: 2 }, 'player', 0, 3);
    expect(k.physRes).toBeLessThanOrEqual(3);
    expect(k.magRes).toBeLessThanOrEqual(3);
  });
});
