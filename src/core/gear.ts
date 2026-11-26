/**
 * v0.24.0 — ITENS DE ASCENSÃO (lógica pura, sem DOM).
 *
 * - 30 itens: cada categoria de personagem tem o seu conjunto de 5 (roupas, armas, acessórios…).
 * - Cada item existe em 5 raridades, mostradas só pela cor do fundo do ícone:
 *   1 Comum (cinza) · 2 Incomum (verde) · 3 Raro (azul) · 4 Épico (roxo) · 5 Lendário (laranja). Não há item Mítico.
 * - Subir um degrau pede 1 de cada item: base → "+" = 3 itens · "+" → "++" = 4 · Despertar ("++" → nova raridade) = 5.
 *   Desses, 1 / 2 / 3 são da raridade UM ACIMA da carta e os outros 2 da raridade DA carta
 *   (ex.: carta Comum: "+" = 2 cinza + 1 verde · "++" = 2 cinza + 2 verde · Despertar = 2 cinza + 3 verde).
 *   Cartas Lendárias e Míticas pedem só itens Lendários (laranja).
 *   Quais itens (e quais são os "de cima"): fixos para cada personagem, numa ordem sorteada do conjunto da categoria.
 * - Cada fase dá sempre os mesmos 3 itens (de categorias diferentes); as 10 fases cobrem os 30.
 *   A cor sai pela tabela GEAR_BANDS (v0.69.0: cor comum, cor rara e chance por dificuldade e faixa de fases).
 */
import { getChar } from './characters';
import { shuffle } from './rng';
import type { Category } from './types';
import { MAX_STEP, ascend, ascendCost, canAscend, stepOf, type OwnedCard } from './progression';
import type { Difficulty } from './adventure';

export interface GearDef {
  id: string;
  name: string;
  icon: string;
  category: Category;
}

const set = (category: Category, list: [string, string, string][]): GearDef[] => list.map(([id, name, icon]) => ({ id, name, icon, category }));

/** Os 6 conjuntos de 5 itens (na ordem: cabeça, corpo, arma/escudo, acessório, pés/extra). */
export const GEAR_SETS: Record<Category, GearDef[]> = {
  tanque: set('tanque', [['elmo', 'Elmo', '⛑️'], ['armadura', 'Armadura', '🦺'], ['escudo', 'Escudo', '🛡️'], ['manoplas', 'Manoplas', '🥊'], ['botas-ferro', 'Botas de ferro', '🥾']]),
  suporte: set('suporte', [['tiara', 'Tiara', '👑'], ['tunica', 'Túnica', '👘'], ['amuleto', 'Amuleto', '📿'], ['bastao', 'Bastão', '🦯'], ['sandalias', 'Sandálias', '🩴']]),
  dps: set('dps', [['bandana', 'Bandana', '🎽'], ['colete', 'Colete', '🦺'], ['espada', 'Espada', '⚔️'], ['luvas', 'Luvas', '🧤'], ['botas', 'Botas', '👢']]),
  mago: set('mago', [['chapeu', 'Chapéu', '🎩'], ['manto', 'Manto', '🧥'], ['cajado', 'Cajado', '🪄'], ['cristal', 'Cristal', '💎'], ['anel', 'Anel', '💍']]),
  arqueiro: set('arqueiro', [['capuz', 'Capuz', '🧢'], ['jaqueta', 'Jaqueta', '🧥'], ['arco', 'Arco', '🏹'], ['aljava', 'Aljava', '🎒'], ['botas-leves', 'Botas leves', '👟']]),
  assassino: set('assassino', [['mascara', 'Máscara', '🎭'], ['capa', 'Capa', '🦇'], ['adagas', 'Adagas', '🗡️'], ['cinto', 'Cinto', '🎗️'], ['diamante-negro', 'Diamante negro', '🖤']]),
};

export const GEAR_CATEGORIES = Object.keys(GEAR_SETS) as Category[];
export const GEAR: GearDef[] = GEAR_CATEGORIES.flatMap((c) => GEAR_SETS[c]);
export const GEAR_BY_ID: Record<string, GearDef> = Object.fromEntries(GEAR.map((g) => [g.id, g]));

