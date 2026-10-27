/**
 * v0.28.8 — Gera as fichas das 120 cartas (CARTAS.md e docs/cartas.json).
 * Rodar: npx vite-node scripts/cartas/gerar.ts
 *
 * As cartas novas são só o PROJETO (ainda não entram no jogo): nome, tipo, grupo, raridade, alcance, espera,
 * habilidades e ataque/vida em cada degrau. Os números de ataque e vida saem da fórmula real do jogo (statsFor).
 * Os 20 personagens que já existem contam para as 20 cartas de cada tipo (a Cria Sombria é só uma invocação).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { CATEGORY_INFO, CHARACTERS, RACE_INFO } from '../../src/core/characters';
import { ABILITIES } from '../../src/core/abilities';
import { TIER_NAMES, statsFor } from '../../src/core/progression';
import type { Category, CharacterDef, Race } from '../../src/core/types';

type Forca = 'simples' | 'media' | 'forte';
interface Hab {
  id: string;
  nome: string;
  icone: string;
  texto: string;
  forca: Forca;
  origem: 'jogo' | 'nova' | 'sugerida';
  nota?: string;
}

/** Força das habilidades que já existem: as fortes só podem estar em 1 personagem. */
const FORCA_JOGO: Record<string, Forca> = {
  diagFrente: 'simples', diagTras: 'simples', guarda: 'simples', salto: 'forte', longoAlcance: 'simples', flechaDupla: 'media',
  perfurante: 'media', retaguarda: 'simples', menorVida: 'media', prole: 'forte', contraGolpe: 'forte', sifao: 'forte', lotus: 'forte',
  inabalavel: 'simples', disparoSombrio: 'simples', espinhos: 'simples', sopro: 'simples', tambor: 'media', brasa: 'media', mare: 'simples',
  precisao: 'simples', olhoAguia: 'simples', cacaMagos: 'simples', surpresa: 'media', vigia: 'media', renascer: 'forte', anjo: 'forte',
  reflexo: 'forte', ombrada: 'simples', necromancia: 'forte', barreira: 'simples',
};

/** As 31 habilidades pedidas (as repetidas usam a do jogo) + as sugeridas. */
const NOVAS: Hab[] = [
  { id: 'vampirismo', nome: 'Vampirismo', icone: '🧛', forca: 'simples', origem: 'nova', texto: 'Cura a si mesmo em 25% do dano que causa (30% no Raro, 35% no Lendário).' },
  { id: 'veneno', nome: 'Veneno', icone: '🧪', forca: 'simples', origem: 'nova', texto: 'O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.', nota: 'Hoje o veneno existe só no feitiço Flecha Envenenada; aqui vira habilidade de personagem.' },
  { id: 'protetor', nome: 'Protetor', icone: '🛡️', forca: 'media', origem: 'nova', texto: 'Recebe no lugar dos aliados vizinhos 30% do dano que eles sofreriam (40% a partir do Épico). É sempre um personagem de muita vida e pouco ataque.' },
  { id: 'dominio', nome: 'Domínio Enfraquecedor', icone: '🌀', forca: 'forte', origem: 'nova', texto: 'Ao entrar em campo, todos os inimigos perdem 1 de ataque enquanto ele estiver vivo (soma com o Sifão de Energia até o teto de −2). Cada ataque dele tira mais 1 de ataque do alvo (até −3 por alvo; ataque mínimo 1). Ataca de longe.', nota: 'Pedido como carta Lendária. A parte da aura lembra o Sifão de Energia da Nyx-07; o enfraquecimento a cada golpe é novo.' },
  { id: 'congelar', nome: 'Congelamento', icone: '❄️', forca: 'media', origem: 'nova', texto: 'Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.' },
  { id: 'queimadura', nome: 'Queimadura', icone: '🔥', forca: 'simples', origem: 'nova', texto: 'O alvo pega fogo: sofre 1 de dano mágico no fim de cada turno por 2 turnos (3 turnos a partir do Épico). Acumula até 2 queimaduras.', nota: 'Diferença do Veneno: o fogo é dano mágico e acumula.' },
  { id: 'evasao', nome: 'Evasão', icone: '💨', forca: 'forte', origem: 'nova', texto: 'Desvia de TODOS os ataques à distância (longo alcance, flechas e feitiços de 1 alvo). Se estiver congelado, atordoado ou lento, é atingido normalmente.' },
  { id: 'atordoar', nome: 'Atordoamento', icone: '💫', forca: 'media', origem: 'nova', texto: 'Ao acertar, 50% de chance de atordoar o alvo: no próximo turno ele não age (não anda, não ataca, não usa habilidade). Não atordoa o mesmo alvo duas vezes seguidas.', nota: 'Diferença do Congelamento: congelado ainda anda; atordoado fica parado.' },
  { id: 'sangramento', nome: 'Sangramento', icone: '🩸', forca: 'simples', origem: 'nova', texto: 'Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.', nota: 'Diferença do Veneno: é físico e piora quando o alvo se move.' },
  { id: 'sedeEterna', nome: 'Sede Eterna', icone: '🧛', forca: 'forte', origem: 'nova', texto: 'Cada ataque tira 2 de vida EXTRA do alvo (3 no Mítico++) e cura ele mesmo nessa quantidade. Ao derrotar um inimigo, passa a "Marca da Sede" para o aliado mais próximo: esse aliado também tira 1 de vida extra por ataque e se cura com ela, mas não passa a marca adiante.', nota: 'Vampirismo mítico pedido pelo jogador.' },
  { id: 'copiador', nome: 'Copiador', icone: '🪞', forca: 'forte', origem: 'nova', texto: 'No primeiro ataque, copia a primeira habilidade do inimigo atingido e fica com ela até o fim da partida (não copia habilidades únicas de cartas Míticas).' },
  { id: 'anular', nome: 'Selo do Vazio', icone: '🚫', forca: 'forte', origem: 'nova', texto: 'Cada golpe físico tira TODAS as habilidades do alvo até o fim da partida (ele vira uma unidade sem habilidades). Não afeta Comandantes. Personagem de ataque físico.' },
  { id: 'furia', nome: 'Fúria', icone: '📈', forca: 'simples', origem: 'nova', texto: 'Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.' },
  { id: 'vinganca', nome: 'Vingança', icone: '🕯️', forca: 'forte', origem: 'nova', texto: 'Ganha +1 de ataque a cada ALIADO derrotado, até +4. Ataca de longe.', nota: 'Pedido como carta Lendária de ataque de longe.' },
  { id: 'ressurreicao', nome: 'Ressurreição', icone: '✨', forca: 'forte', origem: 'nova', texto: 'Traz de volta ao campo, na casa livre mais próxima, um aliado derrotado com 50% da vida. Pode usar 1 vez a cada 10 rodadas (a primeira já na rodada 3).', nota: 'Diferente do Chamado da Necropolis (que devolve a carta para a mão) e do Renascer (que só vale para si).' },
  { id: 'couracaAdaptativa', nome: 'Couraça Adaptativa', icone: '🛡️', forca: 'forte', origem: 'nova', texto: 'Começa com resistência física 1. Cada golpe físico recebido cura 1 de vida e soma +1 de resistência física (até 3).' },
  { id: 'ultimaResistencia', nome: 'Vontade Inquebrável', icone: '⏳', forca: 'forte', origem: 'nova', texto: 'Na primeira vez que receberia um golpe fatal, fica com 1 de vida e imune a todo dano até o fim do turno inimigo.' },
  { id: 'retaliacao', nome: 'Protocolo de Retaliação', icone: '⚖️', forca: 'forte', origem: 'nova', texto: 'Enquanto estiver em campo, quando o seu Comandante sofrer dano, o inimigo mais próximo dele sofre o mesmo dano (até 5 por vez).' },
  { id: 'explosao', nome: 'Explosão', icone: '💥', forca: 'simples', origem: 'nova', texto: 'Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.' },
  { id: 'provocar', nome: 'Provocar', icone: '🗯️', forca: 'simples', origem: 'nova', texto: 'Os inimigos vizinhos são obrigados a atacá-lo, se puderem.' },
  { id: 'critico', nome: 'Golpe Crítico', icone: '🎯', forca: 'simples', origem: 'nova', texto: '25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).' },
  { id: 'perfurar', nome: 'Perfurar', icone: '🗡️', forca: 'media', origem: 'nova', texto: 'O ataque ignora escudos e TODA a resistência do alvo.', nota: 'Diferente do Feixe Perfurante (que atravessa a fileira) e do Tiro Certeiro (que ignora só parte da resistência física).' },
  { id: 'raioCadeia', nome: 'Raio em Cadeia', icone: '⚡', forca: 'forte', origem: 'nova', texto: 'O ataque salta para até mais 2 inimigos vizinhos do alvo, com 60% e 30% do dano.' },
  { id: 'lentidao', nome: 'Lentidão', icone: '🐌', forca: 'simples', origem: 'nova', texto: 'O alvo fica lento por 2 turnos: anda só 1 casa e ataca só a cada 2 turnos.' },
  { id: 'gritoGuerra', nome: 'Grito de Guerra', icone: '📯', forca: 'media', origem: 'nova', texto: 'Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2).', nota: 'O Tambor de Guerra do Tobi ajuda os vizinhos; o Grito ajuda a fileira inteira.' },
  { id: 'teleporte', nome: 'Teleporte', icone: '🌀', forca: 'media', origem: 'nova', texto: 'Uma vez por partida, no início da ação, pula para a casa livre logo atrás do inimigo mais avançado da fileira e o ataca pelas costas (ou troca de lugar com um aliado ferido, se não houver inimigo).' },
  { id: 'clone', nome: 'Clone', icone: '👥', forca: 'forte', origem: 'nova', texto: 'Ao entrar em campo, cria uma cópia com metade da vida e do ataque na casa livre vizinha. A cópia não tem habilidades.' },
  { id: 'maldicao', nome: 'Maldição', icone: '🕯️', forca: 'media', origem: 'nova', texto: 'O alvo recebe +25% de dano de todas as fontes por 2 turnos.' },
  { id: 'purificar', nome: 'Purificar', icone: '🌿', forca: 'simples', origem: 'nova', texto: 'No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.' },
  // sugeridas (comuns nesse tipo de jogo)
  { id: 'ataqueCostas', nome: 'Golpe pelas Costas', icone: '🔙', forca: 'simples', origem: 'sugerida', texto: 'Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.' },
  { id: 'regeneracao', nome: 'Regeneração', icone: '💗', forca: 'simples', origem: 'sugerida', texto: 'No fim de cada turno, recupera 1 de vida (2 a partir do Épico).' },
  { id: 'investida', nome: 'Investida', icone: '🐎', forca: 'simples', origem: 'sugerida', texto: 'No turno em que entra em campo, já ataca se houver inimigo no alcance.' },
  { id: 'execucao', nome: 'Execução', icone: '☠️', forca: 'forte', origem: 'sugerida', texto: 'Derrota na hora o inimigo atingido (não o Comandante) se ele ficar com 25% da vida ou menos.' },
  { id: 'escudoInicial', nome: 'Escudo de Entrada', icone: '🔰', forca: 'simples', origem: 'sugerida', texto: 'Entra em campo com um escudo que absorve 3 de dano (5 a partir do Épico).' },
];

