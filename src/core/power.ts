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

/**
 * Peso de habilidade por personagem — v0.67.3: medido de novo para as 120 cartas (regressão logística em 80 000
 * batalhas IA × IA com baralhos e raridades sorteados; scripts/balance/powerGen.ts e powerFit.ts). Inclui a habilidade, a espera e
 * o alcance de cada carta. Acerto do vencedor: 65,6% → 79,6%.
 */
export const ABILITY_WEIGHT: Record<string, number> = {
  riku: 0.96, nara: 1.01, toru: 0.93, aiko: 1.24, lyra: 1.20, gorath: 0.96, mei: 1.05, yume: 0.83, zarek: 0.98,
  kenji: 1.19, nyx: 1.36, vorax: 2.15, daichi: 0.97, sora: 1.04, tobi: 0.81, kael: 0.88, suri: 1.03, hana: 1.07,
  jin: 1.04, ren: 0.93, kuro: 1.01, taro: 1.06, akemi: 0.88, shin: 0.94, yuna: 1.14, daisuke: 1.01, masao: 0.85,
  sayuri: 0.77, goro: 0.95, emi: 1.26, ryuji: 0.83, kaori: 1.11, tetsuo: 0.78, hayato: 0.60, rin: 1.26, kaito: 0.50,
  aya: 0.79, quorr: 0.91, pip: 1.04, velka: 0.76, orun: 1.08, thessa: 0.91, kryx: 0.81, ilun: 1.41, brakk: 0.97,
  zynna: 0.96, morv: 1.25, aurel: 0.94, vexar: 2.03, lunaris: 1.39, gorm: 0.97, sylith: 1.37, nhyra: 0.85, bolt: 0.87,
  medi3: 1.07, kraz9: 0.85, vex4: 0.95, cryo6: 1.08, bastion2: 0.83, echo5: 1.04, halo8: 0.90, spike11: 0.86,
  phase3: 1.02, titanx: 0.79, pulse7: 1.84, omega9: 1.63, sentinel0: 0.98, razorv: 0.89, mimic: 0.49, aegis: 1.03,
  fen: 1.10, bram: 1.03, isel: 0.89, odo: 1.14, celina: 1.14, tiberius: 0.88, nalia: 1.15, varo: 0.99, selene: 1.28,
  dorian: 0.94, kaela: 0.84, morgause: 1.47, eldrin: 1.60, vesna: 1.17, corvin: 0.58, aethra: 1.72, grub: 0.84,
  skarr: 0.85, bufo: 1.07, trokk: 0.76, magra: 1.02, fenra: 0.88, spindra: 1.17, ghul: 0.87, krag: 0.71, ysmera: 1.11,
  borgo: 1.05, rhazor: 0.75, oculus: 1.07, grendar: 0.88, kolossus: 0.65, vharga: 0.71, ossian: 0.86, mira: 0.95,
  grav: 0.93, pira: 1.36, lethe: 1.08, cador: 1.21, brunna: 0.69, wex: 1.06, morrigan: 0.84, thane: 0.88, ivra: 0.87,
  sabbath: 0.81, nocturna: 1.33, ghor: 0.61, lamenta: 1.16, drakon: 0.81, sanguis: 0.42, elegia: 1.04,
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
