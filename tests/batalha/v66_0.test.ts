import { describe, expect, it } from 'vitest';
import { createBattle, placeUnit } from '../../src/core/battle';
import { effectiveAtk } from '../../src/core/battleRules';
import { BALANCE_V2 } from '../../src/core/balanceV2';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { abilityListHTML } from '../../src/ui/components';
import type { BattleState, CardInstance } from '../../src/core/types';

const c = (id: string, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.66.0 — revisão dos Humanos e Aura de raça', () => {
  it('Aura de Ataque do Hayato: +2 nos outros Humanos aliados, em qualquer casa; não nele, nem em outra raça, nem no inimigo', () => {
    const s = empty();
    const riku = placeUnit(s, c('riku'), 'player', 0, 0);
    const outra = PLAYABLE.find((d) => d.race !== 'humano')!;
    const alien = placeUnit(s, c(outra.id), 'player', 1, 0);
    const inimigo = placeUnit(s, c('ren'), 'enemy', 1, 11);
    const base = [effectiveAtk(s, riku), effectiveAtk(s, alien), effectiveAtk(s, inimigo)];
    const h = placeUnit(s, c('hayato'), 'player', 1, 5);
    expect(effectiveAtk(s, riku)).toBe(base[0] + 2);
    expect(effectiveAtk(s, alien)).toBe(base[1]);
    expect(effectiveAtk(s, inimigo)).toBe(base[2]);
    expect(effectiveAtk(s, h)).toBe(BALANCE_V2.hayato.stats[5][0]); // ele mesmo não ganha a aura
    // duas cópias do Hayato não somam
    placeUnit(s, c('hayato'), 'player', 0, 5);
    expect(effectiveAtk(s, riku)).toBe(base[0] + 2);
    // Hayato derrotado: a aura some
    h.hp = 0;
    s.units.filter((u) => u.charId === 'hayato').forEach((u) => (u.hp = 0));
    expect(effectiveAtk(s, riku)).toBe(base[0]);
  });

  it('a carta mostra a descrição da aura', () => {
    expect(abilityListHTML(getChar('hayato'), 6)).toContain('aliados Humanos ganham +2 de ataque');
  });

  it('v0.67.0: subir de raridade sempre aumenta a força (2 × ataque + vida)', () => {
    const force = (id: string, r: number) => 2 * BALANCE_V2[id].stats[r][0] + BALANCE_V2[id].stats[r][1];
    for (const d of PLAYABLE.filter((x) => x.race === 'humano')) for (let r = d.minStars + 1; r <= d.maxStars; r++) expect(force(d.id, r), d.id).toBeGreaterThan(force(d.id, r - 1));
  });
});
