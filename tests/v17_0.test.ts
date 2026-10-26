import { beforeEach, describe, expect, it } from 'vitest';
import { Ctx, actionOrder, effectiveAtk, addEffect, applyDamage, attack, castSpell, createBattle, deploy, effectOf, placeUnit, resolveSide, spellCasters, spellTargets, waitFor } from '../src/core/battle';
import { aiDeploy, pickSpellTarget } from '../src/core/ai';
import { ABILITIES } from '../src/core/abilities';
import { PLAYABLE, STARTER_IDS, getChar } from '../src/core/characters';
import { newOwned } from '../src/core/progression';
import { DECK_MIN, MAX_COPIES, createDeck, defeatCopy, playFromHand, returnFromNecropolis, drawOpening, queueFor } from '../src/core/deck';
import { autoDeck, deckMaxFor, profileLevelFor } from '../src/core/deckbuild';
import { SPELLS, SPELL_NUM, getSpell, isSpell } from '../src/core/spells';
import { adminSave } from '../src/ui/accounts';
import { addToDeck, deckCards, deckCount, deckIssue, deckMax, defaultSave, loadSave, migrateV17, setCopies, setSaveKey, teamReady, writeSave } from '../src/ui/save';
import { spellCardHTML } from '../src/ui/components';
import type { BattleState, CardInstance } from '../src/core/types';

const c = (id: string, _level = 1, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const deck10 = ['riku', 'nara', 'toru', 'daichi', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin'].map((id) => c(id));
const sp = (id: string, copies = 2): CardInstance => ({ charId: id, stars: 1, copies });

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
  setSaveKey('kicdl-save-v1');
});

describe('v0.17.0 — efeitos com duração (decisão 16)', () => {
  it('veneno: dano no início do lado do dono, ignora resistência, acaba depois das rodadas', () => {
    const s = empty();
    const t = placeUnit(s, c('toru', 1, 4), 'enemy', 0, 9, { hp: 30 });
    expect(t.physRes).toBe(3);
    addEffect(s, new Ctx(), t, 'veneno', 4, 2);
    resolveSide(s, new Ctx(), 'enemy');
    expect(t.hp).toBe(26);
    resolveSide(s, new Ctx(), 'enemy');
    expect(t.hp).toBe(22);
    expect(effectOf(t, 'veneno')).toBeUndefined();
    resolveSide(s, new Ctx(), 'enemy');
    expect(t.hp).toBe(22);
  });
  it('veneno não acumula: fica o mais forte e a maior duração', () => {
    const s = empty();
    const t = placeUnit(s, c('riku'), 'enemy', 0, 9, { hp: 30 });
    addEffect(s, new Ctx(), t, 'veneno', 4, 1);
    addEffect(s, new Ctx(), t, 'veneno', 2, 3);
    expect(t.effects).toEqual([{ kind: 'veneno', amount: 4, turns: 3 }]);
  });
  it('queimadura é reduzida pela resistência mágica', () => {
    const s = empty();
    const t = placeUnit(s, c('lyra', 1, 4), 'enemy', 0, 11, { hp: 30 });
    expect(t.magRes).toBe(2);
    addEffect(s, new Ctx(), t, 'queimadura', 5, 1);
    resolveSide(s, new Ctx(), 'enemy');
    expect(t.hp).toBe(27);
  });
  it('atordoado perde a ação e o efeito acaba no fim do lado', () => {
    const s = empty();
    const a = placeUnit(s, c('nara'), 'player', 0, 5, { atk: 3 });
    const e = placeUnit(s, c('toru'), 'enemy', 0, 6, { hp: 20 });
    addEffect(s, new Ctx(), a, 'atordoado', 1, 1);
    resolveSide(s, new Ctx(), 'player');
    expect(e.hp).toBe(20);
    expect(effectOf(a, 'atordoado')).toBeUndefined();
    resolveSide(s, new Ctx(), 'player');
    expect(e.hp).toBe(20 - (effectiveAtk(s, a) - e.physRes));
  });
  it('escudo temporário absorve o dano antes da vida', () => {
    const s = empty();
    const t = placeUnit(s, c('riku'), 'player', 0, 2, { hp: 10 });
    addEffect(s, new Ctx(), t, 'escudo', 5, 2);
    applyDamage(s, new Ctx(), t, 7, 'fisico', { side: 'enemy' });
    expect(t.hp).toBe(8);
    expect(effectOf(t, 'escudo')).toBeUndefined();
  });
});

