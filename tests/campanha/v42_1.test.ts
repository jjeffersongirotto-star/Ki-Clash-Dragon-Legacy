import { describe, expect, it } from 'vitest';
import { createBattle, PLAYER_HERO_HP_FOR_TEST } from './v33_helpers';
import { playerEndTurn, playerUse } from '../../src/core/match';
import { deployCells } from '../../src/core/battle';
import { isSpell } from '../../src/core/spells';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_SEEDS, TUTORIAL_SPELL, TUTORIAL_SPELL_COPIES, TUTORIAL_STARTER, TUTORIAL_TIPS, guideStep, guideText, newGuideMemo } from '../../src/core/tutorial';
describe('v0.42.1 — tutorial: qualquer uma das 6 casas da zona vale', () => {
it('colocando os personagens em casas sorteadas da zona, as 2 batalhas continuam sendo vencidas', () => {
  for (const i of [0, 1] as const) {
    let wins = 0; const N = 40; let rng = 7;
    const rnd = () => ((rng = (rng * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let t = 0; t < N; t++) {
      const ids = i === 0 ? [TUTORIAL_STARTER] : TUTORIAL_CHARS;
      const s = createBattle({ playerDeck: [...ids.map((charId) => ({ charId, stars: 1, plus: 0, copies: 3 })), ...(i === 1 ? [{ charId: TUTORIAL_SPELL, stars: 1, copies: TUTORIAL_SPELL_COPIES }] : [])], enemyDeck: TUTORIAL_BATTLES[i].enemyDeck, playerHeroHp: PLAYER_HERO_HP_FOR_TEST, enemyHeroHp: TUTORIAL_BATTLES[i].enemyHeroHp, seed: TUTORIAL_SEEDS[i], noWait: true });
      const memo = newGuideMemo(); let sel: number | null = null;
      for (let g = 0; g < 400 && !s.winner; g++) {
        const a = guideStep(i, s, sel, memo);
        if (a.kind === 'hold') memo.held = true;
        else if (a.kind === 'card') sel = a.hand;
        else if (a.kind === 'cell') {
          let [r, c] = [a.r, a.c];
          if (!isSpell(a.charId)) { const cs = deployCells(s, 'player'); [r, c] = cs[Math.floor(rnd() * cs.length)]; }
          if (!playerUse(s, sel!, r, c).ok) throw new Error('fail');
          sel = null;
        } else if (a.kind === 'fight') playerEndTurn(s);
      }
      if (s.winner === 'player') wins++;
    }
    expect(wins, `batalha ${i + 1}`).toBe(N);
  }
});

it('textos: primeiro as 6 casas, depois a casa circulada; sem "esquerda" nem "obrigatório"', () => {
  const s = createBattle({ playerDeck: [{ charId: TUTORIAL_STARTER, stars: 1, plus: 0, copies: 3 }], enemyDeck: TUTORIAL_BATTLES[0].enemyDeck, playerHeroHp: PLAYER_HERO_HP_FOR_TEST, enemyHeroHp: TUTORIAL_BATTLES[0].enemyHeroHp, seed: TUTORIAL_SEEDS[0], noWait: true });
  const memo = newGuideMemo();
  const a = guideStep(0, s, 0, memo);
  expect(a.kind).toBe('cell');
  expect(guideText(0, a, s, true, true)).toContain('qualquer um dos 6 quadrados destacados');
  expect(guideText(0, a, s, true, false)).toContain('casa circulada');
  const all = [guideText(0, a, s, true, true), guideText(0, a, s, true, false), ...TUTORIAL_TIPS.flat().map((t) => t.text)].join(' ');
  expect(all).not.toMatch(/obrigat|colunas da esquerda/i);
});
});
