// Tipos centrais do jogo. Este módulo (src/core) é lógica pura, sem DOM,
// para poder ser reutilizado no servidor quando houver modo online.

export type Side = 'player' | 'enemy';
export type DamageType = 'fisico' | 'magico';
export type Rarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario' | 'mitico';

export type Category = 'tanque' | 'suporte' | 'dps' | 'mago' | 'arqueiro' | 'assassino';

export type Race = 'humano' | 'extraterrestre' | 'monstro' | 'mago' | 'androide' | 'necromante';

export type AbilityId =
  | 'diagFrente'
  | 'diagTras'
  | 'guarda'
  | 'salto'
  | 'longoAlcance'
  | 'flechaDupla'
  | 'perfurante'
  | 'retaguarda'
  | 'menorVida'
  | 'prole'
  | 'contraGolpe'
  | 'sifao'
  | 'lotus'
  | 'inabalavel'
  | 'disparoSombrio'
  | 'espinhos'
  | 'sopro'
  | 'tambor'
  | 'brasa'
  | 'mare'
  | 'precisao'
  | 'olhoAguia'
  | 'cacaMagos'
  | 'surpresa';

export interface Palette {
  primary: string;
  secondary: string;
  hair: string;
  aura: string;
  skin: string;
  eyes: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  category: Category;
  race: Race;
  minStars: number;
  maxStars: number;
  cost: number;
  atk: number;
  hp: number;
  damageType: DamageType;
  physRes: number;
  magRes: number;
  move: number;
  range: number;
  abilities: AbilityId[];
  palette: Palette;
  /** variação visual do cabelo (0..7) */
  hairStyle: number;
  lore: string;
  /** unidades invocadas (não aparecem na coleção) */
  summonOnly?: boolean;
}

/** Uma carta possuída / usada num deck */
export interface CardInstance {
  charId: string;
  level: number;
  stars: number;
}

export interface Unit {
  uid: number;
  charId: string;
  side: Side;
  row: number;
  col: number;
  atk: number;
  maxHp: number;
  hp: number;
  damageType: DamageType;
  physRes: number;
  magRes: number;
  move: number;
  range: number;
  abilities: AbilityId[];
  level: number;
  stars: number;
  isMinion: boolean;
  /** carta de origem */
  card?: CardInstance;
  /** grupo do baralho de onde a cópia saiu (vai para as derrotadas quando a unidade cai) */
  slot?: number;
}

export interface Hero {
  hp: number;
  maxHp: number;
}

export type { DeckState as SideDeck } from './deck';
import type { DeckState } from './deck';

export interface BattleState {
  rows: number;
  cols: number;
  turn: number;
  active: Side;
  heroes: Record<Side, Hero>;
  energy: Record<Side, number>;
  units: Unit[];
  decks: Record<Side, DeckState>;
  winner: Side | 'empate' | null;
  nextUid: number;
  seed: number;
  maxTurns: number;
  fury: boolean;
  log: string[];
}

export interface Snapshot {
  units: Unit[];
  heroes: Record<Side, Hero>;
  energy: Record<Side, number>;
  turn: number;
  active: Side;
}

export type BattleEvent =
  | { type: 'turn'; side: Side; turn: number; text: string }
  | { type: 'deploy'; uid: number; text: string }
  | { type: 'move'; uid: number; from: [number, number]; to: [number, number]; jumped: boolean; text: string }
  | { type: 'attack'; uid: number; target: number | 'hero'; targetSide: Side; ranged: boolean; damageType: DamageType; text: string }
  | { type: 'damage'; uid: number; amount: number; damageType: DamageType; text: string }
  | { type: 'hero'; side: Side; amount: number; text: string }
  | { type: 'death'; uid: number; text: string }
  | { type: 'spawn'; uid: number; text: string }
  | { type: 'counter'; uid: number; target: number; text: string }
  | { type: 'push'; uid: number; from: [number, number]; to: [number, number]; text: string }
  | { type: 'aura'; uid: number; text: string }
  | { type: 'heal'; uid: number; amount: number; text: string }
  | { type: 'end'; winner: Side | 'empate'; text: string };

export type RecordedEvent = BattleEvent & { snap: Snapshot };
