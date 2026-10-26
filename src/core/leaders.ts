/**
 * v0.13.0 — COMANDANTES (Comandante principal).
 *
 * O Comandante sobe de nível quando o PODER DO BARALHO (soma das 10 cartas da equipe) alcança o requisito
 * do próximo nível. O Poder só é conferido NA HORA de evoluir: depois, trocar cartas e baixar o Poder
 * nunca tira o nível do Comandante. Evoluir é grátis (a "trava" é o Poder do baralho).
 *
 * Cada nível dá +10 de vida máxima (20 → 110). A curva foi escolhida no simulador
 * (scripts/balance/schedules.ts): comparadas +5/nível, +10/nível e passos crescentes (+3/+5/+10),
 * só a de +10 elimina o "one-shot" (nenhum turno inimigo tira 100% da vida) em todas as fases.
 * Para a campanha continuar difícil, o Comandante inimigo ganha metade desse acréscimo por fase
 * (enemyLeaderHp em campaign.ts).
 *
 * Preparado para vários Comandantes (1 por categoria, cada um com habilidades que também evoluem):
 * por enquanto só o Bárbaro está disponível.
 */
import type { Category } from './types';

/** Vida máxima do Comandante por nível (índice 0 = nível 1). */
export const LEADER_HP = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
/**
 * Poder do baralho necessário para CHEGAR a cada nível (índice 0 = nível 1 = 0).
 * ≈ Poder típico com que o jogador chega na fase de mesmo número (mediana do simulador).
 */
/** v0.23.0: recalibrado para o Poder sem nível (até a v0.22.0: 0, 480, 510, 560, 610, 660, 760, 840, 930, 980). */
export const LEADER_THRESHOLDS = [0, 420, 440, 470, 520, 590, 670, 690, 800, 820];

/** Habilidade especial do Comandante (reservado: os Comandantes futuros terão habilidades que evoluem por nível). */
export interface LeaderAbility {
  id: string;
  name: string;
  description: string;
}

export interface LeaderDef {
  id: string;
  name: string;
  title: string;
  category: Category;
  /** chave da arte (ver art.ts) */
  art: 'barbaro';
  hpByLevel: number[];
  thresholds: number[];
  abilities: LeaderAbility[];
  available: boolean;
}

export const LEADERS: LeaderDef[] = [
  { id: 'barbaro', name: 'Bárbaro', title: 'Comandante Aliado', category: 'dps', art: 'barbaro', hpByLevel: LEADER_HP, thresholds: LEADER_THRESHOLDS, abilities: [], available: true },
];
export const DEFAULT_LEADER = 'barbaro';

export function getLeader(id: string | undefined): LeaderDef {
  return LEADERS.find((l) => l.id === id && l.available) ?? LEADERS[0];
}

export function leaderMaxLevel(def: LeaderDef): number {
  return def.hpByLevel.length;
}

export function leaderHp(def: LeaderDef, level: number): number {
  const l = Math.max(1, Math.min(leaderMaxLevel(def), Math.floor(level) || 1));
  return def.hpByLevel[l - 1];
}

/** Poder necessário para o próximo nível (null no nível máximo). */
export function nextRequirement(def: LeaderDef, level: number): number | null {
  return level >= leaderMaxLevel(def) ? null : def.thresholds[level];
}

export function canEvolve(def: LeaderDef, level: number, deckPower: number): boolean {
  const req = nextRequirement(def, level);
  return req != null && deckPower >= req;
}

/**
 * Evolui 1 nível se o Poder do baralho alcança o requisito. Nunca diminui o nível.
 * Retorna o nível resultante (igual ao anterior se não pôde evoluir).
 */
export function evolveLeader(def: LeaderDef, level: number, deckPower: number): { ok: boolean; level: number } {
  const cur = Math.max(1, Math.floor(level) || 1);
  if (!canEvolve(def, cur, deckPower)) return { ok: false, level: cur };
  return { ok: true, level: cur + 1 };
}