describe('v0.17.0 — salvamentos (decisões 18 e 21)', () => {
  it('Anjo da Guarda (Mei): salva um aliado vizinho com 1 de vida, uma vez por batalha', () => {
    const s = empty();
    placeUnit(s, c('mei'), 'player', 1, 1);
    const ally = placeUnit(s, c('riku'), 'player', 0, 2, { hp: 3 });
    applyDamage(s, new Ctx(), ally, 9, 'fisico', { side: 'enemy' });
    expect(ally.hp).toBe(1);
    expect(s.units.includes(ally)).toBe(true);
    applyDamage(s, new Ctx(), ally, 9, 'fisico', { side: 'enemy' });
    expect(s.units.includes(ally)).toBe(false);
  });
  it('Anjo da Guarda não alcança quem não é vizinho', () => {
    const s = empty();
    placeUnit(s, c('mei'), 'player', 0, 0);
    const ally = placeUnit(s, c('riku'), 'player', 0, 2, { hp: 3 });
    applyDamage(s, new Ctx(), ally, 9, 'fisico', { side: 'enemy' });
    expect(s.units.includes(ally)).toBe(false);
  });
  it('Renascer (Zarek Raro): volta uma vez com 30% da vida e não vai para a Necropolis', () => {
    const s = empty();
    const z = placeUnit(s, c('zarek', 1, 3), 'enemy', 0, 9, { hp: 20 });
    applyDamage(s, new Ctx(), z, 50, 'fisico', { side: 'player' });
    expect(z.hp).toBe(Math.ceil(z.maxHp * 0.3));
    expect(z.revived).toBe(true);
    applyDamage(s, new Ctx(), z, 50, 'fisico', { side: 'player' });
    expect(s.units.includes(z)).toBe(false);
  });
  it('Necromancia (Vorax) ao entrar traz a última carta derrotada para a mão, pronta', () => {
    const s = createBattle({ playerDeck: deck10.slice(0, 6).concat([c('vorax')]), enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 3 });
    const d = s.decks.player;
    d.hand.forEach((h) => (h.wait = 0));
    const first = d.hand.findIndex((h) => h.charId !== 'vorax');
    const id = d.hand[first].charId;
    expect(deploy(s, 'player', first, 0, 0).ok).toBe(true);
    const u = s.units.find((x) => x.charId === id)!;
    applyDamage(s, new Ctx(), u, 999, 'fisico', { side: 'enemy' });
    expect(d.defeated.map((x) => x.charId)).toEqual([id]);
    // coloca o Vorax na mão e invoca
    const vs = d.slots.find((x) => x.card.charId === 'vorax')!;
    while (d.hand.length >= 6) d.hand.pop();
    vs.inHand++;
    d.hand.push({ ...vs.card, slot: vs.slot, wait: 0 });
    expect(deploy(s, 'player', d.hand.length - 1, 1, 0).ok).toBe(true);
    expect(d.defeated).toHaveLength(0);
    expect(d.hand.some((h) => h.charId === id && h.wait === 0)).toBe(true);
  });
  it('returnFromNecropolis com a mão cheia devolve a carta ao baralho', () => {
    const rng = { seed: 1 };
    const d = createDeck(deck10, rng);
    drawOpening(d, rng);
    const c0 = d.hand[0];
    playFromHand(d, 0);
    defeatCopy(d, c0.slot);
    while (d.hand.length < 6) d.hand.push({ ...c0, wait: 3 });
    const r = returnFromNecropolis(d)!;
    expect(r.toHand).toBe(false);
    expect(d.slots[c0.slot].defeated).toBe(0);
  });
});

