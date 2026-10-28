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
  /** v0.28.0: cartas usadas, feitiços usados e personagens inimigos derrotados pelo jogador */
  stats: { cards: number; spells: number; kills: number };
}

/** v0.35.0: totais de todas as batalhas simuladas (para comparar tamanhos de arena) */
export const ARENA = { battles: 0, turns: 0, clashes: 0, heroToEnemy: 0, heroToPlayer: 0 };
export const resetArena = () => Object.assign(ARENA, { battles: 0, turns: 0, clashes: 0, heroToEnemy: 0, heroToPlayer: 0 });

export function simulate(playerDeck: CardInstance[], enemyDeck: CardInstance[], playerHp: number, enemyHp: number, seed: number, aiLevel = Number(process.env.SIM_AI ?? NaN)): SimResult {
  // v0.35.0: SIM_COLS testa outros tamanhos de arena (12, 10, 7…) sem mudar o jogo
  const s: BattleState = createBattle({ playerDeck, enemyDeck, playerHeroHp: playerHp, enemyHeroHp: enemyHp, seed, cols: Number(process.env.SIM_COLS) || undefined, aiLevel: Number.isFinite(aiLevel) ? aiLevel : undefined });
  let clashes = 0;
  const heroDmg = { player: 0, enemy: 0 };
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
    for (const e of evs) {
      const ev = e as { type: string; target?: unknown; side?: 'player' | 'enemy'; amount?: number };
      if (ev.type === 'attack' && typeof ev.target === 'number') clashes++;
      if (ev.type === 'hero' && ev.side) heroDmg[ev.side] += ev.amount ?? 0;
    }
    maxBurst = Math.max(maxBurst, dmg);
    for (const u of s.units) if (u.side === 'enemy') maxAtk = Math.max(maxAtk, u.atk);
  }
  ARENA.battles++;
  ARENA.turns += s.turn;
  ARENA.clashes += clashes;
  ARENA.heroToEnemy += heroDmg.enemy;
  ARENA.heroToPlayer += heroDmg.player;
  return { winner: (s.winner ?? 'empate') as SimResult['winner'], turns: s.turn, maxBurstOnPlayer: maxBurst, maxEnemyAtk: maxAtk, playerHpLeft: s.heroes.player.hp, stats: { ...s.stats!.player } };
}
