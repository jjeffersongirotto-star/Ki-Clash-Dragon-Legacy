import { describe, expect, it } from 'vitest';
import { act, attack, createBattle, Ctx, effectiveAtk, findTarget, placeUnit } from '../src/core/battle';
import { CHARACTERS, PLAYABLE, STARTER_IDS, getChar, isComingSoon } from '../src/core/characters';
import { STAGES, UNLOCKS } from '../src/core/campaign';
import { abilityPower } from '../src/core/abilities';
import { defaultSave, migrateV8, teamReady, type SaveData } from '../src/ui/save';
import { newOwned } from '../src/core/progression';
import type { BattleState, CardInstance, Category } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1, cols: 7 });
const NEW = ['daichi', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin', 'ren', 'kuro'];

describe('progressão v0.8', () => {
  it('jogador novo começa só com personagens de 1★, pelo menos 10, cobrindo as 6 categorias por igual', () => {
    const s = defaultSave();
    const owned = Object.keys(s.cards);
    expect(owned.length).toBeGreaterThanOrEqual(10);
    for (const id of owned) expect(getChar(id).minStars).toBe(1);
    expect(owned.sort()).toEqual([...STARTER_IDS].sort());
    const per: Record<string, number> = {};
    for (const id of owned) per[getChar(id).category] = (per[getChar(id).category] ?? 0) + 1;
    const cats: Category[] = ['tanque', 'suporte', 'dps', 'mago', 'arqueiro', 'assassino'];
    for (const k of cats) expect(per[k]).toBe(2);
    expect(s.deck).toHaveLength(10);
    expect(teamReady(s)).toBe(true);
  });
  it('novos personagens: 1★ → 4★, únicos, com cena e habilidade própria', () => {
    for (const id of NEW) {
      const d = getChar(id);
      expect([d.minStars, d.maxStars]).toEqual([1, 4]);
      expect(d.abilities.length).toBeGreaterThan(0);
    }
    const sigs = new Set(NEW.map((id) => getChar(id).abilities.join('+')));
    expect(sigs.size).toBe(NEW.length);
    expect(new Set(CHARACTERS.map((d) => d.id)).size).toBe(CHARACTERS.length);
  });
  it('2★, 3★ e 4★ desbloqueiam pelas fases; 5★/6★ ficam "em breve" e não saem em nenhuma fase', () => {
    const unlockables = PLAYABLE.filter((d) => d.minStars >= 2 && d.minStars <= 4).map((d) => d.id).sort();
    expect(Object.values(UNLOCKS).sort()).toEqual(unlockables);
    expect(Object.values(UNLOCKS)).toContain('nyx');
    expect(PLAYABLE.filter(isComingSoon).map((d) => d.id).sort()).toEqual(['kenji', 'vorax']);
    for (const st of STAGES) if (st.unlock) expect(isComingSoon(getChar(st.unlock))).toBe(false);
    // ordem: quem começa com menos estrelas sai antes
    const order = Object.entries(UNLOCKS).sort((a, b) => +a[0] - +b[0]).map(([, id]) => getChar(id).minStars);
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThanOrEqual(order[i - 1]);
  });
  it('toda fase tem baralho da IA com 10 personagens diferentes', () => {
    // v0.18.0: os feitiços da IA ficam fora da contagem de personagens
    const chars = (st: (typeof STAGES)[number]) => st.enemyDeck.filter((x) => !x.charId.startsWith('f-'));
    for (const st of STAGES) {
      expect(chars(st)).toHaveLength(10);
      expect(new Set(chars(st).map((x) => x.charId)).size).toBe(10);
    }
    // as primeiras fases usam só personagens de 1★
    for (const st of STAGES.slice(0, 2)) for (const x of chars(st)) expect(getChar(x.charId).minStars).toBe(1);
  });
  it('migração de save antigo: mantém o que tinha (inclusive Kenji), ganha os novos de 1★ e completa a equipe até 10', () => {
    const old: SaveData = {
      version: 1,
      cards: Object.fromEntries(['riku', 'nara', 'toru', 'aiko', 'kenji'].map((id) => [id, newOwned(id)])),
      deck: ['riku', 'nara', 'kenji'],
      items: { pergaminho: 0, cristal: 0, orbe: 0 },
      essencias: 0,
      cleared: [1, 2, 3],
      speed: 1,
      team10: true,
    };
    old.cards.riku.level = 12;
    const m = migrateV8(old);
    expect(m.cards.kenji).toBeTruthy();
    expect(m.cards.riku.level).toBe(12);
    for (const id of STARTER_IDS) expect(m.cards[id]).toBeTruthy();
    expect(m.deck.slice(0, 3)).toEqual(['riku', 'nara', 'kenji']);
    expect(m.deck).toHaveLength(10);
    expect(teamReady(m)).toBe(true);
    expect(m.v8).toBe(true);
  });
});

describe('habilidades dos novos personagens', () => {
  it('Couraça de Espinhos (Daichi): quem bate corpo a corpo de frente sofre dano de volta', () => {
    const s = empty();
    const d = placeUnit(s, c('daichi', 1, 3), 'enemy', 0, 3, { hp: 50 });
    const a = placeUnit(s, c('riku'), 'player', 0, 2, { hp: 10 });
    attack(s, new Ctx(), a, d);
    expect(a.hp).toBe(10 - abilityPower('espinhos', 3, 1));
    // à distância não fere
    const s2 = empty();
    const d2 = placeUnit(s2, c('daichi'), 'enemy', 0, 4, { hp: 50 });
    const h = placeUnit(s2, c('hana'), 'player', 0, 2, { hp: 4 });
    attack(s2, new Ctx(), h, d2);
    expect(h.hp).toBe(4);
  });
  it('Sopro Restaurador (Sora): cura o aliado mais ferido da própria fileira, a qualquer distância', () => {
    const s = empty();
    const so = placeUnit(s, c('sora'), 'player', 0, 0);
    const far = placeUnit(s, c('daichi'), 'player', 0, 2, { hp: 10 });
    far.hp = 4;
    const other = placeUnit(s, c('daichi'), 'player', 1, 0, { hp: 10 });
    other.hp = 1;
    act(s, new Ctx(), so);
    expect(far.hp).toBe(5);
    expect(other.hp).toBe(1);
  });
  it('Tambor de Guerra (Tobi): vizinhos ganham ataque, sem acumular', () => {
    const s = empty();
    const a = placeUnit(s, c('riku'), 'player', 0, 1, { atk: 3 });
    expect(effectiveAtk(s, a)).toBe(3);
    placeUnit(s, c('tobi'), 'player', 1, 0);
    expect(effectiveAtk(s, a)).toBe(4);
    placeUnit(s, c('tobi', 1, 4), 'player', 1, 1);
    placeUnit(s, c('tobi', 1, 4), 'player', 1, 2);
    expect(effectiveAtk(s, a)).toBe(5);
    const farA = placeUnit(s, c('riku'), 'player', 0, 5, { atk: 3 });
    expect(effectiveAtk(s, farA)).toBe(3);
  });
  it('Explosão de Brasas (Kael): atinge também o inimigo da mesma coluna na outra fileira', () => {
    const s = empty();
    const k = placeUnit(s, c('kael'), 'player', 0, 1, { atk: 3 });
    const t = placeUnit(s, c('toru'), 'enemy', 0, 3, { hp: 30 });
    const o = placeUnit(s, c('toru'), 'enemy', 1, 3, { hp: 30 });
    const n = placeUnit(s, c('toru'), 'enemy', 1, 4, { hp: 30 });
    act(s, new Ctx(), k);
    expect(t.hp).toBe(27);
    expect(o.hp).toBe(29);
    expect(n.hp).toBe(30);
  });
  it('Maré Implacável (Suri): dano extra no herói', () => {
    const s = empty();
    const u = placeUnit(s, c('suri', 1, 3), 'player', 0, 4, { atk: 2 });
    act(s, new Ctx(), u);
    expect(s.heroes.enemy.hp).toBe(30 - 2 - abilityPower('mare', 3, 1));
  });
  it('Tiro Certeiro (Hana): ignora resistência física', () => {
    const s = empty();
    const h = placeUnit(s, c('hana'), 'player', 0, 1, { atk: 3 });
    const g = placeUnit(s, c('gorath', 1, 2), 'enemy', 0, 2, { hp: 30 });
    attack(s, new Ctx(), h, g);
    expect(g.hp).toBe(30 - (3 - (2 - 1)));
  });
  it('Olho de Águia (Jin): mais dano a 2–3 casas do que colado', () => {
    const s = empty();
    const j = placeUnit(s, c('jin'), 'player', 0, 1, { atk: 3 });
    const near = placeUnit(s, c('toru'), 'enemy', 0, 2, { hp: 30 });
    attack(s, new Ctx(), j, near);
    expect(near.hp).toBe(28); // 3 − 1 de resist. física
    const s2 = empty();
    const j2 = placeUnit(s2, c('jin'), 'player', 0, 1, { atk: 3 });
    const far = placeUnit(s2, c('toru'), 'enemy', 0, 4, { hp: 30 });
    attack(s2, new Ctx(), j2, far);
    expect(far.hp).toBe(27); // +1 a 3 casas
  });
  it('Caça-Conjuradores (Ren): prioriza quem ataca de longe até 2 casas', () => {
    const s = empty();
    const r = placeUnit(s, c('ren'), 'player', 0, 2);
    placeUnit(s, c('toru'), 'enemy', 0, 3);
    const mage = placeUnit(s, c('kael'), 'enemy', 0, 4);
    expect(findTarget(s, r)).toBe(mage);
  });
  it('Ataque Surpresa (Kuro): mira o maior ataque até 2 casas e bate mais em vida cheia', () => {
    const s = empty();
    const k = placeUnit(s, c('kuro'), 'player', 0, 2, { atk: 3 });
    placeUnit(s, c('toru'), 'enemy', 0, 3, { atk: 1, hp: 30 });
    const big = placeUnit(s, c('riku'), 'enemy', 0, 4, { atk: 6, hp: 30 });
    expect(findTarget(s, k)).toBe(big);
    attack(s, new Ctx(), k, big);
    expect(big.hp).toBe(30 - 3 - 1);
    attack(s, new Ctx(), k, big);
    expect(big.hp).toBe(30 - 4 - 3);
  });
});
