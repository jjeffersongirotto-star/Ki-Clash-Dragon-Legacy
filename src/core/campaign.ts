import { getChar } from './characters';
import type { CardInstance } from './types';
import { maxLevel } from './progression';
import { DECK_SLOTS } from './deck';
import { LEADER_HP } from './leaders';
import { getSpell } from './spells';

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
  ['f-veneno', 'f-sombras'],
  ['f-raio', 'f-cura'],
  ['f-bola-fogo', 'f-giratoria', 'f-anjo'],
];
export const ENEMY_SPELL_COPIES = 2;

/**
 * Nível das cartas da IA por fase (índice 0 = fase 1), limitado ao nível máximo da cor de cada carta.
 * v0.17: 1, 2, 4, 6, 7, 9, 10, 12, 13, 15 (1 + arredondar(1,5 × índice)). v0.18.0: recalibrado junto com os
 * feitiços da IA para a dificuldade subir de fase em fase (antes as fases 6 e 10 eram muito mais difíceis
 * que as vizinhas e a 2 mais fácil que a 1).
 */
export const ENEMY_LEVELS = [1, 4, 4, 5, 6, 6, 11, 14, 17, 12];

/**
 * Baralho da IA na fase `i`: os 10 personagens com 3 cópias (no nível `level`, limitado pela cor;
 * fase 10 uma cor acima) e os feitiços da fase com 2 cópias.
 */
export function enemyDeckFor(i: number, level = ENEMY_LEVELS[i], spellIds = ENEMY_SPELLS[i]): CardInstance[] {
  if (new Set(POOLS[i]).size !== DECK_SLOTS) throw new Error(`Fase ${i + 1}: a IA precisa de ${DECK_SLOTS} personagens diferentes`);
  const deck = POOLS[i].map((charId) => {
    const def = getChar(charId);
    const stars = Math.min(def.maxStars, def.minStars + (i >= 9 ? 1 : 0));
    return { charId, level: Math.min(level, maxLevel(stars)), stars };
  });
  const spells = spellIds.map((sid) => {
    if (!getSpell(sid).categories.some((k) => POOLS[i].some((id) => getChar(id).category === k))) throw new Error(`Fase ${i + 1}: ${sid} sem conjurador`);
    return { charId: sid, level: 1, stars: 1, copies: ENEMY_SPELL_COPIES };
  });
  return [...deck, ...spells];
}

export const STAGES: Stage[] = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  enemyHeroHp: enemyLeaderHp(i),
  enemyDeck: enemyDeckFor(i),
  rewards: { pergaminho: 4 + i * 2, cristal: 1 + Math.floor(i / 2), orbe: i >= 5 ? 1 : 0, essencias: 6 + i * 3 },
  unlock: UNLOCKS[i + 1],
}));

/** Vida do Comandante do jogador no nível 1 (v0.13: sobe com o nível do Comandante — ver leaders.ts). */
export const PLAYER_HERO_HP = LEADER_HP[0];
