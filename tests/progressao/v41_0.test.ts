import { beforeEach, describe, expect, it } from 'vitest';
import { BANNERS, cardPoolFor, drawAt, grantCard, pull, spareSpells, type Dupes } from '../../src/core/banner';
import { SPELLS, getSpell, isSpell, spellsAt } from '../../src/core/spells';
import { getChar } from '../../src/core/characters';
import { SPELL_REWARD_STAGES, spellRewardFor, spellRewardRarity } from '../../src/core/adventure';
import { autoDeck } from '../../src/core/deckbuild';
import { createBattle } from '../../src/core/battle';
import { PLAYER_HERO_HP } from '../../src/core/campaign';
import { playerEndTurn, playerUse } from '../../src/core/match';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_SEEDS, TUTORIAL_SPELL, TUTORIAL_SPELL_COPIES, guideStep, guideText, newGuideMemo } from '../../src/core/tutorial';
import { newOwned, type OwnedCard } from '../../src/core/progression';
import { adminSave } from '../../src/ui/accounts';
import { addToDeck, deckCards, defaultSave, loadSave, maxCopiesFor, ownedCopies, setSaveKey, usable, writeSave } from '../../src/ui/save';

const lcg = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('v0.41.0 — feitiços colecionáveis', () => {
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

  it('cada feitiço tem uma raridade de Comum a Épico (3 Comuns, 3 Incomuns, 4 Raros, 3 Épicos)', () => {
    for (const s of SPELLS) expect([1, 2, 3, 4]).toContain(s.rarity);
    expect(spellsAt(1)).toEqual(['f-muralha', 'f-flecha-veneno', 'f-cura']);
    expect(spellsAt(2).sort()).toEqual(['f-chuva', 'f-investida', 'f-veneno']);
    expect(spellsAt(3).sort()).toEqual(['f-bola-fogo', 'f-giratoria', 'f-raio', 'f-tremor']);
    expect(spellsAt(4).sort()).toEqual(['f-anjo', 'f-necropolis', 'f-sombras']);
    expect(spellsAt(5)).toEqual([]);
  });

  it('o Banner sorteia feitiços junto com os personagens da mesma raridade (nada de feitiço no Lendário/Mítico)', () => {
    for (let r = 1; r <= 4; r++) for (const id of spellsAt(r)) expect(cardPoolFor(r)).toContain(id);
    expect(cardPoolFor(5).some(isSpell)).toBe(false);
    const rng = lcg(11);
    const got = pull(BANNERS[0], 10, rng).concat(...Array.from({ length: 30 }, () => pull(BANNERS[0], 10, rng)));
    expect(got.some((c) => isSpell(c.charId))).toBe(true);
    for (const c of got) if (isSpell(c.charId)) expect(getSpell(c.charId).rarity).toBe(c.stars);
    for (let i = 0; i < 300; i++) expect(isSpell(drawAt(BANNERS[0], 5, rng).charId)).toBe(false);
  });

  it('ganhar feitiço: o 1º libera, os outros somam cópias; personagens não mudam', () => {
    const cards: Record<string, OwnedCard> = { riku: newOwned('riku') };
    const dupes: Dupes = {};
    const spells: Record<string, number> = {};
    expect(grantCard(cards, { charId: 'f-cura', stars: 1 }, dupes, spells)).toEqual({ charId: 'f-cura', stars: 1, isNew: true });
    expect(grantCard(cards, { charId: 'f-cura', stars: 1 }, dupes, spells)).toEqual({ charId: 'f-cura', stars: 1, isNew: false, copies: 2 });
    expect(spells).toEqual({ 'f-cura': 2 });
    expect(Object.keys(cards)).toEqual(['riku']);
    expect(dupes).toEqual({});
    // desmanchar: a 1ª cópia e as do baralho ficam
    expect(spareSpells({ 'f-cura': 5 }, 'f-cura', 0)).toBe(4);
    expect(spareSpells({ 'f-cura': 5 }, 'f-cura', 3)).toBe(2);
    expect(spareSpells({ 'f-cura': 1 }, 'f-cura', 0)).toBe(0);
  });

  it('baralho: só entra feitiço que você tem, com até as cópias que você tem (máximo 3)', () => {
    const d = defaultSave();
    expect(usable(d, 'f-chuva')).toBe(false);
    expect(addToDeck(d, 'f-chuva')).toBe(0);
    d.spells = { 'f-chuva': 2 };
    expect(usable(d, 'f-chuva')).toBe(true);
    expect(ownedCopies(d, 'f-chuva')).toBe(2);
    expect(maxCopiesFor(d, 'f-chuva')).toBe(2);
    expect(addToDeck(d, 'f-chuva')).toBe(2);
    d.spells['f-chuva'] = 9;
    expect(maxCopiesFor(d, 'f-chuva')).toBe(3);
    // feitiço que sumiu do save sai do baralho de batalha
    d.spells = {};
    expect(deckCards(d).some((c) => c.charId === 'f-chuva')).toBe(false);
  });

  it('migração: save antigo fica com os feitiços que estavam no baralho (com as cópias de lá); os outros ficam bloqueados', () => {
    const d = defaultSave() as ReturnType<typeof defaultSave> & Record<string, unknown>;
    d.tutorial = 3;
    d.deck = ['riku', 'f-chuva', 'f-raio'];
    d.copies = { riku: 1, 'f-chuva': 2 }; // f-raio sem valor = 3
    delete d.v41;
    delete d.spells;
    writeSave(d);
    const m = loadSave();
    expect(m.spells).toEqual({ 'f-chuva': 2, 'f-raio': 3 });
    expect(m.deck).toEqual(['riku', 'f-chuva', 'f-raio']);
    expect(deckCards(m).find((c) => c.charId === 'f-raio')?.copies).toBe(3);
    expect(usable(m, 'f-cura')).toBe(false);
    // save novo (já na v0.41.0): não ganha nada sozinho
    writeSave(m);
    expect(loadSave().spells).toEqual({ 'f-chuva': 2, 'f-raio': 3 });
  });

  it('ADM: todos os feitiços, 9 cópias de cada', () => {
    const a = adminSave();
    for (const s of SPELLS) expect(a.spells?.[s.id]).toBe(9);
    expect(deckCards(a).filter((c) => isSpell(c.charId)).length).toBeGreaterThan(0);
  });

  it('fases 2, 5 e 8 de cada região dão um feitiço na 1ª vitória; a raridade sobe com a região e a dificuldade', () => {
    expect(SPELL_REWARD_STAGES).toEqual([2, 5, 8]);
    expect([2, 5, 8].map((id) => spellRewardFor(id, 'facil'))).toEqual(['f-muralha', 'f-flecha-veneno', 'f-cura']);
    for (const id of [1, 3, 4, 6, 7, 9, 10, 13, 100]) expect(spellRewardFor(id, 'facil')).toBeUndefined();
    expect(spellRewardRarity(2, 'facil')).toBe(1);
    expect(spellRewardRarity(32, 'facil')).toBe(2);
    expect(spellRewardRarity(62, 'facil')).toBe(3);
    expect(spellRewardRarity(92, 'facil')).toBe(4);
    expect(spellRewardRarity(2, 'normal')).toBe(2);
    expect(spellRewardRarity(2, 'dificil')).toBe(3);
    expect(spellRewardRarity(98, 'dificil')).toBe(4);
    for (let id = 1; id <= 100; id++)
      for (const diff of ['facil', 'normal', 'dificil'] as const) {
        const sp = spellRewardFor(id, diff);
        if (sp) expect(getSpell(sp).rarity).toBe(spellRewardRarity(id, diff));
      }
    // nas regiões 1–3 do Fácil, os 3 feitiços Comuns saem 3 vezes cada (3 cópias = o máximo do baralho)
    const easy = Array.from({ length: 30 }, (_, k) => spellRewardFor(k + 1, 'facil')).filter(Boolean);
    for (const id of spellsAt(1)) expect(easy.filter((x) => x === id)).toHaveLength(3);
  });

  it('autoDeck do jogador simulado só usa os feitiços que ele tem', () => {
    const owned = TUTORIAL_CHARS.map((charId) => ({ charId, stars: 1, plus: 0 }));
    const deck = autoDeck(owned, 13, 4, { [TUTORIAL_SPELL]: 1 });
    expect(deck.filter((c) => isSpell(c.charId))).toEqual([{ charId: TUTORIAL_SPELL, stars: 1, copies: 1 }]);
    expect(autoDeck(owned, 13, 4, {}).some((c) => isSpell(c.charId))).toBe(false);
  });
});

