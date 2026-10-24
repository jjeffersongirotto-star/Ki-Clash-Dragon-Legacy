import { getChar } from './characters';
import type { CardInstance } from './types';
import { maxLevel } from './progression';

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

const POOLS: string[][] = [
  ['riku', 'nara', 'riku', 'nara'],
  ['riku', 'nara', 'toru', 'aiko'],
  ['nara', 'toru', 'aiko', 'gorath', 'riku'],
  ['toru', 'aiko', 'lyra', 'gorath', 'riku'],
  ['aiko', 'lyra', 'gorath', 'yume', 'kenji'],
  ['lyra', 'gorath', 'yume', 'zarek', 'nyx'],
  ['gorath', 'yume', 'zarek', 'kenji', 'aiko', 'nyx'],
  ['zarek', 'kenji', 'nyx', 'vorax', 'toru', 'lyra'],
  ['yume', 'zarek', 'kenji', 'nyx', 'aiko', 'riku'],
  ['kenji', 'nyx', 'vorax', 'zarek', 'lyra', 'nara'],
];

const UNLOCKS: Record<number, string> = { 3: 'kenji', 5: 'nyx', 8: 'vorax' };

export const STAGES: Stage[] = NAMES.map((name, i) => {
  const id = i + 1;
  const level = 1 + Math.round(i * 1.5);
  const deck = POOLS[i].map((charId) => {
    const def = getChar(charId);
    const stars = Math.min(def.maxStars, def.minStars + (i >= 9 ? 1 : 0));
    return { charId, level: Math.min(level, maxLevel(stars)), stars };
  });
  return {
    id,
    name,
    enemyHeroHp: 20 + i * 3,
    enemyDeck: deck,
    rewards: { pergaminho: 4 + i * 2, cristal: 1 + Math.floor(i / 2), orbe: i >= 5 ? 1 : 0, essencias: 6 + i * 3 },
    unlock: UNLOCKS[id],
  };
});

export const PLAYER_HERO_HP = 30;