describe('v0.17.0 — Vigia, empurrão, reflexo, resistência por habilidade', () => {
  it('Vigia age primeiro, do mais recuado para o mais avançado', () => {
    const s = empty();
    const a = placeUnit(s, c('riku'), 'player', 0, 5);
    const j = placeUnit(s, c('jin'), 'player', 1, 0);
    const b = placeUnit(s, c('nara'), 'player', 1, 3);
    expect(actionOrder(s, 'player').map((u) => u.uid)).toEqual([j.uid, a.uid, b.uid]);
  });
  it('Ombrada (Gorath) empurra o alvo 1 casa ao acertar de frente; Inabalável não é empurrado', () => {
    const s = empty();
    const g = placeUnit(s, c('gorath'), 'player', 0, 4, { atk: 2 });
    const e = placeUnit(s, c('riku'), 'enemy', 0, 5, { hp: 20 });
    attack(s, new Ctx(), g, e);
    expect(e.col).toBe(6);
    const g2 = placeUnit(s, c('gorath'), 'enemy', 1, 5, { hp: 50 });
    const g1 = placeUnit(s, c('gorath'), 'player', 1, 4, { atk: 2 });
    attack(s, new Ctx(), g1, g2);
    expect(g2.col).toBe(5);
  });
  it('Reflexo de Magia (Nyx Épico 30%): reduz o dano mágico e devolve a parte refletida', () => {
    const s = empty();
    const n = placeUnit(s, c('nyx', 1, 4), 'enemy', 0, 8, { hp: 50 });
    const k = placeUnit(s, c('kael'), 'player', 0, 5, { atk: 10, hp: 30 });
    const atk = effectiveAtk(s, k); // o Sifão da Nyx drena o ataque do Kael
    attack(s, new Ctx(), k, n);
    const refl = Math.floor((atk * 30) / 100);
    expect(n.hp).toBe(50 - (atk - refl));
    expect(k.hp).toBe(30 - refl);
    // dano físico não é refletido
    const r = placeUnit(s, c('riku'), 'player', 1, 5, { atk: 10, hp: 30 });
    applyDamage(s, new Ctx(), n, 10, 'fisico', { side: 'player', unit: r });
    expect(r.hp).toBe(30);
  });
  it('resistência só vem de habilidade (decisão 14)', () => {
    expect(PLAYABLE.every((d) => d.physRes === 0 && d.magRes === 0)).toBe(true);
    const s = empty();
    expect(placeUnit(s, c('kenji'), 'player', 0, 0).physRes).toBe(0);
    expect(placeUnit(s, c('toru', 1, 1), 'player', 0, 1).physRes).toBe(1);
    expect(placeUnit(s, c('lyra', 1, 2), 'player', 1, 0).magRes).toBe(1);
    expect(placeUnit(s, c('kael'), 'player', 1, 1).magRes).toBe(0);
    for (const id of ['vigia', 'renascer', 'anjo', 'reflexo', 'ombrada', 'necromancia', 'barreira'] as const) expect(ABILITIES[id]).toBeTruthy();
  });
});

