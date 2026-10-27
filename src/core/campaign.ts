import { getChar } from './characters';
import type { CardInstance } from './types';
import { fromStepIndex, stepIndex } from './progression';
import { DECK_SLOTS } from './deck';
import { LEADER_HP } from './leaders';
import { getSpell } from './spells';
import { cardPower } from './power';
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
export const ENEMY_HERO_HP = [16, 20, 18, 32, 22, 40, 47, 52, 56, 74];
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
export const ENEMY_STEPS = [3.34, 3.25, 0.5, 1.5, 0, 0, 1.5, 0, 0, 0];
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
export function enemyDeckFor(i: number, target = ENEMY_STEPS[i], spellIds = ENEMY_SPELLS[i], bonus = 0): CardInstance[] {
  if (new Set(POOLS[i]).size !== POOLS[i].length || POOLS[i].length > DECK_SLOTS) throw new Error(`Fase ${i + 1}: a IA precisa de até ${DECK_SLOTS} personagens diferentes`);
  const frac = target - Math.floor(target);
  // degrau quebrado: espalha o degrau a mais entre as cartas (k-ésima carta sobe quando a conta "vira")
  const deck = POOLS[i].map((charId, k) => enemyCard(charId, Math.floor(target) + (Math.floor((k + 1) * frac) > Math.floor(k * frac) ? 1 : 0), bonus));
  const spells = spellIds.map((sid) => {
    if (!getSpell(sid).categories.some((k) => POOLS[i].some((id) => getChar(id).category === k))) throw new Error(`Fase ${i + 1}: ${sid} sem conjurador`);
    return { charId: sid, stars: 1, copies: ENEMY_SPELL_COPIES };
  });
  return [...deck, ...spells];
}

export const STAGES: Stage[] = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  enemyHeroHp: enemyLeaderHp(i),
  enemyDeck: enemyDeckFor(i),
  // v0.22.0: mesmo XP de antes em Orbes — o antigo 📜 (4 + 2i) vira Orbes Comuns; 💎 (1 + i/2) e 🔮 (fase 6+) viram Orbes Incomuns
  rewards: { essencias: 6 + i * 3, orbs: { orbe1: 4 + i * 2, orbe2: Math.round(((1 + Math.floor(i / 2)) * 400 + (i >= 5 ? 1500 : 0)) / 250) } },
  unlock: STAGE_PACKS ? UNLOCKS[i + 1] : undefined,
  pack: STAGE_PACKS ? stagePack(i + 1) : [],
}));

/** Vida do Comandante do jogador no nível 1 (v0.13: sobe com o nível do Comandante — ver leaders.ts). */
export const PLAYER_HERO_HP = LEADER_HP[0];

/**
 * v0.28.0 — Comandante inimigo de cada fase (só a arte; a vida continua `enemyHeroHp`). Fases 1 a 9: o personagem
 * mais forte do baralho da fase (no Fácil) que ainda NÃO foi Comandante de uma fase anterior, então nenhum se repete.
 * A fase 10 é o minotauro de sempre (`null`). O Comandante do jogador não muda.
 */
export const STAGE_COMMANDERS: (string | null)[] = (() => {
  const used = new Set<string>();
  return STAGES.map((st, i) => {
    if (i === STAGES.length - 1) return null;
    const best = st.enemyDeck
      .filter((c) => !c.charId.startsWith('f-') && !used.has(c.charId))
      .sort((a, b) => cardPower(b) - cardPower(a) || a.charId.localeCompare(b.charId))[0];
    used.add(best.charId);
    return best.charId;
  });
})();

/** Carta do Comandante inimigo da fase (na raridade em que ele está no baralho dessa dificuldade), ou `null` = minotauro. */
export function stageCommander(stage: Pick<Stage, 'id' | 'enemyDeck'>): CardInstance | null {
  const id = stage.id >= 1 ? STAGE_COMMANDERS[stage.id - 1] : [...stage.enemyDeck].sort((a, b) => cardPower(b) - cardPower(a))[0]?.charId;
  return (id && stage.enemyDeck.find((c) => c.charId === id)) || null;
}
