/**
 * v0.67.4 — Degrau das cartas inimigas de cada fase, CALIBRADO por scripts/balance/ladder.ts (não editar à mão).
 * Pedido do jogador: fora do primeiro mundo, no máximo 50% de vitória ao chegar, caindo com o nível.
 * `null` = usa a curva de antes.
 */
export const LADDER_STEPS: { facil: number[] | null; normal: number[] | null; dificil: number[] | null } = { facil: null, normal: null, dificil: null };