/** As 31 habilidades do pedido, na ordem, e qual id ficou para cada uma (repetidas apontam para a do jogo). */
const PEDIDO: [string, string, string?][] = [
  ['Vampirismo (tira parte no ataque e enche a vida)', 'vampirismo'],
  ['Espinho (devolve parte do dano físico)', 'espinhos', 'já existe: Couraça de Espinhos'],
  ['Veneno (dano por alguns turnos)', 'veneno', 'existia só em feitiço'],
  ['Cura (aliado em linha por turno)', 'sopro', 'já existe: Sopro Restaurador'],
  ['Protetor (absorve dano dos vizinhos)', 'protetor'],
  ['Lendária: inimigos perdem ataque + cada ataque tira 1, de longe', 'dominio'],
  ['Congelamento (50%, não ataca 1 turno)', 'congelar'],
  ['Queimadura (dano de fogo por turnos)', 'queimadura'],
  ['Evasão (desvia de ataques de longe)', 'evasao'],
  ['Atordoamento (50%, não age 1 turno)', 'atordoar'],
  ['Sangramento (dano por turnos)', 'sangramento'],
  ['Vampirismo mítico (passa para aliado ao matar)', 'sedeEterna'],
  ['Copiador', 'copiador'],
  ['Tira a habilidade do adversário (físico)', 'anular'],
  ['Ganha ataque a cada inimigo morto', 'furia'],
  ['Lendária de longe: ganha ataque a cada aliado morto', 'vinganca'],
  ['Ressuscita aliado (1× a cada 10 rodadas)', 'ressurreicao'],
  ['Escudo físico que cura e fica mais resistente', 'couracaAdaptativa'],
  ['Imune ao receber golpe fatal até o fim do turno inimigo', 'ultimaResistencia'],
  ['Inimigo sofre o mesmo dano do nosso Comandante', 'retaliacao'],
  ['Explosão ao morrer', 'explosao'],
  ['Provocar', 'provocar'],
  ['Golpe Crítico', 'critico'],
  ['Perfurar', 'perfurar'],
  ['Raio em Cadeia', 'raioCadeia'],
  ['Lentidão', 'lentidao'],
  ['Grito de Guerra', 'gritoGuerra', 'parecido com o Tambor de Guerra: vale para a fileira inteira'],
  ['Teleporte', 'teleporte'],
  ['Clone', 'clone'],
  ['Maldição', 'maldicao'],
  ['Purificar', 'purificar'],
];

interface Carta {
  id: string;
  nome: string;
  raca: Race;
  grupo: Category;
  dano: 'fisico' | 'magico';
  min: number;
  max: number;
  espera: number;
  atk: number;
  hp: number;
  habs: string[];
  lore: string;
  aparencia: string;
  existente?: boolean;
}

type T = [string, string, Race, Category, 'f' | 'm', number, number, number, number, number, string, string, string];
const R: Record<string, number> = { C: 1, I: 2, R: 3, E: 4, L: 5, M: 6 };
const t = (id: string, nome: string, raca: Race, grupo: Category, d: 'f' | 'm', ini: string, max: string, espera: number, atk: number, hp: number, habs: string, lore: string, ap: string): T =>
  [id, nome, raca, grupo, d, R[ini], R[max], espera, atk, hp, habs, lore, ap];

