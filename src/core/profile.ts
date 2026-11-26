/**
 * v0.26.0 — Nível de perfil, energia e Ouro de Dragão (lógica pura, sem DOM).
 *
 * - Nível de perfil 1 a 100, por XP de perfil. Ganha XP de perfil: 1 por energia gasta e, ao vencer ou Repetir uma
 *   fase, `profileXpFor` (em dobro na primeira vitória). O tamanho do baralho continua vindo do nível (deckbuild.ts).
 * - Energia: o máximo vem do nível (nível 1 = 20 … nível 100 = 300, em linha reta). Recupera 1 a cada 6 minutos
 *   até o máximo. Ao subir de nível, a energia é reabastecida até o máximo do NOVO nível (v0.68.0; antes somava)
 *   (acima do máximo não recupera, só gasta).
 * - Jogar ou Repetir uma fase custa energia: Fácil 2 · Normal 4 · Difícil 6 (o tutorial não gasta). Na batalha, a
 *   energia é gasta ao começar (derrota também gasta).
 * - Ouro de Dragão: moeda da Loja. Cada vitória ou Repetir dá `goldFor` (em dobro na primeira vitória).
 */
import type { Difficulty } from './adventure';

export const PROFILE_MAX = 100;
/**
 * v0.68.0: XP de perfil para passar do nível `level` para o próximo: 10 × 1,09^(nível−1) + 5 × (nível−1), arredondado
 * (10, 16, 22, … 67 no 10 → 11, 927 no 50 → 51, ~47 mil no 99 → 100). Zerar as 3 dificuldades leva perto do nível 90.
 * Até a v0.67: 10 + 5 × (nível−1).
 */
export const xpToNext = (level: number) => {
  const l = Math.max(1, Math.floor(level)) - 1;
  return Math.round(10 * Math.pow(1.09, l) + 5 * l);
};
const XP_TOTALS: number[] = [0, 0];
for (let l = 2; l <= PROFILE_MAX; l++) XP_TOTALS[l] = XP_TOTALS[l - 1] + xpToNext(l - 1);
/** XP de perfil total para chegar ao nível `level` (nível 1 = 0) */
export const totalXpFor = (level: number) => XP_TOTALS[Math.max(1, Math.min(PROFILE_MAX, Math.floor(level)))];
/** Até a v0.67: XP total do nível na curva antiga (só para converter saves). */
export const oldTotalXpFor = (level: number) => {
  const l = Math.max(1, Math.min(PROFILE_MAX, Math.floor(level))) - 1;
  return 10 * l + (5 * l * (l - 1)) / 2;
};
/** v0.68.0: converte o XP da curva antiga para a nova mantendo o nível e a fração da barra. */
export function convertOldXp(xp: number): number {
  let l = 1;
  while (l < PROFILE_MAX && xp >= oldTotalXpFor(l + 1)) l++;
  if (l >= PROFILE_MAX) return totalXpFor(PROFILE_MAX);
  const frac = (xp - oldTotalXpFor(l)) / (oldTotalXpFor(l + 1) - oldTotalXpFor(l));
  return totalXpFor(l) + Math.floor(frac * xpToNext(l));
}
/** nível de perfil para um XP total */
export function levelFromXp(xp: number): number {
  let l = 1;
  while (l < PROFILE_MAX && xp >= totalXpFor(l + 1)) l++;
  return l;
}

/** Energia máxima do nível (1 → 20 … 100 → 300). */
export const maxEnergy = (level: number) => Math.round(20 + (280 * (Math.max(1, Math.min(PROFILE_MAX, Math.floor(level))) - 1)) / (PROFILE_MAX - 1));
/** recupera 1 de energia a cada 6 minutos (até o máximo) */
export const ENERGY_REGEN_MS = 6 * 60 * 1000;
/** v0.68.0: Fácil 2 · Normal 4 · Difícil 6 (até a v0.67: 1 · 3 · 6). */
export const ENERGY_COST: Record<Difficulty, number> = { facil: 2, normal: 4, dificil: 6 };

/** Estado salvo: XP de perfil total, energia (`at` = desde quando conta a recuperação) e Ouro de Dragão. */
export interface ProfileState {
  xp: number;
  energy: number;
  at: number;
  gold: number;
}

