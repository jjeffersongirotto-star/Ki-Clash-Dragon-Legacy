import type { AbilityId } from './types';

/**
 * v0.23.0 — habilidades que antes melhoravam num NÍVEL agora melhoram num DEGRAU global (raridade − 1) × 3 + degrau:
 * o primeiro degrau em que aquele nível já estava garantido na escada antiga (nível 20 → Incomum+, 25 → Raro, 30 → Raro+).
 */
export const STEP_INCOMUM_PLUS = 4;
export const STEP_RARO = 6;
export const STEP_RARO_PLUS = 7;

/**
 * Registro de habilidades orientado a dados. O motor de batalha consulta
 * estas flags/valores; para criar uma habilidade nova basta registrá-la aqui
 * e tratar o gancho correspondente em battle.ts.
 *
 * `power(stars, step)` define a força da habilidade conforme a RARIDADE da carta (`stars` = 1 Comum … 6 Mítico) e o
 * degrau global (`step` = (raridade − 1) × 3 + degrau; v0.23.0, no lugar do nível);
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
  power?: (stars: number, step: number) => number;
  /** como exibir a força atual */
  powerLabel?: (p: number) => string;
  /** gancho de mira (sempre na própria fileira, exceto diagonais) */
  targeting?: 'diagFrente' | 'diagTras' | 'retaguarda' | 'menorVida' | 'longoAlcance' | 'maiorAtaque' | 'costas';
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
  /** v0.17.0: resistência é habilidade (decisão 14) — valor por cor */
  resBonus?: (stars: number) => { phys: number; mag: number };
  /** v0.17.0: Vigia — age antes dos outros, de trás para frente */
  alert?: boolean;
  /** v0.17.0: Renascer — ao morrer pela 1ª vez, volta com `power`% da vida */
  revive?: boolean;
  /** v0.17.0: Anjo da Guarda — 1 vez por partida salva da morte um aliado vizinho (ou ele mesmo) */
  guardian?: boolean;
  /** v0.17.0: Reflexo de Magia — devolve `power`% do dano mágico (ataques e feitiços) */
  spellReflect?: boolean;
  /** v0.17.0: empurra o alvo 1 casa ao acertar corpo a corpo de frente */
  pushOnHit?: boolean;
  /** v0.17.0: ao entrar em campo, traz da Necropolis a última carta aliada derrotada */
  necro?: boolean;
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
    description: 'Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).',
    icon: '🛡',
    scaling: 'Resistência física 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico, máx.).',
    resBonus: (s) => ({ phys: s >= 4 ? 3 : s >= 3 ? 2 : 1, mag: 0 }),
    power: (s) => (s >= 4 ? 3 : s >= 3 ? 2 : 1),
    powerLabel: (p) => `resist. física ${p}`,
  },
  salto: {
    id: 'salto',
    name: 'Salto Vendaval',
    description: 'Move-se sempre saltando para a 3ª casa à frente, por cima de aliados ou inimigos (2ª ou 1ª se a de cima estiver ocupada). Salta também por cima do inimigo da frente. Ao cair, ataca com bônus.',
    icon: '⤴',
    jump: true,
    scaling: 'Salto: sempre até a 3ª casa (fixo, não aumenta com raridade nem degrau) · Bônus de investida (logo depois do salto): +1 em Raro, +2 em Raro+ e Raro++, +3 a partir de Épico (máx. +3).',
    power: (s, g) => clamp(Math.max(0, s - 2) + (g >= STEP_RARO_PLUS ? 1 : 0), 3),
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
    scaling: 'Incomum: 2ª flecha de 1 · a partir de Raro: 3 (máx. 3).',
    power: (s, g) => clamp(s - 1 + (g >= STEP_RARO ? 1 : 0), 3),
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
    icon: '🗡️',
    targeting: 'retaguarda',
    reach: 2,
    scaling: 'Perfura 2 de resistência em Raro e 3 a partir de Épico (máx. 3).',
    power: (s, g) => clamp(s - 2 + (g >= STEP_RARO ? 1 : 0), 3),
    powerLabel: (p) => `perfura ${p}`,
  },
  menorVida: {
    id: 'menorVida',
    name: 'Instinto Predador',
    description: 'Ataca o inimigo com menos vida da sua fileira até 2 casas à frente. Causa dano extra em alvos com metade da vida ou menos.',
    icon: '🩸',
    targeting: 'menorVida',
    reach: 2,
    scaling: 'Execução: +2 em Raro e +3 a partir de Épico (máx. +3).',
    power: (s, g) => clamp(s - 2 + (g >= STEP_RARO ? 1 : 0), 3),
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
    scaling: 'Cura 2 em Incomum · 3 em Incomum+, Incomum++ e Raro · 4 a partir de Épico (máx. 4).',
    power: (s, g) => clamp((s >= 4 ? 3 : 2) + (g >= STEP_INCOMUM_PLUS ? 1 : 0), 4),
    powerLabel: (p) => `cura ${p}`,
  },
  inabalavel: {
    id: 'inabalavel',
    name: 'Inabalável',
    description: 'Não pode ser empurrado. Resistência física (e mágica no Épico).',
    icon: '⛰',
    scaling: 'Resistência física 2 (Incomum) · 3 (Raro–Épico) · resistência mágica 1 no Épico.',
    resBonus: (s) => ({ phys: s >= 3 ? 3 : 2, mag: s >= 4 ? 1 : 0 }),
    power: (s) => (s >= 3 ? 3 : 2),
    powerLabel: (p) => `resist. física ${p}`,
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
    description: 'Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe). Couraça: resistência física 1.',
    icon: '🌵',
    thorns: true,
    resBonus: () => ({ phys: 1, mag: 0 }),
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
  // ---------- v0.17.0 (fase 2) ----------
  vigia: {
    id: 'vigia',
    name: 'Vigia',
    description: 'Em alerta: age antes de todas as outras unidades do lado, de trás para frente (o Vigia mais recuado primeiro).',
    icon: '👁',
    alert: true,
  },
  renascer: {
    id: 'renascer',
    name: 'Renascer',
    description: 'Na primeira vez que cai, renasce na mesma casa com parte da vida (uma vez por partida). Não vai para a Necropolis.',
    icon: '♻',
    revive: true,
    scaling: 'Volta com 30% da vida (Raro) · 40% (Épico) · 50% (Lendário, máx.).',
    power: (s) => (s >= 5 ? 50 : s >= 4 ? 40 : 30),
    powerLabel: (p) => `renasce com ${p}%`,
  },
  anjo: {
    id: 'anjo',
    name: 'Anjo da Guarda',
    description: 'Uma vez por partida, quando ela ou um aliado vizinho (inclusive diagonais) cairia, o golpe deixa o aliado com 1 de vida.',
    icon: '👼',
    guardian: true,
  },
  reflexo: {
    id: 'reflexo',
    name: 'Reflexo de Magia',
    description: 'Dano mágico recebido (ataques e feitiços) é reduzido e a parte refletida volta para quem atacou (feitiço: para o Comandante de quem lançou).',
    icon: '🪞',
    spellReflect: true,
    scaling: 'Reflete 30% (Épico) · 40% (Lendário) · 50% (Mítico, máx.).',
    power: (s) => (s >= 6 ? 50 : s >= 5 ? 40 : 30),
    powerLabel: (p) => `reflete ${p}%`,
  },
  ombrada: {
    id: 'ombrada',
    name: 'Ombrada',
    description: 'Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre).',
    icon: '💢',
    pushOnHit: true,
  },
  necromancia: {
    id: 'necromancia',
    name: 'Chamado da Necropolis',
    description: 'Ao entrar em campo, traz de volta da Necropolis a última carta aliada derrotada: ela volta para a mão já pronta (ou para o baralho, com a mão cheia).',
    icon: '⚰️',
    necro: true,
  },
  barreira: {
    id: 'barreira',
    name: 'Barreira Arcana',
    description: 'Resistência mágica: reduz o dano de cada golpe mágico.',
    icon: '🔰',
    scaling: 'Resistência mágica 1 (Incomum–Raro) · 2 (Épico, máx.).',
    resBonus: (s) => ({ phys: 0, mag: s >= 4 ? 2 : 1 }),
    power: (s) => (s >= 4 ? 2 : 1),
    powerLabel: (p) => `resist. mágica ${p}`,
  },
  // ---------- v0.30.0: habilidades das 99 cartas novas (CARTAS.md) ----------
  critico: {
    id: 'critico',
    name: 'Golpe Crítico',
    description: 'Cada golpe principal tem chance de causar o dobro de dano.',
    icon: '🎯',
    scaling: 'Chance de 25% (Comum–Épico) · 30% (Lendário e Mítico).',
    power: (s) => (s >= 5 ? 30 : 25),
    powerLabel: (p) => `crítico ${p}%`,
  },
  provocar: {
    id: 'provocar',
    name: 'Provocar',
    description: 'Os inimigos que podem atingi-lo são obrigados a atacá-lo (na fileira dele, no alcance deles, ou na diagonal para quem corta na diagonal).',
    icon: '🗯️',
  },
  sangramento: {
    id: 'sangramento',
    name: 'Sangramento',
    description: 'Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.',
    icon: '🩸',
    power: () => 1,
  },
  lentidao: {
    id: 'lentidao',
    name: 'Lentidão',
    description: 'O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.',
    icon: '🐌',
  },
  ataqueCostas: {
    id: 'ataqueCostas',
    name: 'Golpe pelas Costas',
    description: 'Ataca primeiro o inimigo que já passou por ele na mesma fileira (logo atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.',
    icon: '🔙',
    targeting: 'costas',
    power: () => 1,
    powerLabel: (p) => `costas +${p}`,
  },
  veneno: {
    id: 'veneno',
    name: 'Veneno',
    description: 'O alvo fica envenenado: perde vida no começo de cada turno dele por 3 turnos. Não acumula; um novo golpe renova.',
    icon: '🧪',
    scaling: '1 por turno (Comum–Raro) · 2 (Épico em diante).',
    power: (s) => (s >= 4 ? 2 : 1),
    powerLabel: (p) => `veneno ${p}/turno`,
  },
  maldicao: {
    id: 'maldicao',
    name: 'Maldição',
    description: 'O alvo recebe +25% de dano de todas as fontes por 2 turnos.',
    icon: '🕯️',
    power: () => 25,
    powerLabel: (p) => `+${p}% de dano`,
  },
  purificar: {
    id: 'purificar',
    name: 'Purificar',
    description: 'No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado (ou dele mesmo).',
    icon: '🌿',
  },
  furia: {
    id: 'furia',
    name: 'Fúria',
    description: 'Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.',
    icon: '📈',
    power: () => 3,
    powerLabel: (p) => `até +${p}`,
  },
  regeneracao: {
    id: 'regeneracao',
    name: 'Regeneração',
    description: 'No fim de cada turno dele, recupera vida.',
    icon: '💗',
    scaling: 'Recupera 1 (Comum–Raro) · 2 (Épico em diante).',
    power: (s) => (s >= 4 ? 2 : 1),
    powerLabel: (p) => `+${p} por turno`,
  },
  explosao: {
    id: 'explosao',
    name: 'Explosão',
    description: 'Ao morrer, causa dano em todos os inimigos vizinhos (inclusive diagonais e a outra fileira).',
    icon: '💥',
    scaling: '2 de dano (Comum–Raro) · 3 (Épico em diante).',
    power: (s) => (s >= 4 ? 3 : 2),
    powerLabel: (p) => `explode ${p}`,
  },
  congelar: {
    id: 'congelar',
    name: 'Congelamento',
    description: 'Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.',
    icon: '❄️',
    power: () => 50,
    powerLabel: (p) => `${p}% de congelar`,
  },
  gritoGuerra: {
    id: 'gritoGuerra',
    name: 'Grito de Guerra',
    description: 'Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2).',
    icon: '📯',
    power: () => 1,
    powerLabel: (p) => `fileira +${p}`,
  },
  protetor: {
    id: 'protetor',
    name: 'Protetor',
    description: 'Recebe no lugar dos aliados vizinhos parte do dano que eles sofreriam.',
    icon: '🛡️',
    scaling: '30% do dano (Comum–Raro) · 40% (Épico em diante).',
    power: (s) => (s >= 4 ? 40 : 30),
    powerLabel: (p) => `protege ${p}%`,
  },
  perfurar: {
    id: 'perfurar',
    name: 'Perfurar',
    description: 'O ataque ignora escudos e TODA a resistência do alvo.',
    icon: '🗡️',
  },
  escudoInicial: {
    id: 'escudoInicial',
    name: 'Escudo de Entrada',
    description: 'Entra em campo com um escudo que absorve dano (dura até acabar).',
    icon: '🔰',
    scaling: 'Escudo de 3 (Comum–Raro) · 5 (Épico em diante).',
    power: (s) => (s >= 4 ? 5 : 3),
    powerLabel: (p) => `escudo ${p}`,
  },
  queimadura: {
    id: 'queimadura',
    name: 'Queimadura',
    description: 'O alvo pega fogo: sofre 1 de dano mágico no começo de cada turno dele. Acumula até 2 queimaduras (2 por turno).',
    icon: '🔥',
    scaling: 'Dura 2 turnos (Comum–Raro) · 3 (Épico em diante).',
    power: (s) => (s >= 4 ? 3 : 2),
    powerLabel: (p) => `${p} turnos`,
  },
  vampirismo: {
    id: 'vampirismo',
    name: 'Vampirismo',
    description: 'Cura a si mesmo numa parte do dano que causa.',
    icon: '🧛',
    scaling: '25% (Comum–Incomum) · 30% (Raro–Épico) · 35% (Lendário e Mítico).',
    power: (s) => (s >= 5 ? 35 : s >= 3 ? 30 : 25),
    powerLabel: (p) => `cura ${p}%`,
  },
  investida: {
    id: 'investida',
    name: 'Investida',
    description: 'Na primeira ação depois de entrar em campo, anda 2 casas a mais e o primeiro golpe causa +1 de dano.',
    icon: '🐎',
    power: () => 1,
    powerLabel: (p) => `investida +${p}`,
  },
  atordoar: {
    id: 'atordoar',
    name: 'Atordoamento',
    description: 'Ao acertar, 50% de chance de atordoar o alvo: no próximo turno ele não age (não anda, não ataca, não usa habilidade). Não atordoa o mesmo alvo duas vezes seguidas.',
    icon: '💫',
    power: () => 50,
    powerLabel: (p) => `${p}% de atordoar`,
  },
  teleporte: {
    id: 'teleporte',
    name: 'Teleporte',
    description: 'Uma vez por partida, no início da ação, pula para a casa livre logo atrás do inimigo mais avançado da fileira e o ataca pelas costas (+1 de dano).',
    icon: '🌀',
    power: () => 1,
  },
  anular: {
    id: 'anular',
    name: 'Selo do Vazio',
    description: 'Cada golpe físico tira TODAS as habilidades do alvo até o fim da partida (ele vira uma unidade sem habilidades). Não afeta Comandantes.',
    icon: '🚫',
  },
  ultimaResistencia: {
    id: 'ultimaResistencia',
    name: 'Vontade Inquebrável',
    description: 'Na primeira vez que receberia um golpe fatal, fica com 1 de vida e imune a todo dano até o fim do turno inimigo.',
    icon: '⏳',
  },
  evasao: {
    id: 'evasao',
    name: 'Evasão',
    description: 'Desvia de TODOS os ataques à distância (longo alcance, flechas e feitiços de 1 alvo). Se estiver congelado, atordoado ou lento, é atingido normalmente.',
    icon: '💨',
  },
  dominio: {
    id: 'dominio',
    name: 'Domínio Enfraquecedor',
    description: 'Enquanto estiver em campo, todos os inimigos perdem 1 de ataque (soma com o Sifão de Energia até o teto de −2). Cada ataque dele tira mais 1 de ataque do alvo (até −3 por alvo; ataque mínimo 1).',
    icon: '🌀',
    enemyAtkAura: true,
    power: () => 1,
    powerLabel: (p) => `inimigos −${p} ataque`,
  },
  copiador: {
    id: 'copiador',
    name: 'Copiador',
    description: 'No primeiro ataque a um personagem, copia a primeira habilidade dele e fica com ela até o fim da partida (não copia habilidades únicas de cartas Míticas).',
    icon: '🪞',
  },
  retaliacao: {
    id: 'retaliacao',
    name: 'Protocolo de Retaliação',
    description: 'Enquanto estiver em campo, quando o seu Comandante sofrer dano, o inimigo mais próximo dele sofre o mesmo dano (até 5 por vez).',
    icon: '⚖️',
    power: () => 5,
    powerLabel: (p) => `até ${p}`,
  },
  clone: {
    id: 'clone',
    name: 'Clone',
    description: 'Ao entrar em campo, cria uma cópia com metade da vida e do ataque na casa livre vizinha. A cópia não tem habilidades.',
    icon: '👥',
  },
  raioCadeia: {
    id: 'raioCadeia',
    name: 'Raio em Cadeia',
    description: 'O ataque salta para até mais 2 inimigos vizinhos do alvo, com 60% e 30% do dano.',
    icon: '⚡',
  },
  couracaAdaptativa: {
    id: 'couracaAdaptativa',
    name: 'Couraça Adaptativa',
    description: 'Começa com resistência física 1. Cada golpe físico recebido cura 1 de vida e soma +1 de resistência física (até 3).',
    icon: '🛡️',
    resBonus: () => ({ phys: 1, mag: 0 }),
  },
  execucao: {
    id: 'execucao',
    name: 'Execução',
    description: 'Derrota na hora o inimigo atingido (não o Comandante) se ele ficar com 25% da vida ou menos.',
    icon: '☠️',
    power: () => 25,
  },
  vinganca: {
    id: 'vinganca',
    name: 'Vingança',
    description: 'Ganha +1 de ataque a cada ALIADO derrotado, até +4.',
    icon: '🕯️',
    power: () => 4,
    powerLabel: (p) => `até +${p}`,
  },
  sedeEterna: {
    id: 'sedeEterna',
    name: 'Sede Eterna',
    description: 'Cada ataque tira vida EXTRA do alvo e cura ele mesmo nessa quantidade. Ao derrotar um inimigo, passa a "Marca da Sede" para o aliado mais próximo, que também tira 1 de vida extra por ataque e se cura (mas não passa a marca adiante).',
    icon: '🧛',
    scaling: '2 de vida extra (Mítico e Mítico+) · 3 (Mítico++).',
    power: (_s, g) => (g >= 17 ? 3 : 2),
    powerLabel: (p) => `drena ${p}`,
  },
  marcaSede: {
    id: 'marcaSede',
    name: 'Marca da Sede',
    description: 'Recebida da Sede Eterna: cada ataque tira 1 de vida extra do alvo e cura quem ataca.',
    icon: '🩸',
    power: () => 1,
    powerLabel: (p) => `drena ${p}`,
  },
  ressurreicao: {
    id: 'ressurreicao',
    name: 'Ressurreição',
    description: 'No início da ação, traz de volta ao campo, na casa livre mais próxima, o último aliado derrotado com 50% da vida. Uma vez a cada 10 rodadas (a primeira a partir da rodada 3).',
    icon: '✨',
    power: () => 50,
  },
};

export function has(abilities: AbilityId[], pred: (a: AbilityDef) => unknown): AbilityDef | undefined {
  for (const id of abilities) {
    const a = ABILITIES[id];
    if (a && pred(a)) return a;
  }
  return undefined;
}

/** Força da habilidade na raridade e no degrau (0, 1, 2) da carta. */
export function abilityPower(id: AbilityId, stars: number, step = 0): number {
  return ABILITIES[id].power?.(stars, (stars - 1) * 3 + step) ?? 0;
}
