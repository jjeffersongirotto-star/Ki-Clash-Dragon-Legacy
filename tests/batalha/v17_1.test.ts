import { describe, expect, it } from 'vitest';
import { Ctx, addEffect, applyDamage, createBattle, effectOf, endPlayerTurn, placeUnit, resolveSide } from '../../src/core/battle';
import { getChar } from '../../src/core/characters';
import { getSpell } from '../../src/core/spells';
import type { BattleState, CardInstance } from '../../src/core/types';

const c = (id: string, _level = 1, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
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

describe('v0.17.1 — duração de todos os efeitos no ciclo real de turnos', () => {
  const noAi = () => {};
  // efeito aplicado no turno de quem lança (como os feitiços), depois os turnos rodam de verdade
  const setup = (caster: 'player' | 'enemy') => {
    const s = empty();
    s.fury = false;
    const victimSide = caster === 'player' ? 'enemy' : 'player';
    const v = placeUnit(s, c('riku'), victimSide, 0, victimSide === 'enemy' ? 11 : 0, { hp: 50, atk: 1 });
    return { s, v };
  };
  const advance = (s: BattleState, caster: 'player' | 'enemy', apply: () => void) => {
    if (caster === 'player') {
      apply();
      endPlayerTurn(s, noAi);
    } else endPlayerTurn(s, () => apply());
  };
  for (const caster of ['player', 'enemy'] as const) {
    it(`veneno de 3 rodadas faz dano 3 vezes (lançado pelo ${caster === 'player' ? 'jogador' : 'inimigo'})`, () => {
      const { s, v } = setup(caster);
      advance(s, caster, () => addEffect(s, new Ctx(), v, 'veneno', 2, 3));
      for (let i = 0; i < 5; i++) endPlayerTurn(s, noAi);
      expect(v.hp).toBe(50 - 6);
    });
    it(`queimadura de 2 rodadas faz dano 2 vezes (lançado pelo ${caster === 'player' ? 'jogador' : 'inimigo'})`, () => {
      const { s, v } = setup(caster);
      advance(s, caster, () => addEffect(s, new Ctx(), v, 'queimadura', 3, 2));
      for (let i = 0; i < 5; i++) endPlayerTurn(s, noAi);
      expect(v.hp).toBe(50 - 6);
    });
    it(`atordoado tira exatamente 1 ação (lançado pelo ${caster === 'player' ? 'jogador' : 'inimigo'})`, () => {
      const { s, v } = setup(caster);
      const start = v.col;
      advance(s, caster, () => addEffect(s, new Ctx(), v, 'atordoado', 1, 1));
      if (caster === 'player') {
        expect(v.col).toBe(start);
        expect(effectOf(v, 'atordoado')).toBeUndefined();
      } else {
        expect(effectOf(v, 'atordoado')).toBeDefined();
        endPlayerTurn(s, noAi);
        expect(effectOf(v, 'atordoado')).toBeUndefined();
      }
      const before = v.col;
      endPlayerTurn(s, noAi);
      expect(v.col).not.toBe(before);
    });
  }
});
