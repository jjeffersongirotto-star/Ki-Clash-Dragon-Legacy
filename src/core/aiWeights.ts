/**
 * v0.37.0 — pesos da nota da IA esperta (aiSmart.ts). Gerado/ajustado por scripts/balance/train_ai.ts
 * (treino contra ela mesma: várias partidas com sementes fixas, fica a versão que mais vence).
 */
export interface AiWeights {
  /** diferença de vida (em %) dos Comandantes */
  hero: number;
  /** peso extra quando um Comandante está abaixo de 40% (perigo → defender / acabar a partida) */
  danger: number;
  /** vida das unidades */
  hp: number;
  /** ataque das unidades */
  atk: number;
  /** por habilidade */
  abil: number;
  /** unidades-chave (curandeiros, auras, guardiões) */
  key: number;
  /** avanço × ataque (pressão no Comandante adversário) */
  adv: number;
  /** quanto pesa a ameaça das unidades inimigas que avançam */
  threat: number;
  /** por efeito ruim (veneno, congelado…) */
  eff: number;
  /** cartas prontas na mão */
  hand: number;
  /** quanto uma jogada precisa melhorar a nota para valer a pena */
  margin: number;
}

export const AI_WEIGHTS: AiWeights = { hero: 3, danger: 5.25, hp: 1, atk: 1.96, abil: 0.52, key: 1.83, adv: 1.22, threat: 1.4, eff: 0.84, hand: 0.35, margin: 0.68 };