describe('v0.17.0 — feitiços (decisões 4, 20 e 22)', () => {
  it('2 ou mais feitiços por categoria, alguns cruzados', () => {
    for (const cat of ['tanque', 'suporte', 'dps', 'mago', 'arqueiro', 'assassino'] as const) expect(SPELLS.filter((x) => x.categories.includes(cat)).length).toBeGreaterThanOrEqual(2);
    expect(SPELLS.filter((x) => x.categories.length > 1).length).toBeGreaterThanOrEqual(3);
    expect(SPELLS.every((x) => isSpell(x.id) && waitFor(x.id) >= 1)).toBe(true);
    expect(spellCardHTML('f-bola-fogo')).toContain('spell-card');
  });
  it('precisa de um aliado da categoria em campo; o de maior ataque conjura', () => {
    const s = createBattle({ playerDeck: deck10.slice(0, 6).concat([sp('f-bola-fogo')]), enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 2 });
    const d = s.decks.player;
    const si = d.slots.find((x) => x.card.charId === 'f-bola-fogo')!;
    d.hand.pop();
    si.inHand++;
    d.hand.push({ ...si.card, slot: si.slot, wait: 0 });
    const hi = d.hand.length - 1;
    const e = placeUnit(s, c('riku'), 'enemy', 0, 10, { hp: 40 });
    expect(spellTargets(s, 'player', 'f-bola-fogo')).toEqual([]);
    expect(castSpell(s, 'player', hi, 0, 10).ok).toBe(false);
    placeUnit(s, c('kael'), 'player', 0, 0, { atk: 4 });
    const big = placeUnit(s, c('suri'), 'player', 1, 0, { atk: 10 });
    expect(spellCasters(s, 'player', 'f-bola-fogo')[0]).toBe(big);
    const pile = si.copies - si.inHand;
    const inHand = d.hand.filter((h) => h.charId === 'f-bola-fogo').length;
    const r = castSpell(s, 'player', hi, 0, 10);
    expect(r.ok).toBe(true);
    expect(e.hp).toBeLessThanOrEqual(40 - Math.ceil((10 * SPELL_NUM.bolaHit) / 100));
    expect(effectOf(e, 'queimadura')).toBeTruthy();
    // volta para o monte
    expect(si.copies - si.inHand).toBe(pile + 1);
    expect(d.hand.filter((h) => h.charId === 'f-bola-fogo')).toHaveLength(inHand - 1);
  });
  it('feitiço com reflexo: parte volta no Comandante de quem lançou', () => {
    const s = empty();
    placeUnit(s, c('kael'), 'player', 0, 0, { atk: 10 });
    const n = placeUnit(s, c('nyx', 1, 4), 'enemy', 0, 10, { hp: 99 });
    s.decks.player = createDeck([sp('f-sombras', 1), ...deck10.slice(0, 7)], { seed: 1 });
    expect(spellTargets(s, 'player', 'f-sombras')).toEqual([]); // Kael é Mago, Golpe nas Sombras é de Assassino
    placeUnit(s, c('ren'), 'player', 1, 0, { atk: 10 });
    const d = s.decks.player;
    d.slots[0].inHand++;
    d.hand.push({ ...d.slots[0].card, slot: 0, wait: 0 });
    const hp0 = s.heroes.player.hp;
    const atk = effectiveAtk(s, s.units.find((u) => u.charId === 'ren')!);
    expect(castSpell(s, 'player', 0, 0, 10).ok).toBe(true);
    const dmg = Math.ceil((atk * SPELL_NUM.sombras) / 100);
    const refl = Math.floor((dmg * 30) / 100);
    expect(n.hp).toBe(99 - (dmg - refl));
    expect(s.heroes.player.hp).toBe(hp0 - refl);
  });
  it('Anjo da Guarda (feitiço) salva o aliado uma vez; Cura em Massa cura a fileira', () => {
    const s = empty();
    placeUnit(s, c('sora'), 'player', 1, 0, { atk: 3 });
    const a = placeUnit(s, c('riku'), 'player', 0, 2, { hp: 5 });
    s.decks.player = createDeck([sp('f-anjo', 1), sp('f-cura', 1), ...deck10.slice(0, 6)], { seed: 1 });
    const d = s.decks.player;
    for (const k of [0, 1]) {
      d.slots[k].inHand++;
      d.hand.push({ ...d.slots[k].card, slot: k, wait: 0 });
    }
    expect(castSpell(s, 'player', 0, 0, 2).ok).toBe(true);
    applyDamage(s, new Ctx(), a, 50, 'fisico', { side: 'enemy' });
    expect(a.hp).toBe(1);
    const healed = Math.ceil((a.maxHp * SPELL_NUM.cura) / 100);
    expect(castSpell(s, 'player', 0, 0, 7).ok).toBe(true);
    expect(a.hp).toBe(Math.min(a.maxHp, 1 + healed));
  });
  it('a IA lança feitiços prontos (e o modo Auto do jogador também)', () => {
    const s = createBattle({ playerDeck: deck10.slice(0, 6).concat([sp('f-chuva', 3)]), enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 4 });
    placeUnit(s, c('hana'), 'player', 0, 0);
    placeUnit(s, c('riku'), 'enemy', 1, 10);
    const d = s.decks.player;
    const si = d.slots.find((x) => x.card.charId === 'f-chuva')!;
    d.hand.pop();
    si.inHand++;
    d.hand.push({ ...si.card, slot: si.slot, wait: 0 });
    expect(pickSpellTarget(s, 'player', 'f-chuva')?.[0]).toBe(1);
    const ctx = new Ctx();
    aiDeploy(s, ctx, 'player');
    expect(ctx.events.some((e) => e.type === 'cast')).toBe(true);
  });
  it('espera do feitiço vem do custo; getSpell rejeita id desconhecido', () => {
    expect(waitFor('f-veneno')).toBeLessThan(waitFor('riku') + 5);
    expect(() => getSpell('f-nada')).toThrow();
  });
});

