/**
 * v0.13.0 — PODER das cartas e do baralho.
 *
 * Poder = round( 10 × pesoHabilidade × √(ataque × vida) )
 *  - ataque e vida são os status ATUAIS da carta (raridade e degrau já aplicados por statsFor; v0.23.0: sem nível),
 *    então o Poder sobe a cada degrau ("+", "++") e a cada raridade.
 *  - √(ataque × vida) (média geométrica) foi o formato que melhor previu o vencedor no simulador
 *    (IA × IA, 30 000 partidas — scripts/balance/calibrate.ts). Expoentes 0,4/0,6 e penalidade por
 *    custo deram o mesmo acerto (~71,5%), então ficou o mais simples.
 *  - pesoHabilidade: valor de combate medido de cada personagem (média 1,00), já incluindo as
 *    habilidades E o custo de energia. Ex.: Kenji 1,39 (+39%), Ren 0,78.
 *
 * Poder do baralho = soma do Poder das 10 cartas da equipe.
 */
import { getChar } from './characters';
import { statsFor, stepOf } from './progression';

/** Peso de habilidade por personagem (regressão logística do simulador, normalizado para média 1). */
export const ABILITY_WEIGHT: Record<string, number> = {
  riku: 1.04, nara: 0.91, toru: 1.0, aiko: 1.06, lyra: 1.09, gorath: 0.92, mei: 0.86,
  yume: 1.0, zarek: 0.89, kenji: 1.39, nyx: 0.95, vorax: 0.98, daichi: 1.17, sora: 1.16,
  tobi: 1.08, kael: 0.97, suri: 1.0, hana: 0.9, jin: 0.96, ren: 0.78, kuro: 0.92,
};

export const POWER_SCALE = 10;

export interface PowerCard {
  charId: string;
  stars: number;
  /** v0.23.0: degrau (0, 1, 2); `true` antigo = 1 */
  plus?: number | boolean;
}

export function abilityWeight(charId: string): number {
  return ABILITY_WEIGHT[charId] ?? 1;
}

export function cardPower(c: PowerCard): number {
  const def = getChar(c.charId);
  const { atk, hp } = statsFor(def, c.stars, stepOf(c));
  return Math.round(POWER_SCALE * abilityWeight(c.charId) * Math.sqrt(atk * hp));
}

export function deckPower(cards: PowerCard[]): number {
  return cards.reduce((s, c) => s + cardPower(c), 0);
}
