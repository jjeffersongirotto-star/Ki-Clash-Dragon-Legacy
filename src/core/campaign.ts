import type { CardInstance } from './types';
import { fromStepIndex, stepIndex } from './progression';
import { DECK_SLOTS } from './deck';
import { LEADER_HP } from './leaders';
import { getSpell } from './spells';
import { cardPower } from './power';
import { COMMANDER_LOOK, isCleanCommander } from './commanders';
import { PLAYABLE, getChar } from './characters';
import { shuffle } from './rng';
import { bagXp, orbXp, type XpItemId } from './progression';
import { REGIONS, STAGES_PER_REGION, WORLD_NAMES, WORLD_STAGE_COUNT, localOf, regionOf } from './world';
import type { OrbBag } from './progression';

export interface Stage {
  id: number;
  name: string;
  enemyHeroHp: number;
  enemyDeck: CardInstance[];
  /** recompensa no Fácil (v0.22.0: Orbes Comum e Incomum); Normal e Difícil em adventure.ts (`rewardsFor`) */
  rewards: { essencias: number; orbs: OrbBag };
  unlock?: string;
  /** v0.25.0: pacote da primeira vitória — todos os personagens que a fase dá (o `unlock` e um de Comum) */
  pack: string[];
  /** v0.37.0: nível da IA inimiga (0 = simples; 1–3 = esperta, ver aiSmart.ts) */
  aiLevel?: number;
}

const NAMES = [
  'Vila do Vale Sereno',
  'Floresta dos Ecos',
  'Ponte das Mil Lanças',
  'Deserto Rubro',
  'Templo Submerso',
  'Cidade-Laboratório',
  'Picos Congelados',
  'Ninho do Parasita',
  'Arena Celestial',
  'Trono do Dragão Ancestral',
];

