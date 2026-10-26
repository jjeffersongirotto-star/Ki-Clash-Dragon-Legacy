import type { AbilityId } from './types';

/**
 * Registro de habilidades orientado a dados. O motor de batalha consulta
 * estas flags/valores; para criar uma habilidade nova basta registrá-la aqui
 * e tratar o gancho correspondente em battle.ts.
 *
 * `power(stars, level)` define a força da habilidade conforme a COR da carta (`stars` = tier 1 Comum … 6 Mítico) e o nível;
 * o degrau "+" não muda habilidades (v0.10),
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
  targeting?: 'diagFrente' | 'diagTras' | 'retaguarda' | 'menorVida' | 'longoAlcance' | 'maiorAtaque';
  /** bônus de alcance */
  rangeBonus?: number;
  /** alcance (em colunas à frente) da mira especial */
  reach?: number;
  /** Salto: anda SALTO_MOVE (3) casas fixas e pode pular 1 unidade (inclusive inimiga) */
  jump?: boolean;
  /** ao derrotar: invoca uma unidade */
  onKillSummon?: string;
  /** ao ser atingido por físico corpo a corpo de frente: contra-ataca */
  counter?: boolean;
  /** aura: reduz o ataque de todos os inimigos (valor = power) */
  enemyAtkAura?: boolean;
  /** não pode ser empurrado */
  unpushable?: boolean;
  /** ao sofrer golpe físico corpo a corpo de frente: devolve `power` de dano fixo */
  thorns?: boolean;
  /** no início da ação: cura `power` o aliado mais ferido da própria fileira */
  healRow?: boolean;
  /** aura: aliados vizinhos ganham `power` de ataque (não acumula) */
  allyAtkAura?: boolean;
  /** ao acertar uma unidade: `power` de dano na unidade inimiga da mesma coluna na outra fileira */
  splashOtherRow?: boolean;
  /** `power` de dano extra contra o Comandante */
  heroBonus?: boolean;
  /** ignora `power` de resistência */
  pierce?: boolean;
  /** `power` de dano extra em alvos a 2 ou mais casas */
  farBonus?: boolean;
  /** `power` de dano extra contra unidades de longo alcance */
  rangedBonus?: boolean;
  /** `power` de dano extra em alvos com a vida cheia */
  fullHpBonus?: boolean;
  /** bônus de resistência por estrela */
  resBonus?: (stars: number) => { phys: number; mag: number };
}

const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));

