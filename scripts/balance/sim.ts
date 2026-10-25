/**
 * v0.13.0 — Simulador de equilíbrio (IA × IA, mesma IA do modo Auto).
 * Rodar: npx vite-node scripts/balance/<script>.ts
 */
import { createBattle, Ctx, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy } from '../../src/core/ai';
import type { BattleState, CardInstance } from '../../src/core/types';

export interface SimResult {
  winner: 'player' | 'enemy' | 'empate';
  turns: number;
  /** maior dano que o Líder do jogador levou num único turno inimigo */
  maxBurstOnPlayer: number;
  /** maior ataque efetivo de uma unidade inimiga em campo (antes da Fúria) */
  maxEnemyAtk: number;
  playerHpLeft: number;
}

export function simulate(playerDeck: CardInstance[], enemyDeck: CardInstance[], playerHp: number, enemyHp: number, seed: number): SimResult {
  const s: BattleState = createBattle({ playerDeck, enemyDeck, playerHeroHp: playerHp, enemyHeroHp: enemyHp, seed });
  let maxBurst = 0;
  let maxAtk = 0;
  let guard = 0;
  while (!s.winner && guard++ < 200) {
    aiDeploy(s, new Ctx(), 'player');
    // dano no Líder do jogador nesta rodada, SEM o corte em 0 (soma dos golpes): mede o "one-shot" de verdade
    const evs = endPlayerTurn(s, (st, ctx, side) => {
      aiDeploy(st, ctx, side);
    });
    let dmg = 0;
    for (const e of evs) if (e.type === 'hero' && (e as { side?: string }).side === 'player') dmg += (e as { amount?: number }).amount ?? 0;
    maxBurst = Math.max(maxBurst, dmg);
    for (const u of s.units) if (u.side === 'enemy') maxAtk = Math.max(maxAtk, u.atk);
  }
  return { winner: (s.winner ?? 'empate') as SimResult['winner'], turns: s.turn, maxBurstOnPlayer: maxBurst, maxEnemyAtk: maxAtk, playerHpLeft: s.heroes.player.hp };
}