/** Baralho da IA em cada fase: até a v0.32.0, sempre 10 personagens DIFERENTES (v0.8). */
const POOLS_V8: string[][] = [
  ['riku', 'nara', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin', 'ren', 'kuro'],
  ['riku', 'nara', 'toru', 'daichi', 'tobi', 'kael', 'suri', 'hana', 'jin', 'ren'],
  ['riku', 'nara', 'toru', 'daichi', 'sora', 'kael', 'jin', 'hana', 'kuro', 'aiko'],
  ['riku', 'toru', 'daichi', 'tobi', 'kael', 'jin', 'ren', 'aiko', 'lyra', 'mei'],
  ['nara', 'daichi', 'sora', 'kael', 'jin', 'kuro', 'aiko', 'lyra', 'gorath', 'mei'],
  ['riku', 'toru', 'tobi', 'suri', 'jin', 'aiko', 'lyra', 'gorath', 'mei', 'yume'],
  ['nara', 'daichi', 'kael', 'hana', 'kuro', 'aiko', 'gorath', 'mei', 'yume', 'zarek'],
  ['riku', 'toru', 'tobi', 'jin', 'lyra', 'gorath', 'yume', 'zarek', 'nyx', 'kenji'],
  ['nara', 'daichi', 'kael', 'aiko', 'lyra', 'mei', 'yume', 'zarek', 'nyx', 'kenji'],
  ['riku', 'toru', 'jin', 'aiko', 'gorath', 'mei', 'yume', 'zarek', 'nyx', 'vorax'],
];

/**
 * v0.33.0 — o jogador sai do tutorial com 3 personagens, e a IA também começa pequena: a fase 1 tem 3 personagens
 * diferentes e cada fase libera +1 (fase 8 em diante: 10). Fases 1–3 só com personagens de Comum (os 3 iniciais do
 * jogador levam vantagem); da fase 4 em diante, os personagens mais fortes do baralho de antes da fase.
 */
export const ENEMY_DISTINCT = [3, 4, 5, 6, 7, 8, 9, 10, 10, 10];
const EARLY_POOLS: string[][] = [
  ['hana', 'daichi', 'kuro'],
  ['kuro', 'ren', 'hana', 'tobi'],
  ['daichi', 'tobi', 'ren', 'suri', 'jin'],
];
export const POOLS: string[][] = POOLS_V8.map((pool, i) => EARLY_POOLS[i] ?? pool.slice(pool.length - ENEMY_DISTINCT[i]));

/**
 * Desbloqueio pela progressão normal (primeira vitória na fase): Incomum, Raro e Épico.
 * Quem começa em Lendário/Mítico (Kenji, Vorax) fica bloqueado — "em breve".
 */
export const UNLOCKS: Record<number, string> = { 1: 'aiko', 2: 'mei', 3: 'lyra', 4: 'gorath', 5: 'yume', 6: 'zarek', 8: 'nyx' };

/**
 * v0.25.0 — o jogador novo sai do tutorial só com Riku, Sora e Nara. Os outros personagens de Comum chegam no
 * pacote da primeira vitória de cada fase, junto com o desbloqueio de sempre (UNLOCKS). A fase 10 não tem pacote
 * (só faltariam Kenji e Vorax, que ainda estão "em breve").
 */
export const PACK_COMMONS: Record<number, string> = { 1: 'daichi', 2: 'hana', 3: 'tobi', 4: 'kael', 5: 'toru', 6: 'jin', 7: 'suri', 8: 'ren', 9: 'kuro' };
export const stagePack = (stageId: number): string[] => [UNLOCKS[stageId], PACK_COMMONS[stageId]].filter((id): id is string => !!id);
/** v0.33.0: as fases não dão mais personagens garantidos (o pacote acabou); no lugar, 💠 Gemas de Invocação. */
export const STAGE_PACKS = false;

/**
 * v0.13.0 — vida do Comandante inimigo por fase (índice 0 = fase 1).
 * Antes: 12 + 2·i. Agora soma METADE do acréscimo de vida que o Comandante do jogador tem no nível
 * esperado para aquela fase (nível = número da fase, +10 por nível → +5 por fase): 12 + 7·i.
 * Assim o Comandante do jogador deixa de ser derrubado num turno só, sem a campanha ficar fácil.
 */
export function enemyLeaderHp(i: number): number {
  return ENEMY_HERO_HP[i] ?? 12 + 2 * i + Math.round((LEADER_HP[Math.min(i, LEADER_HP.length - 1)] - LEADER_HP[0]) / 2);
}
/**
 * v0.28.0 — vida do Comandante inimigo por fase, reequilibrada no simulador (scripts/balance/v28.ts) junto com
 * ENEMY_STEPS e ENEMY_SPELLS para a vitória ao chegar ficar ~90% nas fases 1–3, ~75% nas 4–7 e ~65% nas 8–10.
 * Até a v0.27.0: 12 + 7·i (12, 19, 26, 33, 40, 47, 54, 61, 68, 75).
 */
export const ENEMY_HERO_HP = [14, 14, 18, 34, 36, 40, 36, 41, 39, 56];
/* v0.37.0: com a IA esperta nas fases 4–10 (STAGE_AI), reequilibrado no simulador (scripts/balance/v28.ts, SIM_SPELLS=0).
   v0.36.0: 14, 14, 18, 32, 30, 37, 56, 62, 72, 106. */
/* v0.36.0: arena de 10 colunas (os dois lados chegam mais rápido), reequilibrado no simulador (scripts/balance/v28.ts,
   SIM_COLS=10 SIM_SPELLS=0). v0.33.0–v0.35.0: 16, 20, 18, 32, 22, 40, 47, 52, 56, 74. */
/* v0.33.0: com a IA menor nas primeiras fases (3 → 10 personagens) e sem pacotes de fase, reequilibrado no simulador
   (scripts/balance/v28.ts, SIM_SPELLS=0). v0.28.0–v0.32.0: 12, 20, 26, 30, 33, 44, 47, 52, 62, 70. */

/**
 * v0.18.0 — feitiços da IA por fase (índice 0 = fase 1), 2 cópias de cada, somados aos 30 personagens.
 * Junto com ENEMY_LEVELS, escolhidos no simulador (scripts/balance/v18.ts) para a vitória ao chegar
 * cair de fase em fase. Todo feitiço precisa de pelo menos um personagem da categoria dele na fase (conjurador).
 */
export const ENEMY_SPELLS: string[][] = [
  [],
  [],
  ['f-raio'],
  [],
  ['f-raio'],
  [], // v0.28.0: sem feitiços (até a v0.27.0: Flecha Envenenada e Bola de Fogo)
  ['f-tremor', 'f-muralha'],
  [], // v0.23.0: sem feitiços (até a v0.22.0: Veneno e Sombras) — a fase já tem Raros, Épico e Lendário no piso da raridade
  ['f-raio', 'f-cura'],
  ['f-bola-fogo', 'f-anjo'], // v0.28.0: sem a Lâmina Giratória
];
export const ENEMY_SPELL_COPIES = 2;

/**
 * v0.23.0 — DEGRAU das cartas da IA por fase (índice 0 = fase 1), contado na escada inteira:
 * 0 = Comum, 1 = Comum+, 2 = Comum++, 3 = Incomum, … (raridade × 3 + degrau). Cada personagem fica nesse degrau,
 * mas nunca abaixo do degrau base da raridade mínima dele nem acima do topo (raridade máxima "++").
 * Valor quebrado mistura: 0,5 = metade das cartas no degrau 0 e metade no 1. Fases com muitos personagens de raridade
 * alta (6, 8 e 10) já ficam fortes pelo piso da raridade e por isso têm degrau baixo.
 * Escolhidos no simulador (scripts/balance/v18.ts) para a vitória ao chegar ficar perto da v0.22.0.
 * Até a v0.22.0: NÍVEL por fase (1, 4, 4, 5, 6, 6, 11, 14, 17, 12). v0.23.0–v0.27.0: 0, 0,5, 0, 1, 0,5, 0, 3, 0, 0,5, 0,5.
 * v0.28.0: reequilíbrio (scripts/balance/v28.ts).
 */
export const ENEMY_STEPS = [2.8, 1, 0.5, 1.5, 2.5, 0.5, 0, 0, 0, 0];
/* v0.37.0 (IA esperta). v0.36.0: 2,8, 1, 0,5, 1,5, 1,5, 0, 1,5, 0, 0, 0. */
/* v0.36.0 (arena de 10 colunas). v0.33.0–v0.35.0: 3,34, 3,25, 0,5, 1,5, 0, 0, 1,5, 0, 0, 0. */
/* v0.33.0: fases 1–2 com só 3–4 personagens de Comum ficam em Incomum (1 deles Incomum+); v0.28.0: 0, 0,5, 0,5, 0,5, 0, 0, 1,5, 0, 0, 0. */

/**
 * Raridade e degrau do personagem da IA: degrau `target` (limitado à faixa dele) e mais `bonus` degraus
 * (dificuldade Normal/Difícil), sempre dentro do topo do personagem.
 */
export function enemyCard(charId: string, target: number, bonus = 0): CardInstance {
  const def = getChar(charId);
  const lo = stepIndex(def.minStars, 0);
  const hi = stepIndex(def.maxStars, 2);
  const g = Math.min(hi, Math.max(lo, Math.floor(target)) + Math.max(0, Math.floor(bonus)));
  return { charId, ...fromStepIndex(g) };
}

/** Baralho da IA na fase `i`: os personagens da fase (v0.33.0: 3 a 10) com 3 cópias (no degrau da fase + `bonus`) e os feitiços da fase com 2 cópias. */
export function enemyDeckFor(i: number, target = WORLD_STEPS[i], spellIds = WORLD_SPELLS[i], bonus = 0): CardInstance[] {
  // v0.39.0: fases 11–100 (regiões 2–10) com os baralhos gerados em `worldPlan`
  const pool = i < POOLS.length ? POOLS[i] : worldPlan().pools[i - POOLS.length];
  if (new Set(pool).size !== pool.length || pool.length > DECK_SLOTS) throw new Error(`Fase ${i + 1}: a IA precisa de até ${DECK_SLOTS} personagens diferentes`);
  const frac = target - Math.floor(target);
  // degrau quebrado: espalha o degrau a mais entre as cartas (k-ésima carta sobe quando a conta "vira")
  const deck = pool.map((charId, k) => enemyCard(charId, Math.floor(target) + (Math.floor((k + 1) * frac) > Math.floor(k * frac) ? 1 : 0), bonus));
  const spells = spellIds.map((sid) => {
    if (!getSpell(sid).categories.some((k) => pool.some((id) => getChar(id).category === k))) throw new Error(`Fase ${i + 1}: ${sid} sem conjurador`);
    return { charId: sid, stars: 1, copies: ENEMY_SPELL_COPIES };
  });
  return [...deck, ...spells];
}

/**
 * v0.37.0 — nível da IA inimiga por fase no Fácil (0 = simples, 1–3 = esperta: pensa mais turnos à frente).
 * As primeiras fases ficam com a IA simples; Normal e Difícil somam +1 e +2 (até 3), em adventure.ts.
 */
export const STAGE_AI = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3];

