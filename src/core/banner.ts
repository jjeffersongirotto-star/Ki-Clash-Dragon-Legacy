/**
 * v0.27.0 — 🎴 Banner de cartas e cópias repetidas (lógica pura, sem DOM).
 *
 * - Cada banner é um dado em BANNERS (nome, destaque, preços, chances). Para um banner novo (cartas ou fases
 *   futuras), basta acrescentar uma entrada.
 * - Comprar 1 carta ou 10 cartas (10 = preço de 9). No pacote de 10, pelo menos 1 carta Rara ou melhor
 *   (v0.31.0: Épica ou melhor). v0.31.0: a cada 80 cartas compradas (contador por conta), 1 Lendária ou melhor
 *   garantida; o contador volta a 0 sempre que sai uma Lendária ou Mítica.
 * - Cada carta sorteia primeiro a RARIDADE (chances do banner) e depois um personagem que pode estar nessa
 *   raridade (raridade inicial ≤ sorteada ≤ raridade máxima). Ele vem NESSA raridade, no degrau base.
 *   No Lendário, metade das vezes sai um personagem em destaque (Kenji ou Vorax, que só saem no banner).
 * - Cópia repetida (v0.32.0): fica guardada no inventário (mais 1 cópia do personagem). Em Desmanchar, ela vira
 *   XP do próprio personagem (Orbe da raridade da cópia, Comum 100 … Mítico 3.000, + 20% por "+", × sorte
 *   12% ×2 · 5% ×5 · 1% ×10) ou, no modo geral, 25% desse XP guardado como Orbes. A cópia não sobe a raridade.
 */
import { PLAYABLE } from './characters';
import { XP_ITEMS, feedXp, newOwned, orbXp, type OrbBag, type OwnedCard, type XpItemId } from './progression';

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
    // v0.31.0: Comum 25 · Incomum 30 · Raro 25 · Épico 15 · Lendário 4 · Mítico 1 (pedido do jogador)
    odds: { 1: 0.25, 2: 0.3, 3: 0.25, 4: 0.15, 5: 0.04, 6: 0.01 },
    guarantee10: 4,
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

/** v0.31.0: garantia por quantidade — a cada PITY_EVERY cartas, uma Lendária (raridade PITY_RARITY) ou melhor. */
export const PITY_EVERY = 80;
export const PITY_RARITY = 5;

/** Contador da garantia (cartas compradas desde a última Lendária ou Mítica), por banner. */
export type PityState = Record<string, number>;

/**
 * Compra `n` cartas (1 ou 10). No pacote de 10 garante uma carta de `guarantee10` ou melhor.
 * v0.31.0: com `pity`, a 80ª carta sem Lendária vem Lendária ou melhor; sair Lendária/Mítica zera o contador.
 */
export function pull(b: Banner, n: 1 | 10, rng: () => number = Math.random, pity?: PityState): PulledCard[] {
  const out: PulledCard[] = [];
  let count = pity?.[b.id] ?? 0;
  for (let i = 0; i < n; i++) {
    count++;
    const min = pity && count >= PITY_EVERY ? PITY_RARITY : 1;
    const c = drawAt(b, rollRarity(b.odds, rng, min), rng);
    if (c.stars >= PITY_RARITY) count = 0;
    out.push(c);
  }
  if (n === 10 && !out.some((c) => c.stars >= b.guarantee10)) {
    out[n - 1] = drawAt(b, rollRarity(b.odds, rng, b.guarantee10), rng);
    if (out[n - 1].stars >= PITY_RARITY) count = 0;
  }
  if (pity) pity[b.id] = count;
  return out;
}

/** Quantas cartas já contam para a próxima Lendária garantida (0 a 79). */
export const pityCount = (b: Banner, pity?: PityState) => pity?.[b.id] ?? 0;

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

/** v0.28.3: parte do XP de cópia que passa da barra cheia e volta como Orbes. */
export const DUP_OVERFLOW_REFUND = 0.25;

/**
 * v0.28.3: converte XP em Orbes, do maior para o menor (Mítico 3.000 … Comum 100).
 * O resto abaixo de 100 XP é descartado (arredonda para baixo).
 */
export function xpToOrbs(xp: number): OrbBag {
  const bag: OrbBag = {};
  let left = Math.max(0, Math.floor(xp));
  for (const o of [...XP_ITEMS].reverse()) {
    const k = Math.floor(left / o.xp);
    if (k > 0) {
      bag[o.id] = k;
      left -= k * o.xp;
    }
  }
  return bag;
}

/** v0.28.3: Orbes devolvidos por uma cópia cujo XP passou da barra cheia (25% do XP que passou). */
export const overflowRefund = (wasted: number): OrbBag => xpToOrbs(wasted * DUP_OVERFLOW_REFUND);

