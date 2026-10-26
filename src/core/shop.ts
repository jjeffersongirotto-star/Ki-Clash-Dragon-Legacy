/**
 * v0.26.0 — 🏪 Loja: compra itens de ascensão e Orbes com Ouro de Dragão (lógica pura, sem DOM).
 *
 * Preços (mude só aqui):
 * - Item de ascensão (qualquer um dos 30), pela raridade: cinza 40 · verde 100 · azul 250 · roxo 600 · laranja 1.500.
 * - Orbes (~0,3 de Ouro por XP): Comum 30 · Incomum 75 · Raro 120 · Épico 240 · Lendário 450 · Mítico 900.
 * Não vende energia (o Ouro vem de gastar energia; vender energia viraria um ciclo sem fim).
 */
import { GEAR_BY_ID, GEAR_MAX_RARITY, addGear, type GearBag } from './gear';
import type { XpItemId } from './progression';

export const GEAR_PRICE: Record<number, number> = { 1: 40, 2: 100, 3: 250, 4: 600, 5: 1500 };
export const ORB_PRICE: Record<XpItemId, number> = { orbe1: 30, orbe2: 75, orbe3: 120, orbe4: 240, orbe5: 450, orbe6: 900 };

export type BuyResult = { ok: true; cost: number } | { ok: false; cost: number; reason: 'ouro' | 'invalido' };

/** Compra `n` itens de ascensão (`id` na raridade `rarity`). Muda `wallet.gold` e a mochila. */
export function buyGear(wallet: { gold: number }, bag: GearBag, id: string, rarity: number, n = 1): BuyResult {
  const k = Math.floor(n);
  if (!GEAR_BY_ID[id] || !Number.isInteger(rarity) || rarity < 1 || rarity > GEAR_MAX_RARITY || k < 1) return { ok: false, cost: 0, reason: 'invalido' };
  const cost = GEAR_PRICE[rarity] * k;
  if (wallet.gold < cost) return { ok: false, cost, reason: 'ouro' };
  wallet.gold -= cost;
  addGear(bag, id, rarity, k);
  return { ok: true, cost };
}

/** Compra `n` Orbes. Muda `wallet.gold` e `items`. */
export function buyOrb(wallet: { gold: number }, items: Record<XpItemId, number>, id: XpItemId, n = 1): BuyResult {
  const k = Math.floor(n);
  if (!(id in ORB_PRICE) || k < 1) return { ok: false, cost: 0, reason: 'invalido' };
  const cost = ORB_PRICE[id] * k;
  if (wallet.gold < cost) return { ok: false, cost, reason: 'ouro' };
  wallet.gold -= cost;
  items[id] = (items[id] ?? 0) + k;
  return { ok: true, cost };
}
