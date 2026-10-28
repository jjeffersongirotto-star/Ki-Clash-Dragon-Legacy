import { describe, expect, it } from 'vitest';
import { createBattle, Ctx, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy, simpleDeploy } from '../../src/core/ai';
import { AI_LEVELS, cloneForSim, evaluate, smartDeploy } from '../../src/core/aiSmart';
import { claimOf, playerAuto, playerEndTurn, verifyMatch } from '../../src/core/match';
import { STAGES, STAGE_AI } from '../../src/core/campaign';
import { stageFor } from '../../src/core/adventure';

const play = (level: number, seed: number, deck = STAGES[5].enemyDeck) => {
  const s = createBattle({ playerDeck: deck, enemyDeck: deck, playerHeroHp: 60, enemyHeroHp: 60, seed, aiLevel: level });
  let g = 0;
  while (!s.winner && g++ < 200) {
    playerAuto(s);
    playerEndTurn(s);
  }
  return s;
};

describe('v0.37.0 — adversário esperto', () => {
  it('a batalha guarda o nível da IA na gravação e refazer a partida confere (determinística)', () => {
    for (const level of [1, 2, 3]) {
      const s = play(level, 77 + level);
      expect(s.record!.setup.aiLevel).toBe(level);
      expect(verifyMatch(s.record!, claimOf(s))).toEqual({ ok: true });
    }
  });

  it('mesma semente → mesmo resultado (pensar não usa relógio nem o sorteio da batalha de verdade)', () => {
    const a = play(2, 4242);
    const b = play(2, 4242);
    expect(claimOf(a)).toEqual(claimOf(b));
  });

  it('simular numa cópia não mexe na batalha real', () => {
    const s = createBattle({ playerDeck: STAGES[6].enemyDeck, enemyDeck: STAGES[6].enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 9 });
    const before = JSON.stringify({ seed: s.seed, units: s.units, hand: s.decks.enemy.hand });
    const c = cloneForSim(s);
    simpleDeploy(c, new Ctx(), 'player');
    expect(JSON.stringify({ seed: s.seed, units: s.units, hand: s.decks.enemy.hand })).toBe(before);
  });

  it('a nota reconhece vitória, derrota e perigo', () => {
    const s = createBattle({ playerDeck: STAGES[3].enemyDeck, enemyDeck: STAGES[3].enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 1 });
    const mid = evaluate(s, 'enemy');
    const win = cloneForSim(s);
    win.winner = 'enemy';
    const lose = cloneForSim(s);
    lose.winner = 'player';
    expect(evaluate(win, 'enemy')).toBeGreaterThan(mid);
    expect(evaluate(lose, 'enemy')).toBeLessThan(mid);
    const hurt = cloneForSim(s);
    hurt.heroes.enemy.hp = 10;
    const hurtFoe = cloneForSim(s);
    hurtFoe.heroes.player.hp = 10;
    expect(evaluate(hurt, 'enemy')).toBeLessThan(mid);
    expect(evaluate(hurtFoe, 'enemy')).toBeGreaterThan(mid);
  });

  it('a IA esperta (nível 2) vence a IA simples mais vezes no mesmo baralho', () => {
    const wins = (level: number) => {
      let w = 0;
      for (let k = 0; k < 20; k++) {
        const st = STAGES[3 + (k % 7)];
        const s = createBattle({ playerDeck: st.enemyDeck, enemyDeck: st.enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 1000 + k, aiLevel: level });
        let g = 0;
        while (!s.winner && g++ < 200) {
          simpleDeploy(s, new Ctx(), 'player');
          endPlayerTurn(s, aiDeploy);
        }
        if (s.winner === 'enemy') w++;
      }
      return w;
    };
    expect(wins(2)).toBeGreaterThan(wins(0));
  });

  it('níveis por fase: começa simples e sobe; Normal/Difícil somam (até 3); o Auto do jogador usa a IA simples', () => {
    expect(STAGE_AI).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2, 3]);
    expect(STAGES.map((s) => s.aiLevel)).toEqual(STAGE_AI);
    expect(stageFor(1, 'normal').aiLevel).toBe(1);
    expect(stageFor(1, 'dificil').aiLevel).toBe(2);
    expect(stageFor(10, 'dificil').aiLevel).toBe(3);
    expect(Object.keys(AI_LEVELS).map(Number)).toEqual([1, 2, 3]);
    // o lado do jogador nunca usa a esperta pelo aiDeploy (modo Auto)
    const s = createBattle({ playerDeck: STAGES[4].enemyDeck, enemyDeck: STAGES[4].enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 3, aiLevel: 3 });
    const t = createBattle({ playerDeck: STAGES[4].enemyDeck, enemyDeck: STAGES[4].enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 3 });
    aiDeploy(s, new Ctx(), 'player');
    simpleDeploy(t, new Ctx(), 'player');
    expect(s.units.map((u) => [u.charId, u.row, u.col])).toEqual(t.units.map((u) => [u.charId, u.row, u.col]));
  });

  it('o turno da esperta é feito só com jogadas válidas', () => {
    const s = createBattle({ playerDeck: STAGES[8].enemyDeck, enemyDeck: STAGES[8].enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 11 });
    s.active = 'enemy';
    for (const h of s.decks.enemy.hand) h.wait = 0;
    const n = s.units.length;
    smartDeploy(s, new Ctx(), 'enemy', 3, simpleDeploy);
    expect(s.units.length).toBeGreaterThanOrEqual(n);
    for (const u of s.units.filter((x) => x.side === 'enemy')) expect(u.col).toBeGreaterThanOrEqual(s.cols - 3);
  });
});
