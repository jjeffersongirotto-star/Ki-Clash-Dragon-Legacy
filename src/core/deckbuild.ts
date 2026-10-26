/**
 * v0.17.0 — Montagem do baralho (decisão 6): até 3 cópias por carta e limite de tamanho pelo nível de perfil.
 *
 * Nível de perfil (por enquanto): 1 + fases vencidas, até PROFILE_MAX_LEVEL. A fase 3 do plano vai
 * transformar isso no nível de perfil completo (com telas liberadas).
 * Tamanho máximo do baralho = min(40, 28 + 2 × nível): nível 1 = 30 cartas … nível 6 ou mais = 40.
 * Tamanho mínimo = 20 (DECK_MIN).
 */
import { getChar } from './characters';
import { DECK_ABS_MAX, MAX_COPIES } from './deck';
import { cardPower } from './power';
import { SPELLS } from './spells';
import type { CardInstance, Category } from './types';

export const PROFILE_MAX_LEVEL = 11;
/** ordem de valor dos feitiços na IA (simulador v0.17.0, 150 partidas por feitiço em 4 fases) */
export const SPELL_VALUE_ORDER = ['f-giratoria', 'f-chuva', 'f-flecha-veneno', 'f-tremor', 'f-sombras', 'f-raio', 'f-investida', 'f-veneno', 'f-bola-fogo', 'f-necropolis', 'f-muralha', 'f-anjo', 'f-cura'];
export const DECK_BASE = 28;
export const DECK_PER_LEVEL = 2;

export const profileLevelFor = (stagesCleared: number) => Math.max(1, Math.min(PROFILE_MAX_LEVEL, 1 + Math.floor(stagesCleared)));
export const deckMaxFor = (profileLevel: number) => Math.min(DECK_ABS_MAX, DECK_BASE + DECK_PER_LEVEL * Math.max(1, Math.floor(profileLevel)));

/**
 * Baralho automático (simulador, conta ADM e inimigos com feitiços): os personagens mais fortes com 3 cópias
 * até sobrar espaço para os feitiços, depois `spellSlots` cartas de feitiço (2 cópias cada) que combinem com as
 * categorias do baralho (o feitiço cruzado conta para as duas).
 */
export function autoDeck(owned: CardInstance[], max: number, spellSlots = 0): CardInstance[] {
  const chars = owned.slice().sort((a, b) => cardPower(b) - cardPower(a));
  const out: CardInstance[] = [];
  let left = max - spellSlots;
  for (const c of chars) {
    if (left <= 0) break;
    const n = Math.min(MAX_COPIES, left);
    out.push({ ...c, copies: n });
    left -= n;
  }
  const cats = new Map<Category, number>();
  for (const c of out) {
    const cat = getChar(c.charId).category;
    cats.set(cat, (cats.get(cat) ?? 0) + (c.copies ?? MAX_COPIES));
  }
  let sl = spellSlots + Math.max(0, left);
  // feitiços que combinam com o baralho, na ordem de valor medida no simulador (os de área primeiro)
  const pool = SPELLS.map((s) => ({ s, score: s.categories.reduce((n, k) => n + (cats.get(k) ?? 0), 0) }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => SPELL_VALUE_ORDER.indexOf(a.s.id) - SPELL_VALUE_ORDER.indexOf(b.s.id));
  for (const { s } of pool) {
    if (sl <= 0) break;
    const n = Math.min(2, sl);
    out.push({ charId: s.id, stars: 1, copies: n });
    sl -= n;
  }
  return out;
}
