import { describe, expect, it } from 'vitest';
import { STAGES, WORLD_COMMANDERS, WORLD_STAGES, getStage, stageCommander } from '../../src/core/campaign';
import { REGIONS, REGION_COUNT, WORLD_NAMES, localOf, regionOf, regionStageIds, stageLabel } from '../../src/core/world';
import { DIFFICULTIES, gemsFor, markCleared, regionUnlocked, rewardsFor, stageFor, stageUnlocked, starGoals, starsForWin, type AdventureProgress } from '../../src/core/adventure';
import { isCleanCommander } from '../../src/core/commanders';
import { isSpell, getSpell } from '../../src/core/spells';
import { getChar } from '../../src/core/characters';
import { deckPower } from '../../src/core/power';
import { bagXp } from '../../src/core/progression';
import { stageGearDrop } from '../../src/core/gear';
import { DECK_SLOTS } from '../../src/core/deck';
import { defaultSave, migrateV39 } from '../../src/ui/save';

const chars = (id: number, diff: (typeof DIFFICULTIES)[number] = 'facil') => stageFor(id, diff).enemyDeck.filter((c) => !isSpell(c.charId));

describe('v0.39.0 — Mapa do mundo: 100 fases', () => {
  it('10 regiões × 10 fases; a região 1 é a campanha de sempre', () => {
    expect(REGIONS).toHaveLength(REGION_COUNT);
    expect(WORLD_STAGES).toHaveLength(100);
    WORLD_STAGES.forEach((s, i) => expect(s.id).toBe(i + 1));
    for (let i = 0; i < 10; i++) expect(WORLD_STAGES[i]).toBe(STAGES[i]);
    expect(regionOf(1)).toBe(1);
    expect(regionOf(10)).toBe(1);
    expect(regionOf(11)).toBe(2);
    expect(localOf(100)).toBe(10);
    expect(regionStageIds(3)).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    expect(stageLabel(57)).toBe('6-7');
  });

  it('90 fases novas com nomes próprios, todos diferentes', () => {
    const names = WORLD_STAGES.map((s) => s.name);
    expect(new Set(names).size).toBe(100);
    expect(WORLD_NAMES.flat()).toHaveLength(90);
    for (const n of STAGES.map((s) => s.name)) expect(WORLD_NAMES.flat()).not.toContain(n);
    expect(new Set(REGIONS.map((r) => r.name)).size).toBe(REGION_COUNT);
  });

  it('baralhos válidos: 10 personagens diferentes e feitiços com conjurador, em todas as dificuldades', () => {
    for (const diff of DIFFICULTIES)
      for (const s of WORLD_STAGES.slice(10)) {
        const st = stageFor(s.id, diff);
        const cs = chars(s.id, diff);
        expect(new Set(cs.map((c) => c.charId)).size, `${s.id}`).toBe(cs.length);
        expect(cs.length).toBeLessThanOrEqual(DECK_SLOTS);
        for (const sp of st.enemyDeck.filter((c) => isSpell(c.charId)))
          expect(getSpell(sp.charId).categories.some((k) => cs.some((c) => getChar(c.charId).category === k)), `${s.id} ${sp.charId}`).toBe(true);
      }
  });

  it('os 120 personagens aparecem nos baralhos inimigos do mundo', () => {
    const seen = new Set(WORLD_STAGES.flatMap((s) => s.enemyDeck.map((c) => c.charId)));
    expect([...seen].filter((id) => !isSpell(id)).length).toBeGreaterThanOrEqual(110);
  });

  it('dificuldade sobe: Poder do baralho, vida e nível da IA crescem de região em região', () => {
    const avg = (r: number, f: (id: number) => number) => regionStageIds(r).reduce((n, id) => n + f(id), 0) / 10;
    for (let r = 2; r <= REGION_COUNT; r++) {
      expect(avg(r, (id) => deckPower(chars(id))), `poder região ${r}`).toBeGreaterThan(avg(r - 1, (id) => deckPower(chars(id))));
      expect(avg(r, (id) => getStage(id).enemyHeroHp), `vida região ${r}`).toBeGreaterThan(avg(r - 1, (id) => getStage(id).enemyHeroHp));
      expect(avg(r, (id) => getStage(id).aiLevel ?? 0)).toBeGreaterThanOrEqual(avg(r - 1, (id) => getStage(id).aiLevel ?? 0));
    }
    for (const s of WORLD_STAGES.slice(10)) expect(s.aiLevel).toBeGreaterThanOrEqual(1);
    expect(getStage(100).aiLevel).toBe(3);
    expect(stageFor(11, 'dificil').aiLevel).toBe(3);
  });

  it('Comandantes: recorte limpo, no baralho, sem repetir dentro da região e o máximo de diferentes no mundo', () => {
    expect(WORLD_COMMANDERS).toHaveLength(100);
    for (let r = 1; r <= REGION_COUNT; r++) {
      const ids = regionStageIds(r).map((id) => WORLD_COMMANDERS[id - 1]).filter(Boolean);
      expect(new Set(ids).size, `região ${r}`).toBe(ids.length);
    }
    for (const s of WORLD_STAGES.slice(10))
      for (const diff of DIFFICULTIES) {
        const c = stageCommander(stageFor(s.id, diff));
        expect(c, `${s.id}`).not.toBeNull();
        expect(isCleanCommander(c!.charId)).toBe(true);
      }
    expect(new Set(WORLD_COMMANDERS.filter(Boolean)).size).toBeGreaterThanOrEqual(75);
  });

  it('recompensas crescem por região; Gemas na 1ª vitória das fases 3, 6, 9 (1) e 10 (3) de cada região', () => {
    for (let r = 2; r <= REGION_COUNT; r++) {
      const xp = (id: number) => bagXp(rewardsFor(id, 'facil', () => 1).orbs);
      expect(xp((r - 1) * 10 + 1)).toBeGreaterThan(xp((r - 2) * 10 + 1));
      expect(stageGearDrop((r - 1) * 10 + 1, 'facil', () => 1)[0].rarity).toBeGreaterThanOrEqual(stageGearDrop((r - 2) * 10 + 1, 'facil', () => 1)[0].rarity);
    }
    for (let r = 1; r <= REGION_COUNT; r++) {
      const g = regionStageIds(r).map(gemsFor);
      expect(g).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1, 3]);
    }
    // o Normal e o Difícil também crescem (Orbes de raridade maior)
    expect(bagXp(rewardsFor(95, 'normal', () => 1).orbs)).toBeGreaterThan(bagXp(rewardsFor(5, 'normal', () => 1).orbs));
    expect(bagXp(rewardsFor(95, 'dificil', () => 1).orbs)).toBeGreaterThan(bagXp(rewardsFor(5, 'dificil', () => 1).orbs));
  });

  it('objetivos das fases novas vêm da lista combinada e apertam no Difícil', () => {
    const kinds = new Set(['win', 'hp', 'cards', 'nospell', 'spells', 'kills']);
    for (const diff of DIFFICULTIES) for (const s of WORLD_STAGES) for (const g of starGoals(diff, s.id)) expect(kinds.has(g.kind)).toBe(true);
    const goals = starGoals('dificil', 61).map((g) => g.text).join(' ');
    expect(goals).toMatch(/sem o seu Comandante levar dano|no máximo 8 cartas|pelo menos 10|feitiços/);
    // vitória limpa cumpre tudo
    expect(starsForWin({ playerHp: 100, playerMaxHp: 100, turn: 5, stats: { cards: 6, spells: 0, kills: 12 } }, 'facil', 12) & 1).toBe(1);
  });

  it('a região N+1 abre ao vencer a fase 10 da região N, em cada dificuldade', () => {
    const p: AdventureProgress = { cleared: [] };
    expect(regionUnlocked(p, 'facil', 1)).toBe(true);
    expect(regionUnlocked(p, 'facil', 2)).toBe(false);
    for (let id = 1; id <= 9; id++) markCleared(p, 'facil', id);
    expect(regionUnlocked(p, 'facil', 2)).toBe(false);
    markCleared(p, 'facil', 10);
    expect(regionUnlocked(p, 'facil', 2)).toBe(true);
    expect(stageUnlocked(p, 'facil', 11)).toBe(true);
    expect(stageUnlocked(p, 'facil', 12)).toBe(false);
    expect(regionUnlocked(p, 'normal', 2)).toBe(false);
  });

  it('save antigo (só região 1) continua igual e abre o mapa na última região liberada', () => {
    const d = defaultSave();
    d.cleared = [1, 2, 3, 3, 10, 9, 8, 7, 6, 5, 4, 999, -1];
    d.stars = { 'facil:1': 7, 'facil:250': 3 };
    migrateV39(d);
    expect(d.cleared).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(d.stars).toEqual({ 'facil:1': 7 });
    expect(d.region).toBe(2);
    expect(d.v39).toBe(true);
    const n = migrateV39(defaultSave());
    expect(n.region).toBe(1);
  });
});