export const newProfile = (now = Date.now()): ProfileState => ({ xp: 0, energy: maxEnergy(1), at: now, gold: 0 });
export const profileLevelOf = (p: ProfileState) => levelFromXp(p.xp);
export const energyMax = (p: ProfileState) => maxEnergy(profileLevelOf(p));

/** Aplica a recuperação do tempo que passou (muda `p`). Cheio ou acima do máximo: não recupera e o relógio fica em `now`. */
export function tickEnergy(p: ProfileState, now = Date.now()): ProfileState {
  const max = energyMax(p);
  if (p.energy >= max || now < p.at) {
    p.at = now;
    return p;
  }
  const gained = Math.floor((now - p.at) / ENERGY_REGEN_MS);
  if (p.energy + gained >= max) {
    p.energy = max;
    p.at = now;
  } else {
    p.energy += gained;
    p.at += gained * ENERGY_REGEN_MS;
  }
  return p;
}

/** Milissegundos até a próxima energia (0 se cheio). */
export function msToNextEnergy(p: ProfileState, now = Date.now()): number {
  if (p.energy >= energyMax(p)) return 0;
  return Math.max(0, ENERGY_REGEN_MS - ((now - p.at) % ENERGY_REGEN_MS));
}

/**
 * Soma XP de perfil. v0.68.0: subir de nível REABASTECE a energia até o máximo do novo nível (não soma por cima;
 * quem já está acima do máximo fica com o que tem). Retorna os níveis ganhos e a energia ganha.
 */
export function addProfileXp(p: ProfileState, xp: number, now = Date.now()): { levels: number; energy: number; level: number } {
  tickEnergy(p, now);
  const before = profileLevelOf(p);
  p.xp = Math.min(totalXpFor(PROFILE_MAX), p.xp + Math.max(0, Math.floor(xp)));
  const after = profileLevelOf(p);
  const energy = after > before ? Math.max(0, maxEnergy(after) - p.energy) : 0;
  p.energy += energy;
  if (energy) p.at = now;
  return { levels: after - before, energy, level: after };
}

/** Gasta energia (e ganha 1 XP de perfil por energia). `ok: false` se não tiver o bastante. */
export function spendEnergy(p: ProfileState, cost: number, now = Date.now()): { ok: boolean; levels: number; energy: number; level: number } {
  tickEnergy(p, now);
  if (p.energy < cost) return { ok: false, levels: 0, energy: 0, level: profileLevelOf(p) };
  if (p.energy >= energyMax(p)) p.at = now; // a recuperação começa a contar quando sai do cheio
  p.energy -= cost;
  return { ok: true, ...addProfileXp(p, cost, now) };
}

/** multiplicador de XP e Ouro por dificuldade (independente do custo de energia desde a v0.68.0) */
const DIFF_MULT: Record<Difficulty, number> = { facil: 1, normal: 3, dificil: 6 };
/** XP de perfil de uma vitória ou Repetir (além do 1 por energia): (4 + fase) × multiplicador da dificuldade */
export const profileXpFor = (stageId: number, diff: Difficulty) => (4 + stageId) * DIFF_MULT[diff];
/** Ouro de Dragão de uma vitória ou Repetir: (30 + 5 × fase) × multiplicador da dificuldade (v0.68.0; antes 10 + 5 × fase) */
export const goldFor = (stageId: number, diff: Difficulty) => (30 + 5 * stageId) * DIFF_MULT[diff];
/** primeira vitória: XP de perfil e Ouro em dobro (como os itens e o XP por jogar) */
export const FIRST_WIN_MULT = 2;

/** Confere um estado salvo; o que faltar vira o padrão (nível `minLevel`, energia cheia). */
export function normalizeProfile(v: unknown, minLevel = 1, now = Date.now()): ProfileState {
  const o = (v && typeof v === 'object' ? v : {}) as Partial<ProfileState>;
  const num = (x: unknown, d: number) => (Number.isFinite(x as number) && (x as number) >= 0 ? Math.floor(x as number) : d);
  const xp = Math.max(num(o.xp, 0), totalXpFor(minLevel));
  const lv = levelFromXp(xp);
  return { xp, energy: num(o.energy, maxEnergy(lv)), at: num(o.at, now) || now, gold: num(o.gold, 0) };
}
