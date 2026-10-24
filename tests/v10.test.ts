import { describe, expect, it } from 'vitest';
import { ABILITIES, abilityPower } from '../src/core/abilities';
import { createBattle, placeUnit } from '../src/core/battle';
import { PLAYABLE, getChar } from '../src/core/characters';
import {
  ascend,
  ascendCost,
  ascendCostFor,
  feedXp,
  maxLevel,
  newOwned,
  nextTier,
  statsFor,
  stepXp,
  tierLabel,
  xpToNext,
  type OwnedCard,
} from '../src/core/progression';
import { migrateV10, type SaveData } from '../src/ui/save';

const empty = () => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.10 — cores com "+" no lugar das estrelas', () => {
  it('nome do tier segue a cor: Comum, Incomum, Raro, Épico, Lendário, Mítico, com "+"', () => {
    expect([1, 2, 3, 4, 5, 6].map((n) => tierLabel(n))).toEqual(['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico']);
    expect(tierLabel(3, true)).toBe('Raro+');
    expect(tierLabel(6, true)).toBe('Mítico+');
  });

  it('escada: cor → cor+ → próxima cor; a cor máxima também tem "+"', () => {
    const c: OwnedCard = { charId: 'aiko', level: 20, xp: 0, stars: 2, plus: false };
    expect(nextTier(c)).toEqual({ stars: 2, plus: true });
    c.plus = true;
    expect(nextTier(c)).toEqual({ stars: 3, plus: false });
    const top: OwnedCard = { charId: 'aiko', level: 45, xp: 0, stars: 4, plus: true };
    expect(nextTier(top)).toBeNull();
  });

  it('nível máximo: cor = 10 × cor (como antes) e o "+" libera mais 5 níveis', () => {
    expect(maxLevel(1)).toBe(10);
    expect(maxLevel(1, true)).toBe(15);
    expect(maxLevel(3)).toBe(30);
    expect(maxLevel(3, true)).toBe(35);
    expect(maxLevel(6, true)).toBe(65);
  });

  it('do "+" para a próxima cor custa 50% a mais de Essências e de XP que da cor para o "+"', () => {
    for (let s = 1; s <= 6; s++) {
      expect(ascendCostFor(s, true)).toBe(ascendCostFor(s, false) * 1.5);
      expect(stepXp(s, true)).toBe(Math.round(stepXp(s, false) * 1.5));
    }
    expect(ascendCostFor(3, false)).toBe(12);
    expect(ascendCostFor(3, true)).toBe(18);
  });

  it('o XP real de cada degrau (somando os níveis) bate com a tabela (±1% de arredondamento)', () => {
    for (let s = 1; s <= 6; s++) {
      for (const p of [false, true]) {
        const from = p ? maxLevel(s) : s === 1 ? 1 : maxLevel(s - 1, true);
        let sum = 0;
        for (let l = from; l < maxLevel(s, p); l++) sum += xpToNext(l, s, p);
        expect(Math.abs(sum - stepXp(s, p)) / stepXp(s, p)).toBeLessThan(0.01);
      }
    }
  });

  it('Comum (cor base) continua com o mesmo XP da v0.9; dali em diante é mais difícil', () => {
    for (let l = 1; l < 10; l++) expect(xpToNext(l, 1, false)).toBe(xpToNext(l));
    // uma cor inteira (cor + "+") custa 2,5× o XP que a mesma cor custava antes
    expect(stepXp(3) + stepXp(3, true)).toBeCloseTo(stepXp(3) * 2.5, -1);
  });

  it('o "+" dá só um pequeno bônus (vida OU ataque, conforme o personagem) e não muda habilidades', () => {
    for (const d of PLAYABLE) {
      const a = statsFor(d, 20, 2, false);
      const b = statsFor(d, 20, 2, true);
      if (d.plusStat === 'atk') {
        expect(b.hp).toBe(a.hp);
        expect(b.atk - a.atk).toBeGreaterThanOrEqual(1);
        expect(b.atk).toBeLessThanOrEqual(Math.ceil(a.atk * 1.1) + 1);
      } else {
        expect(b.atk).toBe(a.atk);
        expect(b.hp - a.hp).toBeGreaterThanOrEqual(1);
        expect(b.hp).toBeLessThanOrEqual(Math.ceil(a.hp * 1.1) + 1);
      }
    }
    expect(getChar('gorath').plusStat).toBe('hp');
    expect(getChar('riku').plusStat).toBe('atk');
    // habilidades dependem só da cor: a unidade "+" tem a mesma força de habilidade
    const s = empty();
    const base = placeUnit(s, { charId: 'aiko', level: 20, stars: 3 }, 'player', 0, 0);
    const plus = placeUnit(s, { charId: 'aiko', level: 20, stars: 3, plus: true }, 'player', 1, 0);
    expect(plus.stars).toBe(base.stars);
    expect(abilityPower('flechaDupla', plus.stars, plus.level)).toBe(abilityPower('flechaDupla', base.stars, base.level));
    expect(plus.atk).toBeGreaterThan(base.atk);
    expect(plus.physRes).toBe(base.physRes);
    expect(ABILITIES.flechaDupla.scaling).not.toContain('★');
  });

  it('despertar: 1º vai para o "+", 2º para a próxima cor, cobrando o custo certo', () => {
    const c = newOwned('riku');
    feedXp(c, 1e8);
    expect(c.level).toBe(10);
    expect(ascendCost(c)).toBe(4);
    expect(ascend(c, 4).ok).toBe(true);
    expect([c.stars, c.plus]).toEqual([1, true]);
    expect(c.level).toBe(10);
    feedXp(c, 1e8);
    expect(c.level).toBe(15);
    expect(ascendCost(c)).toBe(6);
    expect(ascend(c, 5).ok).toBe(false);
    expect(ascend(c, 6).ok).toBe(true);
    expect([c.stars, c.plus]).toEqual([2, false]);
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

  it('topo (Mítico+ nível 65) continua vencível: dano mínimo 1 e resistência limitada', () => {
    const s = empty();
    const k = placeUnit(s, { charId: 'kenji', level: 65, stars: 6, plus: true }, 'player', 0, 3);
    expect(k.physRes).toBeLessThanOrEqual(3);
    expect(k.magRes).toBeLessThanOrEqual(3);
  });
});
