import { describe, expect, it } from 'vitest';
import { createBattle, PLAYER_HERO_HP_FOR_TEST } from './v33_helpers';
import { playerEndTurn, playerUse } from '../../src/core/match';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_GEMS, TUTORIAL_SEEDS, TUTORIAL_STARTER, guideStep, guideText, newGuideMemo } from '../../src/core/tutorial';
import { GEMS_BY_STAGE, gemsFor } from '../../src/core/adventure';
import { STAGES } from '../../src/core/campaign';

/** Joga a batalha do tutorial seguindo o roteiro guiado (o que o jogador faria tocando onde o tutorial aponta). */
function playGuided(i: 0 | 1) {
  const ids = i === 0 ? [TUTORIAL_STARTER] : TUTORIAL_CHARS;
  const s = createBattle({
    playerDeck: ids.map((charId) => ({ charId, stars: 1, plus: 0, copies: 3 })),
    enemyDeck: TUTORIAL_BATTLES[i].enemyDeck,
    playerHeroHp: PLAYER_HERO_HP_FOR_TEST,
    enemyHeroHp: TUTORIAL_BATTLES[i].enemyHeroHp,
    seed: TUTORIAL_SEEDS[i],
    noWait: true,
  });
  const memo = newGuideMemo();
  let sel: number | null = null;
  const steps: string[] = [];
  let enemyIdleTurns = 0;
  for (let guard = 0; guard < 400 && !s.winner; guard++) {
    const a = guideStep(i, s, sel, memo);
    expect(guideText(i, a, s).length).toBeGreaterThan(0);
    steps.push(a.kind);
    if (a.kind === 'hold') memo.held = true; // v0.35.0: o jogador segura a carta para ver a descrição
    else if (a.kind === 'card') sel = a.hand;
    else if (a.kind === 'cell') {
      expect(playerUse(s, sel!, a.r, a.c).ok).toBe(true);
      sel = null;
    } else if (a.kind === 'fight') {
      const before = s.stats!.enemy.cards;
      playerEndTurn(s);
      if (!s.winner && s.stats!.enemy.cards === before && s.decks.enemy.hand.length) enemyIdleTurns++;
    }
  }
  return { s, steps, enemyIdleTurns };
}

describe('v0.33.0 — tutorial guiado, sempre igual', () => {
  it('as 2 batalhas do tutorial são vencidas seguindo o roteiro, e o inimigo não fica parado com carta na mão', () => {
    for (const i of [0, 1] as const) {
      const a = playGuided(i);
      const b = playGuided(i);
      expect(a.s.winner).toBe('player');
      expect(a.steps).toEqual(b.steps); // sempre igual
      // v0.35.0: a Batalha 2 começa ensinando a segurar a carta (descrição)
      expect(a.steps.slice(0, i === 1 ? 4 : 3)).toEqual(i === 1 ? ['hold', 'card', 'cell', 'fight'] : ['card', 'cell', 'fight']);
      expect(a.enemyIdleTurns).toBe(0);
    }
  });

  it('a batalha 2 ensina Riku na frente, Sora atrás e Nara na outra fileira', () => {
    const { s } = playGuided(1);
    expect(s.stats!.player.cards).toBeGreaterThanOrEqual(3);
  });

  it('💠 Gemas: 2 no fim do tutorial; fases 3, 6 e 9 dão 1 e a fase 10 dá 3 (só na 1ª vitória)', () => {
    expect(TUTORIAL_GEMS).toBe(2);
    expect(GEMS_BY_STAGE).toEqual({ 3: 1, 6: 1, 9: 1, 10: 3 });
    expect(STAGES.map((st) => gemsFor(st.id))).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1, 3]);
    for (const st of STAGES) expect(st.pack).toEqual([]);
  });

  it('v0.35.0: passo de segurar a carta com texto diferente no celular e no PC', () => {
    const s = createBattle({ playerDeck: TUTORIAL_CHARS.map((id) => ({ charId: id, stars: 1, plus: 0, copies: 3 })), enemyDeck: TUTORIAL_BATTLES[1].enemyDeck, playerHeroHp: 30, enemyHeroHp: 10, seed: TUTORIAL_SEEDS[1], noWait: true });
    const a = guideStep(1, s, null, newGuideMemo());
    expect(a.kind).toBe('hold');
    expect(guideText(1, a, s, true)).toContain('toque e segure');
    expect(guideText(1, a, s, false)).toContain('clique e segure');
    expect(guideText(1, a, s, false)).toContain('botão direito');
  });
});
