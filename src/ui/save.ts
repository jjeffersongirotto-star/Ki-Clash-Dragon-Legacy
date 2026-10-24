import { CHAR_BY_ID, STARTER_IDS } from '../core/characters';
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
  /** migração v0.8: personagens iniciais de Comum e equipe obrigatória de 10 */
  v8?: boolean;
  /** migração v0.10: estrelas viraram cores; toda carta antiga fica na cor BASE correspondente (sem "+") */
  v10?: boolean;
}

const KEY = 'kicdl-save-v1';
/** a equipe é o baralho: exatamente 10 cartas distintas × 4 cópias = 40 (sem isso não há batalha) */
export const DECK_MAX = DECK_SLOTS;
export const DECK_REQUIRED = DECK_SLOTS;
/** v0.8: o jogador novo começa só com os personagens de Comum */
export const STARTERS = STARTER_IDS;

export function defaultSave(): SaveData {
  const cards: Record<string, OwnedCard> = {};
  for (const id of STARTERS) cards[id] = newOwned(id);
  return {
    version: 1,
    cards,
    deck: STARTERS.slice(0, DECK_MAX),
    items: { pergaminho: 10, cristal: 3, orbe: 0 },
    essencias: 10,
    cleared: [],
    speed: 1,
    team10: true,
    v8: true,
    v10: true,
  };
}

/**
 * Migração para a v0.8 (uma única vez):
 * - mantém todos os personagens que o jogador já tinha (inclusive Kenji e Vorax, se já obtidos);
 * - dá os novos personagens iniciais de Comum (todo jogador começa com eles);
 * - completa a equipe até 10 (primeiro com os seus mais fortes, depois com os de Comum).
 */
export function migrateV8(d: SaveData): SaveData {
  for (const id of STARTERS) if (!d.cards[id]) d.cards[id] = newOwned(id);
  d.deck = d.deck.filter((id, i, a) => CHAR_BY_ID[id] && d.cards[id] && a.indexOf(id) === i).slice(0, DECK_MAX);
  fillTeam(d);
  d.team10 = true;
  d.v8 = true;
  return d;
}

/**
 * Migração para a v0.10 (uma única vez): a quantidade de estrelas vira a cor de mesmo número
 * (1★ Comum, 2★ Incomum, 3★ Raro, 4★ Épico, 5★ Lendário, 6★ Mítico), sempre na cor BASE (sem "+").
 * Nível e XP ficam como estavam (o nível máximo da cor base é o mesmo de antes: 10 × cor).
 */
export function migrateV10(d: SaveData): SaveData {
  for (const c of Object.values(d.cards)) {
    c.plus = false;
    if (c.level > c.stars * 10) c.level = c.stars * 10;
  }
  d.v10 = true;
  return d;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const d = JSON.parse(raw) as SaveData;
    if (d.version !== 1) return defaultSave();
    const merged: SaveData = { ...defaultSave(), ...d };
    // remove ids que não existem mais
    for (const id of Object.keys(merged.cards)) if (!CHAR_BY_ID[id]) delete merged.cards[id];
    if (!d.v8) migrateV8(merged);
    if (!d.v10) migrateV10(merged);
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
    .sort((a, b) => b.stars - a.stars || Number(!!b.plus) - Number(!!a.plus) || b.level - a.level);
  for (const c of rest) if (d.deck.length < DECK_MAX) d.deck.push(c.charId);
}

/** Equipe pronta para lutar? (exatamente 10 personagens diferentes que você possui) */
export function teamReady(d: SaveData): boolean {
  const ok = d.deck.filter((id, i, a) => d.cards[id] && a.indexOf(id) === i);
  return ok.length === DECK_REQUIRED;
}
