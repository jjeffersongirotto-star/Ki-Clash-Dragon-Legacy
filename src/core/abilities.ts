import type { AbilityId } from './types';

/**
 * Registro de habilidades orientado a dados. O motor de batalha consulta
 * estas flags/valores; para criar uma habilidade nova basta registrá-la aqui
 * e tratar o gancho correspondente em battle.ts.
 *
 * `power(stars, level)` define a força da habilidade conforme estrelas e nível,
 * sempre com teto (`cap`) para que nenhuma unidade fique invencível.
 */
export interface AbilityDef {
  id: AbilityId;
  name: string;
  description: string;
  icon: string;
  /** texto curto de evolução por estrela/nível (exibido nas telas) */
  scaling?: string;
  /** força atual da habilidade (já limitada pelo teto) */
  power?: (stars: number, level: number) => number;
  /** como exibir a força atual */
  powerLabel?: (p: number) => string;
  /** gancho de mira (sempre na própria fileira, exceto diagonais) */
  targeting?: 'diagFrente' | 'diagTras' | 'retaguarda' | 'menorVida';
  /** bônus de alcance */
  rangeBonus?: number;
  /** alcance (em colunas à frente) da mira especial */
  reach?: number;
  /** pode pular unidades no movimento */
  jump?: boolean;
  /** ao derrotar: invoca uma unidade */
  onKillSummon?: string;
  /** ao ser atingido por físico corpo a corpo de frente: contra-ataca */
  counter?: boolean;
  /** aura: reduz o ataque de todos os inimigos (valor = power) */
  enemyAtkAura?: boolean;
  /** não pode ser empurrado */
  unpushable?: boolean;
  /** bônus de resistência por estrela */
  resBonus?: (stars: number) => { phys: number; mag: number };
}

const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));

