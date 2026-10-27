import { beforeEach, describe, expect, it } from 'vitest';
import { deckMaxFor } from '../../src/core/deckbuild';
import { gearCount } from '../../src/core/gear';
import {
  ENERGY_COST, ENERGY_REGEN_MS, FIRST_WIN_MULT, PROFILE_MAX, addProfileXp, energyMax, goldFor, levelFromXp, maxEnergy, msToNextEnergy,
  newProfile, normalizeProfile, profileLevelOf, profileXpFor, spendEnergy, tickEnergy, totalXpFor, xpToNext,
} from '../../src/core/profile';
import { GEAR_PRICE, ORB_PRICE, buyGear, buyOrb } from '../../src/core/shop';
import { adminSave } from '../../src/ui/accounts';
import { deckCount, deckMax, defaultSave, emptyOrbs, loadSave, profileLevel, setSaveKey, writeSave } from '../../src/ui/save';

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

const T0 = 1_800_000_000_000;

describe('v0.26.0 — nível de perfil', () => {
  it('XP por nível 10, 15, 20… e o total bate com a soma', () => {
    expect([1, 2, 3, 10].map(xpToNext)).toEqual([10, 15, 20, 55]);
    let sum = 0;
    for (let l = 1; l < PROFILE_MAX; l++) {
      expect(totalXpFor(l)).toBe(sum);
      sum += xpToNext(l);
    }
    expect(totalXpFor(PROFILE_MAX)).toBe(sum);
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(9)).toBe(1);
    expect(levelFromXp(10)).toBe(2);
    expect(levelFromXp(totalXpFor(PROFILE_MAX) + 10_000)).toBe(PROFILE_MAX);
  });

  it('energia máxima: nível 1 = 20 … nível 100 = 300, sempre subindo', () => {
    expect(maxEnergy(1)).toBe(20);
    expect(maxEnergy(100)).toBe(300);
    for (let l = 2; l <= 100; l++) expect(maxEnergy(l)).toBeGreaterThanOrEqual(maxEnergy(l - 1));
  });

  it('subir de nível soma a energia máxima do nível novo (pode passar do máximo)', () => {
    const p = newProfile(T0);
    expect(p.energy).toBe(20);
    const r = addProfileXp(p, totalXpFor(3), T0);
    expect(r.levels).toBe(2);
    expect(r.energy).toBe(maxEnergy(2) + maxEnergy(3));
    expect(p.energy).toBe(20 + maxEnergy(2) + maxEnergy(3));
    expect(p.energy).toBeGreaterThan(energyMax(p));
  });
});

describe('v0.26.0 — energia', () => {
  it('custos: Fácil 1 · Normal 3 · Difícil 6; gastar dá 1 XP de perfil por energia', () => {
    expect(ENERGY_COST).toEqual({ facil: 1, normal: 3, dificil: 6 });
    const p = newProfile(T0);
    expect(spendEnergy(p, 6, T0).ok).toBe(true);
    expect(p.energy).toBe(14);
    expect(p.xp).toBe(6);
  });

  it('sem energia suficiente não gasta nada', () => {
    const p = { ...newProfile(T0), energy: 2 };
    expect(spendEnergy(p, 3, T0).ok).toBe(false);
    expect(p.energy).toBe(2);
    expect(p.xp).toBe(0);
  });

  it('recupera 1 a cada 6 minutos até o máximo; acima do máximo não recupera', () => {
    const p = newProfile(T0);
    spendEnergy(p, 5, T0); // 15/20
    tickEnergy(p, T0 + 2 * ENERGY_REGEN_MS + 1000);
    expect(p.energy).toBe(17);
    expect(msToNextEnergy(p, T0 + 2 * ENERGY_REGEN_MS + 1000)).toBe(ENERGY_REGEN_MS - 1000);
    tickEnergy(p, T0 + 100 * ENERGY_REGEN_MS);
    expect(p.energy).toBe(20);
    const over = { ...newProfile(T0), energy: 50 };
    tickEnergy(over, T0 + 100 * ENERGY_REGEN_MS);
    expect(over.energy).toBe(50);
  });

  it('a recuperação começa a contar quando sai do cheio', () => {
    const p = newProfile(T0);
    spendEnergy(p, 1, T0 + 10 * ENERGY_REGEN_MS); // estava cheio até agora
    expect(p.energy).toBe(19);
    tickEnergy(p, T0 + 10 * ENERGY_REGEN_MS + ENERGY_REGEN_MS - 1);
    expect(p.energy).toBe(19);
    tickEnergy(p, T0 + 11 * ENERGY_REGEN_MS);
    expect(p.energy).toBe(20);
  });
});

