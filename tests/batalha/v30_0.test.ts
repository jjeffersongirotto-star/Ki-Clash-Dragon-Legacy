import { describe, expect, it } from 'vitest';
import { ABILITIES } from '../../src/core/abilities';
import { Ctx, act, addEffect, applyDamage, attack, createBattle, effectiveAtk, effectOf, findTarget, onEnter, placeUnit, resolveSide } from '../../src/core/battle';
import { CHARACTERS, NEW_IDS, PLAYABLE, getChar, isComingSoon } from '../../src/core/characters';
import { playerAuto, playerEndTurn, claimOf, verifyMatch } from '../../src/core/match';
import { BANNERS, poolFor } from '../../src/core/banner';
import type { AbilityId, BattleState, CardInstance, Unit } from '../../src/core/types';

const empty = (seed = 1): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed });
/** Unidade "neutra" (Riku sem o Salto) com as habilidades pedidas. */
function unit(s: BattleState, side: 'player' | 'enemy', row: number, col: number, abilities: AbilityId[] = [], o: { atk?: number; hp?: number; stars?: number; charId?: string } = {}): Unit {
  const u = placeUnit(s, { charId: o.charId ?? 'riku', stars: o.stars ?? 1 }, side, row, col, { atk: o.atk ?? 3, hp: o.hp ?? 20 });
  u.abilities = abilities.slice();
  return u;
}

describe('v0.30.0 — as 120 cartas', () => {
  it('120 personagens jogáveis, 20 de cada tipo; as 99 novas só saem no banner', () => {
    expect(PLAYABLE).toHaveLength(120);
    expect(NEW_IDS.size).toBe(99);
    for (const race of ['humano', 'extraterrestre', 'monstro', 'mago', 'androide', 'necromante'])
      expect(PLAYABLE.filter((d) => d.race === race), race).toHaveLength(20);
    for (const id of NEW_IDS) expect(isComingSoon(getChar(id))).toBe(true);
  });
  it('toda habilidade das cartas existe no motor e toda carta nova tem dados válidos', () => {
    for (const d of CHARACTERS) {
      for (const a of d.abilities) expect(ABILITIES[a], `${d.id}: ${a}`).toBeTruthy();
      expect(d.minStars).toBeLessThanOrEqual(d.maxStars);
      expect(d.atk).toBeGreaterThan(0);
      expect(d.hp).toBeGreaterThan(0);
    }
  });
  it('banner: Mítico 1% (v0.31.0; antes 0,5%) e as cartas que começam no Mítico saem nessa raridade', () => {
    const b = BANNERS[0];
    expect(b.odds[6]).toBe(0.01);
    const mythic = PLAYABLE.filter((d) => d.minStars === 6).map((d) => d.id);
    expect(mythic.length).toBeGreaterThan(5);
    for (const id of mythic) expect(poolFor(6)).toContain(id);
    expect(poolFor(5).some((id) => mythic.includes(id))).toBe(false);
  });
  it('partida com cartas novas continua refazível e verificável (verifyMatch)', () => {
    const deck = (ids: string[]): CardInstance[] => ids.map((id) => ({ charId: id, stars: getChar(id).minStars }));
    const p = deck(['taro', 'akemi', 'shin', 'yuna', 'emi', 'goro', 'masao', 'sayuri', 'kaori', 'ryuji']);
    const e = deck(['grub', 'skarr', 'bufo', 'trokk', 'magra', 'fenra', 'spindra', 'ghul', 'krag', 'ysmera']);
    const s = createBattle({ playerDeck: p, enemyDeck: e, playerHeroHp: 40, enemyHeroHp: 40, seed: 77 });
    for (let i = 0; i < 40 && !s.winner; i++) {
      playerAuto(s);
      playerEndTurn(s);
    }
    expect(verifyMatch(s.record!, claimOf(s))).toEqual({ ok: true });
  });
});

