import { getChar } from './characters';
import type { CharacterDef } from './types';

/*
 * v0.23.0 — CARTA SEM NÍVEL: RARIDADE + DEGRAU (base, "+", "++")
 * `stars` (1..6) = RARIDADE da carta: 1 Comum · 2 Incomum · 3 Raro · 4 Épico · 5 Lendário · 6 Mítico.
 * `plus` (0, 1, 2) = DEGRAU dentro da raridade: base → "+" → "++" → próxima raridade.
 * - Não existe mais nível numerado. Cada degrau tem só uma BARRA DE XP; com a barra cheia, o Despertar
 *   (Treinar) sobe o degrau gastando Essências ✴.
 * - Status: base × 1,17^índice, índice = (raridade − 1) × 3 + degrau. O XP NÃO aumenta status.
 * - Habilidades e visual mudam com a RARIDADE; algumas habilidades ganham +1 a partir de um degrau
 *   (antes: a partir de um nível — ver abilities.ts).
 * - Até a v0.22.0: nível 1..60 (8% por nível), cor +15% e "+" +10% (veja o REGRAS.md).
 */

export const TIER_NAMES: Record<number, string> = { 1: 'Comum', 2: 'Incomum', 3: 'Raro', 4: 'Épico', 5: 'Lendário', 6: 'Mítico' };

/** Degraus por raridade (base, "+", "++") */
export const STEPS_PER_RARITY = 3;
export const MAX_STEP = STEPS_PER_RARITY - 1;

/** Degrau (0, 1 ou 2) de uma carta; aceita o "+" antigo (true = 1) de saves e baralhos antigos. */
export function stepOf(c: { plus?: number | boolean } | undefined): number {
  const p = c?.plus;
  if (p === true) return 1;
  if (typeof p !== 'number' || !Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(MAX_STEP, Math.floor(p)));
}

/** Nome do degrau, ex.: "Raro", "Raro+" ou "Raro++" */
export function tierLabel(stars: number, step: number = 0): string {
  return `${TIER_NAMES[Math.max(1, Math.min(6, stars))]}${'+'.repeat(Math.max(0, Math.min(MAX_STEP, step)))}`;
}

/** Índice global do degrau (0 = Comum, 1 = Comum+, 2 = Comum++, 3 = Incomum, ...) */
export function stepIndex(stars: number, step = 0): number {
  return (stars - 1) * STEPS_PER_RARITY + Math.max(0, Math.min(MAX_STEP, step));
}
/** Raridade e degrau a partir do índice global */
export const fromStepIndex = (i: number) => ({ stars: Math.floor(i / STEPS_PER_RARITY) + 1, plus: i % STEPS_PER_RARITY });

/** Crescimento de ataque e vida por degrau (v0.23.0): Mítico base ≈ 10,5× o Comum base. */
export const STEP_GROWTH = 1.17;

export function statMultiplier(stars: number, step = 0): number {
  return Math.pow(STEP_GROWTH, stepIndex(stars, step));
}

export function statsFor(def: CharacterDef, stars: number, step = 0): { atk: number; hp: number } {
  const m = statMultiplier(stars, step);
  return { atk: Math.max(1, Math.round(def.atk * m)), hp: Math.max(1, Math.round(def.hp * m)) };
}

/** Curva antiga (v0.9) de XP por nível: 80 × 1,12^(nível−1). Usada só para medir o tamanho das barras. */
export function baseXp(level: number): number {
  return Math.round(80 * Math.pow(1.12, level - 1));
}
const sumBase = (from: number, to: number) => {
  let s = 0;
  for (let l = from; l < to; l++) s += baseXp(l);
  return s;
};
/** XP que a raridade base custava até a v0.22.0 (Raro = níveis 20→30 da curva antiga, etc.). */
const rarityBaseXp = (stars: number) => (stars === 1 ? sumBase(1, 10) : sumBase(10 * (stars - 1), 10 * stars));
/** v0.23.0: tamanho de cada barra (base 1 · "+" 1,25 · "++" 1,5 × o custo da raridade base). Usado só para converter saves da v0.23. */
export const STEP_BAR_V23 = [1, 1.25, 1.5];
/** v0.24.0: proporção das barras — subir para "+" = 30%, para "++" = 60% e o Despertar (nova raridade) = 100% (ex.: 3 / 6 / 10). */
export const STEP_BAR_RATIO = [0.3, 0.6, 1];
/**
 * Tamanho de cada barra em relação ao custo da raridade base. O XP TOTAL de uma raridade continua o da v0.23.0
 * (3,75 × a barra base), só redistribuído na proporção 3 / 6 / 10.
 */
export const STEP_BAR = STEP_BAR_RATIO.map((r) => (r * STEP_BAR_V23.reduce((a, b) => a + b, 0)) / STEP_BAR_RATIO.reduce((a, b) => a + b, 0));

/** XP para encher a barra do degrau (a barra cheia libera o Despertar seguinte; o XP não muda os status). */
export function stepXp(stars: number, step = 0): number {
  return Math.round(rarityBaseXp(stars) * STEP_BAR[Math.max(0, Math.min(MAX_STEP, step))]);
}