export const STAGES: Stage[] = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  enemyHeroHp: enemyLeaderHp(i),
  enemyDeck: enemyDeckFor(i, ENEMY_STEPS[i], ENEMY_SPELLS[i]),
  // v0.22.0: mesmo XP de antes em Orbes — o antigo 📜 (4 + 2i) vira Orbes Comuns; 💎 (1 + i/2) e 🔮 (fase 6+) viram Orbes Incomuns
  rewards: { essencias: 6 + i * 3, orbs: { orbe1: 4 + i * 2, orbe2: Math.round(((1 + Math.floor(i / 2)) * 400 + (i >= 5 ? 1500 : 0)) / 250) } },
  unlock: STAGE_PACKS ? UNLOCKS[i + 1] : undefined,
  pack: STAGE_PACKS ? stagePack(i + 1) : [],
  aiLevel: STAGE_AI[i],
}));

/** Vida do Comandante do jogador no nível 1 (v0.13: sobe com o nível do Comandante — ver leaders.ts). */
export const PLAYER_HERO_HP = LEADER_HP[0];

/**
 * v0.28.0 — Comandante inimigo de cada fase (só a arte; a vida continua `enemyHeroHp`). Fases 1 a 9: o personagem
 * mais forte do baralho da fase (no Fácil) que ainda NÃO foi Comandante de uma fase anterior, então nenhum se repete.
 * A fase 10 é o minotauro de sempre (`null`). O Comandante do jogador não muda.
 * v0.38.0: só personagens com recorte limpo (commanders.ts) — a Nyx (redemoinho cortado) e o Zarek (buraco negro cortado)
 * deixaram de ser Comandantes; entram os seguintes mais fortes do baralho.
 */