/** Tetos globais */
export const RES_CAP = 3;
export const AURA_CAP = 2;
export const MINION_CAP = 3;
/** bônus de ataque máximo vindo de aliados (Tambor de Guerra) */
export const BUFF_CAP = 2;

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  diagFrente: {
    id: 'diagFrente',
    name: 'Corte Diagonal',
    description: 'Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).',
    icon: '↗',
    targeting: 'diagFrente',
    scaling: 'Raro em diante: ao bater em frente, também corta a diagonal com 50% do dano (máx.).',
    power: (s) => (s >= 3 ? 50 : 0),
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
    scaling: 'Raro: +1 de resistência física · Épico: +2 (máx.).',
    resBonus: (s) => ({ phys: s >= 4 ? 2 : s >= 3 ? 1 : 0, mag: 0 }),
    power: (s) => (s >= 4 ? 2 : s >= 3 ? 1 : 0),
    powerLabel: (p) => `+${p} resist. física`,
  },
  salto: {
    id: 'salto',
    name: 'Salto Vendaval',
    description: 'Move-se sempre saltando para a 3ª casa à frente, por cima de aliados ou inimigos (2ª ou 1ª se a de cima estiver ocupada). Salta também por cima do inimigo da frente. Ao cair, ataca com bônus.',
    icon: '⤴',
    jump: true,
    scaling: 'Salto: sempre até a 3ª casa (fixo, não aumenta com cor nem nível) · Bônus de investida (logo depois do salto): +1 em Raro, +2 em Épico, +1 extra no nível 30 (máx. +3).',
    power: (s, l) => clamp(Math.max(0, s - 2) + (l >= 30 ? 1 : 0), 3),
    powerLabel: (p) => `investida +${p}`,
  },
  longoAlcance: {
    id: 'longoAlcance',
    name: 'Longo Alcance',
    description: 'Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.',
    icon: '🎯',
    rangeBonus: 3,
  },
  flechaDupla: {
    id: 'flechaDupla',
    name: 'Flecha Dupla',
    description: 'Dispara uma segunda flecha no mesmo alvo.',
    icon: '➶',
    scaling: 'Incomum: 2ª flecha de 1 · Raro: 2 · Épico: 3 (máx. 3); +1 no nível 25.',
    power: (s, l) => clamp(s - 1 + (l >= 25 ? 1 : 0), 3),
    powerLabel: (p) => (p ? `2ª flecha ${p}` : 'sem 2ª flecha'),
  },
  perfurante: {
    id: 'perfurante',
    name: 'Feixe Perfurante',
    description: 'O feixe atravessa a fileira: acerta o inimigo mais próximo e também os que estão atrás dele no alcance (só na própria fileira).',
    icon: '⇶',
    scaling: 'Dano nos de trás: 50% (Incomum) · 75% (Raro em diante, máx.).',
    power: (s) => (s >= 3 ? 75 : 50),
    powerLabel: (p) => `atrás ${p}%`,
  },
  retaguarda: {
    id: 'retaguarda',
    name: 'Emboscada',
    description: 'Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.',
    icon: '🗡',
    targeting: 'retaguarda',
    reach: 2,
    scaling: 'Perfura 1 de resistência em Raro, 2 em Épico, 3 em Lendário; +1 no nível 25 (máx. 3).',
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
    scaling: 'Execução: +1 em Raro, +2 em Épico, +3 em Lendário; +1 no nível 25 (máx. +3).',
    power: (s, l) => clamp(s - 2 + (l >= 25 ? 1 : 0), 3),
    powerLabel: (p) => `execução +${p}`,
  },
  prole: {
    id: 'prole',
    name: 'Prole Sombria',
    description:
      'Ao derrotar um inimigo, uma Cria Sombria (maga frágil com ataque mágico até 2 casas à frente) surge no campo. Crias que derrotam alguém também geram novas crias. Máximo de 3 crias por lado.',
    icon: '🥚',
    onKillSummon: 'cria',
    scaling: 'Cria: ataque 2 e vida 1 (Lendário) · ataque 3 e vida 2 (Mítico).',
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
    scaling: 'Multiplicador: ×2 (Lendário) · ×2,25 (Mítico, máx.).',
    power: (s) => (s >= 6 ? 2.25 : 2),
    powerLabel: (p) => `contra ×${String(p).replace('.', ',')}`,
  },
  sifao: {
    id: 'sifao',
    name: 'Sifão de Energia',
    description: 'Enquanto estiver em campo, todos os inimigos perdem ataque (redução total máxima de 2, ataque mínimo 1).',
    icon: '🌀',
    enemyAtkAura: true,
    scaling: '−1 de ataque (Épico–Lendário) · −2 (Mítico).',
    power: (s) => (s >= 6 ? 2 : 1),
    powerLabel: (p) => `inimigos −${p} ataque`,
  },
  lotus: {
    id: 'lotus',
    name: 'Bênção do Lótus',
    description: 'No início da sua ação, cura os 2 aliados vizinhos mais feridos (inclusive diagonais e a outra fileira).',
    icon: '✚',
    scaling: 'Cura 2 (Incomum–Raro) · 3 (Épico); +1 no nível 20 (máx. 4).',
    power: (s, l) => clamp((s >= 4 ? 3 : 2) + (l >= 20 ? 1 : 0), 4),
    powerLabel: (p) => `cura ${p}`,
  },
  inabalavel: {
    id: 'inabalavel',
    name: 'Inabalável',
    description: 'Não pode ser empurrado.',
    icon: '⛰',
    scaling: 'Raro: +1 de resistência física · Épico: também +1 de resistência mágica.',
    resBonus: (s) => ({ phys: s >= 3 ? 1 : 0, mag: s >= 4 ? 1 : 0 }),
    unpushable: true,
  },
  disparoSombrio: {
    id: 'disparoSombrio',
    name: 'Disparo Sombrio',
    description: 'Ataque mágico no inimigo mais próximo até 2 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.',
    icon: '🌑',
    rangeBonus: 1,
  },
  // ---------- personagens iniciais (Comum → Épico) ----------
  espinhos: {
    id: 'espinhos',
    name: 'Couraça de Espinhos',
    description: 'Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe).',
    icon: '🌵',
    thorns: true,
    scaling: 'Devolve 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico, máx.).',
    power: (s) => (s >= 4 ? 3 : s >= 3 ? 2 : 1),
    powerLabel: (p) => `devolve ${p}`,
  },
  sopro: {
    id: 'sopro',
    name: 'Sopro Restaurador',
    description: 'No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).',
    icon: '🍃',
    healRow: true,
    scaling: 'Cura 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico, máx.).',
    power: (s) => (s >= 4 ? 3 : s >= 3 ? 2 : 1),
    powerLabel: (p) => `cura ${p}`,
  },
  tambor: {
    id: 'tambor',
    name: 'Tambor de Guerra',
    description: 'Enquanto estiver em campo, os aliados vizinhos (inclusive diagonais e a outra fileira) ganham ataque. Vários tambores não se somam.',
    icon: '🥁',
    allyAtkAura: true,
    scaling: '+1 de ataque (Comum–Raro) · +2 (Épico, máx.).',
    power: (s) => (s >= 4 ? 2 : 1),
    powerLabel: (p) => `vizinhos +${p} ataque`,
  },
  brasa: {
    id: 'brasa',
    name: 'Explosão de Brasas',
    description: 'Ao acertar uma unidade, a explosão também atinge com dano mágico o inimigo da mesma coluna na outra fileira.',
    icon: '💥',
    splashOtherRow: true,
    scaling: 'Explosão de 1 (Comum–Incomum) · 2 (Raro–Épico, máx.).',
    power: (s) => (s >= 3 ? 2 : 1),
    powerLabel: (p) => `explosão ${p}`,
  },
  mare: {
    id: 'mare',
    name: 'Maré Implacável',
    description: 'Causa dano extra ao atacar o Comandante inimigo.',
    icon: '🌊',
    heroBonus: true,
    scaling: '+1 no Comandante (Comum–Incomum) · +2 (Raro) · +3 (Épico, máx.).',
    power: (s) => (s >= 4 ? 3 : s >= 3 ? 2 : 1),
    powerLabel: (p) => `Comandante +${p}`,
  },
  precisao: {
    id: 'precisao',
    name: 'Tiro Certeiro',
    description: 'A flecha ignora parte da resistência física do alvo.',
    icon: '➹',
    pierce: true,
    scaling: 'Ignora 1 de resistência (Comum–Incomum) · 2 (Raro–Épico, máx.).',
    power: (s) => (s >= 3 ? 2 : 1),
    powerLabel: (p) => `perfura ${p}`,
  },
  olhoAguia: {
    id: 'olhoAguia',
    name: 'Olho de Águia',
    description: 'Causa dano extra em unidades a 2 ou mais casas de distância (quanto mais longe, mais certeiro).',
    icon: '🦅',
    farBonus: true,
    scaling: '+1 de dano à distância (Comum–Incomum) · +2 (Raro–Épico, máx.).',
    power: (s) => (s >= 3 ? 2 : 1),
    powerLabel: (p) => `longe +${p}`,
  },
  cacaMagos: {
    id: 'cacaMagos',
    name: 'Caça-Conjuradores',
    description: 'Prioriza unidades de longo alcance (magos, arqueiros e suportes à distância) da sua fileira até 2 casas à frente.',
    icon: '🪓',
    targeting: 'longoAlcance',
    reach: 2,
    rangedBonus: true,
    scaling: 'Dano extra nelas: +1 (Comum–Incomum) · +2 (Raro–Épico, máx.).',
    power: (s) => (s >= 3 ? 2 : 1),
    powerLabel: (p) => `caçada +${p}`,
  },
  surpresa: {
    id: 'surpresa',
    name: 'Ataque Surpresa',
    description: 'Mira o inimigo de maior ataque da sua fileira até 2 casas à frente e causa dano extra em quem ainda está com a vida cheia.',
    icon: '🐾',
    targeting: 'maiorAtaque',
    reach: 2,
    fullHpBonus: true,
    scaling: 'Dano extra: +1 (Comum–Incomum) · +2 (Raro–Épico, máx.).',
    power: (s) => (s >= 3 ? 2 : 1),
    powerLabel: (p) => `surpresa +${p}`,
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
