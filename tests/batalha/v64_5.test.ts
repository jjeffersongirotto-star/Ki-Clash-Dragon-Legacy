import { describe, expect, it } from 'vitest';
import { Ctx, attack, createBattle, placeUnit } from '../../src/core/battle';
import { findTarget, rangeOf } from '../../src/core/battleRules';
import { getChar } from '../../src/core/characters';
import { abilityListHTML } from '../../src/ui/components';
import type { BattleState, CardInstance } from '../../src/core/types';

const c = (id: string, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.64.5 — ajustes do jogador no editor', () => {
  it('valores das cartas', () => {
    const v = (id: string) => [getChar(id).wait, getChar(id).range, getChar(id).damageType];
    expect(v('hayato')).toEqual([6, 2, 'fisico']);
    expect(v('zarek')).toEqual([7, 4, 'magico']);
    expect(v('kael')).toEqual([7, 4, 'magico']);
    expect(getChar('hayato').abilities).not.toContain('critico');
    expect(getChar('zarek').abilities).not.toContain('critico');
    expect(getChar('mimic').abilities).toEqual(['copiador', 'investida', 'anular']);
    expect([getChar('titanx').wait, getChar('aethra').wait, getChar('mimic').wait]).toEqual([5, 6, 6]);
    expect(abilityListHTML(getChar('vharga'), 6)).toContain('totalmente');
  });

  it('Zarek: Emboscada só até 2 casas; senão, o mais próximo no alcance 4', () => {
    const s = empty();
    const z = placeUnit(s, c('zarek'), 'player', 0, 1);
    expect(rangeOf(z)).toBe(4);
    const near = placeUnit(s, c('riku'), 'enemy', 0, 4);
    placeUnit(s, c('riku'), 'enemy', 0, 5);
    expect(findTarget(s, z)).toBe(near);
    const two = placeUnit(s, c('riku'), 'enemy', 0, 3);
    placeUnit(s, c('riku'), 'enemy', 0, 2);
    expect(findTarget(s, z)).toBe(two);
  });

  it('Kael: Fúria sem limite', () => {
    const s = empty();
    const k = placeUnit(s, c('kael'), 'player', 0, 1, { atk: 50 });
    for (let i = 0; i < 5; i++) attack(s, new Ctx(), k, placeUnit(s, c('riku'), 'enemy', 0, 2, { hp: 1 }));
    expect(k.atkMod).toBe(5);
  });

  it('Vharga: cura toda a vida ao derrotar; Titan-X sem resistência mágica', () => {
    const s = empty();
    const v = placeUnit(s, c('vharga'), 'player', 0, 1, { atk: 50 });
    v.hp = 2;
    attack(s, new Ctx(), v, placeUnit(s, c('riku'), 'enemy', 0, 2, { hp: 5 }));
    expect(v.hp).toBe(v.maxHp);
    expect(placeUnit(s, c('titanx'), 'player', 1, 1).magRes).toBe(0);
  });
});
