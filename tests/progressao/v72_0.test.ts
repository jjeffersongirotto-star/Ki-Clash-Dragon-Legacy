import { describe, expect, it } from 'vitest';
import { createDeck, defeatCopy, drawOpening, drawStep, playFromHand, returnFromNecropolis } from '../../src/core/deck';
import { bestCopy, copyList, materialize, pickCopy, pickOf, pickStrongest, setPickCount, unpickCopy } from '../../src/core/copies';
import { cardPower } from '../../src/core/power';
import { newOwned } from '../../src/core/progression';
import { addToDeck, deckCards, deckOwnedCopies, defaultSave, migrateV72, ownedCopies, removeFromDeck, setCopies } from '../../src/ui/save';
import type { CardInstance } from '../../src/core/types';

/** save com o Riku (principal Rara) e cópias guardadas Comuns e Incomuns */
function withCopies() {
  const d = defaultSave();
  d.cards.riku = { ...newOwned('riku'), stars: 3, plus: 1 };
  d.dupes = { riku: { 1: 2, 2: 1 } };
  d.deck = [];
  d.pick = {};
  return d;
}

describe('v0.72.0 — cada cópia é uma carta própria', () => {
  it('cópias guardadas viram cópias próprias (com a cor delas) ao entrar no baralho', () => {
    const d = withCopies();
    expect(ownedCopies(d, 'riku')).toBe(4);
    expect(addToDeck(d, 'riku')).toBe(3);
    // as 3 mais fortes: a Rara+ (principal), a Incomum e uma Comum
    const cs = deckOwnedCopies(d).map((c) => c.stars).sort();
    expect(cs).toEqual([1, 2, 3]);
    expect(d.dupes!.riku).toEqual({ 1: 1 });
    expect(ownedCopies(d, 'riku')).toBe(4);
  });

  it('dá para escolher 2 cópias de raridades diferentes', () => {
    const d = withCopies();
    d.deck = ['riku'];
    d.pick = { riku: [0] };
    const ref = pickCopy(d, 'riku', { stars: 2 });
    expect(ref).toBe(1);
    expect(pickOf(d, 'riku')).toEqual([0, 1]);
    const card = deckCards(d)[0];
    expect(card.copies).toBe(2);
    expect(card.variants?.map((v) => v.stars)).toEqual([3, 2]);
  });

  it('cópia nunca treinada que sai do baralho volta a ser guardada; a treinada fica', () => {
    const d = withCopies();
    d.deck = ['riku'];
    d.pick = { riku: [0] };
    pickCopy(d, 'riku', { stars: 2 });
    pickCopy(d, 'riku', { stars: 1 });
    copyList(d, 'riku')[2].xp = 5; // a Comum foi treinada
    expect(unpickCopy(d, 'riku', 1)).toBe(true); // a Incomum (nunca treinada) volta
    expect(d.dupes!.riku[2]).toBe(1);
    expect(unpickCopy(d, 'riku', pickOf(d, 'riku')[1])).toBe(true); // a Comum treinada continua sendo uma cópia própria
    expect(copyList(d, 'riku').length).toBe(2);
    expect(pickOf(d, 'riku')).toEqual([0]);
    expect(unpickCopy(d, 'riku', 0)).toBe(false); // fica pelo menos 1
  });

  it('−/+ das cópias: entram as mais fortes de fora, saem as mais fracas', () => {
    const d = withCopies();
    d.deck = ['riku'];
    d.pick = { riku: [0] };
    expect(setPickCount(d, 'riku', 3)).toBe(3);
    expect(setPickCount(d, 'riku', 2)).toBe(2);
    expect(deckOwnedCopies(d).map((c) => c.stars).sort()).toEqual([2, 3]);
    expect(setCopies(d, 'riku', 1)).toBe(1);
    expect(deckOwnedCopies(d).map((c) => c.stars)).toEqual([3]);
  });

  it('Poder do baralho soma cada cópia com a cor dela', () => {
    const d = withCopies();
    addToDeck(d, 'riku');
    const p = deckOwnedCopies(d).reduce((s, c) => s + cardPower(c), 0);
    expect(p).toBe(cardPower({ charId: 'riku', stars: 3, plus: 1 }) + cardPower({ charId: 'riku', stars: 2 }) + cardPower({ charId: 'riku', stars: 1 }));
    removeFromDeck(d, 'riku');
    expect(d.dupes!.riku).toEqual({ 1: 2, 2: 1 });
  });

  it('a melhor cópia pode não ser a principal', () => {
    const d = withCopies();
    d.dupes = { riku: { 5: 1 } };
    expect(bestCopy(d, 'riku')?.stars).toBe(5);
    pickStrongest(d, 'riku', 1);
    expect(deckOwnedCopies({ ...d, deck: ['riku'] }).map((c) => c.stars)).toEqual([5]);
    expect(materialize(d, 'riku', 4)).toBeNull(); // não tem guardada Épica
  });

  it('save antigo: as cópias do baralho viram cópias próprias na cor da principal (ninguém perde força)', () => {
    const d = withCopies();
    d.deck = ['riku'];
    d.dupes = { riku: { 1: 3 } };
    d.copies = { riku: 3 };
    migrateV72(d, { copies: { riku: 3 } });
    expect(deckOwnedCopies(d).map((c) => `${c.stars}${c.plus}`)).toEqual(['31', '31', '31']);
    expect(d.dupes!.riku).toEqual({ 1: 1 });
    expect(d.v72).toBe(true);
  });

  it('batalha: cada cópia sai com a cor dela e a derrotada volta com a mesma cor', () => {
    const card: CardInstance = { charId: 'riku', stars: 4, plus: 0, copies: 2, variants: [{ stars: 4, plus: 0 }, { stars: 1, plus: 0 }] };
    const rng = { seed: 7 };
    const d = createDeck([card], rng);
    const hand = drawOpening(d, rng);
    expect(hand).toHaveLength(1);
    const first = hand[0];
    drawStep(d, rng, 1);
    const stars = d.hand.map((h) => h.stars).sort();
    expect(stars).toEqual([1, 4]);
    const played = playFromHand(d, 0)!;
    defeatCopy(d, 0, played.copy);
    expect(d.defeated[0].stars).toBe(played.stars);
    const back = returnFromNecropolis(d);
    expect(back?.card.stars).toBe(played.stars);
    expect(first.copy).not.toBeUndefined();
  });

  it('cópias iguais não gastam sorteio (o baralho do inimigo não muda)', () => {
    const a = createDeck([{ charId: 'riku', stars: 2, copies: 3 }], { seed: 5 });
    const b = createDeck([{ charId: 'riku', stars: 2, copies: 3, variants: [{ stars: 2 }, { stars: 2 }, { stars: 2 }] }], { seed: 5 });
    expect(a.slots[0].seq).toBe(b.slots[0].seq);
  });
});
