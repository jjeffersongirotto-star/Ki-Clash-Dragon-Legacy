import { describe, expect, it } from 'vitest';
import { bankXp, dupeCount, generalXp, grantCard, spareCopies, takeDupe, totalCopies, type Dupes } from '../../src/core/banner';
import { newOwned, type OwnedCard } from '../../src/core/progression';
import { addToDeck, copiesIn, defaultSave, deckMin, maxCopiesFor, migrateV32, setCopies } from '../../src/ui/save';

describe('v0.32.0 — cópias guardadas, baralho com as cópias que você tem e Desmanchar', () => {
  it('ganhar um personagem dá 1 cópia; o repetido vira mais 1 cópia guardada (sem XP)', () => {
    const cards: Record<string, OwnedCard> = {};
    const dupes: Dupes = {};
    grantCard(cards, { charId: 'riku', stars: 1 }, dupes);
    expect(totalCopies(cards, dupes, 'riku')).toBe(1);
    const g = grantCard(cards, { charId: 'riku', stars: 3 }, dupes);
    expect(g.isNew).toBe(false);
    expect(totalCopies(cards, dupes, 'riku')).toBe(2);
    expect(cards.riku.xp).toBe(0);
    expect(dupes.riku).toEqual({ 3: 1 });
    expect(totalCopies(cards, dupes, 'sora')).toBe(0);
  });

  it('o baralho só põe as cópias que você tem (até 3)', () => {
    const d = defaultSave();
    d.cards.sora = newOwned('sora');
    d.deck = [];
    expect(maxCopiesFor(d, 'sora')).toBe(1);
    expect(addToDeck(d, 'sora')).toBe(1);
    expect(setCopies(d, 'sora', 3)).toBe(1);
    d.dupes = { sora: { 1: 5 } };
    expect(maxCopiesFor(d, 'sora')).toBe(3);
    expect(setCopies(d, 'sora', 3)).toBe(3);
    expect(copiesIn(d, 'sora')).toBe(3);
    expect(maxCopiesFor(d, 'f-chuva')).toBe(3); // feitiço: sempre até 3
  });

  it('mínimo do baralho conta as cópias que dá para usar', () => {
    const d = defaultSave();
    d.cards.sora = newOwned('sora');
    d.cards.nara = newOwned('nara');
    expect(deckMin(d)).toBe(3); // 3 personagens com 1 cópia
    d.dupes = { riku: { 1: 2 }, sora: { 1: 2 }, nara: { 1: 2 } };
    expect(deckMin(d)).toBe(9);
  });

  it('save antigo: cada personagem ganha 3 cópias (nada muda no baralho); save novo não ganha nada', () => {
    const old = defaultSave();
    old.cards.sora = newOwned('sora');
    const m = migrateV32(old, {});
    expect(totalCopies(m.cards, m.dupes, 'riku')).toBe(3);
    expect(totalCopies(m.cards, m.dupes, 'sora')).toBe(3);
    const fresh = defaultSave();
    const n = migrateV32(fresh, { v32: true, dupes: {} });
    expect(n.dupes).toEqual({});
  });

  it('dá para desmanchar só as sobras: nunca a última cópia nem as que o baralho usa', () => {
    const dupes: Dupes = { riku: { 1: 4 } }; // 5 cópias
    expect(spareCopies(dupes, 'riku', 0)).toBe(4);
    expect(spareCopies(dupes, 'riku', 3)).toBe(2);
    expect(spareCopies({}, 'riku', 1)).toBe(0);
    expect(takeDupe(dupes, 'riku', 1)).toBe(true);
    expect(dupeCount(dupes, 'riku')).toBe(3);
    expect(takeDupe(dupes, 'riku', 2)).toBe(false);
  });

  it('Desmanchar geral: 25% do XP da cópia, guardado; cada Orbe inteiro sai do cofre', () => {
    expect(generalXp(1)).toBe(25);
    expect(generalXp(3)).toBe(100);
    expect(generalXp(6)).toBe(750);
    const bank = { xp: 0 };
    const items: Record<string, number> = {};
    expect(bankXp(bank, 75, items)).toEqual({});
    expect(bank.xp).toBe(75);
    expect(bankXp(bank, 50, items)).toEqual({ orbe1: 1 });
    expect(bank.xp).toBe(25);
    expect(items.orbe1).toBe(1);
  });
});
