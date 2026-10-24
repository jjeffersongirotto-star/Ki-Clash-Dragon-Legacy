// Tipos centrais do jogo. Este módulo (src/core) é lógica pura, sem DOM,
// para poder ser reutilizado no servidor quando houver modo online.

export type Side = 'player' | 'enemy';
export type DamageType = 'fisico' | 'magico';
export type Rarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario' | 'mitico';

export type AbilityId =
  | 'diagFrente'
  | 'diagTras'
  | 'salto'
  | 'longoAlcance'
  | 'ultimoDaFila'
  | 'retaguarda'
  | 'menorVida'
  | 'prole'
  | 'contraGolpe'
  | 'sifao'
  | 'inabalavel';

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
  /** variação visual do cabelo (0..5) */
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
  /** carta de origem (volta ao baralho quando a unidade cai) */
  card?: CardInstance;
}

export interface Hero {
  hp: number;
  maxHp: number;
}

export interface SideDeck {
  draw: CardInstance[];
  hand: CardInstance[];
}

export interface BattleState {
  rows: number;
  cols: number;
  turn: number;
  active: Side;
  heroes: Record<Side, Hero>;
  energy: Record<Side, number>;
  units: Unit[];
  decks: Record<Side, SideDeck>;
  winner: Side | 'empate' | null;
  nextUid: number;
  seed: number;
  maxTurns: number;
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
  | { type: 'end'; winner: Side | 'empate'; text: string };

export type RecordedEvent = BattleEvent & { snap: Snapshot };
