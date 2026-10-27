/**
 * v0.27.0 — 🎴 Banner de cartas e cópias repetidas (lógica pura, sem DOM).
 *
 * - Cada banner é um dado em BANNERS (nome, destaque, preços, chances). Para um banner novo (cartas ou fases
 *   futuras), basta acrescentar uma entrada.
 * - Comprar 1 carta ou 10 cartas (10 = preço de 9). No pacote de 10, pelo menos 1 carta Rara ou melhor.
 * - Cada carta sorteia primeiro a RARIDADE (chances do banner) e depois um personagem que pode estar nessa
 *   raridade (raridade inicial ≤ sorteada ≤ raridade máxima). Ele vem NESSA raridade, no degrau base.
 *   No Lendário, metade das vezes sai um personagem em destaque (Kenji ou Vorax, que só saem no banner).
 * - Cópia repetida (banner ou pacote de fase): vira XP do personagem que você já tem. XP = Orbe da raridade da
 *   carta convertida (Comum 100 … Mítico 3.000) + 20% por "+" dela, multiplicado pela sorte:
 *   12% ×2 · 5% ×5 · 1% ×10 (senão ×1). A carta repetida não sobe a raridade da sua, mesmo se vier mais rara.
 */
import { PLAYABLE } from './characters';
import { feedXp, newOwned, orbXp, type OwnedCard, type XpItemId } from './progression';

export interface Banner {
  id: string;
  name: string;
  subtitle: string;
  /** personagens em destaque (arte grande); os que estão em `exclusive` só saem neste tipo de banner */
  featured: string[];
  /** chance de, numa carta da raridade `featuredRarity`, sair um dos `featured` */
  featuredShare: number;
  featuredRarity: number;
  price1: number;
  price10: number;
  /** chance de cada raridade por carta (soma 1) */
  odds: Record<number, number>;
  /** no pacote de 10, pelo menos 1 carta desta raridade ou melhor */
  guarantee10: number;
}

/** Personagens que só saem em banner (não vêm em pacote de fase nem no começo). */
export const BANNER_EXCLUSIVE = ['kenji', 'vorax'];

export const BANNERS: Banner[] = [
  {
    id: 'despertar-dragao',
    name: 'Despertar do Dragão',
    subtitle: 'Kenji e Vorax em destaque',
    featured: ['kenji', 'vorax'],
    featuredShare: 0.5,
    featuredRarity: 5,
    price1: 300,
    price10: 2700,
    odds: { 1: 0.4, 2: 0.27, 3: 0.2, 4: 0.1, 5: 0.03 },
    guarantee10: 3,
  },
];

export interface PulledCard {
  charId: string;
  stars: number;
}

/** Sorteia uma raridade pelas chances (só entre as raridades ≥ `min`, renormalizadas). */
export function rollRarity(odds: Record<number, number>, rng: () => number, min = 1): number {
  const tiers = Object.keys(odds).map(Number).filter((r) => r >= min).sort((a, b) => a - b);
  const total = tiers.reduce((s, r) => s + odds[r], 0);
  let x = rng() * total;
  for (const r of tiers) if ((x -= odds[r]) < 0) return r;
  return tiers[tiers.length - 1];
}

/** Personagens que podem sair numa raridade (raridade inicial ≤ r ≤ máxima). */
export const poolFor = (r: number) => PLAYABLE.filter((c) => c.minStars <= r && r <= c.maxStars).map((c) => c.id);

/** Uma carta do banner na raridade `r`. */
export function drawAt(b: Banner, r: number, rng: () => number): PulledCard {
  const pool = poolFor(r);
  const feat = b.featured.filter((id) => pool.includes(id));
  const rest = pool.filter((id) => !b.featured.includes(id));
  const pick = (ids: string[]) => ids[Math.floor(rng() * ids.length) % ids.length];
  if (r === b.featuredRarity && feat.length && (!rest.length || rng() < b.featuredShare)) return { charId: pick(feat), stars: r };
  return { charId: pick(rest.length ? rest : pool), stars: r };
}

/** Compra `n` cartas (1 ou 10). No pacote de 10 garante uma carta de `guarantee10` ou melhor. */
export function pull(b: Banner, n: 1 | 10, rng: () => number = Math.random): PulledCard[] {
  const out: PulledCard[] = [];
  for (let i = 0; i < n; i++) out.push(drawAt(b, rollRarity(b.odds, rng), rng));
  if (n === 10 && !out.some((c) => c.stars >= b.guarantee10)) out[n - 1] = drawAt(b, rollRarity(b.odds, rng, b.guarantee10), rng);
  return out;
}

export const bannerPrice = (b: Banner, n: 1 | 10) => (n === 10 ? b.price10 : b.price1);

// ---------- cópias repetidas ----------

/** Sorte da cópia: [chance, multiplicador]. */
export const DUP_LUCK: [number, number][] = [
  [0.01, 10],
  [0.05, 5],
  [0.12, 2],
];
export const DUP_PLUS_BONUS = 0.2;

/** Multiplicador sorteado para uma cópia (1, 2, 5 ou 10). */
export function dupMultiplier(rng: () => number): number {
  let x = rng();
  for (const [p, m] of DUP_LUCK) if ((x -= p) < 0) return m;
  return 1;
}

/** XP base da cópia: Orbe da raridade da carta convertida + 20% por "+". */
export const dupBaseXp = (stars: number, plus = 0) => Math.round(orbXp(`orbe${Math.min(6, Math.max(1, stars))}` as XpItemId) * (1 + DUP_PLUS_BONUS * plus));

export type GrantResult = { charId: string; stars: number; isNew: true } | { charId: string; stars: number; isNew: false; xp: number; mult: number; wasted: number; filled: boolean };

/**
 * Entrega uma carta (banner ou pacote): personagem novo entra na coleção na raridade da carta;
 * repetido vira XP no que você já tem.
 */
export function grantCard(cards: Record<string, OwnedCard>, card: { charId: string; stars: number; plus?: number }, rng: () => number = Math.random): GrantResult {
  const owned = cards[card.charId];
  if (!owned) {
    cards[card.charId] = { ...newOwned(card.charId), stars: card.stars, plus: 0 };
    return { charId: card.charId, stars: card.stars, isNew: true };
  }
  const mult = dupMultiplier(rng);
  const xp = dupBaseXp(card.stars, card.plus ?? 0) * mult;
  const r = feedXp(owned, xp);
  return { charId: card.charId, stars: card.stars, isNew: false, xp, mult, wasted: r.wasted, filled: r.filled };
}
