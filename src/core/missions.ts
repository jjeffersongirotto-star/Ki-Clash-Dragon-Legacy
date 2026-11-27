/**
 * v0.72.0 — 📜 MISSÕES DIÁRIAS (lógica pura, sem DOM). Pedido do jogador: mais recursos para quem fica travado,
 * no estilo das missões diárias de outros jogos do tipo.
 *
 * - 6 missões por dia (as mesmas todo dia), que zeram à meia-noite de Brasília (como o limite das fases).
 * - Cada missão cumprida tem um prêmio para **resgatar**; cumprir todas libera o **Baú do dia** (💠 1 Gema + 2 itens).
 * - Os prêmios crescem com o seu progresso: a "fase de referência" é a fase vencida que mais dá Ouro (em qualquer
 *   dificuldade). Um prêmio de "1 vitória" = o Ouro, as Essências ou os Orbes de 1 vitória nessa fase.
 * - A missão da Torre só conta depois que a Torre abre (antes, o Baú não pede essa missão).
 */
import { DIFFICULTIES, brasiliaDay, clearedIn, rewardsFor, type AdventureProgress, type Difficulty } from './adventure';
import { goldFor } from './profile';
import { stageGearIds, stageGearRarity } from './gear';
import type { OrbBag } from './progression';

export type MissionEvent = 'win' | 'play' | 'energy' | 'orb' | 'tower' | 'item';
export type MissionPrize = 'gold' | 'essencias' | 'orbs';
export interface MissionDef {
  id: string;
  icon: string;
  text: string;
  event: MissionEvent;
  goal: number;
  prize: MissionPrize;
  /** quantas "vitórias" da fase de referência o prêmio vale */
  mult: number;
}
export const MISSIONS: MissionDef[] = [
  { id: 'win', icon: '🏆', text: 'Vença 3 batalhas (Aventura ou Torre)', event: 'win', goal: 3, prize: 'gold', mult: 3 },
  { id: 'play', icon: '⚔️', text: 'Jogue 8 vezes (batalha, Repetir ou Torre)', event: 'play', goal: 8, prize: 'essencias', mult: 3 },
  { id: 'energy', icon: '⚡', text: 'Gaste 40 de energia', event: 'energy', goal: 40, prize: 'orbs', mult: 2 },
  { id: 'orb', icon: '🔮', text: 'Use 5 Orbes no Treinar', event: 'orb', goal: 5, prize: 'gold', mult: 2 },
  { id: 'tower', icon: '🗼', text: 'Lute 1 vez na Torre', event: 'tower', goal: 1, prize: 'orbs', mult: 2 },
  { id: 'item', icon: '🛡️', text: 'Compre ou funda 1 item de ascensão', event: 'item', goal: 1, prize: 'essencias', mult: 2 },
];
export const CHEST_GEMS = 1;
export const CHEST_ITEMS = 2;

export interface MissionState {
  day: string;
  prog: Record<string, number>;
  claimed: string[];
}
export const freshMissions = (m: MissionState | undefined, now = Date.now()): MissionState => {
  const day = brasiliaDay(now);
  return m && m.day === day ? m : { day, prog: {}, claimed: [] };
};
export function normalizeMissions(v: unknown): MissionState | undefined {
  const m = v as MissionState | undefined;
  if (!m || typeof m !== 'object' || typeof m.day !== 'string') return undefined;
  const prog: Record<string, number> = {};
  for (const d of MISSIONS) {
    const n = Math.floor(Number(m.prog?.[d.id]));
    if (n > 0) prog[d.id] = Math.min(d.goal, n);
  }
  const ids = new Set([...MISSIONS.map((d) => d.id), 'chest']);
  return { day: m.day, prog, claimed: Array.isArray(m.claimed) ? [...new Set(m.claimed.filter((c) => ids.has(c)))] : [] };
}

