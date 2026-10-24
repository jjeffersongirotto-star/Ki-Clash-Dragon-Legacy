// Baralho semi-aleatório (lógica pura, sem DOM).
//
// - O baralho tem DECK_SLOTS cartas distintas ("grupos") com COPIES cópias cada (10 × 4 = 40).
// - A fila de cada grupo conta a partir da COMPRA (não da jogada): depois de comprado,
//   o grupo fica bloqueado nas 6 compras seguintes, pode vir sorteado na 7ª, 8ª e 9ª
//   e vem garantido na 10ª.
// - Mão inicial (6 cartas) = compra 0. Exceção do começo: essas 6 voltam a poder vir
//   sorteadas a partir da 5ª compra (só restam 4 outras) e ficam garantidas na 8ª.
// - A cada rodada compra-se o que falta para a mão voltar a ter 6 cartas: todas essas
//   cartas fazem parte da MESMA compra (v0.8).
// - Garantias atrasadas saem em fila (10ª, 11ª, 12ª...). Uma compra que traz 2 cartas
//   atende 2 garantias da fila; 3 cartas, 3 garantias, e assim por diante.
// - Cópia jogada vai para o campo; quando a unidade morre, a cópia vai para as
//   derrotadas e nunca volta. Grupo com 0 cópias vivas sai do rodízio.
import { nextRandom, shuffle } from './rng';
import type { CardInstance } from './types';

export const DECK_SLOTS = 10;
export const COPIES = 4;
export const HAND_SIZE = 6;
/** pode vir sorteada a partir desta compra após a última compra dela */
export const ELIGIBLE_AFTER = 7;
/** garantida nesta compra após a última compra dela */
export const GUARANTEE_AFTER = 10;
/** exceção da mão inicial */
export const OPENING_ELIGIBLE = 5;
export const OPENING_GUARANTEE = 8;

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

export type HandCard = CardInstance & { slot: number };

export interface DeckState {
  slots: DeckSlot[];
  hand: HandCard[];
  /** cópias derrotadas (monte da direita), em ordem */
  defeated: CardInstance[];
  /** número da última compra feita (0 = mão inicial) */
  step: number;
}

/**
 * Regra v0.8: só se entra na batalha com exatamente 10 cartas DIFERENTES (10 × 4 = 40).
 * Retorna o motivo quando o baralho não vale, ou null quando está ok.
 */
export function deckProblem(cards: CardInstance[]): string | null {
  const distinct = new Set(cards.map((c) => c.charId)).size;
  if (distinct !== cards.length) return 'há personagens repetidos na equipe';
  if (cards.length < DECK_SLOTS) return `a equipe tem ${cards.length} de ${DECK_SLOTS} cartas`;
  if (cards.length > DECK_SLOTS) return `a equipe passou de ${DECK_SLOTS} cartas`;
  return null;
}

/** Os grupos do baralho: uma carta por personagem, sem completar com repetidas (v0.8). */
export function buildSlots(cards: CardInstance[]): CardInstance[] {
  const seen = new Set<string>();
  const out: CardInstance[] = [];
  for (const c of cards) {
    if (seen.has(c.charId) || out.length >= DECK_SLOTS) continue;
    seen.add(c.charId);
    out.push({ ...c });
  }
  return out;
}

export function createDeck(cards: CardInstance[], rng: { seed: number }): DeckState {
  const slots: DeckSlot[] = buildSlots(cards).map((card, slot) => ({
    slot,
    card,
    copies: COPIES,
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
  return { slots, hand: [], defeated: [], step: 0 };
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
  s.eligibleAt = d.step + (opening ? OPENING_ELIGIBLE : ELIGIBLE_AFTER);
  s.dueAt = d.step + (opening ? OPENING_GUARANTEE : GUARANTEE_AFTER);
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
  d.defeated.push({ charId: s.card.charId, level: s.card.level, stars: s.card.stars });
}
