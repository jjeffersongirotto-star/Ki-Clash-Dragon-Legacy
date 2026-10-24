import type { AbilityId } from './types';

/**
 * Registro de habilidades orientado a dados. O motor de batalha consulta
 * estas flags/valores; para criar uma habilidade nova basta registrá-la aqui
 * e tratar o gancho correspondente em battle.ts.
 */
export interface AbilityDef {
  id: AbilityId;
  name: string;
  description: string;
  icon: string;
  /** gancho de mira: altera quem pode ser atacado */
  targeting?: 'diagFrente' | 'diagTras' | 'ultimoDaFila' | 'retaguarda' | 'menorVida';
  /** bônus de alcance */
  rangeBonus?: number;
  /** pode pular unidades no movimento */
  jump?: boolean;
  /** ao derrotar: invoca uma unidade */
  onKillSummon?: string;
  /** ao ser atingido por físico corpo a corpo de frente: contra-ataca */
  counter?: { multiplier: number; push: number };
  /** aura: reduz o ataque de todos os inimigos */
  enemyAtkAura?: number;
  /** não pode ser empurrado */
  unpushable?: boolean;
}

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  diagFrente: {
    id: 'diagFrente',
    name: 'Corte Diagonal',
    description: 'Também ataca inimigos nas diagonais à frente.',
    icon: '↗',
    targeting: 'diagFrente',
  },
  diagTras: {
    id: 'diagTras',
    name: 'Golpe Reverso',
    description: 'Prioriza inimigos nas diagonais para trás (pega quem passou por ele).',
    icon: '↙',
    targeting: 'diagTras',
  },
  salto: {
    id: 'salto',
    name: 'Salto Vendaval',
    description: 'Pula por cima de uma unidade, avançando 2 casas de uma vez.',
    icon: '⤴',
    jump: true,
  },
  longoAlcance: {
    id: 'longoAlcance',
    name: 'Longo Alcance',
    description: '+2 de alcance. Não avança quando consegue atacar.',
    icon: '🏹',
    rangeBonus: 2,
  },
  ultimoDaFila: {
    id: 'ultimoDaFila',
    name: 'Tiro Perfurante',
    description: 'Ataca o último inimigo da sua fileira, onde quer que esteja.',
    icon: '⇥',
    targeting: 'ultimoDaFila',
  },
  retaguarda: {
    id: 'retaguarda',
    name: 'Emboscada',
    description: 'Ataca o inimigo mais recuado (retaguarda) de qualquer fileira.',
    icon: '🗡',
    targeting: 'retaguarda',
  },
  menorVida: {
    id: 'menorVida',
    name: 'Instinto Predador',
    description: 'Ataca o inimigo com menos vida em todo o campo.',
    icon: '🎯',
    targeting: 'menorVida',
  },
  prole: {
    id: 'prole',
    name: 'Prole Sombria',
    description:
      'Ao derrotar um inimigo, uma Cria Sombria (1 de vida, ataque mágico à distância) surge no lugar. Crias que derrotam alguém também geram novas crias.',
    icon: '🥚',
    onKillSummon: 'cria',
  },
  contraGolpe: {
    id: 'contraGolpe',
    name: 'Punho Espelhado',
    description:
      'Ao sofrer ataque físico corpo a corpo de frente, contra-ataca com o dobro do ataque e empurra o agressor 1 casa para trás.',
    icon: '🔁',
    counter: { multiplier: 2, push: 1 },
  },
  sifao: {
    id: 'sifao',
    name: 'Sifão de Energia',
    description: 'Enquanto estiver em campo, todos os inimigos têm -1 de ataque (-2 com 6★).',
    icon: '🌀',
    enemyAtkAura: 1,
  },
  inabalavel: {
    id: 'inabalavel',
    name: 'Inabalável',
    description: 'Não pode ser empurrado.',
    icon: '🛡',
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