describe('v0.30.0 — habilidades novas', () => {
  it('Golpe Crítico: ~25% dos golpes causam o dobro', () => {
    let crits = 0;
    const N = 400;
    for (let i = 0; i < N; i++) {
      const s = empty(i + 1);
      const a = unit(s, 'player', 0, 3, ['critico'], { atk: 4 });
      const t = unit(s, 'enemy', 0, 4, [], { hp: 50 });
      attack(s, new Ctx(), a, t);
      if (t.hp === 50 - 8) crits++;
    }
    expect(crits / N).toBeGreaterThan(0.18);
    expect(crits / N).toBeLessThan(0.32);
  });
  it('Provocar: quem pode atingir o provocador é obrigado a atacá-lo', () => {
    const s = empty();
    const archer = unit(s, 'player', 0, 1, ['longoAlcance']);
    unit(s, 'enemy', 0, 2);
    const taunt = unit(s, 'enemy', 0, 4, ['provocar']);
    expect(findTarget(s, archer)).toBe(taunt);
  });
  it('Golpe pelas Costas: ataca quem passou por ele, com +1', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 5, ['ataqueCostas'], { atk: 3 });
    unit(s, 'enemy', 0, 6, [], { hp: 20 });
    const back = unit(s, 'enemy', 0, 4, [], { hp: 20 });
    expect(findTarget(s, a)).toBe(back);
    act(s, new Ctx(), a);
    expect(back.hp).toBe(20 - 4);
  });
  it('Veneno, Sangramento e Queimadura: dano contínuo (queimadura acumula até 2; sangramento dói ao andar)', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['veneno', 'sangramento', 'queimadura'], { atk: 1 });
    const t = unit(s, 'enemy', 0, 4, [], { hp: 30 });
    attack(s, new Ctx(), a, t);
    attack(s, new Ctx(), a, t);
    expect(effectOf(t, 'veneno')?.amount).toBe(1);
    expect(effectOf(t, 'sangramento')?.amount).toBe(1);
    expect(effectOf(t, 'queimadura')?.amount).toBe(2);
    const before = t.hp;
    resolveSide(s, new Ctx(), 'enemy');
    expect(t.hp).toBeLessThan(before - 3);
    // Veneno de Épico: 2 por turno
    const s2 = empty();
    const e = unit(s2, 'player', 0, 3, ['veneno'], { stars: 4 });
    const t2 = unit(s2, 'enemy', 0, 4);
    attack(s2, new Ctx(), e, t2);
    expect(effectOf(t2, 'veneno')?.amount).toBe(2);
  });
  it('Lentidão: o alvo anda só 1 casa e perde o ataque no primeiro turno lento', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 0, ['lentidao']);
    const t = unit(s, 'enemy', 0, 1, [], { hp: 30 });
    attack(s, new Ctx(), a, t);
    expect(effectOf(t, 'lento')).toBeTruthy();
    const aHp = a.hp;
    act(s, new Ctx(), t);
    expect(a.hp).toBe(aHp);
  });
  it('Maldição: +25% de dano de todas as fontes', () => {
    const s = empty();
    const t = unit(s, 'enemy', 0, 4, [], { hp: 30 });
    addEffect(s, new Ctx(), t, 'maldicao', 25, 2);
    applyDamage(s, new Ctx(), t, 4, 'fisico', { side: 'player' });
    expect(t.hp).toBe(25);
  });
  it('Purificar: tira um efeito ruim do aliado vizinho', () => {
    const s = empty();
    const p = unit(s, 'player', 0, 1, ['purificar']);
    const ally = unit(s, 'player', 0, 2);
    addEffect(s, new Ctx(), ally, 'veneno', 1, 3);
    act(s, new Ctx(), p);
    expect(effectOf(ally, 'veneno')).toBeUndefined();
  });
  it('Fúria e Vingança: ataque sobe com inimigos / aliados derrotados', () => {
    const s = empty();
    const f = unit(s, 'player', 1, 0, ['furia'], { atk: 2 });
    const v = unit(s, 'enemy', 1, 11, ['vinganca'], { atk: 2 });
    const k = unit(s, 'player', 0, 3, [], { atk: 9 });
    const victim = unit(s, 'enemy', 0, 4, [], { hp: 3 });
    const before = effectiveAtk(s, f);
    attack(s, new Ctx(), k, victim);
    expect(effectiveAtk(s, f)).toBe(before + 1);
    expect(v.atkMod).toBe(1);
  });
  it('Regeneração: recupera vida no fim do turno do lado', () => {
    const s = empty();
    const r = unit(s, 'player', 0, 0, ['regeneracao'], { hp: 10 });
    r.hp = 5;
    resolveSide(s, new Ctx(), 'player');
    expect(r.hp).toBeGreaterThanOrEqual(6);
  });
  it('Explosão: ao morrer causa dano nos inimigos vizinhos', () => {
    const s = empty();
    const b = unit(s, 'enemy', 0, 5, ['explosao'], { hp: 1 });
    const a = unit(s, 'player', 0, 4, [], { atk: 5, hp: 20 });
    const n = unit(s, 'player', 1, 5, [], { hp: 20 });
    attack(s, new Ctx(), a, b);
    expect(a.hp).toBe(18);
    expect(n.hp).toBe(18);
  });
  it('Congelamento: congelado não ataca (e não congela o mesmo alvo 2 vezes seguidas)', () => {
    let s!: BattleState;
    let t!: Unit;
    let a!: Unit;
    for (let seed = 1; seed < 50; seed++) {
      s = empty(seed);
      a = unit(s, 'player', 0, 3, ['congelar'], { atk: 1 });
      t = unit(s, 'enemy', 0, 4, [], { hp: 30 });
      attack(s, new Ctx(), a, t);
      if (effectOf(t, 'congelado')) break;
    }
    expect(effectOf(t, 'congelado')).toBeTruthy();
    const hp = a.hp;
    act(s, new Ctx(), t);
    expect(a.hp).toBe(hp);
    t.effects = [];
    for (let i = 0; i < 20; i++) attack(s, new Ctx(), a, t);
    expect(effectOf(t, 'congelado')).toBeUndefined();
  });
  it('Atordoamento: o alvo atordoado perde a ação', () => {
    let s!: BattleState;
    let t!: Unit;
    for (let seed = 1; seed < 50; seed++) {
      s = empty(seed);
      const a = unit(s, 'player', 0, 3, ['atordoar'], { atk: 1 });
      t = unit(s, 'enemy', 0, 4, [], { hp: 30 });
      attack(s, new Ctx(), a, t);
      if (effectOf(t, 'atordoado')) break;
    }
    expect(effectOf(t, 'atordoado')).toBeTruthy();
  });
  it('Grito de Guerra: aliados da mesma fileira +1 (não soma com o Tambor)', () => {
    const s = empty();
    unit(s, 'player', 0, 0, ['gritoGuerra']);
    const a = unit(s, 'player', 0, 6, [], { atk: 3 });
    const b = unit(s, 'player', 1, 6, [], { atk: 3 });
    expect(effectiveAtk(s, a)).toBe(4);
    expect(effectiveAtk(s, b)).toBe(3);
  });
  it('Protetor: recebe 30% do dano dos aliados vizinhos', () => {
    const s = empty();
    const g = unit(s, 'player', 1, 2, ['protetor'], { hp: 30 });
    const a = unit(s, 'player', 0, 2, [], { hp: 20 });
    applyDamage(s, new Ctx(), a, 10, 'fisico', { side: 'enemy' });
    expect(a.hp).toBe(13);
    expect(g.hp).toBe(27);
  });
  it('Perfurar: ignora escudo e toda a resistência', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['perfurar'], { atk: 5 });
    const t = unit(s, 'enemy', 0, 4, ['guarda'], { hp: 20 });
    t.physRes = 3;
    addEffect(s, new Ctx(), t, 'escudo', 10, 2);
    attack(s, new Ctx(), a, t);
    expect(t.hp).toBe(15);
  });
  it('Escudo de Entrada e Clone: ao entrar em campo', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 1, ['escudoInicial', 'clone'], { atk: 6, hp: 10 });
    onEnter(s, new Ctx(), a);
    expect(effectOf(a, 'escudo')?.amount).toBe(3);
    const c = s.units.find((u) => u !== a)!;
    expect(c.isMinion).toBe(true);
    expect(c.abilities).toEqual([]);
    expect(c.atk).toBe(3);
    expect(c.maxHp).toBe(5);
  });
  it('Vampirismo: cura parte do dano causado', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['vampirismo'], { atk: 8, hp: 20 });
    a.hp = 10;
    const t = unit(s, 'enemy', 0, 4, [], { hp: 30 });
    attack(s, new Ctx(), a, t);
    expect(a.hp).toBe(12);
  });
  it('Investida: na primeira ação anda 2 casas a mais e bate com +1', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 0, ['investida'], { atk: 3 });
    const t = unit(s, 'enemy', 0, 5, [], { hp: 20 });
    act(s, new Ctx(), a);
    expect(a.col).toBe(4);
    expect(t.hp).toBe(16);
  });
  it('Teleporte: pula para trás do inimigo mais avançado e ataca pelas costas', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 1, ['teleporte'], { atk: 3 });
    const t = unit(s, 'enemy', 0, 6, [], { hp: 20 });
    act(s, new Ctx(), a);
    expect(a.col).toBe(7);
    expect(t.hp).toBe(16);
    expect(a.used?.teleport).toBe(true);
  });
  it('Selo do Vazio: golpe físico tira todas as habilidades do alvo', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['anular']);
    const t = unit(s, 'enemy', 0, 4, ['guarda', 'veneno'], { hp: 30 });
    attack(s, new Ctx(), a, t);
    expect(t.abilities).toEqual([]);
  });
  it('Vontade Inquebrável: o 1º golpe fatal deixa com 1 de vida e imune até o fim do turno', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, [], { atk: 50 });
    const t = unit(s, 'enemy', 0, 4, ['ultimaResistencia'], { hp: 10 });
    attack(s, new Ctx(), a, t);
    expect(t.hp).toBe(1);
    attack(s, new Ctx(), a, t);
    expect(t.hp).toBe(1);
  });
  it('Evasão: desvia de ataques à distância, mas não se estiver lento', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 1, ['longoAlcance'], { atk: 4 });
    const t = unit(s, 'enemy', 0, 4, ['evasao'], { hp: 20 });
    attack(s, new Ctx(), a, t);
    expect(t.hp).toBe(20);
    addEffect(s, new Ctx(), t, 'lento', 1, 2);
    attack(s, new Ctx(), a, t);
    expect(t.hp).toBe(16);
  });
  it('Domínio Enfraquecedor: aura −1 e cada golpe tira mais 1 do alvo', () => {
    const s = empty();
    const d = unit(s, 'player', 0, 2, ['dominio', 'longoAlcance'], { atk: 2 });
    const t = unit(s, 'enemy', 0, 5, [], { atk: 5, hp: 30 });
    expect(effectiveAtk(s, t)).toBe(4);
    attack(s, new Ctx(), d, t);
    expect(effectiveAtk(s, t)).toBe(3);
  });
  it('Copiador: copia a 1ª habilidade do alvo no primeiro golpe', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['copiador']);
    const t = unit(s, 'enemy', 0, 4, ['veneno'], { hp: 30 });
    attack(s, new Ctx(), a, t);
    expect(a.abilities).toContain('veneno');
  });
  it('Protocolo de Retaliação: dano no Comandante volta no inimigo mais próximo dele', () => {
    const s = empty();
    unit(s, 'player', 1, 0, ['retaliacao']);
    const near = unit(s, 'enemy', 0, 2, [], { hp: 20 });
    const att = unit(s, 'enemy', 0, 5, [], { atk: 4, hp: 20 });
    attack(s, new Ctx(), att, 'hero');
    expect(near.hp).toBe(16);
  });
  it('Raio em Cadeia: salta para 2 inimigos vizinhos (60% e 30%)', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['raioCadeia', 'longoAlcance'], { atk: 10 });
    const t = unit(s, 'enemy', 0, 6, [], { hp: 30 });
    const n1 = unit(s, 'enemy', 1, 6, [], { hp: 30 });
    const n2 = unit(s, 'enemy', 1, 7, [], { hp: 30 });
    act(s, new Ctx(), a);
    expect(t.hp).toBe(20);
    expect(n1.hp).toBe(24);
    expect(n2.hp).toBe(27);
  });
  it('Couraça Adaptativa: cada golpe físico cura 1 e soma resistência (até 3)', () => {
    const s = empty();
    const t = unit(s, 'enemy', 0, 4, ['couracaAdaptativa'], { hp: 30 });
    const a = unit(s, 'player', 0, 3, [], { atk: 5 });
    for (let i = 0; i < 5; i++) attack(s, new Ctx(), a, t);
    expect(t.physRes).toBe(3);
  });
  it('Execução: derrota quem fica com 25% da vida ou menos', () => {
    const s = empty();
    const a = unit(s, 'player', 0, 3, ['execucao'], { atk: 8 });
    const t = unit(s, 'enemy', 0, 4, [], { hp: 10 });
    attack(s, new Ctx(), a, t);
    expect(s.units.includes(t)).toBe(false);
  });
  it('Sede Eterna: drena 2 extra e, ao derrotar, passa a Marca da Sede', () => {
    const s = empty();
    const v = unit(s, 'player', 0, 3, ['sedeEterna'], { atk: 3, hp: 20, stars: 6 });
    v.hp = 10;
    const ally = unit(s, 'player', 1, 3);
    const t = unit(s, 'enemy', 0, 4, [], { hp: 30 });
    attack(s, new Ctx(), v, t);
    expect(t.hp).toBe(25);
    expect(v.hp).toBe(12);
    const weak = unit(s, 'enemy', 0, 5, [], { hp: 1 });
    t.hp = 0;
    s.units = s.units.filter((u) => u !== t);
    attack(s, new Ctx(), v, weak);
    expect(ally.abilities).toContain('marcaSede');
  });
  it('Ressurreição: traz o último aliado derrotado com 50% da vida (rodada 3 em diante)', () => {
    const s = empty();
    const r = unit(s, 'player', 1, 0, ['ressurreicao']);
    const ally = placeUnit(s, { charId: 'daichi', stars: 1 }, 'player', 0, 3);
    applyDamage(s, new Ctx(), ally, 99, 'fisico', { side: 'enemy' });
    expect(s.units.includes(ally)).toBe(false);
    act(s, new Ctx(), r);
    expect(s.units.some((u) => u.charId === 'daichi')).toBe(false);
    s.turn = 3;
    act(s, new Ctx(), r);
    const back = s.units.find((u) => u.charId === 'daichi')!;
    expect(back).toBeTruthy();
    expect(back.hp).toBe(Math.ceil(back.maxHp / 2));
  });
});
