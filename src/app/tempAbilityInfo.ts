/**
 * TEMP (v0.58.2) — só para o seletor de habilidades do editor de balanceamento (sem efeito no jogo).
 * Para cada habilidade: grupo (perto / longe / híbrido) e uma frase curta do que faz, sem números.
 * A descrição completa continua no detalhe da carta. Remover junto com o editor.
 */
import type { AbilityId } from '../core/types';

export type AbilityGroup = 'perto' | 'longe' | 'hibrido';
export const GROUP_LABEL: Record<AbilityGroup, string> = { perto: 'Ataque de perto', longe: 'Ataque de longe', hibrido: 'Híbrido' };
export const GROUP_ORDER: AbilityGroup[] = ['perto', 'longe', 'hibrido'];

const P = 'perto', L = 'longe', H = 'hibrido';
export const ABILITY_INFO: Record<AbilityId, { g: AbilityGroup; b: string }> = {
  diagFrente: { g: P, b: 'Também corta o inimigo na diagonal à frente' },
  diagTras: { g: P, b: 'Ataca quem passou por ele na diagonal de trás' },
  guarda: { g: H, b: 'Recebe menos dano de golpes físicos' },
  salto: { g: P, b: 'Avança saltando por cima das unidades e bate mais forte depois do salto' },
  longoAlcance: { g: L, b: 'Ataca de longe o inimigo mais próximo da fileira' },
  flechaDupla: { g: L, b: 'Dispara uma segunda flecha no mesmo alvo' },
  perfurante: { g: L, b: 'O tiro atravessa e acerta também quem está atrás' },
  retaguarda: { g: P, b: 'Ataca o inimigo mais distante ao alcance, ignorando parte da defesa' },
  menorVida: { g: P, b: 'Caça o inimigo mais ferido e bate mais forte nele' },
  prole: { g: H, b: 'Enquanto vivo, todos os inimigos perdem ataque' },
  lotus: { g: H, b: 'Cura os aliados vizinhos mais feridos' },
  inabalavel: { g: H, b: 'Não pode ser empurrado e resiste a dano' },
  disparoSombrio: { g: L, b: 'Ataque mágico à distância no inimigo mais próximo' },
  espinhos: { g: H, b: 'Quem bate nele de perto sofre dano de volta' },
  sopro: { g: H, b: 'Cura o aliado mais ferido da fileira' },
  tambor: { g: H, b: 'Aliados vizinhos ganham ataque' },
  brasa: { g: H, b: 'O golpe explode e atinge também o inimigo da outra fileira' },
  mare: { g: H, b: 'Causa dano extra no Comandante inimigo' },
  precisao: { g: L, b: 'A flecha ignora parte da defesa física do alvo' },
  olhoAguia: { g: L, b: 'Causa mais dano quanto mais longe está o alvo' },
  cacaMagos: { g: P, b: 'Prioriza magos, arqueiros e suportes inimigos' },
  surpresa: { g: P, b: 'Mira o inimigo mais forte e bate mais se ele estiver intacto' },
  vigia: { g: H, b: 'Age antes das outras unidades do lado' },
  renascer: { g: H, b: 'Renasce uma vez ao cair' },
  anjo: { g: H, b: 'Salva uma vez a si ou um vizinho de cair' },
  reflexo: { g: H, b: 'Reduz dano mágico e devolve parte para quem atacou' },
  ombrada: { g: P, b: 'Empurra para trás o inimigo que acerta de frente' },
  necromancia: { g: H, b: 'Traz de volta para a mão o último aliado derrotado' },
  barreira: { g: H, b: 'Recebe menos dano de golpes mágicos' },
  critico: { g: H, b: 'Chance de causar dano dobrado' },
  provocar: { g: H, b: 'Obriga os inimigos ao alcance a atacá-lo' },
  sangramento: { g: P, b: 'Golpes físicos fazem o alvo sangrar por alguns turnos' },
  lentidao: { g: H, b: 'Deixa o alvo lento e sem atacar por um turno' },
  ataqueCostas: { g: P, b: 'Ataca primeiro quem passou por ele, com dano extra' },
  veneno: { g: H, b: 'Envenena o alvo, que perde vida a cada turno' },
  maldicao: { g: H, b: 'O alvo passa a receber mais dano de tudo' },
  purificar: { g: H, b: 'Remove um efeito ruim de um aliado' },
  furia: { g: H, b: 'Ganha ataque a cada inimigo abatido' },
  regeneracao: { g: H, b: 'Recupera vida a cada turno' },
  explosao: { g: H, b: 'Ao morrer, causa dano nos inimigos vizinhos' },
  congelar: { g: H, b: 'Chance de congelar o alvo, que perde o ataque' },
  gritoGuerra: { g: H, b: 'Aliados da mesma fileira ganham ataque' },
  protetor: { g: H, b: 'Recebe parte do dano dos aliados vizinhos' },
  perfurar: { g: H, b: 'Ignora escudos e toda a defesa do alvo' },
  escudoInicial: { g: H, b: 'Entra em campo com um escudo' },
  queimadura: { g: H, b: 'Põe fogo no alvo, que sofre dano a cada turno' },
  vampirismo: { g: H, b: 'Cura a si mesmo com parte do dano que causa' },
  investida: { g: P, b: 'Ao entrar, avança mais e o primeiro golpe é mais forte' },
  atordoar: { g: H, b: 'Chance de atordoar o alvo, que perde o turno' },
  teleporte: { g: P, b: 'Uma vez, pula para trás do inimigo mais avançado' },
  anular: { g: P, b: 'Golpes físicos tiram todas as habilidades do alvo' },
  ultimaResistencia: { g: H, b: 'Sobrevive uma vez a um golpe fatal' },
  evasao: { g: H, b: 'Desvia de ataques à distância' },
  dominio: { g: H, b: 'Enquanto vivo, os inimigos perdem ataque' },
  copiador: { g: H, b: 'Copia a habilidade do primeiro personagem que atacar' },
  retaliacao: { g: H, b: 'Devolve o dano sofrido pelo seu Comandante' },
  clone: { g: H, b: 'Ao entrar, cria uma cópia mais fraca de si' },
  raioCadeia: { g: L, b: 'O ataque salta para inimigos vizinhos do alvo' },
  couracaAdaptativa: { g: H, b: 'Fica mais resistente e se cura ao levar golpes físicos' },
  execucao: { g: H, b: 'Derrota na hora o inimigo que ficar com pouca vida' },
  vinganca: { g: H, b: 'Ganha ataque a cada aliado derrotado' },
  sedeEterna: { g: H, b: 'Rouba vida a cada ataque e espalha a marca ao abater' },
  marcaSede: { g: H, b: 'Rouba um pouco de vida a cada ataque' },
  contraGolpe: { g: P, b: 'Contra-ataca forte e empurra quem o golpeia de perto' },
  sifao: { g: H, b: 'Enquanto vivo, todos os inimigos perdem ataque' },
  ressurreicao: { g: H, b: 'Traz de volta ao campo o último aliado derrotado' },
} as Record<AbilityId, { g: AbilityGroup; b: string }>;
export const groupOf = (id: string): AbilityGroup => ABILITY_INFO[id as AbilityId]?.g ?? 'hibrido';
export const blurbOf = (id: string): string => ABILITY_INFO[id as AbilityId]?.b ?? '';