/** As 99 cartas novas. Ataque e vida aqui são os valores de base (escala Comum); a tabela mostra cada degrau. */
const NOVAS_CARTAS: T[] = [
  // ---------------- Humano (16) ----------------
  t('taro', 'Taro Escudo-de-Bambu', 'humano', 'tanque', 'f', 'C', 'E', 3, 2, 10, 'guarda,provocar', 'Lenhador da aldeia que aprendeu a parar golpes com um escudo de bambu trançado.', 'Jovem forte de quimono marrom, faixa verde, escudo redondo de bambu, pose firme agachado.'),
  t('akemi', 'Akemi Lança-Dupla', 'humano', 'dps', 'f', 'I', 'E', 3, 3, 6, 'diagFrente,sangramento', 'Lanceira do templo que corta em arco quem tenta passar pelos lados.', 'Mulher de rabo de cavalo alto, roupa vermelha e branca, lança de duas pontas girando.'),
  t('shin', 'Shin Passo-Fantasma', 'humano', 'assassino', 'f', 'I', 'E', 3, 4, 4, 'ataqueCostas,critico', 'Ninja silencioso que espera o inimigo passar para golpear pelas costas.', 'Ninja de roupa azul-escura, máscara cobrindo o rosto, duas kunai, pose de salto baixo.'),
  t('yuna', 'Yuna Mão-Curadora', 'humano', 'suporte', 'm', 'I', 'E', 3, 1, 6, 'longoAlcance,sopro,purificar', 'Curandeira de vila que dissolve venenos com chá de ervas e Ki.', 'Moça de túnica branca e verde-claro, cesto de ervas, mãos brilhando em verde.'),
  t('daisuke', 'Daisuke Arco-de-Ferro', 'humano', 'arqueiro', 'f', 'I', 'E', 3, 3, 5, 'longoAlcance,lentidao', 'Caçador das montanhas cujas flechas com peso de ferro deixam o alvo lento.', 'Homem barbado com capa de pele, arco longo de metal escuro, aljava nas costas.'),
  t('masao', 'Masao Leque-Cortante', 'humano', 'dps', 'f', 'R', 'L', 3, 3, 6, 'diagTras,critico', 'Dançarino de guerra que corta com leques de aço quem ficou para trás.', 'Homem elegante de roupa roxa com dourado, dois leques de aço abertos, pose de dança.'),
  t('sayuri', 'Sayuri Agulha-Venenosa', 'humano', 'assassino', 'f', 'R', 'L', 3, 4, 4, 'retaguarda,veneno', 'Espiã do palácio que acerta os inimigos mais recuados com agulhas envenenadas.', 'Mulher de quimono preto com flores lilás, agulhas entre os dedos, olhar frio.'),
  t('goro', 'Goro Martelo-Solar', 'humano', 'tanque', 'f', 'R', 'L', 4, 2, 11, 'ombrada,guarda', 'Ferreiro gigante que empurra inimigos com o próprio martelo.', 'Homem enorme de avental de couro, braços queimados de sol, martelo de forja dourado.'),
  t('emi', 'Emi Brisa-Arcana', 'humano', 'mago', 'm', 'R', 'L', 4, 3, 4, 'longoAlcance,maldicao', 'Estudante de pergaminhos proibidos que amaldiçoa com símbolos de vento.', 'Garota de óculos, uniforme escolar azul com capa, pergaminho flutuando, símbolos roxos no ar.'),
  t('ryuji', 'Ryuji Punho-de-Tempestade', 'humano', 'dps', 'f', 'E', 'M', 4, 3, 6, 'furia,critico', 'Lutador de torneio que fica mais forte a cada inimigo que cai.', 'Lutador musculoso de faixa na cabeça, luvas de pano rasgadas, raios azuis nos punhos.'),
  t('kaori', 'Kaori Vendaval-Sagrado', 'humano', 'suporte', 'm', 'E', 'M', 4, 2, 6, 'gritoGuerra,sopro', 'Sacerdotisa que toca o sino do templo e anima a fileira inteira.', 'Sacerdotisa de hakama vermelho e branco, sino dourado na mão, fitas voando.'),
  t('tetsuo', 'Tetsuo Muralha-Viva', 'humano', 'tanque', 'f', 'E', 'M', 4, 2, 12, 'protetor,provocar', 'Guarda-costas do imperador; ninguém fere quem está ao lado dele.', 'Samurai de armadura pesada azul-marinho, escudo retangular grande, postura de guarda.'),
  t('hayato', 'Mestre Hayato Céu-Partido', 'humano', 'dps', 'f', 'L', 'M', 5, 3, 7, 'atordoar,diagFrente', 'Velho mestre cujo golpe de palma faz o inimigo perder os sentidos.', 'Ancião de barba branca longa, roupa de monge laranja, palma aberta com onda de choque.'),
  t('rin', 'Rin Flecha-do-Amanhecer', 'humano', 'arqueiro', 'f', 'L', 'M', 5, 3, 5, 'longoAlcance,perfurar,critico', 'Arqueira lendária cujas flechas de luz atravessam qualquer armadura.', 'Arqueira de cabelo ruivo curto, armadura leve dourada, arco de luz alaranjada.'),
  t('kaito', 'Kaito Selo-do-Vazio', 'humano', 'dps', 'f', 'M', 'M', 6, 3, 5, 'anular,critico', 'Monge exilado que sela o poder dos inimigos com cada golpe do punho.', 'Monge de cabeça raspada, tatuagens de selos pretos nos braços, aura cinza e branca.'),
  t('aya', 'Aya Vontade-Inquebrável', 'humano', 'dps', 'f', 'M', 'M', 6, 3, 6, 'ultimaResistencia,investida', 'Heroína que já se levantou de golpes que derrubariam qualquer outro.', 'Guerreira de cabelo preto curto com bandana branca, roupa vermelha rasgada, punhos em chamas douradas.'),
  // ---------------- Extraterrestre (16) ----------------
  t('quorr', 'Quorr Casco-Estelar', 'extraterrestre', 'tanque', 'f', 'C', 'E', 3, 2, 10, 'guarda,regeneracao', 'Alienígena de carapaça que se regenera como coral.', 'Criatura de casco azul-acinzentado, olhos grandes amarelos, braços grossos como pinças.'),
  t('pip', 'Pip Faísca-Lunar', 'extraterrestre', 'suporte', 'm', 'C', 'E', 2, 1, 5, 'longoAlcance,purificar', 'Pequeno visitante da lua que limpa feitiços ruins com faíscas.', 'Alienígena pequeno e redondo, pele lilás, antenas com bolinhas brilhantes, sorriso.'),
  t('velka', 'Velka Garra-de-Cometa', 'extraterrestre', 'assassino', 'f', 'I', 'E', 3, 4, 4, 'ataqueCostas,sangramento', 'Caçadora que cai do céu atrás das linhas inimigas.', 'Felina alienígena de pelo prateado, garras de cristal, rastro de cometa nas costas.'),
  t('orun', 'Orun Arpão-Gélido', 'extraterrestre', 'arqueiro', 'f', 'I', 'E', 3, 3, 5, 'longoAlcance,congelar', 'Pescador de um planeta gelado que dispara arpões que congelam.', 'Alienígena de pele azul-clara, roupa de pele branca, arpão-besta com ponta de gelo.'),
  t('thessa', 'Thessa Espiral-Prateada', 'extraterrestre', 'dps', 'f', 'I', 'E', 3, 3, 6, 'diagTras,lentidao', 'Guerreira que gira e acerta quem tenta escapar por trás.', 'Mulher alienígena alta de pele prateada, cabelo em espiral, chicote de energia.'),
  t('kryx', 'Kryx Lâmina-Nebulosa', 'extraterrestre', 'dps', 'f', 'R', 'L', 3, 3, 6, 'diagFrente,critico', 'Mercenário de nebulosa com espada que corta em diagonal.', 'Alienígena de quatro braços, pele roxa, espada curva de plasma rosa.'),
  t('ilun', 'Ilun Olho-Cósmico', 'extraterrestre', 'mago', 'm', 'R', 'L', 4, 3, 4, 'longoAlcance,maldicao', 'Vidente de três olhos que marca os inimigos para a queda.', 'Alienígena magro de manto azul estrelado, três olhos brilhantes na testa, cajado com orbe.'),
  t('brakk', 'Brakk Couraça-de-Meteoro', 'extraterrestre', 'tanque', 'f', 'R', 'L', 4, 2, 11, 'espinhos,provocar', 'Colosso de rocha espacial coberto de espinhos de meteoro.', 'Criatura de pedra marrom com cristais vermelhos saindo dos ombros, punhos enormes.'),
  t('zynna', 'Zynna Portal-Errante', 'extraterrestre', 'assassino', 'f', 'E', 'M', 4, 4, 4, 'teleporte,critico', 'Ladra que abre portais e aparece atrás do alvo.', 'Alienígena ágil de pele verde-água, capuz curto, adagas e um portal roxo atrás dela.'),
  t('morv', 'Morv Coração-de-Gelo', 'extraterrestre', 'mago', 'm', 'E', 'M', 4, 3, 4, 'longoAlcance,congelar,barreira', 'Sábio de um cometa congelado que transforma o ar em gelo.', 'Alienígena idoso de barba de cristais de gelo, manto azul-escuro, mãos soltando neve.'),
  t('aurel', 'Aurel Farol-Celeste', 'extraterrestre', 'suporte', 'm', 'E', 'M', 4, 2, 6, 'longoAlcance,sopro,escudoInicial', 'Guardião de uma estação de luz que protege quem chega ao campo.', 'Ser de pele dourada com halo de luz, armadura branca leve, lanterna flutuante.'),
  t('vexar', 'Vexar Rei-das-Marés', 'extraterrestre', 'dps', 'f', 'L', 'M', 5, 3, 7, 'furia,sangramento,diagFrente', 'Soberano de um oceano alienígena que fica mais feroz a cada vitória.', 'Alienígena aquático de escamas azul-esverdeadas, coroa de coral, tridente.'),
  t('lunaris', 'Lunaris Arqueira-do-Vácuo', 'extraterrestre', 'arqueiro', 'f', 'L', 'M', 5, 3, 5, 'longoAlcance,olhoAguia,lentidao', 'Atiradora que acerta alvos a anos-luz de distância.', 'Alienígena esguia de pele azul-noite, visor prateado, arco feito de luz de estrelas.'),
  t('gorm', 'Gorm Titã-Orbital', 'extraterrestre', 'tanque', 'f', 'L', 'M', 5, 2, 12, 'protetor,inabalavel,regeneracao', 'Gigante que já foi uma lua; protege os aliados com o próprio corpo.', 'Titã de pele cinza-lunar cheia de crateras, anel de asteroides girando em volta.'),
  t('sylith', 'Sylith Tecelã-de-Luz', 'extraterrestre', 'suporte', 'm', 'L', 'M', 5, 2, 6, 'gritoGuerra,purificar,escudoInicial', 'Rainha de uma colmeia de luz que fortalece toda a fileira.', 'Alienígena com asas translúcidas de inseto, vestido de luz, coroa de antenas.'),
  t('nhyra', 'Nhyra Fantasma-Estelar', 'extraterrestre', 'assassino', 'f', 'M', 'M', 6, 4, 4, 'evasao,ataqueCostas', 'Assassina feita de poeira de estrelas: flechas e feitiços atravessam o corpo dela.', 'Figura translúcida azul e branca, corpo de poeira estelar, lâminas de luz, olhos sem pupila.'),
  // ---------------- Androide (17) ----------------
  t('bolt', 'Bolt-12 Rebite-Veloz', 'androide', 'dps', 'f', 'C', 'E', 2, 3, 6, 'critico', 'Robô de linha de montagem que aprendeu a lutar com rebites.', 'Robô baixo e amarelo-industrial, braço de rebitadeira, olho único verde.'),
  t('medi3', 'Medi-3 Faísca-Azul', 'androide', 'suporte', 'm', 'C', 'E', 2, 1, 5, 'longoAlcance,sopro', 'Drone médico que conserta aliados com raios de reparo.', 'Drone flutuante branco com cruz azul, braços finos de solda, luz azul.'),
  t('kraz9', 'Kraz-9 Serra-Dupla', 'androide', 'dps', 'f', 'I', 'E', 3, 3, 6, 'diagFrente,sangramento', 'Robô de demolição com duas serras circulares nos braços.', 'Robô vermelho e preto, serras circulares no lugar das mãos, faíscas.'),
  t('vex4', 'Vex-4 Caçador-Furtivo', 'androide', 'assassino', 'f', 'I', 'E', 3, 4, 4, 'retaguarda,lentidao', 'Unidade de infiltração que atira nos alvos mais recuados.', 'Androide magro preto-fosco, camuflagem ótica parcial, olho vermelho em fenda.'),
  t('cryo6', 'Cryo-6 Bobina-Gélida', 'androide', 'mago', 'm', 'I', 'E', 3, 3, 4, 'longoAlcance,congelar', 'Gerador de frio que dispara rajadas criogênicas.', 'Robô cilíndrico azul-gelo com bobinas nos ombros, vapor frio saindo.'),
  t('bastion2', 'Bastion-2 Placa-Pesada', 'androide', 'tanque', 'f', 'I', 'E', 3, 2, 10, 'guarda,explosao', 'Robô-escudo cujo reator explode quando ele cai.', 'Robô largo cinza com placas grossas, escudo de torre, reator laranja no peito.'),
  t('echo5', 'Echo-5 Mira-Laser', 'androide', 'arqueiro', 'f', 'R', 'L', 4, 3, 5, 'longoAlcance,perfurar', 'Atirador de precisão cujo laser ignora qualquer blindagem.', 'Androide esguio branco e azul, rifle laser longo, visor de mira no rosto.'),
  t('halo8', 'Halo-8 Reparadora', 'androide', 'suporte', 'm', 'R', 'L', 4, 2, 6, 'longoAlcance,purificar,regeneracao', 'Unidade de manutenção que limpa vírus e defeitos dos aliados.', 'Androide feminina com halo de luz verde-água na cabeça, kit de ferramentas flutuando.'),
  t('spike11', 'Spike-11 Punho-Pistão', 'androide', 'dps', 'f', 'R', 'L', 3, 3, 6, 'ombrada,critico', 'Lutador de arena com pistões nos braços que arremessam inimigos.', 'Robô atarracado laranja com pistões hidráulicos nos punhos, número 11 no peito.'),
  t('phase3', 'Phase-3 Salto-Quântico', 'androide', 'assassino', 'f', 'R', 'L', 4, 4, 4, 'teleporte,ataqueCostas', 'Protótipo que se desmonta em partículas e reaparece atrás do alvo.', 'Androide roxo-metálico com partes do corpo se desfazendo em pixels, lâminas nos antebraços.'),
  t('titanx', 'Titan-X Núcleo-de-Aço', 'androide', 'tanque', 'f', 'E', 'M', 4, 2, 12, 'provocar,inabalavel', 'Máquina de cerco que chama todos os golpes para si.', 'Robô gigante cinza-chumbo com alto-falantes no peito, pernas de esteira, punhos enormes.'),
  t('pulse7', 'Pulse-7 Tempestade-Elétrica', 'androide', 'mago', 'm', 'E', 'M', 4, 3, 4, 'longoAlcance,atordoar', 'Torre móvel que dá choques capazes de travar qualquer um.', 'Androide de bobinas de Tesla nas costas, raios amarelos, olhos brancos brilhantes.'),
  t('omega9', 'Omega-9 Domínio', 'androide', 'mago', 'm', 'L', 'M', 5, 2, 5, 'longoAlcance,dominio', 'Inteligência central que drena a força de todos os inimigos à vista.', 'Androide flutuante de manto metálico preto e dourado, anel de dados girando, olho central roxo.'),
  t('sentinel0', 'Sentinel-0 Guardião-Prime', 'androide', 'tanque', 'f', 'L', 'M', 5, 2, 12, 'protetor,escudoInicial,guarda', 'Primeiro guardião da fábrica: entra em campo já com o escudo ligado.', 'Robô cavaleiro branco e azul, escudo de energia hexagonal, capa curta.'),
  t('razorv', 'Razor-V Lâmina-Fantasma', 'androide', 'dps', 'f', 'L', 'M', 5, 3, 6, 'diagTras,sangramento,critico', 'Androide samurai que corta quem tenta escapar pelas diagonais.', 'Androide samurai preto e vermelho, katana de plasma, cachecol digital voando.'),
  t('mimic', 'Mímesis Copiadora', 'androide', 'dps', 'f', 'M', 'M', 6, 3, 5, 'copiador,investida', 'Androide de metal líquido que imita a técnica de quem toca.', 'Androide de metal líquido prateado espelhado, rosto sem traços, braço mudando de forma.'),
  t('aegis', 'Aegis-Ω Protocolo-Final', 'androide', 'tanque', 'f', 'M', 'M', 6, 2, 9, 'retaliacao,guarda', 'Guardião do Comandante: quem fere o líder recebe o mesmo golpe de volta.', 'Robô dourado e branco com símbolo Ω no peito, escudo de balança, olhos azuis.'),
  // ---------------- Mago Arcano (16) ----------------
  t('fen', 'Fen Aprendiz-das-Brasas', 'mago', 'mago', 'm', 'C', 'E', 2, 3, 4, 'longoAlcance,queimadura', 'Aprendiz desastrado que ainda queima tudo o que acerta.', 'Garoto de chapéu de mago grande demais, manto vermelho chamuscado, chama na mão.'),
  t('bram', 'Bram Guardião-do-Tomo', 'mago', 'tanque', 'f', 'C', 'E', 3, 2, 9, 'barreira,provocar', 'Bibliotecário robusto que usa um livro gigante como escudo.', 'Homem barrigudo de óculos, túnica marrom, livro enorme com tranca de ferro.'),
  t('isel', 'Isel Bruma-Cortante', 'mago', 'dps', 'm', 'I', 'E', 3, 3, 6, 'diagFrente,maldicao', 'Espadachim arcana com lâmina de névoa que amaldiçoa ao cortar.', 'Mulher de cabelo branco, roupa cinza-azulada, espada feita de névoa roxa.'),
  t('odo', 'Odo Sombra-de-Papel', 'mago', 'assassino', 'm', 'I', 'E', 3, 4, 4, 'retaguarda,lentidao', 'Ilusionista que vira papel e atinge os inimigos do fundo.', 'Figura magra de máscara de papel branca, roupa preta, tiras de papel encantado girando.'),
  t('celina', 'Celina Geada-Eterna', 'mago', 'mago', 'm', 'R', 'L', 4, 3, 4, 'longoAlcance,congelar', 'Feiticeira do norte que transforma o campo em gelo.', 'Mulher de vestido azul-gelo, cabelo azul longo, cajado de cristal de gelo.'),
  t('tiberius', 'Tiberius Runa-Viva', 'mago', 'suporte', 'm', 'R', 'L', 4, 2, 6, 'longoAlcance,purificar,escudoInicial', 'Escriba de runas que protege e limpa os aliados.', 'Velho de barba trançada, túnica verde com runas douradas, pena flutuante.'),
  t('nalia', 'Nalia Arco-Rúnico', 'mago', 'arqueiro', 'm', 'R', 'L', 4, 3, 5, 'longoAlcance,olhoAguia', 'Arqueira encantada cujas flechas mágicas acertam mais longe.', 'Elfa de capa verde-musgo, arco de madeira com runas azuis, flechas de luz.'),
  t('varo', 'Varo Golem-de-Cristal', 'mago', 'tanque', 'f', 'R', 'L', 4, 2, 11, 'barreira,explosao', 'Golem criado por magos; ao quebrar, espalha cacos afiados.', 'Golem de cristal rosa e lilás, núcleo brilhante no peito, rachaduras de luz.'),
  t('selene', 'Selene Lua-Arcana', 'mago', 'mago', 'm', 'E', 'M', 4, 3, 4, 'longoAlcance,queimadura,perfurar', 'Maga da lua cujo fogo prateado atravessa qualquer proteção.', 'Mulher de vestido azul-noite com estrelas, coroa de lua crescente, chamas prateadas.'),
  t('dorian', 'Dorian Pena-Encantada', 'mago', 'suporte', 'm', 'E', 'M', 4, 2, 6, 'longoAlcance,sopro,gritoGuerra', 'Bardo arcano cuja canção cura e inflama a fileira.', 'Bardo de chapéu com pena longa, roupa vinho, alaúde mágico com notas flutuando.'),
  t('kaela', 'Kaela Lâmina-Espectral', 'mago', 'assassino', 'm', 'E', 'M', 4, 4, 4, 'ataqueCostas,maldicao', 'Assassina feita de feitiço que surge atrás dos alvos amaldiçoados.', 'Mulher de capuz roxo, corpo meio transparente, adaga espectral verde.'),
  t('morgause', 'Morgause Espelho-Duplo', 'mago', 'mago', 'm', 'L', 'M', 5, 3, 4, 'longoAlcance,clone', 'Feiticeira dos espelhos que nunca luta sozinha: sempre traz o próprio reflexo.', 'Feiticeira de vestido preto e prata, espelho de mão, reflexo dela saindo do espelho.'),
  t('eldrin', 'Eldrin Arquimago-Solar', 'mago', 'mago', 'm', 'L', 'M', 5, 3, 4, 'longoAlcance,queimadura,critico', 'Arquimago do sol cujos raios às vezes caem com o dobro de força.', 'Velho alto de manto branco e dourado, cajado com sol na ponta, barba dourada.'),
  t('vesna', 'Vesna Senhora-do-Inverno', 'mago', 'suporte', 'm', 'L', 'M', 5, 2, 6, 'longoAlcance,congelar,lentidao', 'Rainha do inverno que deixa os inimigos lentos e gelados.', 'Rainha de manto branco com pele, coroa de gelo azul, cetro de floco de neve.'),
  t('corvin', 'Corvin Lâmina-das-Runas', 'mago', 'dps', 'm', 'L', 'M', 5, 3, 7, 'diagTras,furia,perfurar', 'Cavaleiro rúnico que corta pelas diagonais e cresce a cada inimigo caído.', 'Cavaleiro de armadura escura com runas azuis brilhando, espada larga rúnica, corvo no ombro.'),
  t('aethra', 'Aethra Tecelã-do-Trovão', 'mago', 'mago', 'm', 'M', 'M', 6, 3, 4, 'longoAlcance,raioCadeia', 'Deusa menor do trovão: um raio dela pula de inimigo em inimigo.', 'Mulher de cabelo branco esvoaçante, olhos elétricos, vestido azul-tempestade, raios nas mãos.'),
  // ---------------- Monstro (16) ----------------
  t('grub', 'Grub Presa-Lamacenta', 'monstro', 'dps', 'f', 'C', 'E', 2, 3, 6, 'sangramento', 'Fera do pântano de presas tortas que deixam feridas abertas.', 'Monstrinho verde-lama de presas grandes, olhos amarelos, garras sujas.'),
  t('skarr', 'Skarr Escorpião-de-Areia', 'monstro', 'assassino', 'f', 'I', 'E', 3, 4, 4, 'retaguarda,veneno', 'Escorpião gigante que alcança com o ferrão os inimigos do fundo.', 'Escorpião bege-areia do tamanho de um cavalo, ferrão roxo pingando veneno.'),
  t('bufo', 'Bufo Sapo-Ácido', 'monstro', 'mago', 'm', 'I', 'E', 3, 3, 5, 'longoAlcance,veneno', 'Sapo gordo que cospe ácido venenoso de longe.', 'Sapo enorme verde-limão com manchas roxas, bochechas inchadas, baba ácida.'),
  t('trokk', 'Trokk Chifre-Partido', 'monstro', 'dps', 'f', 'I', 'E', 3, 3, 7, 'diagFrente,ombrada', 'Minotauro jovem que derruba quem estiver na frente e nos lados.', 'Minotauro marrom com um chifre quebrado, machado curto, colete de couro.'),
  t('magra', "Mag'ra Colosso-de-Lava", 'monstro', 'tanque', 'f', 'R', 'L', 4, 2, 11, 'explosao,provocar', 'Gigante de rocha derretida que explode quando cai.', 'Colosso de pedra preta com rachaduras de lava laranja, vapor saindo.'),
  t('fenra', 'Fenra Loba-Uivante', 'monstro', 'suporte', 'f', 'R', 'L', 3, 2, 7, 'gritoGuerra,regeneracao', 'Loba alfa cujo uivo dá coragem a toda a matilha.', 'Loba cinza enorme com crina prateada, uivando para cima, marcas tribais azuis.'),
  t('spindra', 'Spindra Aranha-Tecelã', 'monstro', 'arqueiro', 'f', 'R', 'L', 4, 3, 5, 'longoAlcance,lentidao,veneno', 'Aranha gigante que atira teias venenosas de longe.', 'Aranha roxa e preta de oito olhos vermelhos, teias brilhantes, abdômen listrado.'),
  t('ghul', 'Ghul Devora-Ossos', 'monstro', 'dps', 'f', 'R', 'L', 3, 3, 7, 'vampirismo,furia', 'Carniceiro das cavernas que se cura mordendo.', 'Criatura curvada de pele cinza, boca enorme de dentes, ossos pendurados como enfeite.'),
  t('krag', 'Krag Javali-de-Guerra', 'monstro', 'dps', 'f', 'E', 'M', 4, 3, 7, 'investida,ombrada,critico', 'Javali blindado que já entra no campo atropelando.', 'Javali gigante marrom com armadura de placas, presas de metal, olhos em brasa.'),
  t('ysmera', 'Ysmera Serpente-Abissal', 'monstro', 'assassino', 'f', 'E', 'M', 4, 4, 5, 'ataqueCostas,veneno', 'Serpente que desliza por trás das linhas e morde com veneno.', 'Serpente verde-escura com escamas douradas, capuz de naja, olhos verdes brilhantes.'),
  t('borgo', 'Borgo Tronco-Antigo', 'monstro', 'tanque', 'f', 'E', 'M', 4, 2, 12, 'regeneracao,espinhos,provocar', 'Árvore viva de mil anos coberta de espinhos.', 'Ent de madeira escura com casca espinhosa, musgo nos ombros, olhos de seiva dourada.'),
  t('rhazor', 'Rhazor Rei-das-Feras', 'monstro', 'dps', 'f', 'L', 'M', 5, 3, 7, 'furia,sangramento,critico', 'Leão-rei que fica mais feroz a cada presa derrubada.', 'Leão humanoide de juba vermelha, garras douradas, cicatrizes, coroa de ossos.'),
  t('oculus', 'Oculus Olho-Medonho', 'monstro', 'mago', 'm', 'L', 'M', 5, 3, 5, 'longoAlcance,maldicao,lentidao', 'Olho flutuante que amaldiçoa e paralisa com o olhar.', 'Olho gigante flutuante com tentáculos, íris roxa, aura de névoa escura.'),
  t('grendar', 'Grendar Pai-da-Ninhada', 'monstro', 'tanque', 'f', 'L', 'M', 5, 2, 12, 'provocar,protetor,explosao', 'Monstro ancestral que protege os filhotes e explode ao cair.', 'Besta enorme de couro verde-oliva, ovos brilhando nas costas, braços como troncos.'),
  t('kolossus', 'Kolossus Couraça-Viva', 'monstro', 'tanque', 'f', 'M', 'M', 6, 2, 10, 'couracaAdaptativa,provocar', 'Titã cuja carapaça endurece a cada golpe que recebe.', 'Titã de carapaça de besouro preta e dourada, placas se fechando, olhos verdes.'),
  t('vharga', 'Vharga Ceifadora-Voraz', 'monstro', 'assassino', 'f', 'M', 'M', 6, 4, 4, 'execucao,menorVida', 'Fera alada que termina com qualquer inimigo ferido.', 'Criatura alada de pele vermelho-escura, foices no lugar dos braços, asas rasgadas.'),
  // ---------------- Necromante (18) ----------------
  t('ossian', 'Ossian Esqueleto-Lanceiro', 'necromante', 'dps', 'f', 'C', 'E', 2, 3, 5, 'diagFrente', 'Soldado esqueleto que ainda segue a formação de lança.', 'Esqueleto com elmo enferrujado, lança longa, escudo quebrado, olhos de fogo verde.'),
  t('mira', 'Mira Sussurro-Frio', 'necromante', 'suporte', 'm', 'C', 'E', 2, 1, 5, 'longoAlcance,lentidao', 'Fantasma de menina que sussurra e deixa os inimigos pesados.', 'Fantasma de menina pálida, vestido branco antigo, cabelo longo flutuando.'),
  t('grav', 'Grav Coveiro-Robusto', 'necromante', 'tanque', 'f', 'C', 'E', 3, 2, 10, 'guarda,explosao', 'Coveiro morto-vivo que carrega pólvora no casaco.', 'Morto-vivo grandão de casaco remendado, pá enorme, chapéu de coveiro.'),
  t('pira', 'Pira Vela-Fúnebre', 'necromante', 'mago', 'm', 'C', 'E', 2, 3, 4, 'longoAlcance,queimadura', 'Espírito de vela que acende fogo verde nos inimigos.', 'Espírito pequeno em forma de vela derretida, chama verde na cabeça, olhos ocos.'),
  t('lethe', 'Lethe Sombra-Rastejante', 'necromante', 'assassino', 'f', 'I', 'E', 3, 4, 4, 'ataqueCostas,sangramento', 'Sombra que passa pelo chão e corta por trás.', 'Silhueta preta com olhos brancos, garras longas, corpo saindo de uma poça de sombra.'),
  t('cador', 'Cador Arqueiro-Ossudo', 'necromante', 'arqueiro', 'f', 'I', 'E', 3, 3, 5, 'longoAlcance,veneno', 'Arqueiro esqueleto de flechas embebidas em peste.', 'Esqueleto com capuz verde rasgado, arco de osso, flechas com fumaça verde.'),
  t('brunna', 'Brunna Carniçal-Faminta', 'necromante', 'dps', 'f', 'I', 'E', 3, 3, 6, 'vampirismo', 'Carniçal que se cura a cada mordida.', 'Mulher morta-viva de pele azul-acinzentada, dentes afiados, roupas de camponesa rasgadas.'),
  t('wex', 'Wex Bruxo-do-Pântano', 'necromante', 'mago', 'm', 'I', 'E', 3, 3, 4, 'longoAlcance,maldicao', 'Bruxo que amaldiçoa com bonecos de palha.', 'Velho corcunda de manto verde-musgo, boneco de palha na mão, cajado torto.'),
  t('morrigan', 'Morrigan Lâmina-Cinzenta', 'necromante', 'dps', 'f', 'R', 'L', 3, 3, 6, 'diagTras,vampirismo', 'Cavaleira caída que bebe a vida de quem tenta fugir pela diagonal.', 'Cavaleira de armadura cinza rachada, espada que pinga sangue escuro, cabelo preto.'),
  t('thane', 'Thane Cavaleiro-Caído', 'necromante', 'tanque', 'f', 'R', 'L', 4, 2, 11, 'provocar,espinhos', 'Paladino amaldiçoado preso numa armadura cheia de espinhos.', 'Cavaleiro de armadura negra espinhosa, elmo fechado com brilho verde, escudo de caveira.'),
  t('ivra', 'Ivra Fiandeira-de-Almas', 'necromante', 'suporte', 'm', 'R', 'L', 4, 2, 6, 'longoAlcance,sopro,purificar', 'Fiandeira que costura almas e fecha feridas dos aliados.', 'Mulher pálida de vestido roxo, fios de alma brilhando entre os dedos, roca flutuante.'),
  t('sabbath', 'Sabbath Ceifador-Pálido', 'necromante', 'assassino', 'f', 'E', 'M', 4, 4, 4, 'retaguarda,critico,sangramento', 'Ceifador que colhe primeiro os inimigos mais recuados.', 'Figura encapuzada branca e preta, foice longa, máscara de osso.'),
  t('nocturna', 'Nocturna Bruxa-Pestilenta', 'necromante', 'mago', 'm', 'E', 'M', 4, 3, 4, 'longoAlcance,veneno,maldicao', 'Bruxa da peste que envenena e amaldiçoa de uma vez.', 'Bruxa de chapéu pontudo verde-escuro, caldeirão fumegante, corvos em volta.'),
  t('ghor', 'Ghor Abominação-Costurada', 'necromante', 'tanque', 'f', 'E', 'M', 4, 2, 12, 'explosao,regeneracao,provocar', 'Monstro costurado de muitos corpos que estoura ao cair.', 'Gigante costurado de pele de várias cores, pontos grossos, gancho na mão, barriga inchada.'),
  t('lamenta', 'Lamenta Viúva-Vingativa', 'necromante', 'mago', 'm', 'L', 'M', 5, 3, 4, 'longoAlcance,vinganca', 'Viúva espectral que fica mais forte a cada aliado que cai.', 'Fantasma de viúva com véu negro, lágrimas de luz roxa, buquê de flores mortas.'),
  t('drakon', 'Drakon Lorde-dos-Ossos', 'necromante', 'dps', 'f', 'L', 'M', 5, 3, 7, 'furia,vampirismo,diagFrente', 'Lorde esqueleto que se fortalece e se cura no meio da batalha.', 'Esqueleto alto de armadura de ossos de dragão, coroa, espada de osso enorme, olhos verdes.'),
  t('sanguis', 'Sanguis Sede-Eterna', 'necromante', 'dps', 'f', 'M', 'M', 6, 3, 5, 'sedeEterna', 'Vampiro primordial: quem bebe da batalha ao lado dele também sente a sede.', 'Vampiro nobre de capa vermelho-sangue, cabelo branco, olhos vermelhos, garras longas.'),
  t('elegia', 'Elegia Arauta-do-Retorno', 'necromante', 'suporte', 'm', 'M', 'M', 6, 2, 5, 'longoAlcance,ressurreicao', 'Arauta que canta para os mortos e os traz de volta ao campo.', 'Mulher de vestido branco e preto, sino de prata, asas de corvo, aura de almas subindo.'),
];

