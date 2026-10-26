import { describe, expect, it } from 'vitest';
import { act, createBattle, Ctx, moveRange, moveUnit, placeUnit, SALTO_MOVE } from '../src/core/battle';
import { ABILITIES } from '../src/core/abilities';
import { getChar } from '../src/core/characters';
import type { BattleState, CardInstance, RecordedEvent } from '../src/core/types';

const c = (charId: string, _level = 1, stars = 1, plus = 0): CardInstance => ({ charId, stars, plus });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const moves = (ctx: Ctx) => ctx.events.filter((e): e is Extract<RecordedEvent, { type: 'move' }> => e.type === 'move');

describe('v0.15.0 — sem passo da vitória', () => {
  it('corpo a corpo derrota e fica na mesma casa (nenhum evento de movimento)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 0, 2, { atk: 20 });
    placeUnit(s, c('aiko', 1, 2), 'enemy', 0, 3, { hp: 1 });
    const ctx = new Ctx();
    act(s, ctx, u);
    expect(s.units.some((x) => x.side === 'enemy')).toBe(false);
    expect(u.col).toBe(2);
    expect(moves(ctx)).toHaveLength(0);
  });
});

describe('v0.15.0 — atravessar aliados', () => {
  it('tanque atrás de um arqueiro passa por ele e para na frente', () => {
    const s = empty();
    const archer = placeUnit(s, c('aiko', 1, 2), 'player', 0, 1);
    placeUnit(s, c('nara'), 'enemy', 0, 4, { hp: 99 });
    const tank = placeUnit(s, c('gorath'), 'player', 0, 0);
    act(s, new Ctx(), archer); // atira e fica parado
    expect(archer.col).toBe(1);
    const ctx = new Ctx();
    act(s, ctx, tank);
    expect(tank.col).toBe(2);
    const mv = moves(ctx)[0];
    expect(mv.jumped).toBe(false); // v0.15.1: passar por aliado não é salto
    expect(mv.through).toEqual([[0, 1]]);
  });
  it('nunca termina numa casa ocupada: com 2 aliados à frente, para na última casa livre (fica parado)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'player', 1, 1);
    placeUnit(s, c('gorath'), 'player', 1, 2);
    const ctx = new Ctx();
    moveUnit(s, ctx, u);
    expect(u.col).toBe(0);
    expect(moves(ctx)).toHaveLength(0);
  });
  it('aliado logo à frente + casa livre depois: passa e ocupa a casa livre (2 passos no total)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'player', 1, 1);
    moveUnit(s, new Ctx(), u);
    expect(u.col).toBe(2);
    expect(new Set(s.units.map((x) => `${x.row},${x.col}`)).size).toBe(s.units.length);
  });
  it('aliado na 2ª casa: anda só 1 (não para em cima dele)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'player', 1, 2);
    moveUnit(s, new Ctx(), u);
    expect(u.col).toBe(1);
  });
  it('para assim que um alvo entra no alcance (checado nas casas livres)', () => {
    const s = empty();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 0, 0); // alcance 3
    placeUnit(s, c('gorath'), 'player', 0, 1);
    placeUnit(s, c('nara'), 'enemy', 0, 5, { hp: 99 });
    moveUnit(s, new Ctx(), u);
    expect(u.col).toBe(2); // passou pelo aliado; na col 2 o inimigo (col 5) entra no alcance
  });
  it('inimigos continuam bloqueando (sem Salto não passa)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 0, 0);
    placeUnit(s, c('gorath'), 'enemy', 0, 2, { hp: 99 });
    moveUnit(s, new Ctx(), u);
    expect(u.col).toBe(1);
  });
  it('vale para o lado inimigo também (anda para a esquerda)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'enemy', 1, 6);
    placeUnit(s, c('gorath'), 'enemy', 1, 5);
    moveUnit(s, new Ctx(), u);
    expect(u.col).toBe(4);
  });
});

describe('v0.15.0 — Salto Vendaval (Riku): 3 casas fixas', () => {
  it('3 casas em todas as cores e níveis, nunca mais', () => {
    const def = getChar('riku');
    const s = empty();
    for (let st = def.minStars; st <= 6; st++)
      for (const lvl of [0, 1, 2]) {
        const u = placeUnit(s, c('riku', 1, st, lvl), 'player', 0, 0);
        expect(moveRange(u)).toBe(SALTO_MOVE);
        s.units = [];
        const v = placeUnit(s, c('riku', 1, st, lvl), 'player', 0, 0);
        moveUnit(s, new Ctx(), v);
        expect(v.col).toBe(3);
        s.units = [];
      }
    expect(SALTO_MOVE).toBe(3);
    expect(ABILITIES.salto.scaling).toContain('sempre até a 3ª casa');
  });
});