/** Raridades de item: 1 Comum (cinza) … 5 Lendário (laranja). */
export const GEAR_MAX_RARITY = 5;
export const GEAR_RARITIES = [1, 2, 3, 4, 5];
export const GEAR_RARITY_NAMES: Record<number, string> = { 1: 'Comum', 2: 'Incomum', 3: 'Raro', 4: 'Épico', 5: 'Lendário' };

/** Mochila de itens: chave "item:raridade" → quantidade */
export type GearBag = Record<string, number>;
export const gearKey = (id: string, rarity: number) => `${id}:${rarity}`;
export const gearCount = (bag: GearBag | undefined, id: string, rarity: number) => bag?.[gearKey(id, rarity)] ?? 0;
export function addGear(bag: GearBag, id: string, rarity: number, n = 1) {
  const k = gearKey(id, rarity);
  bag[k] = (bag[k] ?? 0) + n;
}

/** Raridade dos itens "da carta" e "de cima" (Lendária e Mítica: só Lendários). */
export const gearOwnRarity = (stars: number) => Math.max(1, Math.min(GEAR_MAX_RARITY, stars));
export const gearAboveRarity = (stars: number) => Math.max(1, Math.min(GEAR_MAX_RARITY, stars + 1));

/** Quantos itens cada Despertar pede (base → "+" · "+" → "++" · "++" → nova raridade) e quantos deles são "de cima". */
export const GEAR_PER_STEP = [3, 4, 5];
export const GEAR_ABOVE_PER_STEP = [1, 2, 3];

/** Um item pedido: `above` = da raridade um acima da carta. */
export interface GearReq {
  id: string;
  above: boolean;
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h | 0;
};

/**
 * Os itens de cada personagem (fixos): ordem sorteada do conjunto da categoria pelo id do personagem (o = ordem).
 * "+"  = o1, o2, o3 (de cima: o1)
 * "++" = o2, o3, o4, o5 (de cima: o4, o5)
 * Despertar = os 5 (de cima: o1, o4, o5)
 * Os itens "da carta" são sempre o2 e o3. A ordem varia de um personagem para outro.
 */
export function charGear(charId: string): { plus: GearReq[]; plus2: GearReq[]; awaken: GearReq[] } {
  const all = GEAR_SETS[getChar(charId).category].map((g) => g.id);
  const o = shuffle(all, { seed: hash(charId) });
  const up = (id: string): GearReq => ({ id, above: true });
  const own = (id: string): GearReq => ({ id, above: false });
  return {
    plus: [up(o[0]), own(o[1]), own(o[2])],
    plus2: [own(o[1]), own(o[2]), up(o[3]), up(o[4])],
    awaken: [up(o[0]), own(o[1]), own(o[2]), up(o[3]), up(o[4])],
  };
}

/** Raridade de um item pedido para uma carta dessa raridade. */
export const reqRarity = (r: GearReq, stars: number) => (r.above ? gearAboveRarity(stars) : gearOwnRarity(stars));

/** Itens (id + cor) que o próximo Despertar da carta pede. Vazio no topo. */
export function gearNeeded(card: { charId: string; stars: number; plus?: number | boolean }): { id: string; rarity: number }[] {
  const def = getChar(card.charId);
  const step = stepOf(card);
  if (card.stars >= def.maxStars && step >= MAX_STEP) return [];
  const g = charGear(card.charId);
  const reqs = step === 0 ? g.plus : step === 1 ? g.plus2 : g.awaken;
  return reqs.map((r) => ({ id: r.id, rarity: reqRarity(r, card.stars) }));
}

/** A mochila tem todos os itens do próximo Despertar? */
export const hasGearFor = (bag: GearBag | undefined, card: { charId: string; stars: number; plus?: number | boolean }) =>
  gearNeeded(card).every((n) => gearCount(bag, n.id, n.rarity) >= 1);

/** Gasta os itens do próximo Despertar (chamar só depois de conferir com `hasGearFor`). */
export function spendGearFor(bag: GearBag, card: { charId: string; stars: number; plus?: number | boolean }) {
  for (const n of gearNeeded(card)) addGear(bag, n.id, n.rarity, -1);
}

