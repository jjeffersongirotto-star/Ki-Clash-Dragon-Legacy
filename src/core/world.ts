/**
 * v0.39.0 — Mapa do mundo: 10 regiões × 10 fases = 100 fases (lógica pura, sem DOM).
 *
 * As fases têm número GLOBAL (1 a 100): a região N tem as fases 10·(N−1)+1 a 10·N. A região 1 é a campanha de
 * sempre (fases 1–10, mesmo progresso salvo). A fase 1 da região N+1 abre ao vencer a fase 10 da região N, em cada
 * dificuldade (é a mesma regra de "vencer a fase anterior" das fases dentro de uma região).
 * Os baralhos, Comandantes, vida, nível da IA e recompensas das regiões 2–10 ficam em campaign.ts (`WORLD_STAGES`).
 */
export const STAGES_PER_REGION = 10;
export const REGION_COUNT = 10;
export const WORLD_STAGE_COUNT = STAGES_PER_REGION * REGION_COUNT;

export interface Region {
  id: number;
  name: string;
  icon: string;
  /** raças que dominam os baralhos inimigos da região (a região 1 é a campanha de sempre) */
  races: string[];
}

export const REGIONS: Region[] = [
  { id: 1, name: 'Vale Sereno', icon: '🏯', races: [] },
  { id: 2, name: 'Costa do Coral Partido', icon: '🌊', races: ['humano', 'extraterrestre'] },
  { id: 3, name: 'Selva das Mil Raízes', icon: '🌳', races: ['monstro', 'mago'] },
  { id: 4, name: 'Dunas de Âmbar', icon: '🏜️', races: ['humano', 'androide'] },
  { id: 5, name: 'Cordilheira Trovejante', icon: '⛰️', races: ['monstro', 'humano'] },
  { id: 6, name: 'Pântano das Velas Mortas', icon: '🕯️', races: ['necromante', 'monstro'] },
  { id: 7, name: 'Cidadela das Engrenagens', icon: '⚙️', races: ['androide', 'extraterrestre'] },
  { id: 8, name: 'Ilhas Flutuantes de Éter', icon: '☁️', races: ['mago', 'necromante'] },
  { id: 9, name: 'Abismo Estelar', icon: '🌌', races: ['extraterrestre', 'androide'] },
  { id: 10, name: 'Coroa do Dragão Eterno', icon: '🐉', races: ['humano', 'mago', 'monstro', 'necromante', 'androide', 'extraterrestre'] },
];

/** Nomes das 90 fases novas (regiões 2–10), na ordem do caminho. */
export const WORLD_NAMES: string[][] = [
  ['Praia das Conchas Quebradas', 'Farol Sem Chama', 'Recife dos Afogados', 'Gruta da Maré Baixa', 'Porto dos Corsários', 'Baía das Sereias de Pedra', 'Naufrágio do Leviatã', 'Ilha da Tartaruga Gigante', 'Redemoinho Esmeralda', 'Santuário do Coral Rubro'],
  ['Trilha dos Cipós', 'Clareira dos Vaga-lumes', 'Rio das Piranhas de Jade', 'Aldeia nas Copas', 'Templo Engolido', 'Ninho da Serpente Alada', 'Cachoeira do Trovão Verde', 'Lagoa dos Sapos Gigantes', 'Árvore-Mãe Ancestral', 'Coração da Selva'],
  ['Oásis Esquecido', 'Caravana Perdida', 'Mar de Areia Cantante', 'Ruínas do Sol Caído', 'Cânion dos Escorpiões', 'Pirâmide Invertida', 'Tempestade de Vidro', 'Cemitério de Colossos', 'Cidade Miragem', 'Trono do Faraó de Âmbar'],
  ['Passo das Cabras Brancas', 'Mosteiro das Nuvens', 'Ponte Pênsil do Abismo', 'Mina dos Martelos de Ferro', 'Geleira Uivante', 'Pico do Eco Eterno', 'Forja do Gigante', 'Ninho das Águias-Trovão', 'Caldeira Adormecida', 'Cume do Primeiro Raio'],
  ['Brejo das Lanternas', 'Vila dos Sinos Mudos', 'Lagoa das Mil Velas', 'Catacumba Alagada', 'Mangue dos Ossos', 'Capela Afundada', 'Ponte dos Lamentos', 'Torre do Corvo Branco', 'Jardim das Lápides', 'Altar da Noite Sem Fim'],
  ['Portão de Bronze', 'Esteira Infinita', 'Fundição Rubra', 'Arsenal Silencioso', 'Laboratório Proibido', 'Torre de Vapor', 'Fábrica de Sentinelas', 'Núcleo de Plasma', 'Sala do Relojoeiro', 'Coração Mecânico'],
  ['Escadaria de Vento', 'Biblioteca Suspensa', 'Jardim de Cristal', 'Observatório Arcano', 'Ilha dos Golens de Nuvem', 'Ponte de Arco-Íris', 'Academia dos Magos Errantes', 'Espelho do Céu', 'Ninho da Fênix Azul', 'Torre do Arquimago'],
  ['Estação Órbita Zero', 'Cinturão de Asteroides', 'Lua Partida', 'Nave-Colmeia', 'Nebulosa Carmesim', 'Planeta de Gelo Negro', 'Portal Quântico', 'Colônia Perdida', 'Horizonte de Eventos', 'Estrela Moribunda'],
  ['Portões de Obsidiana', 'Ponte de Lava', 'Salão dos Ancestrais', 'Câmara dos Ovos Dourados', 'Guarda Escamada', 'Rio de Fogo Celeste', 'Biblioteca dos Dragões', 'Arena dos Campeões', 'Vigília do Último Guardião', 'Despertar do Dragão Eterno'],
];

/** Região da fase (1 a 10). */
export const regionOf = (stageId: number) => Math.ceil(stageId / STAGES_PER_REGION);
/** Número da fase dentro da região (1 a 10). */
export const localOf = (stageId: number) => ((stageId - 1) % STAGES_PER_REGION) + 1;
/** Fases da região (números globais). */
export const regionStageIds = (region: number) => Array.from({ length: STAGES_PER_REGION }, (_, k) => (region - 1) * STAGES_PER_REGION + k + 1);
/** Nome da fase com a região: "Fase 3 · …" vira "3-3" nos textos curtos. */
export const stageLabel = (stageId: number) => `${regionOf(stageId)}-${localOf(stageId)}`;
