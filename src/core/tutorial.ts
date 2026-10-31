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
import { deployCells, spellTargets, waitOf } from './battle';
import { getSpell, isSpell } from './spells';

/** Etapas guardadas no save: 0 = Batalha 1 · 1 = pacote · 2 = Batalha 2 · 3 = concluído */
export const TUT_BATTLE1 = 0;
export const TUT_PACK = 1;
export const TUT_BATTLE2 = 2;
export const TUT_DONE = 3;

export const TUTORIAL_STARTER = 'riku';
export const TUTORIAL_PACK = ['sora', 'nara'];
export const TUTORIAL_CHARS = [TUTORIAL_STARTER, ...TUTORIAL_PACK];
/**
 * v0.41.0: o feitiço do pacote do tutorial (os feitiços deixaram de vir todos liberados). Escolhido no simulador
 * entre os que o Riku, a Sora ou a Nara conseguem lançar (scripts/balance/v41.ts): o que mais ajuda o jogador novo.
 */
export const TUTORIAL_SPELL = 'f-investida';
/** cópias do feitiço do tutorial (todas entram no baralho) */
export const TUTORIAL_SPELL_COPIES = 2;

const enemy = (charId: string, copies = 3): CardInstance => ({ charId, stars: 1, plus: 0, copies });

/** As 2 batalhas do tutorial (id 0: não contam como fase da Aventura). */
export const TUTORIAL_BATTLES: Stage[] = [
  // v0.33.0: guiado e sem espera na mão — o inimigo invoca tudo o que tem, então tem menos cartas
  // v0.36.0: arena de 10 colunas (o inimigo chega mais rápido): 1 Tobi a menos na Batalha 2
  { id: 0, name: 'Tutorial · Batalha 1', enemyHeroHp: 6, enemyDeck: [enemy('kuro', 1)], rewards: { essencias: 0, orbs: {} }, pack: [] },
  { id: 0, name: 'Tutorial · Batalha 2', enemyHeroHp: 10, enemyDeck: [enemy('daichi', 2), enemy('hana', 1), enemy('tobi', 1)], rewards: { essencias: 0, orbs: {} }, pack: [] },
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
    { icon: '🃏', title: 'Invocar', text: 'Toque na carta do Riku na sua mão e depois em um dos 6 quadrados destacados: essa é a sua zona de invocação. Toque em <b>Continuar</b>.' },
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
  /** v0.55.0: já leu e FECHOU a descrição (o roteiro segue para jogar a carta) */
  infoDone?: boolean;
}
export const newGuideMemo = (): GuideMemo => ({ turn: -1, cardsAtTurn: 0, held: false, infoDone: false });

/**
 * v0.55.0: fase do passo "segure a carta" (Batalha 2). Depois de segurar, enquanto a descrição está aberta, só ela
 * fica destacada ('info'); ao fechar, o roteiro AVANÇA para jogar a carta ('guide') e não volta a pedir a descrição.
 */
export function holdPhase(memo: GuideMemo, infoOpen: boolean): 'info' | 'guide' {
  if (!memo.held || memo.infoDone) return 'guide';
  if (infoOpen) return 'info';
  memo.infoDone = true;
  return 'guide';
}

/** Batalha 2: ordem das primeiras invocações e a casa de cada uma (fileira, coluna). */
const PLAN2: { id: string; r: number; c: number }[] = [
  { id: 'riku', r: 0, c: 2 },
  { id: 'sora', r: 0, c: 0 },
  { id: 'nara', r: 1, c: 2 },
];

const cardsUsed = (s: BattleState) => s.stats?.player.cards ?? 0;
const spellsUsed = (s: BattleState) => s.stats?.player.spells ?? 0;

/**
 * v0.41.0: alvo que o tutorial aponta para o feitiço: na fileira, a que tem mais inimigos (a casa do inimigo mais à
 * frente dela); num inimigo, o mais à frente; senão, o primeiro alvo possível.
 */
function spellAim(s: BattleState, id: string): [number, number] | undefined {
  const t = spellTargets(s, 'player', id);
  if (!t.length) return undefined;
  const foes = s.units.filter((u) => u.side === 'enemy' && u.hp > 0).sort((a, b) => a.col - b.col || a.row - b.row);
  const sp = getSpell(id);
  if (sp.target === 'row' && foes.length) {
    const per = (r: number) => foes.filter((u) => u.row === r).length;
    const row = [...new Set(foes.map((u) => u.row))].sort((a, b) => per(b) - per(a) || a - b)[0];
    const u = foes.find((f) => f.row === row)!;
    return [u.row, u.col];
  }
  if (sp.target === 'enemy' && foes.length) return [foes[0].row, foes[0].col];
  return t[0];
}

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
  // v0.41.0: Batalha 2 — depois das 3 primeiras invocações, ensina a lançar o feitiço (uma vez), assim que der
  if (i === 1 && cardsUsed(s) === memo.cardsAtTurn && cardsUsed(s) >= PLAN2.length && spellsUsed(s) === 0) {
    const sp = hand.map((h, k) => ({ h, k })).find(({ h }) => isSpell(h.charId) && waitOf(h) === 0 && spellAim(s, h.charId));
    if (sp) {
      if (selected !== sp.k) return { kind: 'card', hand: sp.k, charId: sp.h.charId };
      const [r, c] = spellAim(s, sp.h.charId)!;
      return { kind: 'cell', r, c, charId: sp.h.charId };
    }
  }
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

