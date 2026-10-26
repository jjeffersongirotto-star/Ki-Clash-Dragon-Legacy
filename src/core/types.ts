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
  | 'surpresa'
  // v0.17.0 (fase 2)
  | 'vigia'
  | 'renascer'
  | 'anjo'
  | 'reflexo'
  | 'ombrada'
  | 'necromancia'
  | 'barreira';

/** v0.17.0: efeitos com duração (contador de rodadas) */
export type EffectKind = 'veneno' | 'queimadura' | 'atordoado' | 'escudo' | 'anjo';
export interface Effect {
  kind: EffectKind;
  /** dano por rodada (veneno/queimadura) ou pontos de escudo que restam */
  amount: number;
  /** rodadas que faltam (o anjo do feitiço dura até ser usado: 99) */
  turns: number;
}

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
  category: Category;
  /** v0.10: status que o degrau "+" melhora (vida ou ataque) */
  plusStat: 'atk' | 'hp';
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
  /** v0.10: cor/tier da carta (1 Comum … 6 Mítico); o nome "stars" ficou por compatibilidade */
  stars: number;
  /** v0.10: degrau "+" da cor */
  plus?: boolean;
  /** v0.17.0: cópias no baralho (1–3; padrão 3). Feitiços usam o id do feitiço em `charId`. */
  copies?: number;
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
  plus?: boolean;
  isMinion: boolean;
  /** carta de origem */
  card?: CardInstance;
  /** grupo do baralho de onde a cópia saiu (vai para as derrotadas quando a unidade cai) */
  slot?: number;
  /** v0.17.0: efeitos com duração */
  effects?: Effect[];
  /** v0.17.0: Renascer já usado / Anjo da Guarda (habilidade) já usado */
  revived?: boolean;
  angelUsed?: boolean;
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
  turn: number;
  active: Side;
}

export type BattleEvent =
  | { type: 'turn'; side: Side; turn: number; text: string }
  | { type: 'deploy'; uid: number; text: string }
  | { type: 'move'; uid: number; from: [number, number]; to: [number, number]; jumped: boolean; through?: [number, number][]; text: string }
  | { type: 'attack'; uid: number; target: number | 'hero'; targetSide: Side; ranged: boolean; damageType: DamageType; text: string }
  | { type: 'damage'; uid: number; amount: number; damageType: DamageType; text: string }
  | { type: 'hero'; side: Side; amount: number; text: string }
  | { type: 'death'; uid: number; text: string }
  | { type: 'spawn'; uid: number; text: string }
  | { type: 'counter'; uid: number; target: number; text: string }
  | { type: 'push'; uid: number; from: [number, number]; to: [number, number]; text: string }
  | { type: 'aura'; uid: number; text: string }
  | { type: 'heal'; uid: number; amount: number; text: string }
  | { type: 'end'; winner: Side | 'empate'; text: string }
  | { type: 'effect'; uid: number; kind: EffectKind | 'renascer' | 'reflexo' | 'necropolis'; text: string }
  | { type: 'cast'; side: Side; spellId: string; caster: number; target?: [number, number]; text: string };

export type RecordedEvent = BattleEvent & { snap: Snapshot };