// ---------------- montagem ----------------
const HABS: Record<string, Hab> = {};
for (const [id, a] of Object.entries(ABILITIES)) {
  const def = a as { name: string; description: string; icon: string };
  HABS[id] = { id, nome: def.name, icone: def.icon, texto: def.description, forca: FORCA_JOGO[id] ?? 'simples', origem: 'jogo' };
}
for (const h of NOVAS) HABS[h.id] = h;

const existentes: Carta[] = CHARACTERS.filter((c) => c.id !== 'cria').map((c) => ({
  id: c.id, nome: c.name, raca: c.race, grupo: c.category, dano: c.damageType, min: c.minStars, max: c.maxStars, espera: c.cost,
  atk: c.atk, hp: c.hp, habs: [...c.abilities], lore: c.lore, aparencia: 'Já tem arte no jogo.', existente: true,
}));
const novas: Carta[] = NOVAS_CARTAS.map(([id, nome, raca, grupo, d, min, max, espera, atk, hp, habs, lore, aparencia]) => ({
  id, nome, raca, grupo, dano: d === 'f' ? 'fisico' : 'magico', min, max, espera, atk, hp, habs: habs.split(','), lore, aparencia,
}));
const todas = [...existentes, ...novas];

// ---------------- conferências ----------------
const erro = (m: string) => { throw new Error(m); };
const ids = new Set<string>();
for (const c of todas) {
  if (ids.has(c.id)) erro(`id repetido: ${c.id}`);
  ids.add(c.id);
  for (const h of c.habs) if (!HABS[h]) erro(`${c.id}: habilidade desconhecida ${h}`);
  if (c.min > c.max) erro(`${c.id}: raridade inicial maior que a máxima`);
}
const RACAS = Object.keys(RACE_INFO) as Race[];
const COSTAS = ['retaguarda', 'ataqueCostas', 'teleporte'];
const DIAG = ['diagFrente', 'diagTras'];
for (const r of RACAS) {
  const lista = todas.filter((c) => c.raca === r);
  if (lista.length !== 20) erro(`${r}: ${lista.length} cartas (precisa de 20)`);
  const mit = lista.filter((c) => c.min === 6).length;
  const len = lista.filter((c) => c.min === 5).length;
  if (mit < 1 || mit > 2) erro(`${r}: ${mit} Míticos`);
  if (len < 3 || len > 4) erro(`${r}: ${len} Lendários`);
  if (!lista.some((c) => c.habs.some((h) => COSTAS.includes(h)))) erro(`${r}: ninguém ataca pelas costas`);
  if (!lista.some((c) => c.habs.some((h) => DIAG.includes(h)))) erro(`${r}: ninguém ataca na diagonal`);
}
const usos: Record<string, string[]> = {};
for (const c of todas) for (const h of c.habs) (usos[h] ??= []).push(c.id);
// a Cria Sombria (invocação) também tem Prole Sombria: não conta como outro personagem
for (const [h, quem] of Object.entries(usos)) if (HABS[h].forca === 'forte' && quem.length > 1) erro(`habilidade forte repetida: ${h} em ${quem.join(', ')}`);
for (const h of NOVAS) if (!usos[h.id]) erro(`habilidade sem carta: ${h.id}`);