/** v0.24.0: converte a barra de uma carta da v0.23.0 mantendo a MESMA fração de progresso no degrau. */
export function migrateBarV24(card: OwnedCard): OwnedCard {
  if (isMaxTier(card)) return { ...card, xp: 0 };
  const step = stepOf(card);
  const oldBar = Math.round(rarityBaseXp(card.stars) * STEP_BAR_V23[step]);
  const frac = Math.max(0, Math.min(1, card.xp / oldBar));
  return { ...card, xp: frac >= 1 ? cardBarXp(card) : Math.round(frac * cardBarXp(card)) };
}

export interface OwnedCard {
  charId: string;
  /** XP na barra do degrau atual (0 … stepXp) */
  xp: number;
  /** raridade (1 Comum … 6 Mítico) */
  stars: number;
  /** degrau na raridade: 0 base, 1 "+", 2 "++" */
  plus: number;
}

export function newOwned(charId: string): OwnedCard {
  const def = getChar(charId);
  return { charId, xp: 0, stars: def.minStars, plus: 0 };
}

export function cardBarXp(card: { stars: number; plus?: number | boolean }): number {
  return stepXp(card.stars, stepOf(card));
}

/** Progresso da barra (0..1); no topo, 1 */
export function xpProgress(card: OwnedCard): number {
  if (isMaxTier(card)) return 1;
  return Math.min(1, card.xp / cardBarXp(card));
}

/** A barra do degrau está cheia? */
export const barFull = (card: OwnedCard) => !isMaxTier(card) && card.xp >= cardBarXp(card);

/**
 * Alimenta XP no personagem. A barra enche até o tamanho do degrau; o que passar do cheio é perdido
 * (para não guardar XP sobrando). No topo (raridade máxima "++") todo XP é perdido.
 */
export function feedXp(card: OwnedCard, amount: number): { filled: boolean; wasted: number } {
  if (isMaxTier(card)) return { filled: false, wasted: amount };
  const cap = cardBarXp(card);
  const was = card.xp >= cap;
  const total = card.xp + Math.max(0, amount);
  card.xp = Math.min(cap, total);
  return { filled: !was && card.xp >= cap, wasted: Math.max(0, total - cap) };
}

/** Essências do Despertar: base → "+" = 4 × raridade · "+" → "++" = 5 × raridade · "++" → próxima raridade = 6 × raridade. */
export function ascendCostFor(stars: number, step = 0): number {
  return stars * (4 + Math.max(0, Math.min(MAX_STEP, step)));
}

export function ascendCost(card: { stars: number; plus?: number | boolean }): number {
  return ascendCostFor(card.stars, stepOf(card));
}

/** Já está no último degrau (raridade máxima com "++")? */
export function isMaxTier(card: { charId: string; stars: number; plus?: number | boolean }): boolean {
  return card.stars >= getChar(card.charId).maxStars && stepOf(card) >= MAX_STEP;
}

/** Próximo degrau do Despertar (ou null no topo). */
export function nextTier(card: { charId: string; stars: number; plus?: number | boolean }): { stars: number; plus: number } | null {
  if (isMaxTier(card)) return null;
  const st = stepOf(card);
  return st < MAX_STEP ? { stars: card.stars, plus: st + 1 } : { stars: card.stars + 1, plus: 0 };
}

export function canAscend(card: OwnedCard): boolean {
  return barFull(card);
}

/** Despertar: sobe 1 degrau (base → "+" → "++" → próxima raridade). Exige a barra cheia e as Essências; a barra zera. */
export function ascend(card: OwnedCard, essences: number): { ok: boolean; cost: number } {
  const cost = ascendCost(card);
  if (!canAscend(card) || essences < cost) return { ok: false, cost };
  const nt = nextTier(card)!;
  card.stars = nt.stars;
  card.plus = nt.plus;
  card.xp = 0;
  return { ok: true, cost };
}

/**
 * v0.23.0 — conversão de uma carta antiga (nível + "+" booleano) para degrau + barra.
 * Mesma raridade e mesmo degrau ("+" antigo = "+"); a barra fica com a mesma FRAÇÃO de progresso que a carta
 * tinha no degrau antigo (níveis já subidos nele + XP atual). Carta antiga no nível máximo do degrau = barra cheia.
 */
export function migrateOldCard(old: { charId: string; level?: number; xp?: number; stars: number; plus?: number | boolean }): OwnedCard {
  const def = getChar(old.charId);
  const stars = Math.max(def.minStars, Math.min(def.maxStars, Math.floor(old.stars) || def.minStars));
  const step = stepOf(old);
  const card: OwnedCard = { charId: old.charId, xp: 0, stars, plus: step };
  if (typeof old.level === 'number' && step <= 1) {
    const plus = step === 1;
    const from = plus ? stars * 10 : stars === 1 ? 1 : (stars - 1) * 10 + 5;
    const to = stars * 10 + (plus ? 5 : 0);
    const lv = Math.max(from, Math.min(to, Math.floor(old.level)));
    const total = sumBase(from, to);
    const k = (plus ? 1.5 : 1) * rarityBaseXp(stars) / total; // escala da curva antiga do degrau
    let done = sumBase(from, lv) * k + (lv < to ? Math.max(0, old.xp ?? 0) : 0);
    if (lv >= to) done = total * k;
    const frac = Math.max(0, Math.min(1, done / (total * k)));
    card.xp = isMaxTier(card) ? 0 : Math.round(frac * cardBarXp(card));
  } else card.xp = Math.max(0, Math.min(cardBarXp(card), Math.floor(old.xp ?? 0)));
  return card;
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
