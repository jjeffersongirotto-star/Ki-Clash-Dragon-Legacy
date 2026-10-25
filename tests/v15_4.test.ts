import { describe, expect, it } from 'vitest';
import { act, canLeapOver, createBattle, Ctx, leapLanding, moveUnit, placeUnit } from '../src/core/battle';
import { abilityPower } from '../src/core/abilities';
import { getChar } from '../src/core/characters';
import { maxLevel } from '../src/core/progression';
import type { BattleState, CardInstance, RecordedEvent } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const moves = (ctx: Ctx) => ctx.events.filter((e): e is Extract<RecordedEvent, { type: 'move' }> => e.type === 'move');
const dmgTo = (ctx: Ctx, uid: number) => ctx.events.filter((e) => e.type === 'damage' && (e as { uid: number }).uid === uid).reduce((a, e) => a + (e as { amount: number }).amount, 0);

describe('v0.15.4 — o movimento do Riku é sempre um salto', () => {
  it('caminho livre: salta direto para a 3ª casa (todas as cores e níveis), com JUMP', () => {
    const def = getChar('riku');
    for (let st = def.minStars; st <= def.maxStars; st++)
      for (const pl of [false, true]) {
        const s = empty();
        const r = placeUnit(s, c('riku', maxLevel(st, pl), st), 'player', 0, 0);
        const ctx = new Ctx();
        expect(moveUnit(s, ctx, r)).toBe(true);
        expect(r.col).toBe(3);
        expect(moves(ctx)).toHaveLength(1);
        expect(moves(ctx)[0].jumped).toBe(true);
      }
  });
  it('passa por cima de aliados nas casas 1–2 e cai na 3ª (aliados aparecem em `through`)', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 1, 0);
    placeUnit(s, c('toru'), 'player', 1, 1);
    placeUnit(s, c('toru'), 'player', 1, 2);
    const ctx = new Ctx();
    moveUnit(s, ctx, r);
    expect(r.col).toBe(3);
    expect(moves(ctx)[0].through).toEqual([[1, 1], [1, 2]]);
  });
  it('3ª ocupada → cai na 2ª; 2ª também → cai na 1ª; as três → fica', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 0);
    placeUnit(s, c('toru'), 'player', 0, 3);
    expect(leapLanding(s, r)).toBe(2);
    placeUnit(s, c('toru'), 'player', 0, 2);
    expect(leapLanding(s, r)).toBe(1);
    placeUnit(s, c('toru'), 'player', 0, 1);
    expect(leapLanding(s, r)).toBeNull();
    const ctx = new Ctx();
    expect(moveUnit(s, ctx, r)).toBe(false);
    expect(r.col).toBe(0);
    expect(moves(ctx)).toHaveLength(0);
  });
  it('fora do campo conta como ocupada: perto do fim cai na última casa possível', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 5);
    expect(leapLanding(s, r)).toBe(6);
  });
  it('nunca anda depois de cair (nem quando não há alvo)', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 0);
    act(s, new Ctx(), r);
    expect(r.col).toBe(3);
  });
  it('inimigo a 3 casas: cai na 2ª (ao lado dele) e ataca com investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 0, { atk: 5 });
    const e = placeUnit(s, c('nara'), 'enemy', 0, 3, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(2);
    expect(dmgTo(ctx, e.uid)).toBe(5 + abilityPower('salto', 4, 1));
  });
  it('inimigo logo à frente e pouso livre: salta por cima dele e ataca com investida quem estiver à frente', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 0, { atk: 5 });
    const front = placeUnit(s, c('nara'), 'enemy', 0, 1, { hp: 50 });
    const next = placeUnit(s, c('nara'), 'enemy', 0, 4, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(3);
    expect(dmgTo(ctx, front.uid)).toBe(0);
    expect(dmgTo(ctx, next.uid)).toBe(5 + 2);
  });
  it('inimigo logo à frente e 3ª ocupada: cai na 2ª (logo atrás dele)', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 1, 1);
    placeUnit(s, c('nara'), 'enemy', 1, 2, { hp: 50 });
    placeUnit(s, c('toru'), 'enemy', 1, 4, { hp: 50 });
    act(s, new Ctx(), r);
    expect(r.col).toBe(3);
  });
  it('inimigo logo à frente e sem pouso (2ª e 3ª ocupadas ou fora): ataca normalmente, sem investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 1, { atk: 5 });
    const front = placeUnit(s, c('nara'), 'enemy', 0, 2, { hp: 50 });
    placeUnit(s, c('nara'), 'enemy', 0, 3, { hp: 50 });
    placeUnit(s, c('toru'), 'player', 0, 4);
    expect(canLeapOver(s, r, front)).toBe(false);
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(1);
    expect(moves(ctx)).toHaveLength(0);
    expect(dmgTo(ctx, front.uid)).toBe(5);
    const s2 = empty();
    const r2 = placeUnit(s2, c('riku'), 'player', 0, 5, { atk: 5 });
    const f2 = placeUnit(s2, c('nara'), 'enemy', 0, 6, { hp: 50 });
    const ctx2 = new Ctx();
    act(s2, ctx2, r2);
    expect(r2.col).toBe(5);
    expect(dmgTo(ctx2, f2.uid)).toBe(5);
  });
  it('na última coluna ataca o Comandante normalmente (não há casa para saltar)', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 6, { atk: 5 });
    act(s, new Ctx(), r);
    expect(r.col).toBe(6);
    expect(s.heroes.enemy.hp).toBe(25);
  });
  it('salta e cai na última coluna: ataca o Comandante com investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 3, { atk: 5 });
    act(s, new Ctx(), r);
    expect(r.col).toBe(6);
    expect(s.heroes.enemy.hp).toBe(30 - 5 - 2);
  });
  it('lado inimigo salta para a esquerda', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'enemy', 1, 6);
    act(s, new Ctx(), r);
    expect(r.col).toBe(3);
  });
  it('outras unidades continuam andando (sem salto)', () => {
    const s = empty();
    const n = placeUnit(s, c('nara'), 'player', 0, 0);
    const ctx = new Ctx();
    expect(moveUnit(s, ctx, n)).toBe(false);
    expect(n.col).toBe(2);
    expect(moves(ctx)[0].jumped).toBe(false);
  });
});
