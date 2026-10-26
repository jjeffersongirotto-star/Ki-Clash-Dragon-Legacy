// Baralho semi-aleatório (lógica pura, sem DOM).
//
// - O baralho tem cartas distintas ("grupos"), cada uma com 1 a MAX_COPIES cópias (v0.17.0),
//   de DECK_MIN a DECK_ABS_MAX cartas no total.
// - A fila de cada grupo conta a partir da COMPRA (não da jogada) e escala com o número de
//   grupos (`queueFor`). Com 10 grupos: bloqueado nas 6 compras seguintes, pode vir sorteado
//   na 7ª, 8ª e 9ª e vem garantido na 10ª.
// - Mão inicial (6 cartas) = compra 0. Exceção do começo (com 10 grupos): essas 6 voltam a
//   poder vir sorteadas a partir da 5ª compra e ficam garantidas na 8ª.
// - A cada rodada compra-se o que falta para a mão voltar a ter 6 cartas: todas essas
//   cartas fazem parte da MESMA compra (v0.8).
// - Garantias atrasadas saem em fila (10ª, 11ª, 12ª...). Uma compra que traz 2 cartas
//   atende 2 garantias da fila; 3 cartas, 3 garantias, e assim por diante.
// - Cópia jogada vai para o campo; quando a unidade morre, a cópia vai para as
//   derrotadas e nunca volta. Grupo com 0 cópias vivas sai do rodízio.
import { nextRandom, shuffle } from './rng';
import type { CardInstance } from './types';

/** referência de grupos (10) — a fila abaixo é calculada pelo número de grupos do baralho (v0.17.0) */
export const DECK_SLOTS = 10;
/** v0.17.0: até 3 cópias de cada carta (antes 4 fixas) */
export const MAX_COPIES = 3;
export const COPIES = MAX_COPIES;
export const HAND_SIZE = 6;
/** v0.17.0: tamanho do baralho (cartas, contando cópias) */
export const DECK_MIN = 20;
export const DECK_ABS_MAX = 40;
/** pode vir sorteada a partir desta compra após a última compra dela (com 10 grupos) */
export const ELIGIBLE_AFTER = 7;
/** garantida nesta compra após a última compra dela (com 10 grupos) */
export const GUARANTEE_AFTER = 10;
/** exceção da mão inicial (com 10 grupos) */
export const OPENING_ELIGIBLE = 5;
export const OPENING_GUARANTEE = 8;
/**
 * v0.17.0: a fila escala com o número de grupos `n` (com 10 fica igual a antes: 7/10 e 5/8):
 * liberada após n − 3 compras, garantida após n; mão inicial n − 5 e n − 2 (mínimo 1).
 */
export function queueFor(n: number) {
  const elig = Math.max(1, n - 3);
  const oElig = Math.max(1, n - 5);
  return { elig, guar: Math.max(elig, n), oElig, oGuar: Math.max(oElig, n - 2) };
}

export interface DeckSlot {
  slot: number;
  card: CardInstance;
  copies: number;
  defeated: number;
  inHand: number;
  onField: number;
  /** compra a partir da qual pode vir sorteada */
  eligibleAt: number;
  /** compra em que fica garantida */
  dueAt: number;
  /** ordem na fila de garantias (quem foi comprado antes sai antes) */
  seq: number;
  /** última compra em que veio (-1 = nunca) */
  lastStep: number;
}

/** `wait`: rodadas que faltam para poder invocar (v0.16.0) */
export type HandCard = CardInstance & { slot: number; wait?: number };

export interface DeckState {
  slots: DeckSlot[];
  hand: HandCard[];
  /** cópias derrotadas (monte da direita), em ordem */
  defeated: CardInstance[];
  /** número da última compra feita (0 = mão inicial) */
  step: number;
  /** v0.17.0: fila calculada pelo número de grupos */
  queue?: ReturnType<typeof queueFor>;
}

