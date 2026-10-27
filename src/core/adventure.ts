/**
 * v0.20.0 — Aventura: dificuldades (Fácil, Normal, Difícil) e limite diário por fase (lógica pura, sem DOM).
 *
 * - As 3 dificuldades têm as MESMAS 10 fases. O Fácil é a campanha de sempre; Normal e Difícil usam os mesmos
 *   baralhos inimigos com as cartas em degraus mais altos e, quando configurado, 1 ou 2 cartas trocadas.
 *   Os números ainda são provisórios (o ajuste fino da dificuldade vem depois).
 * - Cada dificuldade tem o próprio progresso. v0.28.0: a fase N do Normal abre com a fase N do Fácil e a N−1 do Normal (Difícil igual).
 * - v0.21.0: ⭐ estrelas por fase e dificuldade (3 objetivos; v0.28.0: vencer + 2 objetivos da fase); o Repetir só fica liberado com 3 ⭐.
 * - Limite diário por fase e dificuldade: DAILY_LIMIT vezes por dia. Gastam 1: cada "Repetir" e cada vitória em
 *   fase já vencida. A primeira vitória e as derrotas não gastam. Volta à meia-noite de Brasília (UTC−3).
 */
import { ENEMY_SPELLS, ENEMY_STEPS, STAGES, enemyDeckFor, type Stage } from './campaign';
import type { CardInstance } from './types';
import { bagXp, type OrbBag } from './progression';
import { stageGearDrop } from './gear';

export type Difficulty = 'facil' | 'normal' | 'dificil';
export const DIFFICULTIES: Difficulty[] = ['facil', 'normal', 'dificil'];
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };
export const DIFFICULTY_ICON: Record<Difficulty, string> = { facil: '🟢', normal: '🟡', dificil: '🔴' };

export interface DifficultyRule {
  /** v0.23.0: degraus a mais em TODAS as cartas inimigas (limitado ao topo de cada personagem). Até a v0.22.0: níveis (+3 / +6). */
  stepBonus: number;
  /** trocas de personagem por fase (índice 0 = fase 1): [sai, entra] */
  swaps: Record<number, [string, string][]>;
}

/** Provisório: o ajuste fino de cada dificuldade será feito depois. */
export const DIFFICULTY_RULES: Record<Difficulty, DifficultyRule> = {
  facil: { stepBonus: 0, swaps: {} },
  normal: { stepBonus: 1, swaps: {} },
  dificil: { stepBonus: 2, swaps: {} },
};

/** A fase `stageId` na dificuldade escolhida (mesmo nome, Comandante e recompensa; baralho inimigo mais forte). */
export function stageFor(stageId: number, diff: Difficulty): Stage {
  const i = stageId - 1;
  const base = STAGES[i];
  if (diff === 'facil') return base;
  const rule = DIFFICULTY_RULES[diff];
  const deck: CardInstance[] = enemyDeckFor(i, ENEMY_STEPS[i], ENEMY_SPELLS[i], rule.stepBonus);
  for (const [out, inn] of rule.swaps[i] ?? []) {
    const k = deck.findIndex((c) => c.charId === out);
    if (k >= 0 && !deck.some((c) => c.charId === inn)) deck[k] = { ...deck[k], charId: inn };
  }
  return { ...base, enemyDeck: deck };
}

// ---------- progresso por dificuldade ----------

/** Fases vencidas em cada dificuldade (o Fácil é o `cleared` de sempre). */
export interface AdventureProgress {
  cleared: number[];
  clearedDiff?: Partial<Record<Exclude<Difficulty, 'facil'>, number[]>>;
}

export const clearedIn = (p: AdventureProgress, diff: Difficulty): number[] => (diff === 'facil' ? p.cleared : (p.clearedDiff?.[diff] ?? []));
export const isCleared = (p: AdventureProgress, diff: Difficulty, stageId: number) => clearedIn(p, diff).includes(stageId);

export function markCleared(p: AdventureProgress, diff: Difficulty, stageId: number) {
  if (isCleared(p, diff, stageId)) return;
  if (diff === 'facil') p.cleared.push(stageId);
  else ((p.clearedDiff ??= {})[diff] ??= []).push(stageId);
}