describe('v0.41.0 — o feitiço do tutorial', () => {
  it('o Riku, a Sora ou a Nara conseguem lançar o feitiço do tutorial', () => {
    const cats = TUTORIAL_CHARS.map((id) => getChar(id).category);
    expect(getSpell(TUTORIAL_SPELL).categories.some((c) => cats.includes(c))).toBe(true);
    expect(TUTORIAL_SPELL_COPIES).toBe(2);
  });

  it('a Batalha 2 (com o feitiço no baralho) ensina a lançá-lo e o jogador vence seguindo o roteiro', () => {
    const run = () => {
      const s = createBattle({
        playerDeck: [...TUTORIAL_CHARS.map((charId) => ({ charId, stars: 1, plus: 0, copies: 3 })), { charId: TUTORIAL_SPELL, stars: 1, copies: TUTORIAL_SPELL_COPIES }],
        enemyDeck: TUTORIAL_BATTLES[1].enemyDeck,
        playerHeroHp: PLAYER_HERO_HP,
        enemyHeroHp: TUTORIAL_BATTLES[1].enemyHeroHp,
        seed: TUTORIAL_SEEDS[1],
        noWait: true,
      });
      const memo = newGuideMemo();
      let sel: number | null = null;
      const steps: string[] = [];
      const texts: string[] = [];
      for (let g = 0; g < 400 && !s.winner; g++) {
        const a = guideStep(1, s, sel, memo);
        const spell = (a.kind === 'card' || a.kind === 'cell') && isSpell(a.charId);
        steps.push(a.kind + (spell ? '*' : ''));
        if (spell) texts.push(guideText(1, a, s, true), guideText(1, a, s, false));
        if (a.kind === 'hold') memo.held = true;
        else if (a.kind === 'card') sel = a.hand;
        else if (a.kind === 'cell') {
          expect(playerUse(s, sel!, a.r, a.c).ok).toBe(true);
          sel = null;
        } else if (a.kind === 'fight') playerEndTurn(s);
      }
      return { s, steps, texts };
    };
    const a = run();
    expect(a.s.winner).toBe('player');
    expect(a.steps).toEqual(run().steps); // sempre igual
    // as 3 invocações guiadas vêm antes; depois, escolher o feitiço e tocar na casa destacada (uma vez só)
    const k = a.steps.indexOf('card*');
    expect(a.steps.slice(k, k + 2)).toEqual(['card*', 'cell*']);
    expect(a.steps.filter((x) => x === 'card*')).toHaveLength(1);
    expect(a.steps.slice(0, k).filter((x) => x === 'cell')).toHaveLength(3);
    expect(a.s.stats!.player.spells).toBeGreaterThanOrEqual(1);
    // texto do celular (toque) e do PC (clique)
    expect(a.texts[0]).toContain('Toque');
    expect(a.texts[1]).toContain('Clique');
    expect(a.texts.join(' ')).toContain(getSpell(TUTORIAL_SPELL).name);
  });
});