// ---------- v0.32.0: cópias guardadas e Desmanchar ----------

/**
 * Cópias repetidas guardadas no inventário: personagem → raridade da carta → quantidade.
 * O personagem que você tem conta como 1 cópia; cada repetida guardada soma mais 1.
 */
export type Dupes = Record<string, Record<number, number>>;

export const dupeCount = (d: Dupes | undefined, id: string) => Object.values(d?.[id] ?? {}).reduce((a, k) => a + (k ?? 0), 0);
/** Cópias que você tem do personagem (0 se não tem; 1 + as repetidas guardadas). */
export const totalCopies = (cards: Record<string, OwnedCard>, d: Dupes | undefined, id: string) => (cards[id] ? 1 + dupeCount(d, id) : 0);
export function addDupe(d: Dupes, id: string, stars: number, n = 1) {
  const row = (d[id] ??= {});
  row[stars] = (row[stars] ?? 0) + n;
}
/** Tira 1 cópia guardada da raridade `stars`. Retorna false se não houver. */
export function takeDupe(d: Dupes, id: string, stars: number): boolean {
  const row = d[id];
  if (!row || !(row[stars] > 0)) return false;
  if (--row[stars] <= 0) delete row[stars];
  if (!Object.keys(row).length) delete d[id];
  return true;
}
/**
 * Cópias que podem ser desmanchadas: as guardadas, menos as que o baralho usa
 * (o personagem nunca fica sem a última cópia, e o baralho nunca perde cópias).
 */
export const spareCopies = (d: Dupes | undefined, id: string, deckCopies: number) => Math.max(0, dupeCount(d, id) - Math.max(0, deckCopies - 1));

export interface CopyXp {
  xp: number;
  mult: number;
  wasted: number;
  filled: boolean;
  refund: OrbBag;
}
/**
 * Desmanchar DIRECIONADO: a cópia vira XP do próprio personagem (Orbe da raridade da cópia + 20% por "+",
 * × sorte 12% ×2 · 5% ×5 · 1% ×10). 25% do XP que passar da barra cheia volta como Orbes (somados em `items`).
 */
export function feedCopy(owned: OwnedCard, stars: number, plus: number, rng: () => number = Math.random, items?: Partial<Record<XpItemId, number>>): CopyXp {
  const mult = dupMultiplier(rng);
  const xp = dupBaseXp(stars, plus) * mult;
  const r = feedXp(owned, xp);
  const refund = overflowRefund(r.wasted);
  if (items) for (const [id, k] of Object.entries(refund) as [XpItemId, number][]) items[id] = (items[id] ?? 0) + k;
  return { xp, mult, wasted: r.wasted, filled: r.filled, refund };
}

/** Desmanchar GERAL: a cópia vira 25% do XP que daria ao próprio personagem, guardado como Orbes. */
export const GENERAL_SHARE = 0.25;
export const generalXp = (stars: number) => Math.round(dupBaseXp(stars) * GENERAL_SHARE);
/**
 * Soma XP geral ao "cofre" (`bank.xp`) e transforma em Orbes o que já fecha Orbes inteiros (do maior para o menor);
 * a sobra (menos de 100 XP) fica guardada para a próxima. Retorna os Orbes ganhos.
 */
export function bankXp(bank: { xp: number }, xp: number, items: Partial<Record<XpItemId, number>>): OrbBag {
  bank.xp = Math.max(0, Math.floor(bank.xp + xp));
  const orbs = xpToOrbs(bank.xp);
  for (const [id, k] of Object.entries(orbs) as [XpItemId, number][]) {
    items[id] = (items[id] ?? 0) + k;
    bank.xp -= k * orbXp(id);
  }
  return orbs;
}

export type GrantResult = { charId: string; stars: number; isNew: true } | { charId: string; stars: number; isNew: false; copies: number };

/**
 * Entrega uma carta (banner ou pacote): personagem novo entra na coleção na raridade da carta (1 cópia);
 * v0.32.0: o repetido NÃO vira XP sozinho — vira mais 1 cópia guardada no inventário (Desmanchar decide).
 */
export function grantCard(cards: Record<string, OwnedCard>, card: { charId: string; stars: number }, dupes: Dupes): GrantResult {
  if (!cards[card.charId]) {
    cards[card.charId] = { ...newOwned(card.charId), stars: card.stars, plus: 0 };
    return { charId: card.charId, stars: card.stars, isNew: true };
  }
  addDupe(dupes, card.charId, card.stars);
  return { charId: card.charId, stars: card.stars, isNew: false, copies: totalCopies(cards, dupes, card.charId) };
}
