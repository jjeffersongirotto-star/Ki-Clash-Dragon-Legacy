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
import type { BattleState, CardInstance } from './types';
import { deployCells, waitOf } from './battle';
import { isSpell } from './spells';

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
  // v0.33.0: guiado e sem espera na mão — o inimigo invoca tudo o que tem, então tem menos cartas
  { id: 0, name: 'Tutorial · Batalha 1', enemyHeroHp: 6, enemyDeck: [enemy('kuro', 1)], rewards: { essencias: 0, orbs: {} }, pack: [] },
  { id: 0, name: 'Tutorial · Batalha 2', enemyHeroHp: 10, enemyDeck: [enemy('daichi', 2), enemy('hana', 1), enemy('tobi', 2)], rewards: { essencias: 0, orbs: {} }, pack: [] },
];

/**
 * Recompensa ao terminar o tutorial: os Orbes que o jogador novo ganhava no começo (10 Comuns e 3 Raros = 2.200 XP,
 * o bastante para encher a barra do "+" dos 3) e as Essências do Despertar dos 3 (4 cada). Junto com os itens do "+"
 * (tutorialGear), os 3 sobem para Comum+. Simulador: vitória ao chegar na fase 1 = 93% com o baralho só dos 3 personagens.
 */
export const TUTORIAL_REWARD: { essencias: number; orbs: OrbBag } = { essencias: 12, orbs: { orbe1: 10, orbe3: 3 } };
/** v0.33.0: 💠 Gemas de Invocação no fim do tutorial (gastas no passo guiado do Banner). */
export const TUTORIAL_GEMS = 2;

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
    { icon: '✨', title: 'Habilidades', text: 'Cada personagem tem habilidades. Segure uma carta ou unidade para ver o que ela faz.' },
    { icon: '➕', title: 'Sora', text: 'A Sora ataca de longe (até 4 casas na fileira dela) e cura o aliado mais ferido da fileira. Deixe-a atrás dos outros.' },
    { icon: '🌙', title: 'Nara', text: 'A Nara também acerta o inimigo na diagonal logo à frente (na outra fileira).' },
    { icon: '👀', title: 'Inimigos', text: 'Daichi devolve dano a quem o ataca de frente, Hana atira de longe e Tobi dá ataque aos vizinhos. Derrube a Hana e o Tobi primeiro!' },
    { icon: '🤖', title: 'Auto', text: 'Com o botão Auto, o jogo invoca e luta por você. Use quando quiser jogar mais rápido.' },
  ],
];

/** Quantos personagens o jogador tem depois do tutorial (o mínimo do baralho é 3 × isso, até 20). */
export const POST_TUTORIAL_CHARS = TUTORIAL_CHARS.length;

// ---------- v0.33.0: tutorial GUIADO (sempre igual) ----------

/** Sementes fixas das 2 batalhas do tutorial (com as cartas sem espera, a partida é sempre a mesma). */
export const TUTORIAL_SEEDS = [20261027, 20261028];

/** O que o tutorial pede agora: tocar numa carta da mão, numa casa, em LUTAR, ou só assistir. */
export type GuideAction = { kind: 'hold'; hand: number; charId: string } | { kind: 'card'; hand: number; charId: string } | { kind: 'cell'; r: number; c: number; charId: string } | { kind: 'fight' } | { kind: 'watch' };

/** Memória do roteiro: turno atual e quantas cartas já tinham sido usadas no começo dele. */
export interface GuideMemo {
  turn: number;
  cardsAtTurn: number;
  /** v0.35.0: já segurou uma carta para ver a descrição (passo da Batalha 2) */
  held: boolean;
}
export const newGuideMemo = (): GuideMemo => ({ turn: -1, cardsAtTurn: 0, held: false });

/** Batalha 2: ordem das primeiras invocações e a casa de cada uma (fileira, coluna). */
const PLAN2: { id: string; r: number; c: number }[] = [
  { id: 'riku', r: 0, c: 2 },
  { id: 'sora', r: 0, c: 0 },
  { id: 'nara', r: 1, c: 2 },
];

const cardsUsed = (s: BattleState) => s.stats?.player.cards ?? 0;

/**
 * Próximo passo do roteiro (uma invocação por turno; depois, LUTAR). `selected` = carta escolhida na mão.
 * Determinístico: mesma partida → mesmos passos.
 */
