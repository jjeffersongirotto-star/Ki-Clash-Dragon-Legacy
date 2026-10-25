import { describe, expect, it } from 'vitest';
import { act, createBattle, Ctx, LOTUS_TARGETS, moveUnit, placeUnit } from '../src/core/battle';
import { ABILITIES, abilityPower } from '../src/core/abilities';
import type { BattleState, CardInstance, RecordedEvent } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

describe('v0.15.1 — Feixe Perfurante máx. 75%', () => {
  it('50% Incomum, 75% de Raro em diante (nunca 100%)', () => {
    expect(abilityPower('perfurante', 2, 1)).toBe(50);
    for (let s = 3; s <= 6; s++) for (const l of [1, 30, 99]) expect(abilityPower('perfurante', s, l)).toBe(75);
    expect(ABILITIES.perfurante.scaling).toContain('75%');
    expect(ABILITIES.perfurante.scaling).not.toContain('100%');
  });
  it('quem está atrás leva 75% com Lyra Épica', () => {
    const s = empty();
    const l = placeUnit(s, c('lyra', 1, 4), 'player', 0, 1, { atk: 8 });
    placeUnit(s, c('gorath'), 'enemy', 0, 3, { hp: 99 });
    const back = placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 99 });
    back.magRes = 0;
    act(s, new Ctx(), l);
    expect(99 - back.hp).toBe(6);
  });
});

describe('v0.15.1 — Corte Diagonal máx. 50%', () => {
  it('0 em Comum/Incomum, 50% de Raro em diante', () => {
    expect(abilityPower('diagFrente', 1, 1)).toBe(0);
    expect(abilityPower('diagFrente', 2, 1)).toBe(0);
    for (let s = 3; s <= 6; s++) expect(abilityPower('diagFrente', s, 99)).toBe(50);
  });
});

describe('v0.15.1 — Bênção do Lótus: só os 2 mais feridos', () => {
  it('com 3 vizinhos feridos, cura só os 2 que perderam mais vida', () => {
    const s = empty();
    const m = placeUnit(s, c('mei', 1, 2), 'player', 0, 1);
    const a = placeUnit(s, c('gorath'), 'player', 0, 0, { hp: 20 });
    const b = placeUnit(s, c('gorath'), 'player', 1, 1, { hp: 20 });
    const d = placeUnit(s, c('gorath'), 'player', 1, 2, { hp: 20 });
    a.hp = 18; b.hp = 10; d.hp = 14;
    const heals: number[] = [];
    const ctx = new Ctx();
    act(s, ctx, m);
    for (const e of ctx.events) if (e.type === 'heal') heals.push(e.uid);
    expect(heals).toEqual([b.uid, d.uid]);
    expect(a.hp).toBe(18);
    expect(LOTUS_TARGETS).toBe(2);
  });
  it('empate: menos vida primeiro, depois quem entrou antes (determinístico)', () => {
    const s = empty();
    const m = placeUnit(s, c('mei', 1, 2), 'player', 0, 1);
    const x = placeUnit(s, c('gorath'), 'player', 0, 0, { hp: 20 });
    const y = placeUnit(s, c('gorath'), 'player', 1, 0, { hp: 20 });
    const z = placeUnit(s, c('gorath'), 'player', 0, 2, { hp: 10 });
    x.hp = 15; y.hp = 15; z.hp = 5; // todos perderam 5; z tem menos vida
    const ctx = new Ctx();
    act(s, ctx, m);
    const heals = ctx.events.filter((e) => e.type === 'heal').map((e) => (e as { uid: number }).uid);
    expect(heals).toEqual([z.uid, x.uid]);
    expect(ABILITIES.lotus.description).toContain('2 aliados vizinhos mais feridos');
  });
});

describe('v0.15.1 — salto só com a habilidade', () => {
  it('Riku passando por aliado: sem JUMP (jumped=false) e sem investida', () => {
    const s = empty();
    const r = placeUnit(s, c('riku', 30, 4), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'player', 1, 1);
    const ctx = new Ctx();
    expect(moveUnit(s, ctx, r)).toBe(false);
    const mv = ctx.events.find((e) => e.type === 'move') as Extract<RecordedEvent, { type: 'move' }>;
    expect(mv.jumped).toBe(false);
    expect(mv.through).toEqual([[1, 1]]);
    expect(r.col).toBe(3);
  });
  it('unidade comum passando por aliado também não é salto', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 0, 0);
    placeUnit(s, c('gorath'), 'player', 0, 1);
    expect(moveUnit(s, new Ctx(), u)).toBe(false);
    expect(u.col).toBe(2);
  });
});