// ---------------- texto ----------------
const RAR = (s: number) => TIER_NAMES[s];
/** nome curto (primeira palavra; "Mestre Hayato" → Hayato) */
const curto = (n: string) => (n.startsWith('Mestre ') ? n.split(' ')[1] : n.split(' ')[0]);
const nomeHab = (id: string) => `${HABS[id].icone} ${HABS[id].nome}`;
function padrao(c: Carta): string {
  const p: string[] = [];
  const h = c.habs;
  if (h.includes('longoAlcance')) p.push('🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira');
  else if (h.includes('disparoSombrio')) p.push('🎯 Longe: até 2 casas à frente na fileira');
  else p.push('👊 Frente: corpo a corpo, o inimigo logo à frente');
  if (h.includes('diagFrente')) p.push('↗ Diagonal: também corta a diagonal à frente');
  if (h.includes('diagTras')) p.push('↘ Diagonal: prioriza a diagonal logo atrás');
  if (h.includes('retaguarda')) p.push('🔙 Costas: o inimigo mais recuado até 2 casas');
  if (h.includes('ataqueCostas')) p.push('🔙 Costas: quem já passou por ele na fileira');
  if (h.includes('teleporte')) p.push('🌀 Costas: 1× por partida aparece atrás do inimigo mais avançado');
  if (h.includes('menorVida')) p.push('🩸 Escolhe o inimigo com menos vida até 2 casas');
  if (h.includes('cacaMagos')) p.push('🎯 Prioriza unidades de longo alcance até 2 casas');
  if (h.includes('surpresa')) p.push('🎯 Mira o inimigo de maior ataque até 2 casas');
  if (h.includes('salto')) p.push('🦘 Salta 3 casas e ataca ao cair');
  if (h.includes('perfurante')) p.push('➡ Atravessa a fileira');
  if (h.includes('raioCadeia')) p.push('⚡ O raio salta para até 2 vizinhos');
  return p.join(' · ');
}
const tag = (c: Carta) => (c.existente ? ' *(já no jogo)*' : '');
function tabela(c: Carta): string {
  const def = { atk: c.atk, hp: c.hp } as CharacterDef;
  const linhas = ['| Raridade | Base | + | ++ |', '|---|---|---|---|'];
  for (let s = c.min; s <= c.max; s++) {
    const cel = [0, 1, 2].map((st) => { const v = statsFor(def, s, st); return `⚔ ${v.atk} · ❤ ${v.hp}`; });
    linhas.push(`| ${RAR(s)} | ${cel.join(' | ')} |`);
  }
  return linhas.join('\n');
}
function ficha(c: Carta): string {
  const g = CATEGORY_INFO[c.grupo];
  const ini = statsFor({ atk: c.atk, hp: c.hp } as CharacterDef, c.min, 0);
  return [
    `#### ${c.nome}${tag(c)}`,
    `- **Grupo:** ${g.icon} ${g.label} · **Raridade:** ${RAR(c.min)} → até ${RAR(c.max)}++ · **Dano:** ${c.dano === 'fisico' ? 'físico' : 'mágico'} · **Espera:** ${c.espera} rodada(s) na mão`,
    `- **Ataque:** ${padrao(c)}`,
    `- **Ao chegar (${RAR(c.min)}):** ⚔ ${ini.atk} de ataque · ❤ ${ini.hp} de vida`,
    `- **Habilidades:**`,
    ...c.habs.map((h) => `  - ${nomeHab(h)}${HABS[h].forca === 'forte' ? ' *(única)*' : ''}: ${HABS[h].texto}`),
    `- **História:** ${c.lore}`,
    `- **Aparência:** ${c.aparencia}`,
    '',
    '<details><summary>Ataque e vida em cada degrau</summary>',
    '',
    tabela(c),
    '',
    '</details>',
    '',
  ].join('\n');
}