/** Tetos globais */
export const RES_CAP = 3;
export const AURA_CAP = 2;
export const MINION_CAP = 3;

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  diagFrente: {
    id: 'diagFrente',
    name: 'Corte Diagonal',
    description: 'Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).',
    icon: '↗',
    targeting: 'diagFrente',
    scaling: '3★: ao bater em frente, também corta a diagonal com 50% do dano · 4★: 100%.',
    power: (s) => (s >= 4 ? 100 : s >= 3 ? 50 : 0),
    powerLabel: (p) => (p ? `corte duplo ${p}%` : 'sem corte duplo'),
  },
  diagTras: {
    id: 'diagTras',
    name: 'Golpe Reverso',
    description: 'Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).',
    icon: '↙',
    targeting: 'diagTras',
  },
  guarda: {
    id: 'guarda',
    name: 'Postura de Guarda',
    description: 'Resistência física extra.',
    icon: '🛡',
    scaling: '3★: +1 de resistência física · 4★: +2 (máx.).',
    resBonus: (s) => ({ phys: s >= 4 ? 2 : s >= 3 ? 1 : 0, mag: 0 }),
    power: (s) => (s >= 4 ? 2 : s >= 3 ? 1 : 0),
    powerLabel: (p) => `+${p} resist. física`,
  },
  salto: {
    id: 'salto',
    name: 'Salto Vendaval',
    description: 'Pula por cima de uma unidade, avançando 2 casas de uma vez. Ataca com bônus no turno em que salta.',
    icon: '⤴',
    jump: true,
    scaling: 'Bônus de investida: +1 em 3★, +2 em 4★, +1 extra no nível 30 (máx. +3).',
    power: (s, l) => clamp(Math.max(0, s - 2) + (l >= 30 ? 1 : 0), 3),
    powerLabel: (p) => `investida +${p}`,
  },
  longoAlcance: {
    id: 'longoAlcance',
    name: 'Longo Alcance',
    description: 'Ataca o inimigo mais próximo até 3 casas à frente na sua fileira (inclusive o herói). Não avança quando consegue atacar.',
    icon: '🎯',
    rangeBonus: 2,
  },
  flechaDupla: {
    id: 'flechaDupla',
    name: 'Flecha Dupla',
    description: 'Dispara uma segunda flecha no mesmo alvo.',
    icon: '➶',
    scaling: '2★: 2ª flecha de 1 · 3★: 2 · 4★: 3 (máx. 3); +1 no nível 25.',
    power: (s, l) => clamp(s - 1 + (l >= 25 ? 1 : 0), 3),
    powerLabel: (p) => (p ? `2ª flecha ${p}` : 'sem 2ª flecha'),
  },
  perfurante: {
    id: 'perfurante',
    name: 'Feixe Perfurante',
    description: 'O feixe atravessa a fileira: acerta o inimigo mais próximo e também os que estão atrás dele no alcance (só na própria fileira).',
    icon: '⇶',
    scaling: 'Dano nos de trás: 50% (2★) · 75% (3★) · 100% (4★).',
    power: (s) => (s >= 4 ? 100 : s >= 3 ? 75 : 50),
    powerLabel: (p) => `atrás ${p}%`,
  },
  retaguarda: {
    id: 'retaguarda',
    name: 'Emboscada',
    description: 'Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.',
    icon: '🗡',
    targeting: 'retaguarda',
    reach: 2,
    scaling: 'Perfura 1 de resistência em 3★, 2 em 4★, 3 em 5★; +1 no nível 25 (máx. 3).',
    power: (s, l) => clamp(s - 2 + (l >= 25 ? 1 : 0), 3),
    powerLabel: (p) => `perfura ${p}`,
  },
  menorVida: {
    id: 'menorVida',
    name: 'Instinto Predador',
    description: 'Ataca o inimigo com menos vida da sua fileira até 2 casas à frente. Causa dano extra em alvos com metade da vida ou menos.',
    icon: '🩸',
    targeting: 'menorVida',
    reach: 2,
    scaling: 'Execução: +1 em 3★, +2 em 4★, +3 em 5★; +1 no nível 25 (máx. +3).',
    power: (s, l) => clamp(s - 2 + (l >= 25 ? 1 : 0), 3),
    powerLabel: (p) => `execução +${p}`,
  },
  prole: {
    id: 'prole',
    name: 'Prole Sombria',
    description:
      'Ao derrotar um inimigo, uma Cria Sombria (maga frágil de longo alcance) surge no campo. Crias que derrotam alguém também geram novas crias. Máximo de 3 crias por lado.',
    icon: '🥚',
    onKillSummon: 'cria',
    scaling: 'Vida da cria: 1 (5★) · 2 (6★). Ataque: 2, +1 a cada 15 níveis (máx. 4).',
    power: (s) => (s >= 6 ? 2 : 1),
    powerLabel: (p) => `cria com ${p} de vida`,
  },
  contraGolpe: {
    id: 'contraGolpe',
    name: 'Punho Espelhado',
    description:
      'Ao sofrer ataque físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás.',
    icon: '🔁',
    counter: true,
    scaling: 'Multiplicador: ×2 (5★) · ×2,25 (6★, máx.).',
    power: (s) => (s >= 6 ? 2.25 : 2),
    powerLabel: (p) => `contra ×${String(p).replace('.', ',')}`,
  },
  sifao: {
    id: 'sifao',
    name: 'Sifão de Energia',
    description: 'Enquanto estiver em campo, todos os inimigos perdem ataque (redução total máxima de 2, ataque mínimo 1).',
    icon: '🌀',
    enemyAtkAura: true,
    scaling: '−1 de ataque (4–5★) · −2 (6★).',
    power: (s) => (s >= 6 ? 2 : 1),
    powerLabel: (p) => `inimigos −${p} ataque`,
  },
  lotus: {
    id: 'lotus',
    name: 'Bênção do Lótus',
    description: 'No início da sua ação, cura os aliados vizinhos (inclusive diagonais e a outra fileira).',
    icon: '✚',
    scaling: 'Cura 2 (2–3★) · 3 (4★); +1 no nível 20 (máx. 4).',
    power: (s, l) => clamp((s >= 4 ? 3 : 2) + (l >= 20 ? 1 : 0), 4),
    powerLabel: (p) => `cura ${p}`,
  },
  inabalavel: {
    id: 'inabalavel',
    name: 'Inabalável',
    description: 'Não pode ser empurrado.',
    icon: '⛰',
    scaling: '3★: +1 de resistência física · 4★: também +1 de resistência mágica.',
    resBonus: (s) => ({ phys: s >= 3 ? 1 : 0, mag: s >= 4 ? 1 : 0 }),
    unpushable: true,
  },
};

export function has(abilities: AbilityId[], pred: (a: AbilityDef) => unknown): AbilityDef | undefined {
  for (const id of abilities) {
    const a = ABILITIES[id];
    if (a && pred(a)) return a;
  }
  return undefined;
}

export function abilityPower(id: AbilityId, stars: number, level: number): number {
  return ABILITIES[id].power?.(stars, level) ?? 0;
}