export const STAGE_COMMANDERS: (string | null)[] = (() => {
  const used = new Set<string>();
  return STAGES.map((st, i) => {
    if (i === STAGES.length - 1) return null;
    const best = st.enemyDeck
      .filter((c) => !c.charId.startsWith('f-') && isCleanCommander(c.charId) && !used.has(c.charId))
      .sort((a, b) => cardPower(b) - cardPower(a) || a.charId.localeCompare(b.charId))[0];
    used.add(best.charId);
    return best.charId;
  });
})();

/** Carta do Comandante inimigo da fase (na raridade em que ele está no baralho dessa dificuldade), ou `null` = minotauro. */
export function stageCommander(stage: Pick<Stage, 'id' | 'enemyDeck'>): CardInstance | null {
  const id = stage.id >= 1 ? WORLD_COMMANDERS[stage.id - 1] : [...stage.enemyDeck].filter((c) => isCleanCommander(c.charId)).sort((a, b) => cardPower(b) - cardPower(a))[0]?.charId;
  return (id && stage.enemyDeck.find((c) => c.charId === id)) || null;
}

// ---------------- v0.39.0: mapa do mundo (regiões 2–10, fases 11–100) ----------------

/**
 * Degrau-alvo das cartas inimigas no Fácil (escada inteira: 0 = Comum … 17 = Mítico++) na fase 1 e na fase 10 de cada
 * região; as fases do meio ficam na reta entre os dois. Índice 0 = região 2. Escolhidos no simulador de longo prazo
 * (scripts/balance/world.ts, 32 jogadores) para a vitória ao chegar cair devagar de região em região:
 * 83 · 77 · 75 · 74 · 69 · 63 · 60 · 58 · 53 · 52% (média de cada região, 1 a 10). As regiões 8–10 têm degrau bem
 * mais alto porque o jogador chega com muitas cartas Lendárias e Míticas do Banner.
 */