/**
 * v0.28.0: a fase N do Normal abre quando a fase N foi vencida no Fácil E a fase N−1 foi vencida no Normal
 * (a fase 1, só com a fase 1 do Fácil). O Difícil funciona igual em relação ao Normal.
 * Até a v0.27.0: o Normal inteiro abria só ao vencer a fase 10 no Fácil.
 */
export function stageUnlocked(p: AdventureProgress, diff: Difficulty, stageId: number): boolean {
  const k = DIFFICULTIES.indexOf(diff);
  if (k > 0 && !isCleared(p, DIFFICULTIES[k - 1], stageId)) return false;
  return stageId === 1 || isCleared(p, diff, stageId - 1);
}

/** A dificuldade está liberada? (a fase 1 dela está liberada: Fácil sempre; Normal/Difícil com a fase 1 da anterior) */
export const difficultyUnlocked = (p: AdventureProgress, diff: Difficulty) => stageUnlocked(p, diff, 1);

// ---------- limite diário ----------

export const DAILY_LIMIT = 5;
/** Brasília não tem horário de verão desde 2019: UTC−3 fixo. */
const BRASILIA_OFFSET_MS = 3 * 3600 * 1000;
/** dia de hoje em Brasília, "AAAA-MM-DD" */
export const brasiliaDay = (now = Date.now()) => new Date(now - BRASILIA_OFFSET_MS).toISOString().slice(0, 10);

export interface DailyUse {
  day: string;
  used: Record<string, number>;
}

const dailyKey = (diff: Difficulty, stageId: number) => `${diff}:${stageId}`;

/** Zera as contagens quando o dia (de Brasília) muda. */
export function freshDaily(d: DailyUse | undefined, now = Date.now()): DailyUse {
  const day = brasiliaDay(now);
  return d && d.day === day ? d : { day, used: {} };
}

/** Quantas vezes ainda dá para jogar/repetir a fase hoje. */
export function dailyLeft(d: DailyUse | undefined, diff: Difficulty, stageId: number, now = Date.now()): number {
  return Math.max(0, DAILY_LIMIT - (freshDaily(d, now).used[dailyKey(diff, stageId)] ?? 0));
}

/** Gasta 1 vez da fase hoje. Retorna o registro atualizado (o anterior, se for de outro dia, é trocado). */
export function useDaily(d: DailyUse | undefined, diff: Difficulty, stageId: number, now = Date.now()): DailyUse {
  const cur = freshDaily(d, now);
  const k = dailyKey(diff, stageId);
  cur.used[k] = Math.min(DAILY_LIMIT, (cur.used[k] ?? 0) + 1);
  return cur;
}

/** O jogador pode tocar em Jogar nesta fase? (fase nova: sempre; fase vencida: se ainda houver vezes no dia) */
export function canPlay(p: AdventureProgress, d: DailyUse | undefined, diff: Difficulty, stageId: number, now = Date.now()): boolean {
  if (!stageUnlocked(p, diff, stageId)) return false;
  return !isCleared(p, diff, stageId) || dailyLeft(d, diff, stageId, now) > 0;
}

/** O jogador pode tocar em Repetir nesta fase? (fase com 3 ⭐ nesta dificuldade e com vezes no dia — v0.21.0) */
export const canRepeat = (p: AdventureProgress & StarProgress, d: DailyUse | undefined, diff: Difficulty, stageId: number, now = Date.now()) =>
  isCleared(p, diff, stageId) && starCount(starsOf(p, diff, stageId)) === STAR_COUNT && dailyLeft(d, diff, stageId, now) > 0;

// ---------- v0.21.0: estrelas por fase (v0.28.0: objetivos por fase) ----------

/**
 * v0.28.0: a 1ª ⭐ é sempre vencer. A 2ª e a 3ª são 2 objetivos FIXOS de cada fase em cada dificuldade, da lista:
 * ❤️ vida do Comandante ≥ 50/70/100% · 🃏 usar no máximo 8/10/12 cartas · 🪄 sem feitiços ou com pelo menos 2 ·
 * 💀 derrotar pelo menos 6/8/10 personagens inimigos. Normal e Difícil usam outros objetivos ou números mais apertados.
 * Escolhidos com o simulador (scripts/balance/v28.ts) para todos serem possíveis.
 * Até a v0.27.0: vencer · Comandante com 50% · até 15 turnos, iguais em todas as fases.
 */
