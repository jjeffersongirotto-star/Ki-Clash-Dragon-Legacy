import { getChar } from './characters';
import type { CharacterDef } from './types';

/** Nível máximo permitido por quantidade de estrelas */
export function maxLevel(stars: number): number {
  return stars * 10;
}

/** XP necessária para sair do nível `level` para o próximo (cresce a cada nível) */
export function xpToNext(level: number): number {
  return Math.round(80 * Math.pow(1.12, level - 1));
}

export function statMultiplier(level: number, stars: number): number {
  return (1 + 0.08 * (level - 1)) * (1 + 0.15 * (stars - 1));
}

export function statsFor(def: CharacterDef, level: number, stars: number): { atk: number; hp: number } {
  const m = statMultiplier(level, stars);
  return { atk: Math.max(1, Math.round(def.atk * m)), hp: Math.max(1, Math.round(def.hp * m)) };
}

export interface OwnedCard {
  charId: string;
  level: number;
  xp: number;
  stars: number;
}

export function newOwned(charId: string): OwnedCard {
  const def = getChar(charId);
  return { charId, level: 1, xp: 0, stars: def.minStars };
}

/** Progresso da barra (0..1) */
export function xpProgress(card: OwnedCard): number {
  if (card.level >= maxLevel(card.stars)) return 1;
  return card.xp / xpToNext(card.level);
}

/**
 * Alimenta XP no personagem. Ao encher 100% da barra sobe de nível e a
 * próxima barra é maior. Para no nível máximo das estrelas atuais.
 * Retorna quantos níveis subiu e quanto XP sobrou (desperdiçado no teto).
 */
export function feedXp(card: OwnedCard, amount: number): { levelsGained: number; wasted: number } {
  let levelsGained = 0;
  const cap = maxLevel(card.stars);
  if (card.level >= cap) return { levelsGained: 0, wasted: amount };
  card.xp += amount;
  while (card.level < cap && card.xp >= xpToNext(card.level)) {
    card.xp -= xpToNext(card.level);
    card.level++;
    levelsGained++;
  }
  let wasted = 0;
  if (card.level >= cap) {
    wasted = card.xp;
    card.xp = 0;
  }
  return { levelsGained, wasted };
}

export function ascendCost(card: OwnedCard): number {
  return card.stars * 4;
}

export function canAscend(card: OwnedCard): boolean {
  const def = getChar(card.charId);
  return card.stars < def.maxStars && card.level >= maxLevel(card.stars);
}

/** Despertar: +1 estrela (exige nível máximo e essências). */
export function ascend(card: OwnedCard, essences: number): { ok: boolean; cost: number } {
  const cost = ascendCost(card);
  if (!canAscend(card) || essences < cost) return { ok: false, cost };
  card.stars++;
  return { ok: true, cost };
}

export const XP_ITEMS = [
  { id: 'pergaminho', name: 'Pergaminho de Ki', xp: 100, icon: '📜' },
  { id: 'cristal', name: 'Cristal de Ki', xp: 400, icon: '💎' },
  { id: 'orbe', name: 'Orbe do Dragão Ancestral', xp: 1500, icon: '🔮' },
] as const;
export type XpItemId = (typeof XP_ITEMS)[number]['id'];