export const WORLD_STEP_RANGE: [number, number][] = [
  [2.35, 3.35],
  [4.5, 5.5],
  [4.65, 5.65],
  [6.65, 7.65],
  [7.35, 8.35],
  [8.5, 9.5],
  [12.7, 13.7],
  [13.15, 14.15],
  [15.5, 16.5],
];
/** Vida do Comandante inimigo na fase 1 e na fase 10 de cada região (índice 0 = região 2). */
export const WORLD_HP_RANGE: [number, number][] = [
  [50, 70],
  [60, 80],
  [70, 90],
  [80, 100],
  [90, 110],
  [100, 120],
  [110, 130],
  [120, 140],
  [130, 160],
];
/** XP dos Orbes de cada região em relação à fase de mesmo número da região 1 (multiplica por isto a cada região). */
export const WORLD_XP_GROWTH = 2;
/** Feitiços que a IA pode receber nas regiões novas (só os que miram um alvo ou uma fileira). */
const WORLD_SPELL_POOL = ['f-raio', 'f-tremor', 'f-muralha', 'f-cura', 'f-bola-fogo', 'f-anjo', 'f-chuva', 'f-flecha-veneno', 'f-veneno', 'f-investida', 'f-giratoria', 'f-sombras'];

/** Nível da IA nas regiões novas (Fácil): sobe dentro da região e de região em região; da região 6 em diante, sempre 3. */
export const worldAiLevel = (region: number, local: number) => Math.max(1, Math.min(3, Math.floor(1 + (region - 2) * 0.5 + (local - 1) / 4.5)));

const lerp = ([a, b]: [number, number], local: number) => a + ((b - a) * (local - 1)) / (STAGES_PER_REGION - 1);
const rarityOfStep = (t: number) => Math.max(1, Math.min(6, Math.floor(t / 3) + 1));
/** O personagem chega à raridade `r` (começa nela ou abaixo e termina nela ou acima)? */
const fits = (id: string, r: number) => getChar(id).minStars <= r && getChar(id).maxStars >= r;

interface WorldPlan {
  pools: string[][];
  spells: string[][];
  commanders: string[];
}
let plan: WorldPlan | null = null;
/**
 * Baralhos, feitiços e Comandantes das fases 11–100 (gerados uma vez, sempre iguais). Cada fase tem 10 personagens
 * diferentes: o Comandante, depois os personagens que chegam à raridade da fase com a raça da região e o resto de
 * qualquer raça. O Comandante tem recorte limpo (commanders.ts), não se repete dentro da região e só volta a aparecer
 * no mundo quando todos os recortes limpos que servem para a raridade já foram usados (o que foi usado há mais tempo).
 */
export function worldPlan(): WorldPlan {
  if (plan) return plan;
  const all = PLAYABLE.map((d) => d.id);
  const clean = Object.keys(COMMANDER_LOOK).filter((id) => all.includes(id));
  const lastUsed = new Map<string, number>();
  STAGE_COMMANDERS.forEach((id, i) => id && lastUsed.set(id, i));
  const pools: string[][] = [];
  const spells: string[][] = [];
  const commanders: string[] = [];
  for (let i = POOLS.length; i < WORLD_STAGE_COUNT; i++) {
    const region = regionOf(i + 1);
    const local = localOf(i + 1);
    const races = REGIONS[region - 1].races;
    const r = rarityOfStep(lerp(WORLD_STEP_RANGE[region - 2], local));
    const st = { seed: 7919 * (i + 1) };
    const inRegion = new Set(local > 1 ? commanders.slice(commanders.length - (local - 1)) : []);
    // Comandante: recorte limpo, chega à raridade da fase, ainda não usado nesta região; prefere o que nunca foi usado
    // (ou foi usado há mais tempo) e a raça da região
    // (quem nunca foi Comandante vale mais do que a raça da região; quem termina 1 raridade abaixo da fase ainda serve)
    const reach = (id: string) => (fits(id, r) ? 0 : getChar(id).maxStars >= r - 1 && getChar(id).minStars <= r ? 50 : 1000);
    const score = (id: string) => reach(id) + (races.includes(getChar(id).race) ? 0 : 20) + (lastUsed.has(id) ? 100 + lastUsed.get(id)! / 1000 : 0);
    const cmd = shuffle(clean.filter((id) => !inRegion.has(id)), st).sort((a, b) => score(a) - score(b))[0];
    commanders.push(cmd);
    lastUsed.set(cmd, i);
    // o resto do baralho: quem chega à raridade, raça da região primeiro (no máximo 7 da região, para variar)
    const others = shuffle(all.filter((id) => id !== cmd && fits(id, r)), st);
    const mine = others.filter((id) => races.includes(getChar(id).race)).slice(0, 7);
    const rest = others.filter((id) => !mine.includes(id));
    const pool = [cmd, ...mine, ...rest].slice(0, DECK_SLOTS);
    if (pool.length < DECK_SLOTS) pool.push(...shuffle(all.filter((id) => !pool.includes(id)), st).slice(0, DECK_SLOTS - pool.length));
    pools.push(pool);
    // feitiços: 1 nas fases 3 e 6, 2 nas fases 9 e 10 (sempre com conjurador no baralho)
    const n = local === 3 || local === 6 ? 1 : local >= 9 ? 2 : 0;
    const castable = shuffle(WORLD_SPELL_POOL, st).filter((sid) => getSpell(sid).categories.some((k) => pool.some((id) => getChar(id).category === k)));
    spells.push(castable.slice(0, n));
  }
  plan = { pools, spells, commanders };
  return plan;
}