export function guideStep(i: 0 | 1, s: BattleState, selected: number | null, memo: GuideMemo): GuideAction {
  if (s.winner || s.active !== 'player') return { kind: 'watch' };
  if (memo.turn !== s.turn) {
    memo.turn = s.turn;
    memo.cardsAtTurn = cardsUsed(s);
  }
  const hand = s.decks.player.hand;
  const ready = hand.map((h, k) => ({ h, k })).filter(({ h }) => !isSpell(h.charId) && waitOf(h) === 0);
  const cells = deployCells(s, 'player');
  if (cardsUsed(s) === memo.cardsAtTurn && ready.length && cells.length) {
    const n = cardsUsed(s);
    const plan = i === 1 ? PLAN2[n] : undefined;
    const pick = (plan && ready.find(({ h }) => h.charId === plan.id)) || ready[0];
    // v0.35.0: antes da 1ª invocação da Batalha 2, ensina a SEGURAR a carta para ver a descrição
    if (i === 1 && n === 0 && !memo.held) return { kind: 'hold', hand: pick.k, charId: pick.h.charId };
    if (selected !== pick.k) return { kind: 'card', hand: pick.k, charId: pick.h.charId };
    const want = plan && pick.h.charId === plan.id && cells.some(([r, c]) => r === plan.r && c === plan.c) ? [plan.r, plan.c] : [...cells].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
    return { kind: 'cell', r: want[0], c: want[1], charId: pick.h.charId };
  }
  return { kind: 'fight' };
}

/** Texto do passo (muda conforme o que já foi feito). `touch` = celular/tablet (toque) ou PC (mouse). */
export function guideText(i: 0 | 1, a: GuideAction, s: BattleState, touch = true): string {
  const n = cardsUsed(s);
  if (a.kind === 'hold')
    return touch
      ? 'Para ver o que uma carta faz, <b>toque e segure</b> a carta do <b>Riku</b> até aparecer a descrição.'
      : 'Para ver o que uma carta faz, <b>clique e segure</b> a carta do <b>Riku</b> (ou clique com o <b>botão direito</b>) até aparecer a descrição.';
  if (a.kind === 'watch') return s.winner ? '' : 'Veja o que acontece: seus personagens andam e atacam, depois o inimigo joga.';
  if (i === 0) {
    if (a.kind === 'card') return n === 0 ? 'Esta é a sua <b>mão</b>. Toque na carta do <b>Riku</b> para escolhê-la.' : 'Chegou carta nova na mão. Toque nela para invocar mais um <b>Riku</b>.';
    if (a.kind === 'cell') return n === 0 ? 'Agora toque na <b>casa destacada</b>. A sua zona são as 3 colunas da esquerda: é lá que os personagens entram.' : 'Toque na <b>casa destacada</b> para invocar.';
    if (s.turn <= 1) return 'Toque em <b>LUTAR ⚔</b>. Seus personagens andam para a direita e atacam quem estiver na frente.';
    if (s.turn === 2) return 'Lá em cima ficam as <b>barras de vida</b> dos Comandantes. Quem chega ao fim da arena bate no Comandante inimigo. Toque em <b>LUTAR</b>.';
    return 'Continue! Toque em <b>LUTAR</b> até derrubar o Comandante inimigo.';
  }
  if (a.kind === 'card') {
    if (n === 0) return 'Isso! A descrição mostra as habilidades (vale também para as unidades em campo). Agora <b>toque</b> (sem segurar) na carta do <b>Riku</b> para escolhê-la.';
    if (n === 1) return 'A <b>Sora</b> ataca de longe (até 4 casas) e cura o aliado mais ferido da fileira. Toque na carta da Sora.';
    if (n === 2) return 'A <b>Nara</b> também acerta o inimigo na <b>diagonal</b> logo à frente. Toque na carta da Nara.';
    return 'Invoque a carta pronta: toque nela e depois na casa destacada.';
  }
  if (a.kind === 'cell') {
    if (n === 0) return 'Coloque o Riku na frente: toque na casa destacada.';
    if (n === 1) return 'Coloque a Sora <b>atrás</b> do Riku, na mesma fileira: assim ela fica protegida.';
    if (n === 2) return 'Coloque a Nara na <b>outra fileira</b>.';
    return 'Toque na casa destacada.';
  }
  if (n >= 3 && s.turn <= 4) return 'Os inimigos também têm habilidades: <b>Daichi</b> devolve dano, <b>Hana</b> atira de longe e <b>Tobi</b> dá ataque aos vizinhos. Toque em <b>LUTAR</b>.';
  return 'Toque em <b>LUTAR</b>. Dica: segure uma carta ou unidade para ver as habilidades e use o <b>Auto</b> para jogar mais rápido.';
}