describe('v0.17.0 — baralho com cópias e nível de perfil (decisão 6)', () => {
  it('máximo = min(40, 28 + 2 × nível); nível = 1 + fases vencidas', () => {
    expect([1, 2, 5, 6, 11].map(deckMaxFor)).toEqual([30, 32, 38, 40, 40]);
    expect([0, 3, 99].map(profileLevelFor)).toEqual([1, 4, 11]);
    expect(MAX_COPIES).toBe(3);
    expect(DECK_MIN).toBe(20);
  });
  it('fila de compra se ajusta ao número de cartas diferentes (igual ao antigo com 10)', () => {
    expect(queueFor(10)).toEqual({ elig: 7, guar: 10, oElig: 5, oGuar: 8 });
    const q = queueFor(14);
    expect(q.elig).toBe(11);
  });
  /** v0.25.0: o save novo começa no tutorial só com o Riku; estes testes usam o começo de antes (os de Comum, equipe de 10). */
  const oldStart = () => {
    const d = defaultSave();
    for (const id of STARTER_IDS) d.cards[id] = newOwned(id);
    d.deck = STARTER_IDS.slice(0, 10);
    return d;
  };
  it('save: entra com o máximo de cópias que couber, −/+ respeitam o limite, migração corta o excesso', () => {
    const d = oldStart();
    expect(deckCount(d)).toBe(30);
    expect(deckMax(d)).toBe(30);
    expect(teamReady(d)).toBe(true);
    expect(addToDeck(d, 'f-chuva')).toBe(0); // cheio
    setCopies(d, 'riku', 1);
    expect(addToDeck(d, 'f-chuva')).toBe(2);
    expect(deckCount(d)).toBe(30);
    expect(setCopies(d, 'f-chuva', 3)).toBe(2);
    expect(deckCards(d).find((x) => x.charId === 'f-chuva')?.copies).toBe(2);
    // save antigo: 10 personagens (sem cópias) cabe em 30
    const old = oldStart();
    delete old.copies;
    old.deck.push('f-raio');
    migrateV17(old);
    expect(deckCount(old)).toBeLessThanOrEqual(30);
    expect(deckIssue(old)).toBeNull();
    writeSave(old);
    expect(loadSave().deck).toContain(old.deck[old.deck.length - 1]);
  });
  it('baralho só de feitiços ou pequeno demais não vale', () => {
    const d = oldStart();
    d.deck = ['f-chuva', 'f-raio'];
    expect(deckIssue(d)).toMatch(/personagem/);
    d.deck = ['riku', 'nara', 'toru', 'f-raio'];
    expect(deckIssue(d)).toMatch(/mínimo/);
  });
  it('autoDeck e ADM: 40 cartas, 10 personagens × 3 + feitiços que combinam', () => {
    const a = adminSave();
    expect(deckIssue(a)).toBeNull();
    expect(deckCount(a)).toBe(40);
    expect(a.deck.some(isSpell)).toBe(true);
    const ad = autoDeck(deck10, 36, 6);
    expect(ad.reduce((n, x) => n + (x.copies ?? 3), 0)).toBe(36);
    expect(ad.filter((x) => isSpell(x.charId)).length).toBeGreaterThan(0);
  });
});
