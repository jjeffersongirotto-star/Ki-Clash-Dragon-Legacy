/**
 * v0.73.0 — 🗼 TORRE (lógica pura, sem DOM). Pedido do jogador: um modo para juntar recursos além da campanha,
 * no estilo das torres de outros jogos do tipo (andares cada vez mais difíceis, prêmio só na primeira vitória).
 *
 * - 100 andares em fila: só dá para lutar no próximo andar ainda não vencido.
 * - **Grátis**: não gasta energia nem o limite do dia; dá para tentar quantas vezes quiser.
 * - Abre depois de vencer a Fácil 10 (fim da região 1).
 * - Força do andar k: a da Normal (k + TOWER_OFFSET) + `TOWER_BONUS` degraus — um pouco à frente da Normal, para ser
 *   um desafio que melhora quando o baralho melhora. A cada 10 andares, um **chefe**: +1 degrau e +50% de vida.
 * - Prêmio (só na primeira vitória de cada andar): Ouro, Essências e Orbes da Normal equivalente (em dobro, como uma
 *   primeira vitória) e os 3 itens dela; a cada 5 andares +3 itens; a cada 10 (chefe) 💠 Gemas.
 */
import { hardDeckIds, hardStageAt, ladderStep, rewardsFor, type StageReward } from './adventure';
import { goldFor, profileXpFor } from './profile';
import { stageGearDrop } from './gear';
import type { Stage } from './campaign';

export const TOWER_FLOORS = 100;
/** andar k = Normal (k + 2): logo depois da Fácil 10 o jogador está perto da Normal 3 */
export const TOWER_OFFSET = 2;
export const TOWER_BONUS = 0.3;
export const TOWER_BOSS_BONUS = 1;
export const TOWER_BOSS_HP = 1.5;
/** 💠 Gemas no andar de chefe (a cada 10) */
export const TOWER_BOSS_GEMS = 2;
/** vencer esta fase do Fácil abre a Torre */
export const TOWER_UNLOCK_STAGE = 10;

export const isBossFloor = (floor: number) => floor % 10 === 0;
/** a fase da Normal que o andar usa de base (baralho, vida, recompensas) */
export const towerBase = (floor: number) => Math.min(100, Math.max(1, floor + TOWER_OFFSET));
/** degrau das cartas inimigas do andar */
export const towerStep = (floor: number) => Math.min(17.99, ladderStep('normal', towerBase(floor)) + TOWER_BONUS + (isBossFloor(floor) ? TOWER_BOSS_BONUS : 0));

/** A batalha do andar. `id` 0: sem "Fase N" no título; o Comandante é o mais forte do baralho. */
export function towerStage(floor: number): Stage {
  const f = Math.max(1, Math.min(TOWER_FLOORS, Math.floor(floor)));
  const base = hardStageAt(towerBase(f), 'normal', towerStep(f), hardDeckIds('normal', Math.min(100, towerBase(f) + 1)));
  const boss = isBossFloor(f);
  return { ...base, id: 0, name: `Torre · Andar ${f}${boss ? ' (chefe)' : ''}`, enemyHeroHp: Math.round(base.enemyHeroHp * (boss ? TOWER_BOSS_HP : 1)), aiLevel: Math.min(3, (base.aiLevel ?? 0) + (boss ? 1 : 0)) };
}

export interface TowerReward extends StageReward {
  gold: number;
  profileXp: number;
  gems: number;
}
/** Prêmio da primeira vitória do andar. */
export function towerReward(floor: number, rng: () => number = Math.random): TowerReward {
  const b = towerBase(floor);
  const r = rewardsFor(b, 'normal', rng);
  const gear = [...r.gear];
  if (floor % 5 === 0) gear.push(...stageGearDrop(b, 'normal', rng));
  const orbs = Object.fromEntries(Object.entries(r.orbs).map(([k, n]) => [k, (n ?? 0) * 2]));
  return { essencias: r.essencias * 2, orbs, gear, gold: goldFor(b, 'normal') * 2, profileXp: profileXpFor(b, 'normal'), gems: isBossFloor(floor) ? TOWER_BOSS_GEMS : 0 };
}

/** Progresso salvo: o maior andar vencido (0 = nenhum). */
export interface TowerState {
  best: number;
}
export const normalizeTower = (v: unknown): TowerState => {
  const b = Math.floor(Number((v as TowerState | undefined)?.best));
  return { best: Number.isFinite(b) ? Math.max(0, Math.min(TOWER_FLOORS, b)) : 0 };
};
/** o andar em que dá para lutar agora (null = Torre completa) */
export const towerNext = (t: TowerState | undefined) => ((t?.best ?? 0) < TOWER_FLOORS ? (t?.best ?? 0) + 1 : null);
export const towerUnlocked = (cleared: number[]) => cleared.includes(TOWER_UNLOCK_STAGE);