describe('v0.26.0 — XP de perfil e Ouro das fases', () => {
  it('sobem com a fase e com a dificuldade (proporcional ao custo de energia); primeira vitória em dobro', () => {
    expect(profileXpFor(1, 'facil')).toBe(5);
    expect(profileXpFor(10, 'dificil')).toBe(84);
    expect(goldFor(1, 'facil')).toBe(15);
    expect(goldFor(10, 'facil')).toBe(60);
    expect(goldFor(5, 'normal')).toBe(3 * goldFor(5, 'facil'));
    expect(goldFor(5, 'dificil')).toBe(6 * goldFor(5, 'facil'));
    expect(FIRST_WIN_MULT).toBe(2);
  });
});

describe('v0.26.0 — Loja', () => {
  it('compra item de ascensão pelo preço da raridade', () => {
    const w = { gold: 200 };
    const bag = {};
    expect(buyGear(w, bag, 'elmo', 2)).toEqual({ ok: true, cost: GEAR_PRICE[2] });
    expect(w.gold).toBe(100);
    expect(gearCount(bag, 'elmo', 2)).toBe(1);
    expect(buyGear(w, bag, 'elmo', 3)).toEqual({ ok: false, cost: GEAR_PRICE[3], reason: 'ouro' });
    expect(w.gold).toBe(100);
    expect(buyGear(w, bag, 'nada', 1).ok).toBe(false);
    expect(buyGear(w, bag, 'elmo', 6).ok).toBe(false);
  });

  it('preços sobem com a raridade; Orbes custam ~0,3 de Ouro por XP', () => {
    expect([1, 2, 3, 4, 5].map((r) => GEAR_PRICE[r])).toEqual([40, 100, 250, 600, 1500]);
    const items = emptyOrbs();
    const w = { gold: 1000 };
    expect(buyOrb(w, items, 'orbe3', 2)).toEqual({ ok: true, cost: 2 * ORB_PRICE.orbe3 });
    expect(items.orbe3).toBe(2);
    expect(w.gold).toBe(1000 - 2 * ORB_PRICE.orbe3);
  });
});

describe('v0.26.0 — saves', () => {
  it('save novo: nível 1, energia 20, sem Ouro', () => {
    const d = defaultSave();
    expect(profileLevel(d)).toBe(1);
    expect(d.profile!.energy).toBe(20);
    expect(d.profile!.gold).toBe(0);
  });

  it('save antigo: nível de perfil = 1 + fases vencidas (como antes), energia cheia e baralho sem perder espaço', () => {
    const old = adminSave();
    delete old.profile;
    delete old.v26;
    old.cleared = [1, 2, 3, 4, 5, 6, 7];
    old.clearedDiff = { normal: [], dificil: [] };
    writeSave(old);
    const m = loadSave();
    expect(profileLevel(m)).toBe(8);
    expect(m.profile!.energy).toBe(maxEnergy(8));
    expect(m.profile!.gold).toBe(0);
    expect(deckMax(m)).toBe(deckMaxFor(8));
    expect(deckCount(m)).toBe(40);
    expect(m.v26).toBe(true);
  });

  it('save da v0.26 mantém XP, energia (mesmo acima do máximo) e Ouro', () => {
    const d = defaultSave();
    d.profile = { xp: totalXpFor(5) + 3, energy: 77, at: T0, gold: 1234 };
    writeSave(d);
    const m = loadSave();
    expect(profileLevelOf(m.profile!)).toBe(5);
    expect(m.profile).toEqual({ xp: totalXpFor(5) + 3, energy: 77, at: T0, gold: 1234 });
  });

  it('valores inválidos viram o padrão', () => {
    expect(normalizeProfile({ xp: -5, energy: 'x', gold: NaN }, 1, T0)).toEqual({ xp: 0, energy: 20, at: T0, gold: 0 });
  });

  it('ADM: nível 100, muita energia e Ouro', () => {
    const a = adminSave();
    expect(profileLevel(a)).toBe(PROFILE_MAX);
    expect(a.profile!.energy).toBeGreaterThan(1000);
    expect(a.profile!.gold).toBeGreaterThan(100000);
  });
});
