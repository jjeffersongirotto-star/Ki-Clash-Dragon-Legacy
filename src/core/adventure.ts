/**
 * v0.20.0 — Aventura: dificuldades (Fácil, Normal, Difícil) e limite diário por fase (lógica pura, sem DOM).
 *
 * - As 3 dificuldades têm as MESMAS 10 fases. O Fácil é a campanha de sempre; Normal e Difícil usam os mesmos
 *   baralhos inimigos com as cartas em degraus mais altos e, quando configurado, 1 ou 2 cartas trocadas.
 *   Os números ainda são provisórios (o ajuste fino da dificuldade vem depois).
 * - Cada dificuldade tem o próprio progresso. O Normal abre ao vencer a fase 10 no Fácil; o Difícil, a fase 10 no Normal.
 * - v0.21.0: ⭐ estrelas por fase e dificuldade (3 objetivos); o Repetir só fica liberado com 3 ⭐.
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

/** A dificuldade está liberada? (Normal: fase 10 vencida no Fácil; Difícil: fase 10 vencida no Normal) */
export function difficultyUnlocked(p: AdventureProgress, diff: Difficulty): boolean {
  const k = DIFFICULTIES.indexOf(diff);
  return k === 0 || isCleared(p, DIFFICULTIES[k - 1], STAGES.length);
}

/** A fase está liberada nessa dificuldade? (dificuldade liberada e fase anterior vencida nela) */
export const stageUnlocked = (p: AdventureProgress, diff: Difficulty, stageId: number) =>
  difficultyUnlocked(p, diff) && (stageId === 1 || isCleared(p, diff, stageId - 1));

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
  isCleared(p, diff, stageId) && starCount(starsOf(p, diff, stageId)) === STAR_GOALS.length && dailyLeft(d, diff, stageId, now) > 0;

// ---------- v0.21.0: estrelas por fase ----------

/** Os 3 objetivos (cada um vale 1 ⭐ e pode ser cumprido em vitórias diferentes). */
export const STAR_HP_PCT = 50;
export const STAR_MAX_TURNS = 15;
export const STAR_GOALS = [
  { id: 'win', text: 'Vencer a fase' },
  { id: 'hp', text: `Vencer com o seu Comandante com ${STAR_HP_PCT}% ou mais da vida` },
  { id: 'fast', text: `Vencer em até ${STAR_MAX_TURNS} turnos` },
] as const;

/** Estrelas guardadas como bits por "dificuldade:fase" (bit 0 vencer, bit 1 vida, bit 2 turnos). */
export interface StarProgress {
  stars?: Record<string, number>;
}
const starKey = (diff: Difficulty, stageId: number) => `${diff}:${stageId}`;
export const starsOf = (p: StarProgress, diff: Difficulty, stageId: number) => p.stars?.[starKey(diff, stageId)] ?? 0;
export const starCount = (mask: number) => STAR_GOALS.filter((_, i) => mask & (1 << i)).length;

/** Objetivos cumpridos numa vitória. */
export function starsForWin(r: { playerHp: number; playerMaxHp: number; turn: number }): number {
  let m = 1;
  if (r.playerHp * 100 >= r.playerMaxHp * STAR_HP_PCT) m |= 2;
  if (r.turn <= STAR_MAX_TURNS) m |= 4;
  return m;
}

/** Soma os objetivos desta vitória aos que a fase já tinha. Retorna a máscara das estrelas NOVAS. */
export function addStars(p: StarProgress, diff: Difficulty, stageId: number, mask: number): number {
  const before = starsOf(p, diff, stageId);
  (p.stars ??= {})[starKey(diff, stageId)] = before | mask;
  return mask & ~before;
}

// ---------- v0.22.0: Orbes por dificuldade ----------

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
