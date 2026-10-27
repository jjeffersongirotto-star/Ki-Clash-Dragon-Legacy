import { beforeEach, describe, expect, it } from 'vitest';
import { Ctx, createBattle, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy } from '../../src/core/ai';
import { PLAYABLE, STARTER_IDS, getChar, isComingSoon } from '../../src/core/characters';
import { PACK_COMMONS, STAGES, UNLOCKS, stagePack } from '../../src/core/campaign';
import { DECK_MIN, deckMinFor, deckProblem } from '../../src/core/deck';
import { hasGearFor } from '../../src/core/gear';
import { LEADER_HP } from '../../src/core/leaders';
import { ascendCost, bagXp, cardBarXp, newOwned } from '../../src/core/progression';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_PACK, TUTORIAL_REWARD, TUTORIAL_STARTER, TUT_BATTLE2, TUT_DONE, tutorialGear } from '../../src/core/tutorial';
import { adminSave } from '../../src/ui/accounts';
import { deckIssue, deckMin, defaultSave, loadSave, setSaveKey, tutorialDone, writeSave } from '../../src/ui/save';

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

/** Batalha no Auto dos dois lados (como o simulador). */
function autoWin(i: number, ids: string[], seed: number) {
  const s = createBattle({ playerDeck: ids.map((id) => ({ charId: id, stars: 1, plus: 0, copies: 3 })), enemyDeck: TUTORIAL_BATTLES[i].enemyDeck, playerHeroHp: LEADER_HP[0], enemyHeroHp: TUTORIAL_BATTLES[i].enemyHeroHp, seed });
  for (let g = 0; !s.winner && g < 200; g++) {
    aiDeploy(s, new Ctx(), 'player');
    endPlayerTurn(s, aiDeploy);
  }
  return s.winner === 'player';
}

describe('v0.25.0 — tutorial', () => {
  it('save novo: começa no tutorial só com o Riku, sem Orbes nem Essências, e o baralho de 3 cópias vale', () => {
    const d = defaultSave();
    expect(d.tutorial).toBe(0);
    expect(tutorialDone(d)).toBe(false);
    expect(Object.keys(d.cards)).toEqual([TUTORIAL_STARTER]);
    expect(Object.values(d.items).every((v) => v === 0)).toBe(true);
    expect(d.essencias).toBe(0);
    expect(deckMin(d)).toBe(3);
    expect(deckIssue(d)).toBeNull();
  });

  it('pacote grátis: Sora (suporte de longo alcance) e Nara (Corte Diagonal)', () => {
    expect(TUTORIAL_PACK).toEqual(['sora', 'nara']);
    expect(getChar('sora').category).toBe('suporte');
    expect(getChar('sora').abilities).toContain('longoAlcance');
    expect(getChar('nara').abilities).toContain('diagFrente');
  });

  it('batalhas do tutorial: 1 contra 1 e contra Daichi, Hana e Tobi — o jogador vence sempre (no Auto)', () => {
    expect(TUTORIAL_BATTLES[0].enemyDeck.map((c) => c.charId)).toHaveLength(1);
    expect(TUTORIAL_BATTLES[1].enemyDeck.map((c) => c.charId)).toEqual(['daichi', 'hana', 'tobi']);
    for (let seed = 1; seed <= 30; seed++) {
      expect(autoWin(0, [TUTORIAL_STARTER], seed)).toBe(true);
      expect(autoWin(1, TUTORIAL_CHARS, seed)).toBe(true);
    }
  });

  it('recompensa: XP para encher a barra do "+" dos 3, Essências do Despertar e os itens do "+"', () => {
    const cards = TUTORIAL_CHARS.map(newOwned);
    expect(bagXp(TUTORIAL_REWARD.orbs)).toBeGreaterThanOrEqual(cards.reduce((n, c) => n + cardBarXp(c), 0));
    expect(TUTORIAL_REWARD.essencias).toBeGreaterThanOrEqual(cards.reduce((n, c) => n + ascendCost(c), 0));
    const bag = tutorialGear();
    for (const c of cards) expect(hasGearFor(bag, c)).toBe(true);
  });

  it('saves antigos pulam o tutorial e ficam com tudo; save novo no meio do tutorial continua de onde parou', () => {
    const old = defaultSave() as unknown as Record<string, unknown>;
    delete old.v25;
    delete old.tutorial;
    old.cards = Object.fromEntries(STARTER_IDS.map((id) => [id, newOwned(id)]));
    old.deck = STARTER_IDS.slice(0, 10);
    old.cleared = [1, 2];
    store.set('kicdl-save-v1', JSON.stringify(old));
    const m = loadSave();
    expect(m.tutorial).toBe(TUT_DONE);
    expect(Object.keys(m.cards).sort()).toEqual([...STARTER_IDS].sort());
    const mid = defaultSave();
    mid.tutorial = TUT_BATTLE2;
    writeSave(mid);
    expect(loadSave().tutorial).toBe(TUT_BATTLE2);
    expect(tutorialDone(adminSave())).toBe(true);
  });

  it('mínimo do baralho = 3 × personagens (até 20)', () => {
    expect(deckMinFor(1)).toBe(3);
    expect(deckMinFor(3)).toBe(9);
    expect(deckMinFor(7)).toBe(DECK_MIN);
    expect(deckMinFor(20)).toBe(DECK_MIN);
    const three = TUTORIAL_CHARS.map((id) => ({ charId: id, stars: 1, copies: 3 }));
    expect(deckProblem(three)).toBeNull();
    expect(deckProblem(three.map((c) => ({ ...c, copies: 2 })))).toMatch(/6 de no mínimo 9/);
    const d = defaultSave();
    for (const id of TUTORIAL_PACK) d.cards[id] = newOwned(id);
    d.deck = ['riku', 'sora']; // tem 3 personagens: o mínimo conta os que ele TEM
    expect(deckIssue(d)).toMatch(/6 de no mínimo 9/);
  });

  it('pacote da primeira vitória de cada fase: o desbloqueio de sempre + um de Comum; todos os personagens obtêm-se uma vez', () => {
    for (const st of STAGES) {
      expect(st.pack).toEqual(stagePack(st.id));
      if (st.unlock) expect(st.pack).toContain(st.unlock);
      for (const id of st.pack) expect(isComingSoon(getChar(id))).toBe(false);
    }
    for (let id = 1; id <= 9; id++) expect(STAGES[id - 1].pack.length).toBeGreaterThanOrEqual(1);
    const all = [...TUTORIAL_CHARS, ...STAGES.flatMap((s) => s.pack)];
    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual(PLAYABLE.filter((c) => !isComingSoon(c)).map((c) => c.id).sort());
    expect(Object.values(PACK_COMMONS).every((id) => getChar(id).minStars === 1)).toBe(true);
    expect(Object.keys(UNLOCKS).length).toBe(7);
  });
});
