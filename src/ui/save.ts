import { DECK_SLOTS } from '../core/deck';
import { newOwned, type OwnedCard, type XpItemId } from '../core/progression';

export interface SaveData {
  version: 1;
  cards: Record<string, OwnedCard>;
  deck: string[];
  items: Record<XpItemId, number>;
  essencias: number;
  cleared: number[];
  speed: number;
  /** migração v0.7: equipe passou de 6 para 10 cartas */
  team10?: boolean;
}

const KEY = 'kicdl-save-v1';
/** a equipe é o baralho: 10 cartas distintas × 4 cópias = 40 */
export const DECK_MAX = DECK_SLOTS;
export const DECK_MIN = 3;
export const STARTERS = ['riku', 'nara', 'toru', 'aiko', 'lyra', 'gorath', 'mei', 'yume', 'zarek'];

export function defaultSave(): SaveData {
  const cards: Record<string, OwnedCard> = {};
  for (const id of STARTERS) cards[id] = newOwned(id);
  return {
    version: 1,
    cards,
    deck: ['riku', 'nara', 'toru', 'aiko', 'gorath', 'lyra', 'mei', 'yume', 'zarek'],
    items: { pergaminho: 10, cristal: 3, orbe: 0 },
    essencias: 10,
    cleared: [],
    speed: 1,
    team10: true,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const d = JSON.parse(raw) as SaveData;
    if (d.version !== 1) return defaultSave();
    const merged = { ...defaultSave(), ...d };
    // migração: personagens iniciais novos entram na coleção
    for (const id of STARTERS) if (!merged.cards[id]) merged.cards[id] = newOwned(id);
    // migração v0.7: a equipe antiga (até 6) é completada até 10 com os personagens que você já tem
    if (!d.team10) {
      fillTeam(merged);
      merged.team10 = true;
    }
    return merged;
  } catch {
    return defaultSave();
  }
}

export function writeSave(d: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* armazenamento indisponível */
  }
}

export function resetSave(): SaveData {
  localStorage.removeItem(KEY);
  return defaultSave();
}

/** Completa a equipe até 10 com personagens possuídos que estão fora dela (mais fortes primeiro). */
export function fillTeam(d: SaveData) {
  const rest = Object.values(d.cards)
    .filter((c) => !d.deck.includes(c.charId))
    .sort((a, b) => b.stars - a.stars || b.level - a.level);
  for (const c of rest) if (d.deck.length < DECK_MAX) d.deck.push(c.charId);
}
