import { describe, expect, it } from 'vitest';
import { cardMatches, toggleSel } from '../../src/core/cardFilter';
import { adminMinSave, loadAccounts } from '../../src/ui/accounts';
import { PLAYABLE } from '../../src/core/characters';

const S = (...a: string[]) => new Set(a);
describe('v0.55.1 — filtros Raça e Tipo', () => {
  it('sem filtro mostra tudo', () => expect(cardMatches('humano', ['dps'], S(), S())).toBe(true));
  it('E entre filtros', () => {
    expect(cardMatches('humano', ['dps'], S('humano'), S('dps'))).toBe(true);
    expect(cardMatches('humano', ['tanque'], S('humano'), S('dps'))).toBe(false);
  });
  it('OU dentro do mesmo filtro', () => {
    expect(cardMatches('elfo', ['tanque'], S('humano', 'elfo'), S('dps', 'tanque'))).toBe(true);
    expect(cardMatches('orc', ['tanque'], S('humano', 'elfo'), S())).toBe(false);
  });
  it('feitiço some com filtro de raça e aparece pelo tipo', () => {
    expect(cardMatches(null, ['dps', 'assassino'], S('humano'), S())).toBe(false);
    expect(cardMatches(null, ['dps', 'assassino'], S(), S('assassino'))).toBe(true);
  });
  it('toggle', () => {
    const s = S();
    toggleSel(s, 'dps');
    expect(s.has('dps')).toBe(true);
    toggleSel(s, 'dps');
    expect(s.size).toBe(0);
  });
});
describe('v0.55.1 — conta adm2', () => {
  it('existe sempre, separada da ADM', () => {
    const st = loadAccounts();
    expect(st.accounts.adm2?.adminMin).toBe(true);
    expect(st.accounts.adm2?.admin).toBeFalsy();
    expect(st.accounts.adm?.admin).toBe(true);
  });
  it('todas as cartas na raridade mínima, sem "+"', () => {
    const d = adminMinSave();
    for (const def of PLAYABLE) if (d.cards[def.id]) {
      expect(d.cards[def.id].stars).toBe(def.minStars);
      expect(d.cards[def.id].plus).toBe(0);
    }
    expect(d.deck.length).toBeGreaterThan(0);
  });
});
