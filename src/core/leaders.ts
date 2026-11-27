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
/** v0.62.0 (balanceamento v2.0, escala enxuta): até a v0.61.0 era 20 → 110 (+10 por nível). */
/** v0.70.0: 30 níveis, de 20 a 64 em passos de ~1,5 (até a v0.69: 10 níveis — 20, 26, 32, 38, 44, 48, 52, 56, 60, 64). */
export const LEADER_LEVELS = 30;
export const LEADER_HP = Array.from({ length: LEADER_LEVELS }, (_, i) => Math.round(20 + (44 * i) / (LEADER_LEVELS - 1)));
/**
 * Poder do baralho necessário para CHEGAR a cada nível (índice 0 = nível 1 = 0).
 * v0.70.0 (30 níveis): níveis 2–20 acompanham a campanha (Poder típico do simulador ao longo das 300 fases, mediana de
 * 4 jogadores, ×0,85 e suavizado — o jogador real é menos eficiente que o simulado); quem zera o Difícil fica perto do 20. Níveis 21–30 são o fim de jogo:
 * sobem em progressão geométrica até o nível 30 = Poder do baralho máximo (4785 na v0.70.0, quando cada personagem contava uma vez).
 * v0.71.0: cada cópia conta no Poder (cada uma com a sua cor) — requisitos medidos de novo; nível 30 = o baralho de 40 cartas
 * mais forte possível (13 personagens × 3 cópias + 1, todos no máximo ++) = 6075.
 * Até a v0.69 (10 níveis): 0, 120, 125, 145, 150, 155, 180, 185, 190, 215.
 */
export const LEADER_THRESHOLDS = [0, 520, 560, 610, 665, 780, 890, 1005, 1055, 1125, 1190, 1460, 1525, 1645, 1765, 2015, 2195, 2300, 2580, 2770, 2995, 3240, 3505, 3790, 4100, 4435, 4800, 5190, 5615, 6075];

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

/** v0.70.0: o nível mais alto que o Poder do baralho alcança agora (nunca abaixo do atual). Um toque sobe tudo. */
export function reachableLevel(def: LeaderDef, level: number, deckPower: number): number {
  let l = Math.max(1, Math.floor(level) || 1);
  while (canEvolve(def, l, deckPower)) l++;
  return l;
}