export const copiesOf = (c: CardInstance) => Math.max(1, Math.min(MAX_COPIES, Math.floor(c.copies ?? MAX_COPIES)));
export const deckSize = (cards: CardInstance[]) => cards.reduce((n, c) => n + copiesOf(c), 0);

/**
 * Regra v0.17.0: cada carta aparece uma vez na lista (com 1 a 3 cópias) e o baralho tem de
 * DECK_MIN a `max` cartas (o máximo cresce com o nível de perfil). Retorna o motivo quando não vale.
 */
export function deckProblem(cards: CardInstance[], max = DECK_ABS_MAX): string | null {
  const distinct = new Set(cards.map((c) => c.charId)).size;
  if (distinct !== cards.length) return 'há cartas repetidas na lista (use as cópias)';
  if (cards.some((c) => (c.copies ?? MAX_COPIES) > MAX_COPIES || (c.copies ?? 1) < 1)) return `cada carta pode ter de 1 a ${MAX_COPIES} cópias`;
  if (!cards.some((c) => !c.charId.startsWith('f-'))) return 'o baralho precisa de pelo menos 1 personagem';
  const n = deckSize(cards);
  if (n < DECK_MIN) return `o baralho tem ${n} de no mínimo ${DECK_MIN} cartas`;
  if (n > max) return `o baralho passou do máximo de ${max} cartas`;
  return null;
}

/** Os grupos do baralho: uma entrada por carta (as cópias ficam no grupo). */
export function buildSlots(cards: CardInstance[]): CardInstance[] {
  const seen = new Set<string>();
  const out: CardInstance[] = [];
  for (const c of cards) {
    if (seen.has(c.charId)) continue;
    seen.add(c.charId);
    out.push({ ...c });
  }
  return out;
}

export function createDeck(cards: CardInstance[], rng: { seed: number }): DeckState {
  const slots: DeckSlot[] = buildSlots(cards).map((card, slot) => ({
    slot,
    card,
    copies: copiesOf(card),
    defeated: 0,
    inHand: 0,
    onField: 0,
    eligibleAt: 1,
    dueAt: 1,
    seq: 0,
    lastStep: -1,
  }));
  // ordem aleatória para os grupos nunca comprados
  shuffle(slots, rng).forEach((s, i) => (s.seq = -1000 + i));
  return { slots, hand: [], defeated: [], step: 0, queue: queueFor(slots.length) };
}

export const alive = (s: DeckSlot) => s.copies - s.defeated;
export const inPile = (s: DeckSlot) => Math.max(0, alive(s) - s.inHand - s.onField);
export const pileCount = (d: DeckState) => d.slots.reduce((n, s) => n + inPile(s), 0);
export const totalCards = (d: DeckState) => d.slots.reduce((n, s) => n + s.copies, 0);
/** grupos ainda no rodízio (com cópias vivas) */
export const inRotation = (d: DeckState) => d.slots.filter((s) => alive(s) > 0);

function take(d: DeckState, s: DeckSlot, k: number, opening: boolean) {
  s.inHand++;
  s.lastStep = d.step;
  const q = d.queue ?? queueFor(DECK_SLOTS);
  s.eligibleAt = d.step + (opening ? q.oElig : q.elig);
  s.dueAt = d.step + (opening ? q.oGuar : q.guar);
  s.seq = d.step * 100 + k;
  d.hand.push({ ...s.card, slot: s.slot });
}

/** Mão inicial: 6 cartas distintas sorteadas. Conta como uma compra (a compra 0). */
export function drawOpening(d: DeckState, rng: { seed: number }): HandCard[] {
  const pool = shuffle(d.slots.filter((s) => inPile(s) > 0), rng);
  const picks = pool.slice(0, HAND_SIZE);
  d.step = 0;
  picks.forEach((s, k) => take(d, s, k, true));
  return d.hand.slice();
}