const md: string[] = [];
md.push('# Cartas do Ki-Clash: Dragon Legacy — projeto das 120 cartas');
md.push('');
md.push('> **Ainda não estão no jogo.** Este arquivo é o projeto das cartas: 6 tipos × 20 cartas = **120**. Os 20 personagens que já existem contam (marcados *já no jogo*; a Cria Sombria é só uma invocação e não conta). As outras **99** são novas.');
md.push('> Serve para outra IA desenhar a aparência de cada personagem (carta e batalha). Depois as artes voltam e as cartas entram no jogo.');
md.push('> Ataque e vida saem da fórmula real do jogo: base × 1,17 a cada degrau (Comum, Comum+, Comum++, Incomum…). O arquivo é gerado por `scripts/cartas/gerar.ts`; a versão para programas está em `docs/cartas.json`.');
md.push('');
md.push('## Resumo por tipo');
md.push('');
md.push('| Tipo | Total | Novas | Comum | Incomum | Raro | Épico | Lendário | Mítico | Ataca pelas costas | Ataca na diagonal |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of RACAS) {
  const l = todas.filter((c) => c.raca === r);
  const n = (s: number) => l.filter((c) => c.min === s).length;
  const costas = l.filter((c) => c.habs.some((h) => COSTAS.includes(h))).map((c) => curto(c.nome)).join(', ');
  const diag = l.filter((c) => c.habs.some((h) => DIAG.includes(h))).map((c) => curto(c.nome)).join(', ');
  md.push(`| ${RACE_INFO[r].icon} ${RACE_INFO[r].label} | ${l.length} | ${l.filter((c) => !c.existente).length} | ${n(1)} | ${n(2)} | ${n(3)} | ${n(4)} | ${n(5)} | ${n(6)} | ${costas} | ${diag} |`);
}
md.push('');
md.push('| Tipo | ' + (Object.keys(CATEGORY_INFO) as Category[]).map((k) => `${CATEGORY_INFO[k].icon} ${CATEGORY_INFO[k].label}`).join(' | ') + ' |');
md.push('|---|' + Object.keys(CATEGORY_INFO).map(() => '---').join('|') + '|');
for (const r of RACAS) {
  const l = todas.filter((c) => c.raca === r);
  md.push(`| ${RACE_INFO[r].icon} ${RACE_INFO[r].label} | ` + (Object.keys(CATEGORY_INFO) as Category[]).map((k) => l.filter((c) => c.grupo === k).length).join(' | ') + ' |');
}
md.push('');
md.push('**Como ler a raridade:** a carta começa na raridade de entrada e pode subir até a máxima (degraus base, + e ++ em cada uma). Cartas Míticas já começam no Mítico. Quanto mais forte a habilidade, menor a vida ou o ataque, para nenhuma carta ficar invencível.');
md.push('');
md.push('**Espera:** quantas rodadas a carta fica na mão antes de poder entrar em campo (Comum 2–3 · Incomum 3 · Raro 3–4 · Épico 4 · Lendário 5 · Mítico 6).');
md.push('');
for (const r of RACAS) {
  md.push(`## ${RACE_INFO[r].icon} ${RACE_INFO[r].label}`);
  md.push('');
  md.push(`> ${RACE_INFO[r].desc}`);
  md.push('');
  const l = todas.filter((c) => c.raca === r).sort((a, b) => a.min - b.min || Number(!a.existente) - Number(!b.existente) || a.nome.localeCompare(b.nome));
  md.push('| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |');
  md.push('|---|---|---|---|---|---|');
  for (const c of l) {
    const v = statsFor({ atk: c.atk, hp: c.hp } as CharacterDef, c.min, 0);
    md.push(`| ${c.nome}${c.existente ? ' *(já no jogo)*' : ''} | ${CATEGORY_INFO[c.grupo].icon} ${CATEGORY_INFO[c.grupo].label} | ${RAR(c.min)} | ${c.dano === 'fisico' ? 'físico' : 'mágico'} | ${v.atk} / ${v.hp} | ${c.habs.map(nomeHab).join(', ')} |`);
  }
  md.push('');
  md.push('### Fichas');
  md.push('');
  for (const c of l) md.push(ficha(c));
}
md.push('## Habilidades');
md.push('');
md.push('**Simples** podem aparecer em vários personagens · **média** em poucos · **forte** é **única** (só 1 personagem).');
md.push('');
md.push('### As 31 habilidades pedidas');
md.push('');
md.push('| # | Pedido | Ficou como | Observação |');
md.push('|---|---|---|---|');
PEDIDO.forEach(([p, id, obs], i) => md.push(`| ${i + 1} | ${p} | ${nomeHab(id)} | ${obs ?? (HABS[id].origem === 'jogo' ? 'já existe no jogo' : 'nova')} |`));
md.push('');
const linhaHab = (h: Hab) => `| ${h.icone} ${h.nome} | ${h.forca === 'forte' ? '**forte (única)**' : h.forca} | ${h.texto}${h.nota ? ` *${h.nota}*` : ''} | ${(usos[h.id] ?? []).map((id) => curto(todas.find((c) => c.id === id)!.nome)).join(', ') || '—'} |`;
for (const [titulo, origem] of [['Novas', 'nova'], ['Sugeridas (comuns nesse tipo de jogo)', 'sugerida'], ['Que já existem no jogo', 'jogo']] as const) {
  md.push(`### ${titulo}`);
  md.push('');
  md.push('| Habilidade | Força | O que faz | Quem tem |');
  md.push('|---|---|---|---|');
  for (const h of Object.values(HABS).filter((x) => x.origem === origem)) md.push(linhaHab(h));
  md.push('');
}

writeFileSync('CARTAS.md', md.join('\n'));
mkdirSync('docs', { recursive: true });
const json = {
  versao: '0.28.8',
  nota: 'Projeto das 120 cartas (ainda não estão no jogo). atk/hp = base na escala Comum; tabela = statsFor (base × 1,17^degrau).',
  habilidades: Object.values(HABS).map((h) => ({ ...h, usadaPor: usos[h.id] ?? [] })),
  cartas: todas.map((c) => ({
    ...c,
    padraoAtaque: padrao(c),
    status: Array.from({ length: c.max - c.min + 1 }, (_, i) => c.min + i).flatMap((s) => [0, 1, 2].map((st) => ({ raridade: RAR(s), degrau: st, ...statsFor({ atk: c.atk, hp: c.hp } as CharacterDef, s, st) }))),
  })),
};
writeFileSync('docs/cartas.json', JSON.stringify(json, null, 2) + '\n');
console.log(`ok: ${todas.length} cartas (${novas.length} novas), ${Object.keys(HABS).length} habilidades`);
