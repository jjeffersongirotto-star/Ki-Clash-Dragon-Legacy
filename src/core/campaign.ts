import { getChar } from './characters';
import type { CardInstance } from './types';
import { maxLevel } from './progression';
import { DECK_SLOTS } from './deck';

export interface Stage {
  id: number;
  name: string;
  enemyHeroHp: number;
  enemyDeck: CardInstance[];
  rewards: { pergaminho: number; cristal: number; orbe: number; essencias: number };
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

export const STAGES: Stage[] = NAMES.map((name, i) => {
  const id = i + 1;
  // fases 1 e 2 mais leves para a equipe inicial de Comum (nível 1 e 2); depois, como antes
  const level = i <= 1 ? 1 + i : 1 + Math.round(i * 1.5);
  // baralho da IA: 10 personagens diferentes, 4 cópias cada
  if (new Set(POOLS[i]).size !== DECK_SLOTS) throw new Error(`Fase ${id}: a IA precisa de ${DECK_SLOTS} personagens diferentes`);
  const deck = POOLS[i].map((charId) => {
    const def = getChar(charId);
    const stars = Math.min(def.maxStars, def.minStars + (i >= 9 ? 1 : 0));
    return { charId, level: Math.min(level, maxLevel(stars)), stars };
  });
  return {
    id,
    name,
    enemyHeroHp: 12 + i * 2,
    enemyDeck: deck,
    rewards: { pergaminho: 4 + i * 2, cristal: 1 + Math.floor(i / 2), orbe: i >= 5 ? 1 : 0, essencias: 6 + i * 3 },
    unlock: UNLOCKS[id],
  };
});

export const PLAYER_HERO_HP = 20;