/**
 * Faz uma compra de `count` cartas (na batalha: quantas faltam para a mão voltar a 6).
 * Todas as cartas de uma compra contam como a MESMA compra na fila.
 * Ordem de escolha: 1) garantias vencidas, em fila; 2) sorteio entre as liberadas;
 * 3) se nada estiver liberado, a que está mais perto de liberar (a mão nunca fica sem compra).
 * Mão cheia: compra só o que cabe; se não cabe nada, não há compra e a fila não anda.
 */
export function drawStep(d: DeckState, rng: { seed: number }, count = 1): HandCard[] {
  const n = Math.min(count, HAND_SIZE - d.hand.length);
  if (n <= 0) return [];
  const can = d.slots.filter((s) => inPile(s) > 0);
  if (!can.length) return [];
  d.step++;
  const step = d.step;
  const picked: DeckSlot[] = [];
  const due = can.filter((s) => s.dueAt <= step).sort((a, b) => a.dueAt - b.dueAt || a.seq - b.seq);
  for (const s of due) if (picked.length < n) picked.push(s);
  while (picked.length < n) {
    const free = can.filter((s) => !picked.includes(s) && s.eligibleAt <= step);
    if (!free.length) break;
    picked.push(free[Math.floor(nextRandom(rng) * free.length)]);
  }
  if (picked.length < n) {
    const rest = can.filter((s) => !picked.includes(s)).sort((a, b) => a.eligibleAt - b.eligibleAt || a.seq - b.seq);
    for (const s of rest) if (picked.length < n) picked.push(s);
  }
  const start = d.hand.length;
  picked.forEach((s, k) => take(d, s, k, false));
  return d.hand.slice(start);
}

/** Tira a carta da mão e a coloca em campo. */
export function playFromHand(d: DeckState, handIndex: number): HandCard | undefined {
  const c = d.hand[handIndex];
  if (!c) return undefined;
  d.hand.splice(handIndex, 1);
  const s = d.slots[c.slot];
  if (s) {
    s.inHand = Math.max(0, s.inHand - 1);
    s.onField++;
  }
  return c;
}

/** A unidade daquela cópia morreu: a cópia vai para as derrotadas para sempre. */
export function defeatCopy(d: DeckState, slot: number) {
  const s = d.slots[slot];
  if (!s) return;
  s.onField = Math.max(0, s.onField - 1);
  s.defeated = Math.min(s.copies, s.defeated + 1);
  d.defeated.push({ charId: s.card.charId, level: s.card.level, stars: s.card.stars, plus: !!s.card.plus });
}

/** v0.17.0: feitiço lançado — a cópia sai da mão e volta ao monte (a fila decide quando volta à mão). */
export function castFromHand(d: DeckState, handIndex: number): HandCard | undefined {
  const c = d.hand[handIndex];
  if (!c) return undefined;
  d.hand.splice(handIndex, 1);
  const s = d.slots[c.slot];
  if (s) {
    s.inHand = Math.max(0, s.inHand - 1);
    // a espera para voltar à mão recomeça no lançamento (como se tivesse acabado de ser comprado)
    const q = d.queue ?? queueFor(DECK_SLOTS);
    s.eligibleAt = d.step + q.elig;
    s.dueAt = d.step + q.guar;
  }
  return c;
}

/**
 * v0.17.0: traz da Necropolis a última cópia derrotada. Volta para a mão (pronta) se houver vaga;
 * senão volta para o monte. Retorna a carta trazida, ou null se a Necropolis estiver vazia.
 */
export function returnFromNecropolis(d: DeckState): { card: CardInstance; toHand: boolean } | null {
  const card = d.defeated.pop();
  if (!card) return null;
  const s = d.slots.find((x) => x.card.charId === card.charId && x.defeated > 0);
  if (!s) return { card, toHand: false };
  s.defeated--;
  if (d.hand.length < HAND_SIZE) {
    s.inHand++;
    d.hand.push({ ...s.card, slot: s.slot, wait: 0 });
    return { card, toHand: true };
  }
  return { card, toHand: false };
}
