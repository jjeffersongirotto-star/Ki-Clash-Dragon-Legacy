/**
 * v0.25.0 — Tutorial (lógica pura, sem DOM).
 *
 * Uma fase só do tutorial, ANTES da fase 1 (a fase 1 não muda). O jogador novo:
 *  1. começa só com o Riku e faz a Batalha 1: 1 contra 1, guiada, feita para ele vencer;
 *  2. abre um pacote grátis com a Sora (suporte de longo alcance) e a Nara (Corte Diagonal);
 *  3. faz a Batalha 2 contra Daichi, Hana e Tobi, que mostram as habilidades;
 *  4. ganha a recompensa do tutorial (Orbes, Essências e os itens do "+" dos 3) e segue para a fase 1.
 * Saves antigos (com qualquer progresso) e a conta ADM pulam o tutorial. Dá para pular a qualquer momento:
 * quem pula recebe o pacote e a recompensa do mesmo jeito.
 */
import type { Stage } from './campaign';
import { gearNeeded, type GearBag, addGear } from './gear';
import type { OrbBag } from './progression';
import type { CardInstance } from './types';

/** Etapas guardadas no save: 0 = Batalha 1 · 1 = pacote · 2 = Batalha 2 · 3 = concluído */
export const TUT_BATTLE1 = 0;
export const TUT_PACK = 1;
export const TUT_BATTLE2 = 2;
export const TUT_DONE = 3;

export const TUTORIAL_STARTER = 'riku';
export const TUTORIAL_PACK = ['sora', 'nara'];
export const TUTORIAL_CHARS = [TUTORIAL_STARTER, ...TUTORIAL_PACK];

const enemy = (charId: string, copies = 3): CardInstance => ({ charId, stars: 1, plus: 0, copies });

/** As 2 batalhas do tutorial (id 0: não contam como fase da Aventura). */
export const TUTORIAL_BATTLES: Stage[] = [
  { id: 0, name: 'Tutorial · Batalha 1', enemyHeroHp: 6, enemyDeck: [enemy('kuro')], rewards: { essencias: 0, orbs: {} }, pack: [] },
  { id: 0, name: 'Tutorial · Batalha 2', enemyHeroHp: 10, enemyDeck: [enemy('daichi'), enemy('hana'), enemy('tobi')], rewards: { essencias: 0, orbs: {} }, pack: [] },
];

/**
 * Recompensa ao terminar o tutorial: os Orbes que o jogador novo ganhava no começo (10 Comuns e 3 Raros = 2.200 XP,
 * o bastante para encher a barra do "+" dos 3) e as Essências do Despertar dos 3 (4 cada). Junto com os itens do "+"
 * (tutorialGear), os 3 sobem para Comum+. Simulador: vitória ao chegar na fase 1 = 93% com o baralho só dos 3 personagens.
 */
export const TUTORIAL_REWARD: { essencias: number; orbs: OrbBag } = { essencias: 12, orbs: { orbe1: 10, orbe3: 3 } };

/** Itens que o tutorial dá: os do "+" de cada um dos 3 personagens (para o jogador aprender o Despertar). */
export function tutorialGear(): GearBag {
  const bag: GearBag = {};
  for (const id of TUTORIAL_CHARS) for (const g of gearNeeded({ charId: id, stars: 1, plus: 0 })) addGear(bag, g.id, g.rarity);
  return bag;
}

/** Caixinhas de texto de cada batalha (curtas, uma por vez). */
export const TUTORIAL_TIPS: { icon: string; title: string; text: string }[][] = [
  [
    { icon: '🎯', title: 'Objetivo', text: 'Derrube a vida do Comandante inimigo (lá na direita) antes que ele derrube a do seu (na esquerda).' },
    { icon: '🃏', title: 'Invocar', text: 'Toque na carta do Riku na sua mão e depois numa casa brilhante das 3 colunas da esquerda. Essa é a sua zona.' },
    { icon: '⚔', title: 'Lutar', text: 'Toque em LUTAR. Seus personagens andam para a direita e atacam. Quem chega ao fim da arena bate no Comandante inimigo.' },
    { icon: '❤', title: 'Vida do Comandante', text: 'As barras lá em cima mostram a vida dos dois Comandantes. Se a sua chegar a 0, você perde.' },
  ],
  [
    { icon: '✨', title: 'Habilidades', text: 'Cada personagem tem habilidades. Segure uma carta (ou toque numa unidade) para ver o que ela faz.' },
    { icon: '➕', title: 'Sora', text: 'A Sora ataca de longe (até 4 casas na fileira dela) e cura o aliado mais ferido da fileira. Deixe-a atrás dos outros.' },
    { icon: '🌙', title: 'Nara', text: 'A Nara também acerta o inimigo na diagonal logo à frente (na outra fileira).' },
    { icon: '👀', title: 'Inimigos', text: 'Daichi devolve dano a quem o ataca de frente, Hana atira de longe e Tobi dá ataque aos vizinhos. Derrube a Hana e o Tobi primeiro!' },
    { icon: '🤖', title: 'Auto', text: 'Com o botão Auto, o jogo invoca e luta por você. Use quando quiser jogar mais rápido.' },
  ],
];

/** Quantos personagens o jogador tem depois do tutorial (o mínimo do baralho é 3 × isso, até 20). */
export const POST_TUTORIAL_CHARS = TUTORIAL_CHARS.length;
