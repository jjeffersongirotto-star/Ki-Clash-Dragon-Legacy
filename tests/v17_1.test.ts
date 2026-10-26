import { describe, expect, it } from 'vitest';
import { Ctx, addEffect, applyDamage, createBattle, effectOf, placeUnit, resolveSide } from '../src/core/battle';
import { getChar } from '../src/core/characters';
import { getSpell } from '../src/core/spells';
import type { BattleState, CardInstance } from '../src/core/types';

const c = (id: string, level = 1, stars = getChar(id).minStars): CardInstance => ({ charId: id, level, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.17.1 — escudo temporário conta os turnos do adversário', () => {
  it('escudo de 2 rodadas lançado no seu turno protege contra 2 turnos inimigos', () => {
    const s = empty();
    const t = placeUnit(s, c('riku'), 'player', 0, 2, { hp: 10 });
    addEffect(s, new Ctx(), t, 'escudo', 20, 2);
    resolveSide(s, new Ctx(), 'player');
    expect(effectOf(t, 'escudo')?.turns).toBe(2);
    resolveSide(s, new Ctx(), 'enemy');
    expect(effectOf(t, 'escudo')?.turns).toBe(1);
    resolveSide(s, new Ctx(), 'player');
    applyDamage(s, new Ctx(), t, 3, 'fisico', { side: 'enemy' });
    expect(t.hp).toBe(10);
    resolveSide(s, new Ctx(), 'enemy');
    expect(effectOf(t, 'escudo')).toBeUndefined();
  });
  it('escudo lançado pelo inimigo também dura 2 turnos do jogador', () => {
    const s = empty();
    const t = placeUnit(s, c('riku'), 'enemy', 0, 9, { hp: 10 });
    addEffect(s, new Ctx(), t, 'escudo', 20, 2);
    resolveSide(s, new Ctx(), 'enemy');
    resolveSide(s, new Ctx(), 'player');
    expect(effectOf(t, 'escudo')?.turns).toBe(1);
    resolveSide(s, new Ctx(), 'player');
    expect(effectOf(t, 'escudo')).toBeUndefined();
  });
  it('atordoado continua acabando no fim do turno do lado da unidade', () => {
    const s = empty();
    const a = placeUnit(s, c('nara'), 'player', 0, 5);
    addEffect(s, new Ctx(), a, 'atordoado', 1, 1);
    resolveSide(s, new Ctx(), 'enemy');
    expect(effectOf(a, 'atordoado')).toBeDefined();
    resolveSide(s, new Ctx(), 'player');
    expect(effectOf(a, 'atordoado')).toBeUndefined();
  });
  it('Anjo da Guarda (feitiço) diz na carta que dura até ser usado', () => {
    expect(getSpell('f-anjo').description).toContain('dura até ser usado');
  });
});