// ---------- itens das fases ----------

/**
 * Os 3 itens fixos de cada fase (de categorias diferentes). Item n = 0..29: categoria = n % 6, item = ⌊n / 6⌋.
 * Fase 1 = n 0–2, fase 2 = n 3–5, … ⇒ as 10 fases cobrem os 30 itens, 1 vez cada.
 */
export const STAGE_GEAR: string[][] = Array.from({ length: 10 }, (_, p) =>
  [0, 1, 2].map((k) => {
    const n = p * 3 + k;
    return GEAR_SETS[GEAR_CATEGORIES[n % 6]][Math.floor(n / 6)].id;
  }),
);

/** Cor comum e cor rara do drop até a fase `upTo` (inclusive) e a chance da rara. */
export interface GearBand {
  upTo: number;
  low: number;
  high: number;
  rare: number;
}
/**
 * v0.69.0 — TABELA DE CORES DOS ITENS POR DIFICULDADE E FASE (mude só aqui).
 * O Fácil tem teto (azul, com roxo só no fim); o Normal dá azul e roxo; o Difícil, roxo e laranja (v0.71.0: laranja só no Difícil).
 * Até a v0.68: cada dificuldade tinha [comum, rara] e subia +1 cor a cada 2 regiões (o Fácil chegava ao laranja).
 */
export const GEAR_BANDS: Record<Difficulty, GearBand[]> = {
  facil: [
    { upTo: 20, low: 1, high: 2, rare: 0.4 },
    { upTo: 50, low: 2, high: 3, rare: 0.4 },
    { upTo: 80, low: 3, high: 4, rare: 0.1 },
    { upTo: 100, low: 3, high: 4, rare: 0.4 },
  ],
  // v0.71.0 (pedido do jogador): laranja só no Difícil — o Normal dá azul e roxo
  normal: [
    { upTo: 50, low: 3, high: 4, rare: 0.2 },
    { upTo: 100, low: 3, high: 4, rare: 0.5 },
  ],
  dificil: [
    { upTo: 30, low: 4, high: 5, rare: 0.2 },
    { upTo: 100, low: 5, high: 5, rare: 0 },
  ],
};
/** A faixa de cores da fase. */
export function stageGearBand(stageId: number, diff: Difficulty): GearBand {
  const bands = GEAR_BANDS[diff];
  return bands.find((b) => stageId <= b.upTo) ?? bands[bands.length - 1];
}

/** v0.39.0: os 3 itens da fase pelo número dela na região (a fase 3 de toda região dá os itens da fase 3). */
export const stageGearIds = (stageId: number): string[] => STAGE_GEAR[(stageId - 1) % STAGE_GEAR.length] ?? [];
/** Cores dos itens na fase: [comum, rara] (iguais quando só sai uma cor). */
export function stageGearRarity(stageId: number, diff: Difficulty): [number, number] {
  const b = stageGearBand(stageId, diff);
  return [b.low, b.rare > 0 ? b.high : b.low];
}
/** Chance da cor rara na fase (0 quando só sai uma cor). */
export const stageGearChance = (stageId: number, diff: Difficulty) => {
  const b = stageGearBand(stageId, diff);
  return b.high > b.low ? b.rare : 0;
};
/** Itens que a fase dá numa vitória ou Repetir: os 3 da fase, cada um com a cor sorteada. */
export function stageGearDrop(stageId: number, diff: Difficulty, rng: () => number = Math.random): { id: string; rarity: number }[] {
  const [low, high] = stageGearRarity(stageId, diff);
  const chance = stageGearChance(stageId, diff);
  return stageGearIds(stageId).map((id) => ({ id, rarity: rng() < chance ? high : low }));
}

/** Onde conseguir um item numa cor: as fases (por dificuldade) que podem dar esse item nessa cor. */
export function gearSources(id: string, rarity: number, stages = 100): { diff: Difficulty; stages: number[] }[] {
  const out: { diff: Difficulty; stages: number[] }[] = [];
  for (const diff of ['facil', 'normal', 'dificil'] as Difficulty[]) {
    const list: number[] = [];
    for (let s = 1; s <= stages; s++) {
      if (!stageGearIds(s).includes(id)) continue;
      const [lo, hi] = stageGearRarity(s, diff);
      if (lo === rarity || hi === rarity) list.push(s);
    }
    if (list.length) out.push({ diff, stages: list });
  }
  return out;
}

