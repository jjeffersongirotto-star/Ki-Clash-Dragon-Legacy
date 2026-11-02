/**
 * v0.59.0 — Heróis (álbum): todos os personagens por grupo (raça) e tipo (categoria), cada raridade acende sozinha.
 * Sem DOM: testável no vitest.
 *
 * Raridades obtidas (`heroSeen`): ao salvar, entram a raridade ATUAL de cada personagem que você tem e as raridades
 * das cópias guardadas (pacote/banner/prêmio repetido ou subir de raridade). Ganhar a Comum NÃO acende a Incomum.
 * Saves antigos (sem `heroSeen`): recebem da raridade mínima até a atual (supõe que subiu passando por elas).
 */
import { CATEGORY_INFO, PLAYABLE, RACE_INFO } from './characters';
import { SPELLS } from './spells';
import type { CharacterDef } from './types';

export interface HeroSave {
  cards: Record<string, { stars: number }>;
  dupes?: Record<string, Record<number, number>>;
  spells?: Record<string, number>;
  heroSeen?: Record<string, number[]>;
  heroClaims?: string[];
}

export const RACE_ORDER = Object.keys(RACE_INFO);
export const CAT_ORDER = ['dps', 'tanque', 'suporte', 'mago', 'arqueiro', 'assassino'].filter((c) => c in CATEGORY_INFO);

/** Dentro do tipo: raridade inicial menor primeiro; empate = menos raridades primeiro; depois nome. */
export const heroOrder = (a: CharacterDef, b: CharacterDef) => a.minStars - b.minStars || a.maxStars - b.maxStars || a.name.localeCompare(b.name);

export interface HeroType { cat: string; chars: CharacterDef[] }
export interface HeroGroup { race: string; types: HeroType[] }
export function heroGroups(list: CharacterDef[] = PLAYABLE): HeroGroup[] {
  return RACE_ORDER.map((race) => ({
    race,
    types: CAT_ORDER.map((cat) => ({ cat, chars: list.filter((d) => d.race === race && d.category === cat).sort(heroOrder) })).filter((t) => t.chars.length),
  })).filter((g) => g.types.length);
}

const add = (seen: Record<string, number[]>, id: string, st: number) => {
  const s = (seen[id] ??= []);
  if (!s.includes(st)) {
    s.push(st);
    s.sort((x, y) => x - y);
  }
};
/** Atualiza `heroSeen` (chamar ao salvar). Na 1ª vez preenche de min..atual. */
export function syncSeen(d: HeroSave, byId: Record<string, CharacterDef>): Record<string, number[]> {
  const first = !d.heroSeen;
  const seen = (d.heroSeen ??= {});
  for (const [id, c] of Object.entries(d.cards)) {
    const def = byId[id];
    if (!def) continue;
    if (first) for (let st = def.minStars; st <= c.stars; st++) add(seen, id, st);
    else add(seen, id, c.stars);
  }
  for (const [id, by] of Object.entries(d.dupes ?? {})) for (const [st, n] of Object.entries(by)) if (n > 0 && byId[id]) add(seen, id, +st);
  return seen;
}
export const hasRarity = (d: HeroSave, id: string, st: number) => !!d.heroSeen?.[id]?.includes(st);
export const charDone = (d: HeroSave, def: CharacterDef) => {
  for (let st = def.minStars; st <= def.maxStars; st++) if (!hasRarity(d, def.id, st)) return false;
  return true;
};
export const spellOwned = (d: HeroSave, id: string) => (d.spells?.[id] ?? 0) > 0;

export interface Reward { gold: number; gems: number; xp: number }
/** Prêmios (ver REGRAS): tipo dentro do grupo < grupo inteiro < todos os personagens; feitiços: todos. */
export const REWARD_TYPE: Reward = { gold: 200, gems: 0, xp: 50 };
export const REWARD_GROUP: Reward = { gold: 600, gems: 10, xp: 150 };
export const REWARD_ALL: Reward = { gold: 1500, gems: 20, xp: 400 };
export const REWARD_SPELLS: Reward = { gold: 600, gems: 2, xp: 150 };

export interface Goal { key: string; label: string; done: number; total: number; reward: Reward }
export function heroGoals(d: HeroSave, groups = heroGroups()): Goal[] {
  const out: Goal[] = [];
  let all = 0, allN = 0;
  for (const g of groups) {
    let gd = 0, gn = 0;
    for (const t of g.types) {
      const done = t.chars.filter((c) => charDone(d, c)).length;
      out.push({ key: `t:${g.race}:${t.cat}`, label: `${RACE_INFO[g.race as keyof typeof RACE_INFO].label} · ${CATEGORY_INFO[t.cat as keyof typeof CATEGORY_INFO].label}`, done, total: t.chars.length, reward: REWARD_TYPE });
      gd += done;
      gn += t.chars.length;
    }
    out.push({ key: `g:${g.race}`, label: RACE_INFO[g.race as keyof typeof RACE_INFO].label, done: gd, total: gn, reward: REWARD_GROUP });
    all += gd;
    allN += gn;
  }
  out.push({ key: 'all', label: 'Todos os personagens', done: all, total: allN, reward: REWARD_ALL });
  out.push({ key: 'spells', label: 'Todos os feitiços', done: SPELLS.filter((s) => spellOwned(d, s.id)).length, total: SPELLS.length, reward: REWARD_SPELLS });
  return out;
}
export const goalClaimed = (d: HeroSave, key: string) => !!d.heroClaims?.includes(key);
/** Resgata uma vez: devolve o prêmio ou null (incompleto ou já resgatado). Quem chama soma ouro/gemas/XP e salva. */
export function claimGoal(d: HeroSave, g: Goal): Reward | null {
  if (g.done < g.total || goalClaimed(d, g.key)) return null;
  (d.heroClaims ??= []).push(g.key);
  return g.reward;
}

/**
 * v0.59.0: prêmio por raridade nova obtida (cada carta × raridade resgata uma vez, inclusive as do save antigo).
 * Comum/Incomum = Ouro; Raro/Épico = Orbe de XP da cor da raridade (XP de carta); Lendário/Mítico = Gemas.
 */
export const VARIANT_REWARD: Record<number, Reward & { orb?: string; orbs?: number }> = {
  1: { gold: 100, gems: 0, xp: 0 },
  2: { gold: 100, gems: 0, xp: 0 },
  3: { gold: 0, gems: 0, xp: 0, orb: 'orbe3', orbs: 1 },
  4: { gold: 0, gems: 0, xp: 0, orb: 'orbe4', orbs: 1 },
  5: { gold: 0, gems: 1, xp: 0 },
  6: { gold: 0, gems: 3, xp: 0 },
};
export const variantKey = (id: string, st: number) => `v:${id}:${st}`;
export const variantClaimable = (d: HeroSave, id: string, st: number) => hasRarity(d, id, st) && !goalClaimed(d, variantKey(id, st));
export function claimVariant(d: HeroSave, id: string, st: number) {
  if (!variantClaimable(d, id, st)) return null;
  (d.heroClaims ??= []).push(variantKey(id, st));
  return VARIANT_REWARD[st];
}
