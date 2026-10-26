/**
 * v0.20.0 — Aventura: dificuldades (Fácil, Normal, Difícil) e limite diário por fase (lógica pura, sem DOM).
 *
 * - As 3 dificuldades têm as MESMAS 10 fases. O Fácil é a campanha de sempre; Normal e Difícil usam os mesmos
 *   baralhos inimigos com as cartas em nível mais alto e, quando configurado, 1 ou 2 cartas trocadas.
 *   Os números ainda são provisórios (o ajuste fino da dificuldade vem depois).
 * - Cada dificuldade tem o próprio progresso. O Normal abre ao vencer a fase 10 no Fácil; o Difícil, a fase 10 no Normal.
 * - Limite diário por fase e dificuldade: DAILY_LIMIT vezes por dia. Gastam 1: cada "Repetir" e cada vitória em
 *   fase já vencida. A primeira vitória e as derrotas não gastam. Volta à meia-noite de Brasília (UTC−3).
 */
import { ENEMY_LEVELS, ENEMY_SPELLS, STAGES, enemyDeckFor, type Stage } from './campaign';
import type { CardInstance } from './types';

export type Difficulty = 'facil' | 'normal' | 'dificil';
export const DIFFICULTIES: Difficulty[] = ['facil', 'normal', 'dificil'];
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };
export const DIFFICULTY_ICON: Record<Difficulty, string> = { facil: '🟢', normal: '🟡', dificil: '🔴' };

export interface DifficultyRule {
  /** níveis a mais nas cartas inimigas (limitado ao nível máximo da cor de cada carta) */
  levelBonus: number;
  /** trocas de personagem por fase (índice 0 = fase 1): [sai, entra] */
  swaps: Record<number, [string, string][]>;
}

/** Provisório: o ajuste fino de cada dificuldade será feito depois. */
export const DIFFICULTY_RULES: Record<Difficulty, DifficultyRule> = {
  facil: { levelBonus: 0, swaps: {} },
  normal: { levelBonus: 3, swaps: {} },
  dificil: { levelBonus: 6, swaps: {} },
};

/** A fase `stageId` na dificuldade escolhida (mesmo nome, Comandante e recompensa; baralho inimigo mais forte). */
export function stageFor(stageId: number, diff: Difficulty): Stage {
  const i = stageId - 1;
  const base = STAGES[i];
  if (diff === 'facil') return base;
  const rule = DIFFICULTY_RULES[diff];
  const deck: CardInstance[] = enemyDeckFor(i, ENEMY_LEVELS[i] + rule.levelBonus, ENEMY_SPELLS[i]);
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

/** O jogador pode tocar em Repetir nesta fase? (só fase vencida e com vezes no dia) */
export const canRepeat = (p: AdventureProgress, d: DailyUse | undefined, diff: Difficulty, stageId: number, now = Date.now()) =>
  isCleared(p, diff, stageId) && dailyLeft(d, diff, stageId, now) > 0;
