/**
 * v0.17.0 — Feitiços (decisões 4, 20 e 22).
 * - Ocupam vagas do baralho (1 a 3 cópias) e esperam na mão como as outras cartas (custo − 1 rodadas, mínimo 1).
 * - Cada categoria tem 2 feitiços próprios; alguns são CRUZADOS (valem para 2 categorias).
 * - Para lançar, é preciso ter em campo um aliado de uma das categorias do feitiço: ele é o conjurador
 *   (o de maior ataque). A força do feitiço sai do ataque atual do conjurador (ou da vida do alvo, nas curas),
 *   então acompanha a evolução das suas cartas.
 * - Depois de lançado, o feitiço volta para o monte e reaparece pela fila de compra, como qualquer carta
 *   (a fila recomeça no lançamento: fica bloqueado como se tivesse acabado de ser comprado).
 * - Nenhum feitiço vai para a Necropolis.
 * v0.41.0: os feitiços deixaram de vir todos liberados. São cartas colecionáveis como os personagens: cada um tem
 * uma raridade (Comum a Épico) e chega pelo 🎴 Banner (na raridade dele), pela 1ª vitória das fases 2, 5 e 8 de
 * cada região e pelo pacote do tutorial. O baralho usa até 3 cópias, mas só as que você tem; as que sobram ficam
 * no 🎒 Inventário e podem ser desmanchadas (em Orbes, como o Desmanchar geral dos personagens).
 */
import type { Category } from './types';

export type SpellTarget = 'enemy' | 'ally' | 'row' | 'none';

export interface SpellDef {
  id: string;
  name: string;
  icon: string;
  /** categorias que podem conjurar (2 = feitiço cruzado) */
  categories: Category[];
  cost: number;
  target: SpellTarget;
  /** tipo do dano (feitiços de dano) */
  damageType?: 'fisico' | 'magico';
  description: string;
  /** v0.41.0: raridade da carta de feitiço (1 Comum … 4 Épico): em que raridade ela sai no Banner */
  rarity: number;
}

export const SPELL_PREFIX = 'f-';

export const SPELLS: SpellDef[] = [
  // ---- DPS ----
  { id: 'f-investida', name: 'Investida de Ki', icon: '💨', categories: ['dps'], cost: 3, target: 'enemy', damageType: 'fisico', description: 'Um inimigo qualquer sofre 250% do ataque do conjurador (físico) e é empurrado 1 casa para trás.', rarity: 2 },
  { id: 'f-giratoria', name: 'Lâmina Giratória', icon: '🌪', categories: ['dps', 'assassino'], cost: 3, target: 'row', damageType: 'fisico', description: 'Todos os inimigos da fileira escolhida sofrem 120% do ataque do conjurador (físico).', rarity: 3 },
  // ---- Tanque ----
  { id: 'f-muralha', name: 'Muralha', icon: '🧱', categories: ['tanque'], cost: 2, target: 'ally', description: 'Um aliado ganha escudo temporário igual a 80% da vida máxima do conjurador, por 2 rodadas.', rarity: 1 },
  { id: 'f-tremor', name: 'Tremor', icon: '🌋', categories: ['tanque', 'dps'], cost: 3, target: 'enemy', damageType: 'fisico', description: 'Um inimigo sofre 100% do ataque do conjurador, fica atordoado (perde a próxima ação) e é empurrado 1 casa.', rarity: 3 },
  // ---- Arqueiro ----
  { id: 'f-chuva', name: 'Chuva de Flechas', icon: '🏹', categories: ['arqueiro'], cost: 3, target: 'row', damageType: 'fisico', description: 'Todos os inimigos da fileira escolhida sofrem 100% do ataque do conjurador (físico).', rarity: 2 },
  { id: 'f-flecha-veneno', name: 'Flecha Envenenada', icon: '🧪', categories: ['arqueiro', 'assassino'], cost: 2, target: 'enemy', damageType: 'fisico', description: 'Um inimigo sofre 80% do ataque do conjurador e fica envenenado: 60% do ataque por rodada, por 3 rodadas.', rarity: 1 },
  // ---- Mago ----
  { id: 'f-bola-fogo', name: 'Bola de Fogo', icon: '☄️', categories: ['mago'], cost: 3, target: 'enemy', damageType: 'magico', description: 'Um inimigo sofre 200% do ataque do conjurador (mágico) e queima: 50% por rodada, por 2 rodadas.', rarity: 3 },
  { id: 'f-raio', name: 'Raio Paralisante', icon: '⚡', categories: ['mago', 'suporte'], cost: 3, target: 'enemy', damageType: 'magico', description: 'Um inimigo sofre 130% do ataque do conjurador (mágico) e fica atordoado (perde a próxima ação).', rarity: 3 },
  // ---- Assassino ----
  { id: 'f-veneno', name: 'Veneno Mortal', icon: '☠️', categories: ['assassino'], cost: 2, target: 'enemy', description: 'Um inimigo fica envenenado: 100% do ataque do conjurador por rodada, por 3 rodadas (o veneno ignora resistência).', rarity: 2 },
  { id: 'f-sombras', name: 'Golpe nas Sombras', icon: '🗡️', categories: ['assassino'], cost: 3, target: 'enemy', damageType: 'fisico', description: 'Um inimigo sofre 250% do ataque do conjurador, ignorando toda a resistência.', rarity: 4 },
  // ---- Suporte ----
  { id: 'f-cura', name: 'Cura em Massa', icon: '💖', categories: ['suporte'], cost: 2, target: 'row', description: 'Cura os aliados da fileira escolhida em 50% da vida máxima de cada um.', rarity: 1 },
  { id: 'f-anjo', name: 'Anjo da Guarda', icon: '👼', categories: ['suporte'], cost: 3, target: 'ally', description: 'Protege um aliado: na próxima vez que ele cairia, fica com 1 de vida (uma vez; dura até ser usado).', rarity: 4 },
  { id: 'f-necropolis', name: 'Chamado da Necropolis', icon: '⚰️', categories: ['suporte', 'mago'], cost: 3, target: 'none', description: 'Traz de volta da Necropolis a última carta aliada derrotada: volta para a mão já pronta (ou para o baralho, com a mão cheia).', rarity: 4 },
];

/** v0.41.0: feitiços que saem no Banner numa raridade */
export const spellsAt = (r: number) => SPELLS.filter((s) => s.rarity === r).map((s) => s.id);

export const SPELL_BY_ID: Record<string, SpellDef> = Object.fromEntries(SPELLS.map((s) => [s.id, s]));
export const isSpell = (id: string) => id.startsWith(SPELL_PREFIX) && !!SPELL_BY_ID[id];
export const getSpell = (id: string) => {
  const s = SPELL_BY_ID[id];
  if (!s) throw new Error(`Feitiço desconhecido: ${id}`);
  return s;
};
/** percentuais usados pelos feitiços (um lugar só para o REGRAS e os testes) */
export const SPELL_NUM = {
  investida: 250, giratoria: 120, muralhaHp: 80, muralhaTurns: 2, tremor: 100, chuva: 100,
  flechaHit: 80, flechaDot: 60, flechaTurns: 3, bolaHit: 200, bolaDot: 50, bolaTurns: 2,
  raio: 130, veneno: 100, venenoTurns: 3, sombras: 250, cura: 50,
} as const;
