import { describe, expect, it } from 'vitest';
import { Ctx, applyDamage, createBattle, placeUnit } from '../src/core/battle';
import { getChar } from '../src/core/characters';
import type { BattleState, CardInstance } from '../src/core/types';

const c = (id: string, _level = 1, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.20.1 — Reflexo de Magia só de quem continua de pé', () => {
  it('Nyx derrotada pelo golpe não devolve dano', () => {
    const s = empty();
    const n = placeUnit(s, c('nyx', 1, 4), 'enemy', 0, 8, { hp: 5 });
    const k = placeUnit(s, c('kael'), 'player', 0, 5, { atk: 10, hp: 30 });
    applyDamage(s, new Ctx(), n, 20, 'magico', { side: 'player', unit: k });
    expect(s.units.includes(n)).toBe(false);
    expect(k.hp).toBe(30);
  });
  it('feitiço que derruba a Nyx não reflete no Comandante de quem lançou', () => {
    const s = empty();
    const n = placeUnit(s, c('nyx', 1, 4), 'enemy', 0, 8, { hp: 5 });
    applyDamage(s, new Ctx(), n, 20, 'magico', { side: 'player', spell: true });
    expect(s.heroes.player.hp).toBe(30);
  });
  it('Nyx que sobrevive continua refletindo', () => {
    const s = empty();
    const n = placeUnit(s, c('nyx', 1, 4), 'enemy', 0, 8, { hp: 50 });
    const k = placeUnit(s, c('kael'), 'player', 0, 5, { atk: 10, hp: 30 });
    applyDamage(s, new Ctx(), n, 10, 'magico', { side: 'player', unit: k });
    expect(k.hp).toBe(27);
  });
});
