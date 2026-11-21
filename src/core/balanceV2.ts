import type { AbilityId, Category, Race } from './types';

/**
 * v0.63.0 — Balanceamento v2.1. Gerado a partir do "Documento Oficial de Balanceamento (v2.0)" com as mudanças pedidas:
 * - trocas de vaga (raridade mín→máx) entre cartas e mudanças de função (cat);
 * - Regra de Origem: dentro da mesma raça e função, toda carta que nasce numa raridade acima tem, em cada raridade,
 *   pelo menos 1 ponto (ATQ + vida) a mais que a mais forte das que nasceram abaixo; todas crescem +1 por raridade;
 * - Espera calculada pela força na raridade de origem: (ATQ × 2 + vida) ÷ 3 (ATQ × 1,5 para quem nasce Comum/Incomum),
 *   +1 com habilidade de Tier 4–5 desde a origem; até 6 (só quem nasce Mítico chega a 7–8);
 * - habilidades: `ab` = todas; `up` = raridade em que a habilidade é desbloqueada (Épico/Lendário ganham +1 ao subir).
 * Degraus: "+" dá +1 de vida (mantido no "++"); o "++" dá +1 de ataque só na raridade máxima da carta (progression.ts).
 */
export interface BalanceEntry {
  min: number;
  max: number;
  wait: number;
  /** raridade (1..6) → [ataque, vida] */
  stats: Record<number, [number, number]>;
  /** função nova (quando mudou) */
  cat?: Category;
  /** habilidades da carta (incluindo as desbloqueadas depois) */
  ab: AbilityId[];
  /** habilidade → raridade em que passa a valer */
  up?: Partial<Record<AbilityId, number>>;
  /** v0.64.5: alcance em casas (1 = corpo a corpo) e tipo de dano, quando o jogador mudou no editor */
  range?: number;
  dmg?: 'fisico' | 'magico';
  /** v0.64.5: descrição própria de uma habilidade só nesta carta (mudança "só esta carta" do editor) */
  desc?: Partial<Record<AbilityId, string>>;
  /** v0.64.5: variações de habilidade só nesta carta (ver battle.ts) */
  tweaks?: CardTweak[];
  /** v0.64.5: valores ajustados à mão pelo jogador — ficam fora das regras automáticas (origem e espera) */
  manual?: boolean;
  /** v0.66.0: Aura de raça — aliados (não ele mesmo) daquela raça em campo ganham ataque/vida. Poucas cartas-chave. */
  aura?: { race: Race; atk?: number; hp?: number };
}

/** Variações de habilidade só de uma carta. */
export type CardTweak = 'couracaMagica' | 'execucao13' | 'predadorVidaCheia' | 'emboscadaComAliado' | 'retaguardaSemPerfurar' | 'furiaSemLimite' | 'vampirismoTotal' | 'inabalavelSemMagia';
/** A unidade/carta tem essa variação? */
export const hasTweak = (charId: string, t: CardTweak) => !!BALANCE_V2[charId]?.tweaks?.includes(t);

