import { getChar } from './characters';
import type { CharacterDef } from './types';

/*
 * v0.10 — CORES COM "+" NO LUGAR DAS ESTRELAS
 * O campo `stars` (1..6) continua existindo no código, mas agora significa a COR/TIER da carta:
 * 1 Comum (cinza) · 2 Incomum (verde) · 3 Raro (azul) · 4 Épico (roxo) · 5 Lendário (laranja) · 6 Mítico (vermelho).
 * Cada cor tem 2 degraus: base e "+" (`plus`). Ex.: Raro → Raro+ → Épico → Épico+ ...
 * - Habilidades e visual mudam só quando a COR muda (o "+" não mexe neles).
 * - O "+" dá um pequeno bônus de vida OU ataque, conforme o personagem (`plusStat`).
 * - A cor máxima do personagem também tem o "+" (último degrau).
 */

export const TIER_NAMES: Record<number, string> = { 1: 'Comum', 2: 'Incomum', 3: 'Raro', 4: 'Épico', 5: 'Lendário', 6: 'Mítico' };

/** Nome do degrau, ex.: "Raro" ou "Raro+" */
export function tierLabel(stars: number, plus = false): string {
  return `${TIER_NAMES[Math.max(1, Math.min(6, stars))]}${plus ? '+' : ''}`;
}

/** Índice do degrau (0 = Comum, 1 = Comum+, 2 = Incomum, ...) */
export function stepIndex(stars: number, plus = false): number {
  return (stars - 1) * 2 + (plus ? 1 : 0);
}

/**
 * Nível máximo de cada degrau: cor base = 10 × cor (igual ao antigo 10 × estrelas);
 * o "+" libera mais 5 níveis. Ex.: Comum 10 · Comum+ 15 · Incomum 20 · Incomum+ 25 · Raro 30 ...
 */
export function maxLevel(stars: number, plus = false): number {
  return stars * 10 + (plus ? 5 : 0);
}

/** Nível em que o degrau começa (de onde o degrau anterior parou). */
export function stepStartLevel(stars: number, plus = false): number {
  if (plus) return maxLevel(stars, false);
  return stars === 1 ? 1 : maxLevel(stars - 1, true);
}

/** Curva antiga (v0.9) de XP por nível: 80 × 1,12^(nível−1). */
export function baseXp(level: number): number {
  return Math.round(80 * Math.pow(1.12, level - 1));
}

const sumBase = (from: number, to: number) => {
  let s = 0;
  for (let l = from; l < to; l++) s += baseXp(l);
  return s;
};

/**
 * XP total de cada degrau (do início do degrau até o nível máximo dele).
 * - Cor base: o mesmo XP que uma cor inteira custava na v0.9 (ex.: Raro = níveis 20→30 da curva antiga).
 * - "+": 50% A MAIS que a cor base da mesma cor (Raro+ = 1,5 × Raro).
 */
export function stepXp(stars: number, plus = false): number {
  const colourCost = stars === 1 ? sumBase(1, 10) : sumBase(10 * (stars - 1), 10 * stars);
  return Math.round(colourCost * (plus ? 1.5 : 1));
}

/**
 * XP para sair do `level` para o próximo. Mantém o formato da curva antiga (cada nível pede mais),
 * escalado para que o degrau inteiro custe exatamente `stepXp`. Sem cor informada: curva antiga.
 */
export function xpToNext(level: number, stars?: number, plus = false): number {
  if (stars == null) return baseXp(level);
  const from = stepStartLevel(stars, plus);
  const to = maxLevel(stars, plus);
  const k = stepXp(stars, plus) / sumBase(from, to);
  return Math.max(1, Math.round(baseXp(level) * k));
}

/** Bônus do "+": +10% no status escolhido do personagem (mínimo +1). Não mexe em habilidades. */
export const PLUS_BONUS = 0.1;

export function statMultiplier(level: number, stars: number): number {
  return (1 + 0.08 * (level - 1)) * (1 + 0.15 * (stars - 1));
}

export function plusBonus(value: number): number {
  return Math.max(1, Math.round(value * PLUS_BONUS));
}

export function statsFor(def: CharacterDef, level: number, stars: number, plus = false): { atk: number; hp: number } {
  const m = statMultiplier(level, stars);
  const atk = Math.max(1, Math.round(def.atk * m));
  const hp = Math.max(1, Math.round(def.hp * m));
  if (!plus) return { atk, hp };
  return def.plusStat === 'atk' ? { atk: atk + plusBonus(atk), hp } : { atk, hp: hp + plusBonus(hp) };
}

export interface OwnedCard {
  charId: string;
  level: number;
  xp: number;
  stars: number;
  /** degrau "+" da cor atual */
  plus?: boolean;
}

