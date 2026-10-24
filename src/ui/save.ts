import { newOwned, type OwnedCard, type XpItemId } from '../core/progression';

export interface SaveData {
  version: 1;
  cards: Record<string, OwnedCard>;
  deck: string[];
  items: Record<XpItemId, number>;
  essencias: number;
  cleared: number[];
  speed: number;
}

const KEY = 'kicdl-save-v1';
export const DECK_MAX = 6;
export const DECK_MIN = 3;
export const STARTERS = ['riku', 'nara', 'toru', 'aiko', 'lyra', 'gorath', 'yume', 'zarek'];

export function defaultSave(): SaveData {
  const cards: Record<string, OwnedCard> = {};
  for (const id of STARTERS) cards[id] = newOwned(id);
  return {
    version: 1,
    cards,
    deck: ['riku', 'nara', 'toru', 'aiko', 'gorath', 'lyra'],
    items: { pergaminho: 10, cristal: 3, orbe: 0 },
    essencias: 10,
    cleared: [],
    speed: 1,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const d = JSON.parse(raw) as SaveData;
    if (d.version !== 1) return defaultSave();
    return { ...defaultSave(), ...d };
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