/** Degrau-alvo das cartas inimigas em cada uma das 100 fases (Fácil). */
export const WORLD_STEPS: number[] = Array.from({ length: WORLD_STAGE_COUNT }, (_, i) => (i < ENEMY_STEPS.length ? ENEMY_STEPS[i] : lerp(WORLD_STEP_RANGE[regionOf(i + 1) - 2], localOf(i + 1))));
/** Feitiços da IA em cada uma das 100 fases. */
export const WORLD_SPELLS: string[][] = Array.from({ length: WORLD_STAGE_COUNT }, (_, i) => (i < ENEMY_SPELLS.length ? ENEMY_SPELLS[i] : worldPlan().spells[i - ENEMY_SPELLS.length]));

/** Orbes da recompensa no Fácil das fases 11–100: o XP da fase de mesmo número da região 1 × WORLD_XP_GROWTH^(região−1), em Orbes de raridade maior a cada 2 regiões (60% numa raridade e 40% na de cima). */
export const regionOrbTier = (region: number) => Math.min(5, 1 + Math.ceil((region - 1) / 2));
function worldRewards(i: number): Stage['rewards'] {
  const region = regionOf(i + 1);
  const base = STAGES[localOf(i + 1) - 1].rewards;
  const xp = bagXp(base.orbs) * Math.pow(WORLD_XP_GROWTH, region - 1);
  const t = regionOrbTier(region);
  const lo = `orbe${t}` as XpItemId, hi = `orbe${t + 1}` as XpItemId;
  return { essencias: 6 + i * 3, orbs: { [lo]: Math.max(1, Math.round((xp * 0.6) / orbXp(lo))), [hi]: Math.max(1, Math.round((xp * 0.4) / orbXp(hi))) } };
}

/** As 100 fases do mundo (as 10 primeiras são `STAGES`, a região 1). */
export const WORLD_STAGES: Stage[] = [
  ...STAGES,
  ...Array.from({ length: WORLD_STAGE_COUNT - STAGES.length }, (_, k): Stage => {
    const i = STAGES.length + k;
    const region = regionOf(i + 1);
    const local = localOf(i + 1);
    return {
      id: i + 1,
      name: WORLD_NAMES[region - 2][local - 1],
      enemyHeroHp: Math.round(lerp(WORLD_HP_RANGE[region - 2], local)),
      enemyDeck: enemyDeckFor(i),
      rewards: worldRewards(i),
      pack: [],
      aiLevel: worldAiLevel(region, local),
    };
  }),
];
/** Fase pelo número global (1 a 100). */
export const getStage = (stageId: number): Stage => WORLD_STAGES[stageId - 1];

/** Comandante de cada uma das 100 fases (`null` = minotauro, só na fase 10). */
export const WORLD_COMMANDERS: (string | null)[] = [...STAGE_COMMANDERS, ...worldPlan().commanders];
