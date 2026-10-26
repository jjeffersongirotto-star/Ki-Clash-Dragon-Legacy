import { getChar } from './characters';
import type { CardInstance } from './types';
import { fromStepIndex, stepIndex } from './progression';
import { DECK_SLOTS } from './deck';
import { LEADER_HP } from './leaders';
import { getSpell } from './spells';
import type { OrbBag } from './progression';

export interface Stage {
  id: number;
  name: string;
  enemyHeroHp: number;
  enemyDeck: CardInstance[];
  /** recompensa no Fácil (v0.22.0: Orbes Comum e Incomum); Normal e Difícil em adventure.ts (`rewardsFor`) */
  rewards: { essencias: number; orbs: OrbBag };
  unlock?: string;
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

/** Baralho da IA em cada fase: sempre 10 personagens DIFERENTES (v0.8). */
const POOLS: string[][] = [
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
 * Desbloqueio pela progressão normal (primeira vitória na fase): Incomum, Raro e Épico.
 * Quem começa em Lendário/Mítico (Kenji, Vorax) fica bloqueado — "em breve".
 */
export const UNLOCKS: Record<number, string> = { 1: 'aiko', 2: 'mei', 3: 'lyra', 4: 'gorath', 5: 'yume', 6: 'zarek', 8: 'nyx' };

/**
 * v0.13.0 — vida do Comandante inimigo por fase (índice 0 = fase 1).
 * Antes: 12 + 2·i. Agora soma METADE do acréscimo de vida que o Comandante do jogador tem no nível
 * esperado para aquela fase (nível = número da fase, +10 por nível → +5 por fase): 12 + 7·i.
 * Assim o Comandante do jogador deixa de ser derrubado num turno só, sem a campanha ficar fácil.
 */
export function enemyLeaderHp(i: number): number {
  return 12 + 2 * i + Math.round((LEADER_HP[Math.min(i, LEADER_HP.length - 1)] - LEADER_HP[0]) / 2);
}

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
  ['f-flecha-veneno', 'f-bola-fogo'],
  ['f-tremor', 'f-muralha'],
  [], // v0.23.0: sem feitiços (até a v0.22.0: Veneno e Sombras) — a fase já tem Raros, Épico e Lendário no piso da raridade
  ['f-raio', 'f-cura'],
  ['f-bola-fogo', 'f-giratoria', 'f-anjo'],
];
export const ENEMY_SPELL_COPIES = 2;

/**
 * v0.23.0 — DEGRAU das cartas da IA por fase (índice 0 = fase 1), contado na escada inteira:
 * 0 = Comum, 1 = Comum+, 2 = Comum++, 3 = Incomum, … (raridade × 3 + degrau). Cada personagem fica nesse degrau,
 * mas nunca abaixo do degrau base da raridade mínima dele nem acima do topo (raridade máxima "++").
 * Valor quebrado mistura: 0,5 = metade das cartas no degrau 0 e metade no 1. Fases com muitos personagens de raridade
 * alta (6, 8 e 10) já ficam fortes pelo piso da raridade e por isso têm degrau baixo.
 * Escolhidos no simulador (scripts/balance/v18.ts) para a vitória ao chegar ficar perto da v0.22.0.
 * Até a v0.22.0: NÍVEL por fase (1, 4, 4, 5, 6, 6, 11, 14, 17, 12).
 */
export const ENEMY_STEPS = [0, 0.5, 0, 1, 0.5, 0, 3, 0, 0.5, 0.5];

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

/** Baralho da IA na fase `i`: os 10 personagens com 3 cópias (no degrau da fase + `bonus`) e os feitiços da fase com 2 cópias. */
export function enemyDeckFor(i: number, target = ENEMY_STEPS[i], spellIds = ENEMY_SPELLS[i], bonus = 0): CardInstance[] {
  if (new Set(POOLS[i]).size !== DECK_SLOTS) throw new Error(`Fase ${i + 1}: a IA precisa de ${DECK_SLOTS} personagens diferentes`);
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
  unlock: UNLOCKS[i + 1],
}));

/** Vida do Comandante do jogador no nível 1 (v0.13: sobe com o nível do Comandante — ver leaders.ts). */
export const PLAYER_HERO_HP = LEADER_HP[0];