export const BALANCE_V2: Record<string, BalanceEntry> = {
  // v0.67.0: revisão completa das 6 raças (força = 2 × ataque + vida, pela raridade e pela espera; ver REGRAS.md)
  riku: { min: 1, max: 4, wait: 2, stats: { 1: [2, 3], 2: [2, 5], 3: [3, 6], 4: [4, 6] }, ab: ['salto'], range: 1, manual: true },
  nara: { min: 1, max: 3, wait: 2, stats: { 1: [2, 3], 2: [2, 5], 3: [3, 6] }, ab: ['arrancada'], range: 1, manual: true },
  toru: { min: 1, max: 4, wait: 2, stats: { 1: [2, 6], 2: [2, 8], 3: [3, 9], 4: [3, 12] }, ab: [], range: 1, manual: true },
  aiko: { min: 2, max: 4, wait: 2, stats: { 2: [3, 2], 3: [4, 3], 4: [5, 3] }, ab: ['flechaDupla'], range: 4, manual: true },
  lyra: { min: 2, max: 4, wait: 1, stats: { 2: [3, 3], 3: [4, 3], 4: [5, 3] }, ab: [], range: 4, manual: true },
  gorath: { min: 2, max: 4, wait: 2, stats: { 2: [2, 8], 3: [2, 11], 4: [2, 14] }, ab: [], range: 1, manual: true },
  mei: { min: 2, max: 4, wait: 2, stats: { 2: [1, 5], 3: [1, 8], 4: [1, 10] }, ab: ['lotus'], range: 4, manual: true },
  yume: { min: 2, max: 4, wait: 2, stats: { 2: [3, 2], 3: [4, 3], 4: [5, 3] }, ab: ['diagFrente', 'menorVida'], range: 1, manual: true },
  zarek: { min: 6, max: 6, wait: 5, stats: { 6: [6, 10] }, cat: 'dps', ab: ['retaguarda', 'renascer'], range: 4, dmg: 'magico', tweaks: ['retaguardaSemPerfurar', 'emboscadaComAliado'], desc: { retaguarda: 'Se tiver um aliado à frente dele na fileira (protegendo), ataca o inimigo mais distante no alcance (até 4 casas); senão, ataca o inimigo mais próximo.' }, manual: true },
  kenji: { min: 5, max: 6, wait: 4, stats: { 5: [2, 16], 6: [2, 19] }, cat: 'tanque', ab: ['contraGolpe', 'guarda', 'regeneracao'], up: { regeneracao: 6 }, range: 1, manual: true },
  nyx: { min: 3, max: 5, wait: 3, stats: { 3: [1, 5], 4: [1, 8], 5: [1, 10] }, ab: ['sifao'], range: 4, manual: true },
  vorax: { min: 6, max: 6, wait: 6, stats: { 6: [8, 8] }, ab: ['prole', 'necromancia', 'vinganca'], range: 4, manual: true },
  daichi: { min: 1, max: 3, wait: 2, stats: { 1: [2, 6], 2: [2, 8], 3: [2, 11] }, ab: [], range: 1, manual: true },
  sora: { min: 1, max: 3, wait: 1, stats: { 1: [1, 4], 2: [1, 6], 3: [1, 8] }, ab: [], range: 4, manual: true },
  tobi: { min: 2, max: 4, wait: 3, stats: { 2: [2, 3], 3: [2, 5], 4: [3, 6] }, ab: ['tambor'], range: 1, manual: true },
  kael: { min: 6, max: 6, wait: 7, stats: { 6: [9, 15] }, cat: 'dps', ab: ['brasa', 'queimadura', 'furia'], range: 4, dmg: 'magico', tweaks: ['furiaSemLimite'], desc: { furia: 'Ganha +1 de ataque a cada inimigo derrotado (sem limite).' }, manual: true },
  suri: { min: 1, max: 3, wait: 2, stats: { 1: [2, 2], 2: [3, 2], 3: [4, 3] }, ab: ['mare'], range: 4, manual: true },
  hana: { min: 1, max: 3, wait: 1, stats: { 1: [2, 3], 2: [3, 3], 3: [4, 3] }, ab: [], range: 4, manual: true },
  jin: { min: 1, max: 4, wait: 2, stats: { 1: [2, 4], 2: [3, 4], 3: [4, 5], 4: [5, 6] }, ab: [], range: 4, manual: true },
  ren: { min: 1, max: 4, wait: 2, stats: { 1: [2, 4], 2: [3, 4], 3: [4, 5], 4: [4, 7] }, cat: 'dps', ab: [], range: 2, manual: true },
  kuro: { min: 1, max: 4, wait: 1, stats: { 1: [2, 1], 2: [3, 1], 3: [3, 3], 4: [4, 3] }, ab: ['diagFrente', 'surpresa'], range: 1, manual: true },
  taro: { min: 1, max: 3, wait: 2, stats: { 1: [1, 8], 2: [1, 10], 3: [2, 11] }, ab: [], range: 1, manual: true },
  akemi: { min: 2, max: 4, wait: 2, stats: { 2: [2, 5], 3: [3, 6], 4: [4, 6] }, ab: ['diagFrente', 'sangramento'], range: 1, manual: true },
  shin: { min: 1, max: 4, wait: 2, stats: { 1: [3, 2], 2: [3, 4], 3: [4, 5], 4: [5, 6] }, ab: ['diagFrente'], range: 1, manual: true },
  yuna: { min: 2, max: 4, wait: 2, stats: { 2: [1, 5], 3: [1, 8], 4: [1, 10] }, ab: ['ondaCurativa'], range: 4, manual: true },
  daisuke: { min: 5, max: 6, wait: 5, stats: { 5: [7, 7], 6: [9, 7] }, ab: ['lentidao', 'perfurar', 'critico'], up: { critico: 6 }, range: 4, manual: true },
  masao: { min: 3, max: 5, wait: 2, stats: { 3: [4, 6], 4: [4, 9], 5: [5, 10] }, ab: [], range: 1, manual: true },
  sayuri: { min: 4, max: 6, wait: 3, stats: { 4: [6, 4], 5: [7, 5], 6: [8, 6] }, ab: ['diagFrente', 'retaguarda', 'kiOculto'], up: { kiOculto: 5 }, range: 1, manual: true },
  goro: { min: 3, max: 5, wait: 2, stats: { 3: [2, 11], 4: [2, 14], 5: [2, 17] }, ab: [], range: 1, manual: true },
  emi: { min: 3, max: 5, wait: 2, stats: { 3: [4, 3], 4: [5, 3], 5: [6, 4] }, ab: ['maldicao'], range: 4, manual: true },
  ryuji: { min: 4, max: 6, wait: 4, stats: { 4: [4, 7], 5: [5, 7], 6: [6, 8] }, ab: ['furia', 'critico', 'contraCrescente'], up: { contraCrescente: 5 }, range: 1, manual: true },
  kaori: { min: 4, max: 6, wait: 3, stats: { 4: [1, 13], 5: [1, 16], 6: [2, 17] }, ab: ['gritoGuerra', 'purificar'], up: { purificar: 5 }, range: 1, manual: true },
  tetsuo: { min: 4, max: 6, wait: 4, stats: { 4: [2, 13], 5: [2, 16], 6: [2, 19] }, ab: ['protetor', 'provocar', 'espinhos'], up: { espinhos: 5 }, range: 1, manual: true },
  hayato: { min: 6, max: 6, wait: 6, stats: { 6: [6, 11] }, ab: ['atordoar', 'diagFrente', 'auraAtaque'], range: 2, desc: { auraAtaque: 'Enquanto estiver em campo, todos os outros aliados Humanos ganham +2 de ataque. Cópias desta carta não somam.' }, manual: true, aura: { race: 'humano', atk: 2 } },
  rin: { min: 2, max: 4, wait: 2, stats: { 2: [3, 2], 3: [4, 3], 4: [5, 3] }, ab: ['olhoAguia'], range: 4, manual: true },
  kaito: { min: 6, max: 6, wait: 5, stats: { 6: [7, 12] }, ab: ['anular', 'critico', 'investida'], range: 1, manual: true },
  aya: { min: 5, max: 6, wait: 4, stats: { 5: [5, 9], 6: [6, 10] }, ab: ['ultimaResistencia', 'ombrada', 'vinganca'], up: { vinganca: 6 }, range: 1, manual: true },
  quorr: { min: 1, max: 4, wait: 3, stats: { 1: [1, 9], 2: [1, 12], 3: [1, 15], 4: [1, 18] }, ab: [], range: 1, manual: true },
  pip: { min: 1, max: 3, wait: 2, stats: { 1: [1, 3], 2: [1, 5], 3: [1, 8] }, ab: ['preparacao'], range: 4, manual: true },
  velka: { min: 2, max: 4, wait: 2, stats: { 2: [3, 3], 3: [4, 4], 4: [4, 6] }, cat: 'dps', ab: ['golpeFinal'], range: 1, manual: true },
  orun: { min: 2, max: 4, wait: 2, stats: { 2: [3, 4], 3: [4, 5], 4: [5, 6] }, ab: [], range: 4, manual: true },
  thessa: { min: 2, max: 4, wait: 2, stats: { 2: [3, 5], 3: [3, 8], 4: [4, 9] }, ab: [], range: 1, manual: true },
  kryx: { min: 3, max: 5, wait: 2, stats: { 3: [4, 6], 4: [5, 7], 5: [6, 8] }, ab: [], range: 1, manual: true },
  ilun: { min: 4, max: 6, wait: 4, stats: { 4: [5, 5], 5: [6, 6], 6: [7, 7] }, ab: ['perfurante', 'maldicao', 'atordoar'], up: { maldicao: 5, atordoar: 6 }, range: 4, manual: true },
  brakk: { min: 3, max: 5, wait: 2, stats: { 3: [1, 11], 4: [2, 11], 5: [2, 14] }, ab: ['espinhos'], range: 1, manual: true },
  zynna: { min: 2, max: 4, wait: 1, stats: { 2: [2, 3], 3: [3, 3], 4: [4, 3] }, ab: ['diagFrente', 'bateRecua'], range: 1, manual: true },
  morv: { min: 3, max: 5, wait: 2, stats: { 3: [5, 3], 4: [6, 4], 5: [7, 5] }, ab: [], range: 4, manual: true },
  aurel: { min: 5, max: 6, wait: 5, stats: { 5: [1, 14], 6: [2, 16] }, ab: ['auraVida', 'escudoInicial', 'anjo'], up: { anjo: 6 }, range: 4, desc: { auraVida: 'Enquanto estiver em campo, todos os outros aliados Extraterrestres ganham +2 de vida (atual e máxima). Cópias desta carta não somam.' }, manual: true, aura: { race: 'extraterrestre', hp: 2 } },
  vexar: { min: 5, max: 6, wait: 6, stats: { 5: [7, 11], 6: [8, 13] }, ab: ['furia', 'diagFrente', 'evasao', 'sangramento'], up: { sangramento: 6 }, range: 1, manual: true },
  lunaris: { min: 5, max: 6, wait: 3, stats: { 5: [7, 5], 6: [8, 6] }, ab: ['olhoAguia', 'precisao', 'vigia'], up: { vigia: 6 }, range: 4, manual: true },
  gorm: { min: 5, max: 6, wait: 4, stats: { 5: [2, 16], 6: [2, 19] }, ab: ['inabalavel', 'provocar', 'regeneracao'], up: { regeneracao: 6 }, range: 1, manual: true },
  sylith: { min: 4, max: 6, wait: 2, stats: { 4: [1, 10], 5: [1, 13], 6: [1, 15] }, ab: ['gritoGuerra', 'purificar', 'escudoInicial'], up: { escudoInicial: 5 }, range: 1, manual: true },
  nhyra: { min: 4, max: 6, wait: 4, stats: { 4: [5, 4], 5: [6, 4], 6: [7, 5] }, ab: ['diagFrente', 'ataqueCostas', 'contraCrescente'], up: { contraCrescente: 5 }, range: 1, manual: true },
  bolt: { min: 1, max: 4, wait: 1, stats: { 1: [2, 4], 2: [3, 4], 3: [4, 4], 4: [4, 6] }, ab: [], range: 1, manual: true },
  medi3: { min: 1, max: 4, wait: 2, stats: { 1: [1, 3], 2: [1, 5], 3: [1, 8], 4: [1, 10] }, ab: ['sopro'], range: 4, manual: true },
  kraz9: { min: 2, max: 4, wait: 2, stats: { 2: [2, 5], 3: [3, 6], 4: [4, 6] }, ab: ['diagFrente'], range: 1, manual: true },
  vex4: { min: 2, max: 4, wait: 2, stats: { 2: [4, 2], 3: [5, 3], 4: [6, 4] }, ab: ['diagFrente'], range: 1, manual: true },
  cryo6: { min: 2, max: 4, wait: 2, stats: { 2: [3, 4], 3: [3, 7], 4: [4, 8] }, ab: [], range: 4, manual: true },
  bastion2: { min: 2, max: 4, wait: 4, stats: { 2: [1, 9], 3: [1, 12], 4: [2, 13] }, ab: ['reconstrucao'], range: 1, manual: true },
  echo5: { min: 3, max: 5, wait: 3, stats: { 3: [4, 2], 4: [5, 3], 5: [5, 5] }, ab: ['perfurar'], range: 4, manual: true },
  halo8: { min: 4, max: 6, wait: 5, stats: { 4: [1, 12], 5: [1, 14], 6: [2, 16] }, ab: ['auraVida', 'regeneracao', 'pulsoVital'], up: { regeneracao: 5, pulsoVital: 6 }, range: 4, desc: { auraVida: 'Enquanto estiver em campo, todos os outros aliados Androides ganham +3 de vida (atual e máxima). Cópias desta carta não somam.' }, manual: true, aura: { race: 'androide', hp: 3 } },
  spike11: { min: 3, max: 5, wait: 2, stats: { 3: [3, 4], 4: [4, 5], 5: [4, 7] }, ab: ['disparoInstavel'], range: 2, manual: true },
  phase3: { min: 3, max: 5, wait: 3, stats: { 3: [4, 2], 4: [5, 3], 5: [6, 3] }, ab: ['diagFrente', 'teleporte'], range: 1, manual: true },
  titanx: { min: 6, max: 6, wait: 5, stats: { 6: [3, 19] }, ab: ['provocar', 'inabalavel', 'cascaReativa'], range: 1, tweaks: ['inabalavelSemMagia'], desc: { inabalavel: 'Não pode ser empurrado. Resistência física.' }, manual: true },
  pulse7: { min: 4, max: 6, wait: 4, stats: { 4: [5, 5], 5: [6, 6], 6: [7, 7] }, ab: ['raioCadeia', 'lentidao'], up: { lentidao: 5 }, range: 4, manual: true },
  omega9: { min: 5, max: 6, wait: 3, stats: { 5: [2, 9], 6: [2, 12] }, ab: ['dominio', 'barreira'], up: { barreira: 6 }, range: 4, manual: true },
  sentinel0: { min: 4, max: 6, wait: 3, stats: { 4: [2, 14], 5: [2, 17], 6: [2, 20] }, ab: ['escudoInicial', 'guarda'], up: { guarda: 5 }, range: 1, manual: true },
  razorv: { min: 5, max: 6, wait: 4, stats: { 5: [5, 9], 6: [6, 10] }, ab: ['diagFrente', 'golpeDuplo', 'vampirismo'], up: { vampirismo: 6 }, range: 1, manual: true },
  mimic: { min: 6, max: 6, wait: 6, stats: { 6: [7, 13] }, ab: ['copiador', 'investida', 'anular'], range: 1, manual: true },
  aegis: { min: 5, max: 6, wait: 4, stats: { 5: [2, 16], 6: [2, 19] }, ab: ['retaliacao', 'guarda', 'espinhos'], up: { espinhos: 6 }, range: 1, manual: true },
  fen: { min: 1, max: 4, wait: 1, stats: { 1: [2, 3], 2: [3, 3], 3: [4, 3], 4: [4, 5] }, ab: [], range: 4, manual: true },
  bram: { min: 1, max: 4, wait: 1, stats: { 1: [1, 7], 2: [1, 9], 3: [1, 11], 4: [1, 13] }, ab: [], range: 1, manual: true },
  isel: { min: 2, max: 4, wait: 2, stats: { 2: [2, 5], 3: [3, 6], 4: [4, 6] }, ab: ['diagFrente'], range: 1, manual: true },
  odo: { min: 4, max: 6, wait: 3, stats: { 4: [1, 13], 5: [1, 16], 6: [2, 17] }, cat: 'suporte', ab: ['escudoInicial', 'purificar', 'lentidao'], up: { purificar: 5, lentidao: 6 }, range: 4, manual: true },
  celina: { min: 3, max: 5, wait: 2, stats: { 3: [4, 5], 4: [5, 6], 5: [6, 7] }, ab: [], range: 4, manual: true },
  tiberius: { min: 6, max: 6, wait: 5, stats: { 6: [2, 18] }, ab: ['auraVida', 'purificar', 'lotus'], range: 4, desc: { auraVida: 'Enquanto estiver em campo, todos os outros aliados Magos Arcanos ganham +3 de vida (atual e máxima). Cópias desta carta não somam.' }, manual: true, aura: { race: 'mago', hp: 3 } },
  nalia: { min: 3, max: 5, wait: 2, stats: { 3: [4, 5], 4: [5, 6], 5: [6, 7] }, ab: [], range: 4, manual: true },
  varo: { min: 3, max: 5, wait: 2, stats: { 3: [2, 11], 4: [2, 14], 5: [2, 17] }, ab: [], range: 1, manual: true },
  selene: { min: 4, max: 6, wait: 3, stats: { 4: [6, 4], 5: [7, 5], 6: [8, 6] }, ab: ['queimadura', 'congelar', 'maldicao'], up: { congelar: 5, maldicao: 6 }, range: 4, manual: true },
  dorian: { min: 2, max: 4, wait: 3, stats: { 2: [2, 2], 3: [2, 3], 4: [3, 4] }, ab: ['auraAtaque'], range: 4, desc: { auraAtaque: 'Enquanto estiver em campo, todos os outros aliados Humanos ganham +1 de ataque. Cópias desta carta não somam.' }, manual: true, aura: { race: 'humano', atk: 1 } },
  kaela: { min: 4, max: 6, wait: 3, stats: { 4: [6, 4], 5: [7, 5], 6: [8, 6] }, ab: ['diagFrente', 'maldicao', 'surpresa'], up: { surpresa: 5 }, range: 1, manual: true },
  morgause: { min: 5, max: 6, wait: 4, stats: { 5: [6, 4], 6: [7, 5] }, ab: ['clone', 'reflexo', 'barreira'], up: { barreira: 6 }, range: 4, manual: true },
  eldrin: { min: 5, max: 6, wait: 3, stats: { 5: [7, 5], 6: [8, 6] }, ab: ['brasa', 'olhoAguia', 'perfurante'], up: { perfurante: 6 }, range: 4, manual: true },
  vesna: { min: 6, max: 6, wait: 4, stats: { 6: [9, 7] }, cat: 'arqueiro', ab: ['congelar', 'lentidao', 'flechaDupla'], range: 4, manual: true },
  corvin: { min: 5, max: 6, wait: 4, stats: { 5: [5, 9], 6: [6, 10] }, ab: ['furia', 'perfurar'], up: { perfurar: 6 }, range: 1, manual: true },
  aethra: { min: 6, max: 6, wait: 6, stats: { 6: [9, 8] }, ab: ['raioCadeia', 'atordoar', 'perfurante'], range: 4, manual: true },
  grub: { min: 1, max: 4, wait: 3, stats: { 1: [2, 6], 2: [3, 7], 3: [3, 10], 4: [4, 11] }, ab: [], range: 1, manual: true },
  skarr: { min: 4, max: 6, wait: 3, stats: { 4: [6, 4], 5: [7, 5], 6: [8, 6] }, ab: ['diagFrente', 'retaguarda', 'veneno'], up: { veneno: 5 }, range: 1, manual: true },
  bufo: { min: 2, max: 4, wait: 3, stats: { 2: [3, 6], 3: [4, 7], 4: [5, 8] }, ab: [], range: 4, manual: true },
  trokk: { min: 5, max: 6, wait: 4, stats: { 5: [5, 7], 6: [6, 8] }, ab: ['diagFrente', 'auraAtaque', 'furia'], up: { furia: 6 }, range: 1, desc: { auraAtaque: 'Enquanto estiver em campo, todos os outros aliados Monstros ganham +1 de ataque. Cópias desta carta não somam.' }, manual: true, aura: { race: 'monstro', atk: 1 } },
  magra: { min: 3, max: 5, wait: 2, stats: { 3: [1, 11], 4: [2, 11], 5: [2, 14] }, ab: ['explosao'], range: 1, manual: true },
  fenra: { min: 3, max: 5, wait: 3, stats: { 3: [1, 5], 4: [1, 8], 5: [1, 10] }, ab: ['auraVida'], range: 1, desc: { auraVida: 'Enquanto estiver em campo, todos os outros aliados Necromantes ganham +2 de vida (atual e máxima). Cópias desta carta não somam.' }, manual: true, aura: { race: 'necromante', hp: 2 } },
  spindra: { min: 3, max: 5, wait: 2, stats: { 3: [5, 3], 4: [6, 4], 5: [7, 5] }, ab: [], range: 4, manual: true },
  ghul: { min: 2, max: 4, wait: 2, stats: { 2: [3, 5], 3: [4, 6], 4: [5, 7] }, ab: [], range: 1, manual: true },
  krag: { min: 4, max: 6, wait: 3, stats: { 4: [5, 7], 5: [6, 8], 6: [6, 11] }, ab: ['investida', 'ombrada'], up: { ombrada: 5 }, range: 1, manual: true },
  ysmera: { min: 1, max: 4, wait: 2, stats: { 1: [1, 3], 2: [1, 5], 3: [1, 8], 4: [1, 10] }, cat: 'suporte', ab: ['sopro'], range: 4, manual: true },
  borgo: { min: 4, max: 6, wait: 3, stats: { 4: [2, 14], 5: [2, 17], 6: [2, 20] }, ab: ['regeneracao', 'provocar', 'espinhos'], up: { espinhos: 5 }, range: 1, manual: true },
  rhazor: { min: 3, max: 5, wait: 3, stats: { 3: [4, 8], 4: [5, 9], 5: [6, 11] }, ab: [], range: 1, manual: true },
  oculus: { min: 5, max: 6, wait: 4, stats: { 5: [6, 6], 6: [7, 7] }, ab: ['maldicao', 'atordoar'], up: { atordoar: 6 }, range: 4, manual: true },
  grendar: { min: 5, max: 6, wait: 4, stats: { 5: [2, 14], 6: [2, 17] }, ab: ['protetor', 'pulsoVital'], up: { pulsoVital: 6 }, range: 1, manual: true },
  kolossus: { min: 6, max: 6, wait: 7, stats: { 6: [3, 28] }, ab: ['couracaAdaptativa', 'provocar', 'guarda'], range: 1, tweaks: ['couracaMagica'], desc: { couracaAdaptativa: 'Começa com resistência mágica 1. Cada golpe físico recebido cura 1 de vida e soma +1 de resistência mágica (até 4).' }, manual: true },
  vharga: { min: 6, max: 6, wait: 6, stats: { 6: [7, 13] }, cat: 'dps', ab: ['execucao', 'menorVida', 'vampirismo'], range: 2, dmg: 'magico', tweaks: ['vampirismoTotal', 'execucao13', 'predadorVidaCheia'], desc: { execucao: 'Derrota na hora o inimigo atingido (não o Comandante) se ele ficar com 13 de vida ou menos.', menorVida: 'Ataca o inimigo com menos vida da sua fileira até 2 casas à frente; se ele estiver com a vida cheia, causa +4 de dano.', vampirismo: 'Cura a si mesmo totalmente sempre que derrotar um inimigo.' }, manual: true },
  ossian: { min: 1, max: 4, wait: 1, stats: { 1: [2, 4], 2: [3, 4], 3: [3, 6], 4: [4, 6] }, ab: [], range: 1, manual: true },
  mira: { min: 1, max: 4, wait: 3, stats: { 1: [1, 6], 2: [1, 9], 3: [1, 12], 4: [2, 13] }, ab: [], range: 4, manual: true },
  grav: { min: 1, max: 4, wait: 3, stats: { 1: [1, 9], 2: [1, 12], 3: [2, 13], 4: [2, 16] }, ab: [], range: 1, manual: true },
  pira: { min: 5, max: 6, wait: 3, stats: { 5: [7, 5], 6: [8, 6] }, ab: ['queimadura', 'brasa'], range: 4, manual: true },
  lethe: { min: 2, max: 4, wait: 1, stats: { 2: [3, 3], 3: [4, 3], 4: [4, 5] }, cat: 'arqueiro', ab: [], range: 4, manual: true },
  cador: { min: 2, max: 4, wait: 2, stats: { 2: [3, 2], 3: [4, 3], 4: [5, 3] }, ab: ['veneno'], range: 4, manual: true },
  brunna: { min: 5, max: 6, wait: 4, stats: { 5: [5, 9], 6: [6, 10] }, ab: ['impeto', 'vinganca', 'diagFrente'], up: { diagFrente: 6 }, range: 1, manual: true },
  wex: { min: 1, max: 4, wait: 2, stats: { 1: [2, 4], 2: [3, 4], 3: [4, 5], 4: [5, 6] }, ab: [], range: 4, manual: true },
  morrigan: { min: 3, max: 5, wait: 2, stats: { 3: [3, 6], 4: [4, 6], 5: [5, 7] }, ab: ['diagFrente'], range: 1, manual: true },
  thane: { min: 4, max: 6, wait: 4, stats: { 4: [2, 13], 5: [2, 16], 6: [2, 19] }, ab: ['provocar', 'espinhos', 'cascaReativa'], up: { cascaReativa: 5 }, range: 1, manual: true },
  ivra: { min: 6, max: 6, wait: 5, stats: { 6: [2, 18] }, ab: ['auraVida', 'purificar', 'sopro'], range: 4, desc: { auraVida: 'Enquanto estiver em campo, todos os outros aliados Necromantes ganham +2 de vida (atual e máxima). Cópias desta carta não somam.' }, manual: true, aura: { race: 'necromante', hp: 2 } },
  sabbath: { min: 4, max: 6, wait: 3, stats: { 4: [6, 4], 5: [7, 5], 6: [8, 6] }, ab: ['diagFrente', 'sangramento', 'ataqueCostas'], up: { ataqueCostas: 5 }, range: 1, manual: true },
  nocturna: { min: 4, max: 6, wait: 3, stats: { 4: [6, 4], 5: [7, 5], 6: [8, 6] }, ab: ['maldicao', 'veneno', 'queimadura'], up: { veneno: 5, queimadura: 6 }, range: 4, manual: true },
  ghor: { min: 6, max: 6, wait: 7, stats: { 6: [4, 30] }, ab: ['provocar', 'guarda', 'regeneracao'], range: 1, manual: true },
  lamenta: { min: 2, max: 4, wait: 2, stats: { 2: [2, 4], 3: [3, 5], 4: [4, 5] }, ab: ['pressao'], range: 4, manual: true },
  drakon: { min: 2, max: 4, wait: 3, stats: { 2: [3, 7], 3: [4, 8], 4: [4, 11] }, ab: [], range: 1, manual: true },
  sanguis: { min: 6, max: 6, wait: 7, stats: { 6: [9, 15] }, ab: ['sedeEterna', 'critico', 'investida'], range: 1, manual: true },
  elegia: { min: 3, max: 5, wait: 3, stats: { 3: [1, 7], 4: [1, 10], 5: [1, 12] }, ab: ['ressurreicao'], range: 4, manual: true },
};
