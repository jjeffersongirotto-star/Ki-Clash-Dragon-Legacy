/**
 * v0.18.0 — Partidas verificáveis (base para o futuro modo online).
 *
 * A batalha é determinística: com os mesmos baralhos, vidas, semente inicial e jogadas do jogador, o
 * resultado é sempre o mesmo (a IA inimiga e o Auto usam o sorteio da própria batalha). Por isso basta
 * gravar a configuração e as jogadas do jogador (`state.record`) para refazer a partida inteira.
 *
 * A tela de batalha usa as funções `player*` abaixo (elas jogam e gravam). Um servidor só precisa chamar
 * `verifyMatch` com a gravação e o resultado informado pelo aparelho antes de dar a recompensa; ele também
 * deve conferir se os baralhos da gravação batem com as cartas da conta e com a fase.
 */
import { aiDeploy } from './ai';
import { Ctx, castSpell, createBattle, deploy, endPlayerTurn } from './battle';
import { isSpell } from './spells';
import type { BattleState, MatchRecord, PlayerAction, RecordedEvent, Side } from './types';

const rec = (state: BattleState, a: PlayerAction) => state.record?.actions.push(a);

/** Usa a carta da mão do jogador na casa (invoca o personagem ou lança o feitiço) e grava a jogada se valeu. */
export function playerUse(state: BattleState, hand: number, row: number, col: number, ctx = new Ctx()) {
  const card = state.decks.player.hand[hand];
  const res = card && isSpell(card.charId) ? castSpell(state, 'player', hand, row, col, ctx) : deploy(state, 'player', hand, row, col, ctx);
  if (res.ok) rec(state, { t: 'use', hand, row, col });
  return res;
}

/** Modo Auto: a IA invoca/lança pelo jogador. Grava só "auto" (refazer chama a mesma IA, com o mesmo sorteio). */
export function playerAuto(state: BattleState, ctx = new Ctx()) {
  if (state.winner || state.active !== 'player') return;
  rec(state, { t: 'auto' });
  aiDeploy(state, ctx, 'player');
}

/** LUTAR: as unidades agem, o inimigo joga e começa o próximo turno. */
export function playerEndTurn(state: BattleState): RecordedEvent[] {
  if (state.winner || state.active !== 'player') return [];
  rec(state, { t: 'end' });
  return endPlayerTurn(state, aiDeploy);
}

/** O que o aparelho informa no fim da partida. */
export interface MatchClaim {
  winner: Side | 'empate' | null;
  turn: number;
  playerHp: number;
  enemyHp: number;
}

export const claimOf = (state: BattleState): MatchClaim => ({ winner: state.winner, turn: state.turn, playerHp: state.heroes.player.hp, enemyHp: state.heroes.enemy.hp });

/** Refaz a partida a partir da gravação. `error` diz a primeira jogada que não vale (gravação adulterada). */
export function replayMatch(record: MatchRecord): { state: BattleState; error?: string } {
  const state = createBattle({ ...record.setup });
  for (let i = 0; i < record.actions.length; i++) {
    const a = record.actions[i];
    if (state.winner) return { state, error: `jogada ${i + 1} depois do fim da partida` };
    if (a.t === 'use') {
      const res = playerUse(state, a.hand, a.row, a.col);
      if (!res.ok) return { state, error: `jogada ${i + 1} inválida: ${res.reason}` };
    } else if (a.t === 'auto') playerAuto(state);
    else if (a.t === 'end') playerEndTurn(state);
    else return { state, error: `jogada ${i + 1} desconhecida` };
  }
  return { state };
}

/** Confere se a gravação, refeita, chega exatamente ao resultado informado. */
export function verifyMatch(record: MatchRecord, claim: MatchClaim): { ok: true } | { ok: false; reason: string } {
  let replay: ReturnType<typeof replayMatch>;
  try {
    replay = replayMatch(record);
  } catch (e) {
    return { ok: false, reason: `gravação inválida: ${(e as Error).message}` };
  }
  if (replay.error) return { ok: false, reason: replay.error };
  const real = claimOf(replay.state);
  for (const k of ['winner', 'turn', 'playerHp', 'enemyHp'] as const)
    if (real[k] !== claim[k]) return { ok: false, reason: `resultado não confere (${k}: informado ${claim[k]}, refeito ${real[k]})` };
  return { ok: true };
}