export type GoalKind = 'hp' | 'cards' | 'nospell' | 'spells' | 'kills';
export interface StarGoal {
  kind: GoalKind;
  n: number;
}
const G = (kind: GoalKind, n = 0): StarGoal => ({ kind, n });
export const STAGE_GOALS: Record<Difficulty, [StarGoal, StarGoal][]> = {
  facil: [
    [G('hp', 50), G('cards', 12)],
    [G('hp', 70), G('nospell')],
    [G('kills', 6), G('hp', 70)],
    [G('cards', 12), G('nospell')],
    [G('kills', 8), G('hp', 70)],
    [G('spells', 2), G('hp', 50)],
    [G('kills', 8), G('cards', 12)],
    [G('hp', 100), G('nospell')],
    [G('kills', 6), G('spells', 2)],
    [G('hp', 100), G('cards', 12)],
  ],
  normal: [
    [G('hp', 70), G('cards', 10)],
    [G('hp', 100), G('cards', 12)],
    [G('kills', 8), G('nospell')],
    [G('cards', 10), G('hp', 70)],
    [G('kills', 10), G('spells', 2)],
    [G('hp', 70), G('cards', 12)],
    [G('kills', 10), G('nospell')],
    [G('hp', 100), G('cards', 10)],
    [G('kills', 8), G('hp', 70)],
    [G('spells', 2), G('cards', 10)],
  ],
  dificil: [
    [G('hp', 100), G('cards', 8)],
    [G('hp', 100), G('cards', 10)],
    [G('kills', 10), G('cards', 10)],
    [G('cards', 8), G('hp', 100)],
    [G('kills', 10), G('hp', 100)],
    [G('spells', 2), G('cards', 10)],
    [G('kills', 10), G('hp', 100)],
    [G('hp', 100), G('cards', 8)],
    [G('hp', 100), G('spells', 2)],
    [G('hp', 100), G('cards', 8)],
  ],
};

export const goalText = (g: StarGoal): string =>
  g.kind === 'hp'
    ? g.n >= 100
      ? '❤️ Vencer sem o seu Comandante levar dano'
      : `❤️ Vencer com o seu Comandante com ${g.n}% ou mais da vida`
    : g.kind === 'cards'
      ? `🃏 Vencer usando no máximo ${g.n} cartas`
      : g.kind === 'nospell'
        ? '🪄 Vencer sem usar feitiços'
        : g.kind === 'spells'
          ? `🪄 Vencer usando pelo menos ${g.n} feitiços`
          : `💀 Derrotar pelo menos ${g.n} personagens inimigos e vencer`;

/** Número de estrelas por fase. */
export const STAR_COUNT = 3;
/** Os 3 objetivos da fase na dificuldade (o 1º é sempre vencer). */
export function starGoals(diff: Difficulty, stageId: number): { kind: 'win' | GoalKind; text: string }[] {
  const pair = STAGE_GOALS[diff][stageId - 1] ?? STAGE_GOALS.facil[0];
  return [{ kind: 'win', text: 'Vencer a fase' }, ...pair.map((g) => ({ kind: g.kind, text: goalText(g) }))];
}

/** Estrelas guardadas como bits por "dificuldade:fase" (bit 0 vencer, bits 1 e 2 os objetivos da fase). */
export interface StarProgress {
  stars?: Record<string, number>;
}
const starKey = (diff: Difficulty, stageId: number) => `${diff}:${stageId}`;
export const starsOf = (p: StarProgress, diff: Difficulty, stageId: number) => p.stars?.[starKey(diff, stageId)] ?? 0;
export const starCount = (mask: number) => [0, 1, 2].filter((i) => mask & (1 << i)).length;

export interface WinResult {
  playerHp: number;
  playerMaxHp: number;
  turn: number;
  /** cartas e feitiços usados pelo jogador e personagens inimigos derrotados */
  stats?: { cards: number; spells: number; kills: number };
}