export function newOwned(charId: string): OwnedCard {
  const def = getChar(charId);
  return { charId, level: 1, xp: 0, stars: def.minStars, plus: false };
}

export function cardMaxLevel(card: { stars: number; plus?: boolean }): number {
  return maxLevel(card.stars, !!card.plus);
}

export function cardXpToNext(card: { level: number; stars: number; plus?: boolean }): number {
  return xpToNext(card.level, card.stars, !!card.plus);
}

/** Progresso da barra (0..1) */
export function xpProgress(card: OwnedCard): number {
  if (card.level >= cardMaxLevel(card)) return 1;
  return card.xp / cardXpToNext(card);
}

/**
 * Alimenta XP no personagem. Ao encher 100% da barra sobe de nível e a
 * próxima barra é maior. Para no nível máximo do degrau atual.
 * Retorna quantos níveis subiu e quanto XP sobrou (desperdiçado no teto).
 */
export function feedXp(card: OwnedCard, amount: number): { levelsGained: number; wasted: number } {
  let levelsGained = 0;
  const cap = cardMaxLevel(card);
  if (card.level >= cap) return { levelsGained: 0, wasted: amount };
  card.xp += amount;
  while (card.level < cap && card.xp >= cardXpToNext(card)) {
    card.xp -= cardXpToNext(card);
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

/** Essências do Despertar: cor → cor+ custa 4 × cor; cor+ → próxima cor custa 50% a mais (6 × cor). */
export function ascendCostFor(stars: number, plus = false): number {
  return plus ? stars * 6 : stars * 4;
}

export function ascendCost(card: { stars: number; plus?: boolean }): number {
  return ascendCostFor(card.stars, !!card.plus);
}

/** Já está no último degrau (cor máxima com "+")? */
export function isMaxTier(card: { charId: string; stars: number; plus?: boolean }): boolean {
  return card.stars >= getChar(card.charId).maxStars && !!card.plus;
}

/** Próximo degrau do Despertar (ou null no topo). */
export function nextTier(card: { charId: string; stars: number; plus?: boolean }): { stars: number; plus: boolean } | null {
  if (isMaxTier(card)) return null;
  return card.plus ? { stars: card.stars + 1, plus: false } : { stars: card.stars, plus: true };
}

export function canAscend(card: OwnedCard): boolean {
  return !isMaxTier(card) && card.level >= cardMaxLevel(card);
}

/** Despertar: base → "+", ou "+" → próxima cor (exige nível máximo do degrau e essências). */
export function ascend(card: OwnedCard, essences: number): { ok: boolean; cost: number } {
  const cost = ascendCost(card);
  if (!canAscend(card) || essences < cost) return { ok: false, cost };
  if (card.plus) {
    card.stars++;
    card.plus = false;
  } else card.plus = true;
  return { ok: true, cost };
}

/**
 * v0.22.0 — 🔮 Orbes por raridade: o único item de XP (substituem o 📜 Pergaminho e o 💎 Cristal).
 * `rarity` = raridade (1 Comum … 6 Mítico), mostrada pela cor do Orbe.
 */
export const XP_ITEMS = [
  { id: 'orbe1', rarity: 1, name: 'Orbe Comum', xp: 100, icon: '🔮' },
  { id: 'orbe2', rarity: 2, name: 'Orbe Incomum', xp: 250, icon: '🔮' },
  { id: 'orbe3', rarity: 3, name: 'Orbe Raro', xp: 400, icon: '🔮' },
  { id: 'orbe4', rarity: 4, name: 'Orbe Épico', xp: 800, icon: '🔮' },
  { id: 'orbe5', rarity: 5, name: 'Orbe Lendário', xp: 1500, icon: '🔮' },
  { id: 'orbe6', rarity: 6, name: 'Orbe Mítico', xp: 3000, icon: '🔮' },
] as const;
export type XpItemId = (typeof XP_ITEMS)[number]['id'];
export type OrbBag = Partial<Record<XpItemId, number>>;
export const orbXp = (id: XpItemId) => XP_ITEMS.find((o) => o.id === id)!.xp;
/** XP total de um conjunto de Orbes */
export const bagXp = (bag: OrbBag) => Object.entries(bag).reduce((n, [id, k]) => n + orbXp(id as XpItemId) * (k ?? 0), 0);
/** v0.22.0: conversão sem perder XP — 📜 Pergaminho → Orbe Comum, 💎 Cristal → Orbe Raro, 🔮 antigo → Orbe Lendário */
export const LEGACY_ITEM_TO_ORB: Record<string, XpItemId> = { pergaminho: 'orbe1', cristal: 'orbe3', orbe: 'orbe5' };
/** XP por jogar (v0.22.0): todo o baralho ganha isto ao VENCER jogando a fase (derrota e Repetir não dão). */
export const playXp = (stageId: number) => 15 + 5 * stageId;
