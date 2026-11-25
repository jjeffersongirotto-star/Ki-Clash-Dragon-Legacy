import { describe, expect, it } from 'vitest';
import { Ctx, act, applyDamage, attack, canMulligan, castSpell, createBattle, deploy, effectiveAtk, mulligan, placeUnit, spellTargets, waitFor } from '../../src/core/battle';
import { auraRing } from '../../src/core/battleRules';
import { BALANCE_V2 } from '../../src/core/balanceV2';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { createDeck } from '../../src/core/deck';
import { playerMulligan, replayMatch } from '../../src/core/match';
import type { BattleState, CardInstance } from '../../src/core/types';

const c = (id: string, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const deck10 = ['riku', 'nara', 'toru', 'daichi', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin'].map((id) => ({ ...c(id), copies: 3 }));

describe('v0.67.0 — tabela das 6 raças', () => {
  it('força = 2 × ataque + vida cresce a cada raridade; espera é da carta (1 a 8)', () => {
    for (const d of PLAYABLE) {
      const b = BALANCE_V2[d.id];
      expect(b.wait, d.id).toBeGreaterThanOrEqual(1);
      expect(b.wait, d.id).toBeLessThanOrEqual(d.id === 'vorax' ? 9 : 8); // v0.67.5: Vorax espera 9 (referência do "Cell")
      for (let r = b.min + 1; r <= b.max; r++) expect(2 * b.stats[r][0] + b.stats[r][1], `${d.id}@${r}`).toBeGreaterThan(2 * b.stats[r - 1][0] + b.stats[r - 1][1]);
    }
  });
  it('trocas de tipo e de raridade', () => {
    expect(['ren', 'velka', 'zarek', 'vharga'].map((id) => getChar(id).category)).toEqual(['dps', 'dps', 'dps', 'dps']);
    expect(getChar('lethe').category).toBe('arqueiro');
    expect(getChar('kenji').category).toBe('tanque');
    expect([getChar('shin').minStars, getChar('shin').maxStars, getChar('sayuri').minStars, getChar('sayuri').maxStars]).toEqual([1, 4, 4, 6]);
    expect(PLAYABLE.filter((d) => d.category === 'assassino').length).toBe(11);
    for (const d of PLAYABLE.filter((x) => x.category === 'assassino')) expect(d.abilities, d.id).toContain('diagFrente');
    expect(getChar('kael').range).toBe(4);
  });
  it('cerca de 1/3 das cartas de cada tipo sem habilidade', () => {
    for (const cat of ['tanque', 'dps', 'arqueiro', 'mago'] as const) {
      const all = PLAYABLE.filter((d) => d.category === cat);
      const none = all.filter((d) => d.abilities.length === 0).length;
      expect(none / all.length, cat).toBeGreaterThan(0.25);
      expect(none / all.length, cat).toBeLessThan(0.5);
    }
  });
  it('cartas de espera 1 existem em todas as raças', () => {
    for (const race of ['humano', 'androide', 'extraterrestre', 'mago', 'monstro', 'necromante']) expect(PLAYABLE.some((d) => d.race === race && d.wait === 1), race).toBe(true);
  });
});

describe('v0.67.0 — habilidades novas', () => {
  it('Aura de Vida: outros aliados da raça ganham vida enquanto a carta está em campo', () => {
    const s = empty();
    const n = placeUnit(s, c('ossian'), 'player', 0, 0);
    const hp0 = n.maxHp;
    const ivra = placeUnit(s, c('ivra'), 'player', 1, 0);
    expect(n.maxHp).toBe(hp0 + 2);
    expect(ivra.auraHp ?? 0).toBe(0);
    const outra = placeUnit(s, c('riku'), 'player', 0, 1);
    expect(outra.auraHp ?? 0).toBe(0);
    applyDamage(s, new Ctx(), ivra, 999, 'magico', { side: 'enemy' });
    expect(n.maxHp).toBe(hp0);
  });
  it('Aura de raça para outra raça: Dorian (Mago) dá ataque aos Humanos', () => {
    const s = empty();
    const r = placeUnit(s, c('riku'), 'player', 0, 0);
    const a0 = effectiveAtk(s, r);
    placeUnit(s, c('dorian'), 'player', 1, 0);
    expect(effectiveAtk(s, r)).toBe(a0 + 1);
  });
  it('Pressão no Comandante: dano direto no início da ação', () => {
    const s = empty();
    const u = placeUnit(s, c('lamenta'), 'player', 0, 0);
    act(s, new Ctx(), u);
    expect(s.heroes.enemy.hp).toBeLessThanOrEqual(30 - 1);
  });
  it('Bate e Recua: volta uma casa depois de atacar', () => {
    const s = empty();
    const z = placeUnit(s, c('zynna'), 'player', 0, 3, { atk: 1 });
    placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 50 });
    act(s, new Ctx(), z);
    expect(z.col).toBe(2);
  });
  it('Preparação: ao entrar, a carta mais demorada da mão perde espera', () => {
    const s = createBattle({ playerDeck: [...deck10, { ...c('pip'), copies: 3 }], enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 5 });
    const hand = s.decks.player.hand;
    hand.forEach((h) => (h.wait = 3));
    hand[0].wait = 0;
    hand[0].charId = 'pip';
    const before = hand.slice(1).map((h) => h.wait);
    expect(deploy(s, 'player', 0, 0, 0).ok).toBe(true);
    const after = s.decks.player.hand.map((h) => h.wait!);
    expect(after.reduce((a, b) => a + b, 0)).toBe(before.reduce((a, b) => a! + b!, 0)! - 1);
  });
  it('Reconstrução: uma vez, pode voltar com a vida cheia; Golpe Final impede', () => {
    let back = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed });
      const b = placeUnit(s, c('bastion2'), 'player', 0, 0);
      applyDamage(s, new Ctx(), b, 999, 'fisico', { side: 'enemy' });
      if (s.units.includes(b)) {
        back++;
        expect(b.hp).toBe(b.maxHp);
        applyDamage(s, new Ctx(), b, 999, 'fisico', { side: 'enemy' });
        expect(s.units.includes(b)).toBe(false);
      }
    }
    expect(back).toBeGreaterThan(0);
    expect(back).toBeLessThan(40);
    for (let seed = 1; seed <= 20; seed++) {
      const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed });
      const b = placeUnit(s, c('bastion2'), 'player', 0, 3);
      const v = placeUnit(s, c('velka'), 'enemy', 0, 4, { atk: 99 });
      attack(s, new Ctx(), v, b);
      expect(s.units.includes(b)).toBe(false);
    }
  });
  it('Disparo Instável: dano 50%, 100%, 150% ou 200%', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed });
      const u = placeUnit(s, c('spike11'), 'player', 0, 3, { atk: 4 });
      const t = placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 50 });
      attack(s, new Ctx(), u, t);
      seen.add(50 - t.hp);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([2, 4, 6, 8]);
  });
  it('Arrancada: anda mais na primeira ação', () => {
    const s = empty();
    const n = placeUnit(s, c('nara'), 'player', 0, 0);
    act(s, new Ctx(), n);
    expect(n.col).toBe(n.move + 3);
    const col = n.col;
    act(s, new Ctx(), n);
    expect(n.col).toBeLessThanOrEqual(col + n.move);
  });
  it('Onda Curativa: cura o aliado mais ferido de qualquer fileira', () => {
    const s = empty();
    const y = placeUnit(s, c('yuna'), 'player', 0, 0);
    const far = placeUnit(s, c('riku'), 'player', 1, 2, { hp: 10 });
    far.hp = 2;
    act(s, new Ctx(), y);
    expect(far.hp).toBe(2 + 1);
  });
  it('Golpe Duplo: ataca duas vezes', () => {
    const s = empty();
    const r = placeUnit(s, c('razorv'), 'player', 0, 3, { atk: 3 });
    r.abilities = ['golpeDuplo'];
    const t = placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 50 });
    act(s, new Ctx(), r);
    expect(t.hp).toBe(44);
  });
  it('Ki Oculto: não pode ser alvo de feitiço de alvo único', () => {
    const s = empty();
    placeUnit(s, c('shin'), 'player', 0, 0, { atk: 5 });
    const sy = placeUnit(s, c('sayuri', 5), 'enemy', 0, 8);
    expect(sy.abilities).toContain('kiOculto');
    s.decks.player = createDeck([{ charId: 'f-sombras', stars: 1, copies: 1 }, ...deck10.slice(0, 7)], { seed: 1 });
    expect(spellTargets(s, 'player', 'f-sombras').some(([r, col]) => r === sy.row && col === sy.col)).toBe(false);
  });
  it('Ímpeto: +ataque a cada golpe que causa dano', () => {
    const s = empty();
    const b = placeUnit(s, c('brunna'), 'player', 0, 3, { atk: 3 });
    const t = placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 50 });
    attack(s, new Ctx(), b, t);
    attack(s, new Ctx(), b, t);
    expect(b.atkMod).toBe(4); // Lendário: +2 por golpe
  });
  it('Vorax "Cell": qualquer inimigo derrotado (por qualquer aliado) vira cria, sem limite', () => {
    const s = empty();
    placeUnit(s, c('vorax'), 'player', 1, 0);
    const r = placeUnit(s, c('riku'), 'player', 0, 2, { atk: 99 });
    for (let i = 0; i < 5; i++) {
      const e = placeUnit(s, c('riku'), 'enemy', 0, 3 + i, { hp: 1 });
      attack(s, new Ctx(), r, e);
    }
    expect(s.units.filter((u) => u.charId === 'cria' && u.side === 'player').length).toBe(5);
  });
  it('v0.67.5: Vorax explode ao morrer com 8 de dano em quem está ao redor', () => {
    const s = empty();
    const v = placeUnit(s, c('vorax'), 'player', 0, 2);
    const e = placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 20 });
    applyDamage(s, new Ctx(), v, 999, 'fisico', { side: 'enemy' });
    expect(e.hp).toBe(e.maxHp - 8);
  });
  it('Explosão de Ki: aliados +5 de ataque e queimadura', () => {
    const s = empty();
    const k = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 2 });
    s.decks.player = createDeck([{ charId: 'f-explosao-ki', stars: 4, copies: 1 }, ...deck10.slice(0, 7)], { seed: 1 });
    const d = s.decks.player;
    d.slots[0].inHand++;
    d.hand.push({ ...d.slots[0].card, slot: 0, wait: 0 });
    const [row, col] = spellTargets(s, 'player', 'f-explosao-ki')[0];
    expect(castSpell(s, 'player', d.hand.length - 1, row, col).ok).toBe(true);
    expect(effectiveAtk(s, k)).toBe(7);
    expect(k.effects?.some((e) => e.kind === 'queimadura')).toBe(true);
  });
  it('anel de aura: verde para quem ajuda aliados, roxo para quem enfraquece inimigos', () => {
    expect(auraRing(getChar('hayato').abilities)).toBe('ally');
    expect(auraRing(getChar('omega9').abilities)).toBe('enemy');
    expect(auraRing(getChar('riku').abilities)).toBeNull();
  });
});

describe('v0.67.0 — começo da partida', () => {
  it('sem adiantamento: só as cartas de espera 1 ficam prontas no 1º turno', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 2 });
    for (const h of s.decks.player.hand) expect(h.wait).toBe(Math.max(0, waitFor(h.charId) - 1));
  });
  it('troca da mão inicial: uma vez, antes de jogar, e a partida gravada refaz igual', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 7 });
    expect(canMulligan(s, 'player')).toBe(true);
    expect(playerMulligan(s)).toBe(true);
    expect(s.decks.player.hand.length).toBe(6);
    expect(s.decks.player.slots.reduce((n, sl) => n + sl.inHand, 0)).toBe(6);
    expect(mulligan(s, 'player')).toBe(false);
    const re = replayMatch(s.record!);
    expect(re.error).toBeUndefined();
    expect(re.state.decks.player.hand.map((h) => h.charId)).toEqual(s.decks.player.hand.map((h) => h.charId));
  });
});