/** O objetivo foi cumprido nesta vitória? */
export function goalMet(g: StarGoal, r: WinResult): boolean {
  if (g.kind === 'hp') return r.playerHp * 100 >= r.playerMaxHp * g.n;
  // sem a contagem da partida, só o objetivo de vida pode valer
  const st = r.stats;
  if (!st) return false;
  switch (g.kind) {
    case 'cards':
      return st.cards <= g.n;
    case 'nospell':
      return st.spells === 0;
    case 'spells':
      return st.spells >= g.n;
    case 'kills':
      return st.kills >= g.n;
  }
}

/** Objetivos cumpridos numa vitória (máscara de bits). */
export function starsForWin(r: WinResult, diff: Difficulty = 'facil', stageId = 1): number {
  const pair = STAGE_GOALS[diff][stageId - 1] ?? STAGE_GOALS.facil[0];
  let m = 1;
  pair.forEach((g, i) => {
    if (goalMet(g, r)) m |= 2 << i;
  });
  return m;
}

/** Soma os objetivos desta vitória aos que a fase já tinha. Retorna a máscara das estrelas NOVAS. */
export function addStars(p: StarProgress, diff: Difficulty, stageId: number, mask: number): number {
  const before = starsOf(p, diff, stageId);
  (p.stars ??= {})[starKey(diff, stageId)] = before | mask;
  return mask & ~before;
}

// ---------- v0.22.0: Orbes por dificuldade ----------

/** v0.24.1: na primeira vitória de cada fase, os itens da fase saem 2 vezes e o XP por jogar vem multiplicado por isto. */
export const FIRST_WIN_XP_MULT = 2;

/** v0.33.0: 💠 Gemas de Invocação na PRIMEIRA vitória da fase (em cada dificuldade): fases 3, 6 e 9 = 1; fase 10 = 3. */
export const GEMS_BY_STAGE: Record<number, number> = { 3: 1, 6: 1, 9: 1, 10: 3 };
export const gemsFor = (stageId: number) => GEMS_BY_STAGE[stageId] ?? 0;

/** Chances no Difícil, por vitória ou Repetir (independentes). */
export const HARD_LEGENDARY_CHANCE = 0.1;
export const HARD_MYTHIC_CHANCE = 0.02;

/**
 * Recompensa da fase na dificuldade. O XP total dos Orbes fica parecido nas três; a raridade sobe:
 * Fácil = Comum e Incomum (campaign.ts) · Normal = Raro (60% do XP) e Épico (40%) · Difícil = Épicos,
 * mais 10% de chance de 1 Lendário e 2% de 1 Mítico. `rng` decide as chances (Math.random no jogo).
 */
export function rewardsFor(stageId: number, diff: Difficulty, rng: () => number = Math.random): StageReward {
  return { ...orbRewards(stageId, diff, rng), gear: stageGearDrop(stageId, diff, rng) };
}

/** v0.24.0: a recompensa também traz os 3 itens de ascensão da fase (cor sorteada pela dificuldade: Fácil 60/40, Normal e Difícil 80/20, ver gear.ts). */
export interface StageReward {
  essencias: number;
  orbs: OrbBag;
  gear: { id: string; rarity: number }[];
}

function orbRewards(stageId: number, diff: Difficulty, rng: () => number): { essencias: number; orbs: OrbBag } {
  const base = STAGES[stageId - 1].rewards;
  if (diff === 'facil') return { essencias: base.essencias, orbs: { ...base.orbs } };
  const xp = bagXp(base.orbs);
  if (diff === 'normal') return { essencias: base.essencias, orbs: { orbe3: Math.max(1, Math.round((xp * 0.6) / 400)), orbe4: Math.max(1, Math.round((xp * 0.4) / 800)) } };
  const orbs: OrbBag = { orbe4: Math.max(1, Math.round(xp / 800)) };
  if (rng() < HARD_LEGENDARY_CHANCE) orbs.orbe5 = 1;
  if (rng() < HARD_MYTHIC_CHANCE) orbs.orbe6 = 1;
  return { essencias: base.essencias, orbs };
}
