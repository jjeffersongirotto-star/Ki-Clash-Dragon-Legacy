import { describe, expect, it } from 'vitest';
import { createBattle, PLAYER_HERO_HP_FOR_TEST } from './v33_helpers';
import { playerEndTurn, playerUse } from '../../src/core/match';
import { TUTORIAL_BATTLES, TUTORIAL_SEEDS, TUTORIAL_STARTER, guideStep, newGuideMemo } from '../../src/core/tutorial';

describe('v0.55.3 — Batalha 1 do tutorial: 1 em cima, 1 embaixo', () => {
  it('as duas primeiras invocações vão para fileiras diferentes e a batalha é vencida', () => {
    const s = createBattle({ playerDeck: [{ charId: TUTORIAL_STARTER, stars: 1, plus: 0, copies: 3 }], enemyDeck: TUTORIAL_BATTLES[0].enemyDeck, playerHeroHp: PLAYER_HERO_HP_FOR_TEST, enemyHeroHp: TUTORIAL_BATTLES[0].enemyHeroHp, seed: TUTORIAL_SEEDS[0], noWait: true });
    const memo = newGuideMemo(); let sel: number | null = null; const rows: number[] = [];
    for (let g = 0; g < 400 && !s.winner; g++) {
      const a = guideStep(0, s, sel, memo);
      if (a.kind === 'hold') memo.held = true;
      else if (a.kind === 'card') sel = a.hand;
      else if (a.kind === 'cell') { rows.push(a.r); expect(playerUse(s, sel!, a.r, a.c).ok).toBe(true); sel = null; }
      else if (a.kind === 'fight') playerEndTurn(s);
    }
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0]).not.toBe(rows[1]);
    expect(s.winner).toBe('player');
  });
});