/** Soma `n` ao progresso das missões desse tipo (zera se o dia virou). */
export function trackMission(m: MissionState | undefined, ev: MissionEvent, n = 1, now = Date.now()): MissionState {
  const s = freshMissions(m, now);
  for (const d of MISSIONS) if (d.event === ev && n > 0) s.prog[d.id] = Math.min(d.goal, (s.prog[d.id] ?? 0) + n);
  return s;
}
export const missionDone = (m: MissionState | undefined, id: string, now = Date.now()) => {
  const d = MISSIONS.find((x) => x.id === id);
  return !!d && (freshMissions(m, now).prog[id] ?? 0) >= d.goal;
};
/** missões que contam para o Baú (a da Torre só depois que ela abre) */
export const chestMissions = (towerOpen: boolean) => MISSIONS.filter((d) => towerOpen || d.event !== 'tower');
export const chestReady = (m: MissionState | undefined, towerOpen: boolean, now = Date.now()) => chestMissions(towerOpen).every((d) => missionDone(m, d.id, now));

/** Fase de referência dos prêmios: a fase vencida que mais dá Ouro (sem nenhuma, a Fácil 1). */
export function refStage(p: AdventureProgress): { diff: Difficulty; stage: number } {
  let best = { diff: 'facil' as Difficulty, stage: 1 };
  for (const diff of DIFFICULTIES) {
    const ids = clearedIn(p, diff);
    if (!ids.length) continue;
    const stage = Math.max(...ids);
    if (goldFor(stage, diff) > goldFor(best.stage, best.diff)) best = { diff, stage };
  }
  return best;
}

export interface MissionReward {
  gold: number;
  essencias: number;
  orbs: OrbBag;
  gems: number;
  gear: { id: string; rarity: number }[];
}
const empty = (): MissionReward => ({ gold: 0, essencias: 0, orbs: {}, gems: 0, gear: [] });
/** Prêmio da missão `id` (ou do Baú, `id` = 'chest') para o progresso atual. */
export function missionReward(p: AdventureProgress, id: string, rng: () => number = Math.random): MissionReward {
  const { diff, stage } = refStage(p);
  const out = empty();
  if (id === 'chest') {
    out.gems = CHEST_GEMS;
    // itens da cor da fase de referência (nunca uma cor acima: não pula o cadeado)
    const ids = stageGearIds(stage);
    const lo = stageGearRarity(stage, diff)[0];
    for (let k = 0; k < CHEST_ITEMS; k++) out.gear.push({ id: ids[Math.floor(rng() * ids.length)], rarity: lo });
    return out;
  }
  const d = MISSIONS.find((x) => x.id === id);
  if (!d) return out;
  const r = rewardsFor(stage, diff, () => 0.99); // sem as chances extras do Difícil
  if (d.prize === 'gold') out.gold = goldFor(stage, diff) * d.mult;
  else if (d.prize === 'essencias') out.essencias = r.essencias * d.mult;
  else for (const [k, n] of Object.entries(r.orbs)) out.orbs[k as keyof OrbBag] = (n ?? 0) * d.mult;
  return out;
}

/** Resgata o prêmio (missão cumprida e ainda não resgatada; o Baú pede todas). Devolve o prêmio ou null. */
export function claimMission(m: MissionState | undefined, p: AdventureProgress, id: string, towerOpen: boolean, rng: () => number = Math.random, now = Date.now()): { state: MissionState; reward: MissionReward } | null {
  const s = freshMissions(m, now);
  if (s.claimed.includes(id)) return null;
  if (id === 'chest' ? !chestReady(s, towerOpen, now) : !missionDone(s, id, now)) return null;
  s.claimed.push(id);
  return { state: s, reward: missionReward(p, id, rng) };
}
/** quantos prêmios estão prontos para resgatar (para o aviso na Base) */
export function missionsToClaim(m: MissionState | undefined, towerOpen: boolean, now = Date.now()): number {
  const s = freshMissions(m, now);
  let n = MISSIONS.filter((d) => (towerOpen || d.event !== 'tower') && missionDone(s, d.id, now) && !s.claimed.includes(d.id)).length;
  if (chestReady(s, towerOpen, now) && !s.claimed.includes('chest')) n++;
  return n;
}
