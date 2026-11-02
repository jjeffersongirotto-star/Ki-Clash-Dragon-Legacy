import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CHAR_BY_ID, PLAYABLE } from '../../src/core/characters';
import { SPELLS } from '../../src/core/spells';
import { claimGoal, claimVariant, charDone, hasRarity, heroGoals, heroGroups, syncSeen, VARIANT_REWARD, REWARD_TYPE, REWARD_GROUP, REWARD_ALL, type HeroSave } from '../../src/core/heroes';

describe('v0.59.0 Heróis', () => {
  it('ordem: grupo → tipo → raridade inicial → menos raridades', () => {
    const g = heroGroups();
    expect(g.flatMap((x) => x.types.flatMap((t) => t.chars)).length).toBe(PLAYABLE.length);
    for (const x of g) for (const t of x.types) for (let i = 1; i < t.chars.length; i++) {
      const a = t.chars[i - 1], b = t.chars[i];
      expect(a.minStars < b.minStars || (a.minStars === b.minStars && a.maxStars <= b.maxStars)).toBe(true);
    }
  });
  it('cada raridade acende sozinha; save antigo preenche min..atual', () => {
    const d = PLAYABLE.find((c) => c.maxStars - c.minStars >= 2)!;
    const old: HeroSave = { cards: { [d.id]: { stars: d.minStars + 1 } } };
    syncSeen(old, CHAR_BY_ID);
    expect(hasRarity(old, d.id, d.minStars)).toBe(true);
    expect(hasRarity(old, d.id, d.minStars + 1)).toBe(true);
    const fresh: HeroSave = { cards: {}, heroSeen: {} };
    fresh.cards[d.id] = { stars: d.minStars };
    syncSeen(fresh, CHAR_BY_ID);
    expect(hasRarity(fresh, d.id, d.minStars)).toBe(true);
    expect(hasRarity(fresh, d.id, d.minStars + 1)).toBe(false); // ter a Comum não acende a Incomum
    fresh.cards[d.id].stars = d.minStars + 2; // subiu direto (ou ganhou mais alta)
    syncSeen(fresh, CHAR_BY_ID);
    expect(hasRarity(fresh, d.id, d.minStars + 1)).toBe(false);
    expect(hasRarity(fresh, d.id, d.minStars + 2)).toBe(true);
    fresh.dupes = { [d.id]: { [d.minStars + 1]: 1 } };
    syncSeen(fresh, CHAR_BY_ID);
    expect(charDone(fresh, d)).toBe(d.maxStars === d.minStars + 2);
  });
  it('prêmios: resgata uma vez; grupo > tipo; todos > grupo', () => {
    expect(REWARD_GROUP.gold).toBeGreaterThan(REWARD_TYPE.gold);
    expect(REWARD_ALL.gems).toBeGreaterThan(REWARD_GROUP.gems);
    const s: HeroSave = { cards: {}, heroSeen: {}, spells: Object.fromEntries(SPELLS.map((x) => [x.id, 1])) };
    const sp = heroGoals(s).find((g) => g.key === 'spells')!;
    expect(claimGoal(s, sp)).not.toBeNull();
    expect(claimGoal(s, sp)).toBeNull();
    const t = heroGoals(s).find((g) => g.key.startsWith('t:'))!;
    expect(claimGoal(s, t)).toBeNull(); // incompleto
  });
  it('prêmio por raridade nova: ouro / orbe da cor / gemas, uma vez', () => {
    expect(VARIANT_REWARD[1].gold).toBe(100);
    expect(VARIANT_REWARD[3].orb).toBe('orbe3');
    expect(VARIANT_REWARD[4].orb).toBe('orbe4');
    expect(VARIANT_REWARD[5].gems).toBe(1);
    expect(VARIANT_REWARD[6].gems).toBe(3);
    const d = PLAYABLE[0];
    const s: HeroSave = { cards: { [d.id]: { stars: d.minStars } } };
    syncSeen(s, CHAR_BY_ID);
    expect(claimVariant(s, d.id, d.minStars)).toEqual(VARIANT_REWARD[d.minStars]);
    expect(claimVariant(s, d.id, d.minStars)).toBeNull();
  });
  it('Baralho só mostra cartas obtidas; editor TEMP nos Heróis; ícone no hub', () => {
    const c = readFileSync('src/app/collection.ts', 'utf8');
    expect(c).toContain('export const SHOW_UNOWNED = false;');
    expect(c).not.toContain('bindCardEditor');
    expect(readFileSync('src/app/heroes.ts', 'utf8')).toContain('bindCardEditor(app, heroes)');
    expect(readFileSync('src/app/home.ts', 'utf8')).toContain('id="hubHeroes"');
  });
});

describe('v0.59.3 — Resgatar todos', () => {
  it('soma igual a resgatar um por um e não sobra nada', async () => {
    const H = await import('../../src/core/heroes');
    const mk = (): HeroSave => {
      const heroSeen: Record<string, number[]> = {};
      for (const g of heroGroups()) for (const t of g.types) for (const c of t.chars) heroSeen[c.id] = Array.from({ length: c.maxStars - c.minStars + 1 }, (_, i) => c.minStars + i);
      return { cards: {}, spells: {}, heroSeen, heroClaims: [] } as unknown as HeroSave;
    };
    const a = mk(), b = mk();
    expect(H.claimableCount(a)).toBeGreaterThan(0);
    const tot = H.claimAll(a);
    const ind = { gold: 0, gems: 0, xp: 0, orbs: {} as Record<string, number>, count: 0 };
    for (const g of heroGroups()) for (const t of g.types) for (const c of t.chars) for (let st = c.minStars; st <= c.maxStars; st++) {
      const r = claimVariant(b, c.id, st); if (!r) continue;
      ind.gold += r.gold; ind.gems += r.gems; ind.xp += r.xp; ind.count++; if (r.orb) ind.orbs[r.orb] = (ind.orbs[r.orb] ?? 0) + (r.orbs ?? 1);
    }
    for (const g of heroGoals(b)) { const r = claimGoal(b, g); if (r) { ind.gold += r.gold; ind.gems += r.gems; ind.xp += r.xp; ind.count++; } }
    expect(tot).toEqual(ind);
    expect(H.claimableCount(a)).toBe(0);
    expect(H.claimAll(a).count).toBe(0);
    expect([...a.heroClaims!].sort()).toEqual([...b.heroClaims!].sort());
  });
});

describe('v0.59.6 — filtros Grupo e Tipo', () => {
  it('combina 1 grupo + 1 tipo; Todos = sem filtro', async () => {
    const H = await import('../../src/core/heroes');
    const all = heroGroups();
    expect(H.filterHeroGroups(all, null, null)).toEqual(all);
    const race = all[0].race, cat = all[0].types[0].cat;
    const r = H.filterHeroGroups(all, race, null);
    expect(r.map((g) => g.race)).toEqual([race]);
    const c = H.filterHeroGroups(all, null, cat);
    expect(c.every((g) => g.types.every((t) => t.cat === cat))).toBe(true);
    const rc = H.filterHeroGroups(all, race, cat);
    expect(rc).toHaveLength(1);
    expect(rc[0].types.map((t) => t.cat)).toEqual([cat]);
    expect(rc[0].types[0].chars).toEqual(all[0].types[0].chars);
    expect(H.showSpellsWith(null, null)).toBe(true);
    expect(H.showSpellsWith(race, null)).toBe(false);
    expect(H.showSpellsWith(null, cat)).toBe(false);
  });
});