/**
 * Texto do passo (muda conforme o que já foi feito). `touch` = celular/tablet (toque) ou PC (mouse).
 * v0.42.1: `zoneIntro` = 1ª invocação da Batalha 1, antes do círculo: mostra que vale qualquer uma das 6 casas da zona.
 */
export function guideText(i: 0 | 1, a: GuideAction, s: BattleState, touch = true, zoneIntro = false): string {
  const n = cardsUsed(s);
  if (a.kind === 'hold')
    return touch
      ? 'Para ver o que uma carta faz, <b>toque e segure</b> a carta do <b>Riku</b> até aparecer a descrição.'
      : 'Para ver o que uma carta faz, <b>clique e segure</b> a carta do <b>Riku</b> (ou clique com o <b>botão direito</b>) até aparecer a descrição.';
  if (a.kind === 'watch') return s.winner ? '' : 'Veja o que acontece: seus personagens andam e atacam, depois o inimigo joga.';
  // v0.41.0: o passo do feitiço (Batalha 2)
  if ((a.kind === 'card' || a.kind === 'cell') && isSpell(a.charId)) {
    const sp = getSpell(a.charId);
    const tap = touch ? 'Toque' : 'Clique';
    if (a.kind === 'card') return `Hora do <b>feitiço</b>! ${tap} na carta <b>${sp.icon} ${sp.name}</b>. Feitiço não entra em campo: um aliado da categoria dele (aqui, quem tem o maior ataque) conjura.`;
    const what = sp.target === 'row' ? 'acerta <b>todos os inimigos da fileira</b>' : sp.target === 'enemy' ? 'acerta o <b>inimigo destacado</b>' : sp.target === 'ally' ? 'vale para o <b>aliado destacado</b>' : 'faz efeito';
    return `${tap} na <b>casa destacada</b> para lançar: o feitiço ${what}. Depois ele volta para o baralho e reaparece na mão.`;
  }
  if (i === 0) {
    if (a.kind === 'card') return n === 0 ? 'Esta é a sua <b>mão</b>. Toque na carta do <b>Riku</b> para escolhê-la.' : 'Chegou carta nova na mão. Toque nela para invocar mais um <b>Riku</b>.';
    if (a.kind === 'cell') {
      if (n === 0 && zoneIntro) return 'Você pode colocar o <b>Riku</b> em <b>qualquer um dos 6 quadrados destacados</b>: essa é a sua zona de invocação. Toque em <b>Continuar</b>.';
      return n === 0 ? 'Coloque o <b>Riku</b> aqui: toque na <b>casa circulada</b>.' : 'Toque na <b>casa circulada</b> para invocar.';
    }
    if (s.turn <= 1) return 'Toque em <b>LUTAR ⚔</b>. Seus personagens andam para a direita e atacam quem estiver na frente.';
    if (s.turn === 2) return 'Lá em cima ficam as <b>barras de vida</b> dos Comandantes. Quem chega ao fim da arena bate no Comandante inimigo. Toque em <b>LUTAR</b>.';
    return 'Continue! Toque em <b>LUTAR</b> até derrubar o Comandante inimigo.';
  }
  if (a.kind === 'card') {
    if (n === 0) return 'Isso! A descrição mostra as habilidades (vale também para as unidades em campo). Agora <b>toque</b> (sem segurar) na carta do <b>Riku</b> para escolhê-la.';
    if (n === 1) return 'A <b>Sora</b> ataca de longe (até 4 casas) e cura o aliado mais ferido da fileira. Toque na carta da Sora.';
    if (n === 2) return 'A <b>Nara</b> também acerta o inimigo na <b>diagonal</b> logo à frente. Toque na carta da Nara.';
    return 'Invoque a carta pronta: toque nela e depois na casa circulada.';
  }
  if (a.kind === 'cell') {
    if (n === 0) return 'Coloque o Riku na <b>casa circulada</b>, na frente da sua zona.';
    if (n === 1) return 'Coloque a Sora <b>atrás</b> do Riku, na mesma fileira: assim ela fica protegida.';
    if (n === 2) return 'Coloque a Nara na <b>outra fileira</b>.';
    return 'Toque na <b>casa circulada</b>.';
  }
  if (n >= 3 && s.turn <= 4) return 'Os inimigos também têm habilidades: <b>Daichi</b> devolve dano, <b>Hana</b> atira de longe e <b>Tobi</b> dá ataque aos vizinhos. Toque em <b>LUTAR</b>.';
  return 'Toque em <b>LUTAR</b>. Dica: segure uma carta ou unidade para ver as habilidades e use o <b>Auto</b> para jogar mais rápido.';
}
/** v0.55.2: só a casa (r, c) aceita a carta no passo guiado */
export const cellOnly = (r: number, c: number) => (rr: number, cc: number) => rr === r && cc === c;