// ---------- v0.69.0: cadeado e fusão ----------

/**
 * Itens (id + cor) já ganhos numa fase (ou no tutorial). Só esses podem ser fundidos ou comprados na Loja:
 * a fusão e a Loja não deixam pular etapas. Chave "item:raridade".
 */
export type GearSeen = string[];
export const isGearUnlocked = (seen: GearSeen | undefined, id: string, rarity: number) => !!seen?.includes(gearKey(id, rarity));
export function markGearSeen(seen: GearSeen, id: string, rarity: number) {
  const k = gearKey(id, rarity);
  if (!seen.includes(k)) seen.push(k);
}
/** Fusão: 3 itens iguais de uma cor viram 1 do mesmo item na cor acima. */
export const FUSE_INPUT = 3;
/** Essências da fusão, pela cor que SAI: verde 5 · azul 10 · roxo 20 · laranja 40. */
export const FUSE_COST: Record<number, number> = { 2: 5, 3: 10, 4: 20, 5: 40 };
export type FuseResult = { ok: true; cost: number } | { ok: false; cost: number; reason: 'cadeado' | 'itens' | 'essencias' | 'invalido' };
/** Funde 3 × (`id`, cor `to − 1`) em 1 × (`id`, cor `to`). Muda a mochila e `wallet.essencias`. */
export function fuseGear(bag: GearBag, wallet: { essencias: number }, seen: GearSeen | undefined, id: string, to: number): FuseResult {
  const cost = FUSE_COST[to] ?? 0;
  if (!GEAR_BY_ID[id] || !cost) return { ok: false, cost, reason: 'invalido' };
  if (!isGearUnlocked(seen, id, to)) return { ok: false, cost, reason: 'cadeado' };
  if (gearCount(bag, id, to - 1) < FUSE_INPUT) return { ok: false, cost, reason: 'itens' };
  if (wallet.essencias < cost) return { ok: false, cost, reason: 'essencias' };
  wallet.essencias -= cost;
  addGear(bag, id, to - 1, -FUSE_INPUT);
  addGear(bag, id, to, 1);
  return { ok: true, cost };
}
/** Confere a lista de itens já ganhos. */
export function normalizeGearSeen(v: unknown): GearSeen {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((k): k is string => typeof k === 'string' && (() => { const [id, r] = k.split(':'); return !!GEAR_BY_ID[id] && Number(r) >= 1 && Number(r) <= GEAR_MAX_RARITY; })()))];
}

/** Confere uma mochila salva (chaves válidas e quantidades inteiras ≥ 0). */
export function normalizeGear(v: unknown): GearBag {
  const out: GearBag = {};
  if (!v || typeof v !== 'object') return out;
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
    const [id, r] = k.split(':');
    const rr = Number(r);
    if (!GEAR_BY_ID[id] || !Number.isInteger(rr) || rr < 1 || rr > GEAR_MAX_RARITY) continue;
    if (Number.isFinite(n as number) && (n as number) > 0) out[k] = Math.floor(n as number);
  }
  return out;
}

/**
 * Despertar completo do jogo (v0.24.0): barra cheia + Essências + itens. Gasta Essências e itens e sobe o degrau.
 * (`ascend` de progression.ts é só a parte da barra e das Essências.)
 */
export function ascendWithGear(card: OwnedCard, essences: number, bag: GearBag): { ok: boolean; cost: number; reason?: 'barra' | 'essencias' | 'itens' } {
  const cost = ascendCost(card);
  if (!canAscend(card)) return { ok: false, cost, reason: 'barra' };
  if (essences < cost) return { ok: false, cost, reason: 'essencias' };
  if (!hasGearFor(bag, card)) return { ok: false, cost, reason: 'itens' };
  spendGearFor(bag, card);
  return ascend(card, essences);
}
