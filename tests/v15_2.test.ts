import { describe, expect, it } from 'vitest';
import { act, canLeapOver, createBattle, Ctx, placeUnit } from '../src/core/battle';
import { abilityPower } from '../src/core/abilities';
import type { BattleState, CardInstance, RecordedEvent } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const moves = (ctx: Ctx) => ctx.events.filter((e): e is Extract<RecordedEvent, { type: 'move' }> => e.type === 'move');
const dmgTo = (ctx: Ctx, uid: number) => ctx.events.filter((e) => e.type === 'damage' && (e as { uid: number }).uid === uid).reduce((a, e) => a + (e as { amount: number }).amount, 0);

describe('v0.15.2 — Salto Vendaval por cima do inimigo da frente', () => {
  it('casa de trás livre: salta, cai atrás e ataca quem estiver à frente com investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 1, { atk: 5 });
    const front = placeUnit(s, c('nara'), 'enemy', 0, 2, { hp: 50 });
    const next = placeUnit(s, c('nara'), 'enemy', 0, 4, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(3);
    const mv = moves(ctx);
    expect(mv).toHaveLength(1);
    expect(mv[0].jumped).toBe(true);
    expect(dmgTo(ctx, front.uid)).toBe(0);
    expect(dmgTo(ctx, next.uid)).toBe(5 + abilityPower('salto', 4, 1)); // investida +2 (Épico)
  });
  it('sem ninguém no alcance depois do salto: usa a 3ª casa que sobra e não ataca', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 1, 0, { atk: 5 });
    const front = placeUnit(s, c('nara'), 'enemy', 1, 1, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(3); // salto (2 casas) + 1 passo = 3 casas fixas
    expect(moves(ctx)[0].jumped).toBe(true);
    expect(ctx.events.some((e) => e.type === 'attack')).toBe(false);
    expect(front.hp).toBe(50);
  });
  it('o Comandante conta: salto até a última coluna e ataca o Comandante com investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 4, { atk: 5 });
    placeUnit(s, c('nara'), 'enemy', 0, 5, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(6);
    expect(s.heroes.enemy.hp).toBe(30 - 5 - 2);
  });
  it('casa de trás ocupada: ataca o inimigo da frente normalmente (sem JUMP, sem investida)', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 1, 4), 'player', 0, 1, { atk: 5 });
    const front = placeUnit(s, c('nara'), 'enemy', 0, 2, { hp: 50 });
    placeUnit(s, c('nara'), 'enemy', 0, 3, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(1);
    expect(moves(ctx)).toHaveLength(0);
    expect(dmgTo(ctx, front.uid)).toBe(5);
  });
  it('casa de trás aliada (do Riku) também bloqueia o salto', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 1);
    const front = placeUnit(s, c('nara'), 'enemy', 0, 2, { hp: 50 });
    placeUnit(s, c('toru'), 'player', 0, 3);
    expect(canLeapOver(s, r, front)).toBe(false);
  });
  it('fora do tabuleiro: ataca normalmente', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 5, { atk: 5 });
    const front = placeUnit(s, c('nara'), 'enemy', 0, 6, { hp: 50 });
    const ctx = new Ctx();
    act(s, ctx, r);
    expect(r.col).toBe(5);
    expect(dmgTo(ctx, front.uid)).toBe(5);
  });
  it('lado inimigo (anda para a esquerda) também salta', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'enemy', 1, 5);
    placeUnit(s, c('nara'), 'player', 1, 4, { hp: 50 });
    act(s, new Ctx(), r);
    expect(r.col).toBe(2); // 5 → salta a 4 → cai na 3 → 3ª casa: 2
  });
  it('só o Riku salta: outros atacam o inimigo da frente', () => {
    const s = empty();
    const n = placeUnit(s, c('nara'), 'player', 0, 1);
    const front = placeUnit(s, c('toru'), 'enemy', 0, 2, { hp: 50 });
    expect(canLeapOver(s, n, front)).toBe(false);
  });
});
