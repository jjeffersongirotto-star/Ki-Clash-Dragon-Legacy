/**
 * v0.38.0 — Comandantes sem cortes.
 *
 * Só vira Comandante adversário quem tem RECORTE LIMPO: corpo, arma e efeito inteiros (src/assets/cutouts/<id>.webp,
 * gerado por scripts/art/build_cutouts.py). As 120 artes foram conferidas uma a uma lado a lado com o recorte;
 * as que perdem um pedaço (efeito cortado pela metade, arma sem a lâmina, corpo escondido pelo cenário ou encostado
 * na borda da arte) ficam em COMMANDER_REJECTED, com o motivo, e nunca são Comandante.
 *
 * `h` = altura APARENTE em relação ao nosso bárbaro (1,0): tamanho real do personagem e pose (agachado, ajoelhado,
 * sentado ou flutuando fica mais baixo; nunca é esticado para encher a coluna). `flip` = espelhar para olhar para a
 * arena (personagem que na arte age para a direita).
 */
export interface CommanderLook {
  h: number;
  flip?: boolean;
}

export const COMMANDER_LOOK: Record<string, CommanderLook> = {
  gorath: { h: 1.12 }, // minotauro gigante, em pé
  daichi: { h: 1.1 }, // golem de pedra enorme, base aberta
  ghor: { h: 1.1 }, // zumbi gigante, em pé
  gorm: { h: 1.1 }, // golem de gelo gigante, braços abertos
  spike11: { h: 1.08 }, // robô de guerra enorme, base aberta
  krag: { h: 1.08 }, // ieti enorme, em pé com a lança
  thane: { h: 1.05 }, // cavaleiro sobre o cavalo esqueleto
  brakk: { h: 1.05 }, // homem-dragão grande, braços cruzados
  borgo: { h: 1.05 }, // brutamontes-rinoceronte em avanço
  vorax: { h: 1.0 }, // necromante alto, flutuando
  aegis: { h: 1.0 }, // guardião de armadura, braços cruzados
  grav: { h: 1.0 }, // cavaleiro esqueleto com o caixão
  bastion2: { h: 1.0, flip: true }, // robô grande atrás do escudo
  ryuji: { h: 0.95 }, // cavaleiro de armadura, em pé
  tiberius: { h: 0.95 }, // mago velho de armadura, em pé
  aurel: { h: 0.95 }, // anjo flutuando com as asas abertas
  ilun: { h: 0.92 }, // alienígena de túnica, flutuando
  dorian: { h: 0.92 }, // homem alto, em pé
  sentinel0: { h: 0.92, flip: true }, // androide voando com o canhão
  sabbath: { h: 0.92 }, // esqueleto de túnica, em pé
  goro: { h: 0.9 }, // monge grandão em avanço
  hayato: { h: 0.9 }, // mestre velho em base aberta
  vex4: { h: 0.9 }, // ciborgue grandão com o punho erguido
  tobi: { h: 0.9 }, // oni grande tocando tambor, em movimento
  toru: { h: 0.9 }, // androide grandão, base aberta
  corvin: { h: 0.9 }, // homem de capa, em pé
  aethra: { h: 0.9 }, // feiticeira flutuando sobre cristais
  rhazor: { h: 0.9 }, // raptor em salto
  pira: { h: 0.9 }, // mulher flutuando entre caveiras
  cador: { h: 0.9 }, // legionário esqueleto, em pé
  lethe: { h: 0.9 }, // barqueira em pé no barco
  lyra: { h: 0.88, flip: true }, // mulher em pé (o chapéu soma altura)
  daisuke: { h: 0.88 }, // lutador em base de luta
  halo8: { h: 0.88 }, // androide em pé, mãos juntas
  akemi: { h: 0.86 }, // samurai em base aberta com a lança
  taro: { h: 0.86, flip: true }, // lutador em base aberta com o escudo
  aiko: { h: 0.86, flip: true }, // mulher em pé atirando com o arco
  kryx: { h: 0.86, flip: true }, // soldado em base aberta mirando
  cryo6: { h: 0.86, flip: true }, // androide em pé com o canhão
  isel: { h: 0.86 }, // mulher de vestido, em pé
  spindra: { h: 0.85 }, // mulher-aranha
  yume: { h: 0.84 }, // mulher avançando com a foice
  kael: { h: 0.84 }, // jovem em pé
  sayuri: { h: 0.84 }, // mulher dançando com os leques
  nocturna: { h: 0.84, flip: true }, // vampira mirando com a besta
  kenji: { h: 0.82 }, // homem em base baixa de kung fu
  suri: { h: 0.82 }, // espírito flutuando
  aya: { h: 0.82, flip: true }, // mulher em salto com a espada
  zynna: { h: 0.82, flip: true }, // mulher dando um chute alto
  bolt: { h: 0.82 }, // androide correndo
  sora: { h: 0.8, flip: true }, // mulher em passo de dança
  kaito: { h: 0.8 }, // imperador flutuando, pernas dobradas
  pulse7: { h: 0.8, flip: true }, // mulher na prancha voadora mirando
  fenra: { h: 0.8 }, // lobo uivando nas patas de trás
  ivra: { h: 0.8 }, // rainha sentada no trono
  emi: { h: 0.78, flip: true }, // mulher em base baixa com o arco
  tetsuo: { h: 0.78, flip: true }, // lutador em salto socando
  bram: { h: 0.78 }, // anão atrás da bigorna
  ossian: { h: 0.78, flip: true }, // esqueleto agachado na gárgula mirando
  lamenta: { h: 0.78 }, // anjo ajoelhado rezando
  pip: { h: 0.76, flip: true }, // arqueiro em salto
  kaori: { h: 0.76 }, // mulher em salto com o nunchaku
  ysmera: { h: 0.75 }, // mulher-árvore sentada
  thessa: { h: 0.72, flip: true }, // mulher em avanço baixo com as lâminas
  phase3: { h: 0.72, flip: true }, // ninja agachado com a espada
  nhyra: { h: 0.72 }, // rainha sentada no trono de cristal
  sylith: { h: 0.7 }, // acrobata de cabeça para baixo atirando
  vesna: { h: 0.7, flip: true }, // arqueira ajoelhada mirando
  elegia: { h: 0.68 }, // mulher sentada tocando violoncelo
  nara: { h: 0.66, flip: true }, // mulher em avanço baixo
  jin: { h: 0.66 }, // ajoelhado mirando
  kuro: { h: 0.66 }, // agachado para o bote
  lunaris: { h: 0.66 }, // mulher sentada flutuando
  mira: { h: 0.66 }, // mulher ajoelhada
  mei: { h: 0.62 }, // sentada sobre a flor de lótus
  celina: { h: 0.62, flip: true }, // ajoelhada no livro mirando
  selene: { h: 0.62 }, // sentada na nuvem tocando harpa
  bufo: { h: 0.6 }, // sapo meditando sobre a folha
  grub: { h: 0.55 }, // besouro baixo
};

/** Artes que NÃO servem de Comandante (motivo da triagem da v0.38.0). */
export const COMMANDER_REJECTED: Record<string, string> = {
  riku: 'Ki dos punhos cortado (mãos somem)',
  hana: 'espirais de vento cortadas e arco tocando a borda',
  ren: 'leva um pedaço do telhado junto',
  shin: 'lâmina de raio cortada (sobra um pedaço solto)',
  yuna: 'fitas de energia cortadas pela metade',
  masao: 'espada de fogo cortada (fica só o cabo)',
  rin: 'redemoinho cortado e pedaço da rocha',
  quorr: 'escudo e braço cortados',
  orun: 'raio e lança cortados pela borda',
  velka: 'lâmina do machado cortada',
  zarek: 'buraco negro da mão cortado',
  morv: 'coluna cortada pela borda de baixo',
  vexar: 'espada e capa cortadas',
  medi3: 'drone flutuante separado do corpo',
  kraz9: 'lâminas de laser cortadas em pedaços',
  echo5: 'harpa cortada (fica sentada no vazio)',
  nyx: 'redemoinho da mão cortado pela metade',
  titanx: 'martelo cortado (mão vazia)',
  omega9: 'asas de fogo cortadas pela metade',
  razorv: 'anéis de energia cortados',
  mimic: 'tentáculos cortados pelas bordas de cima e da direita',
  fen: 'de cabeça para baixo, fitas cortadas',
  odo: 'corpo cortado pela mesa (falta o meio)',
  nalia: 'pedaço do reflexo do chão junto da perna',
  varo: 'redemoinho de areia cortado pela borda',
  kaela: 'asas de fogo cortadas, pedaço solto embaixo',
  eldrin: 'cajado sem a ponta',
  morgause: 'vestido cortado pelas bordas',
  skarr: 'asas cortadas pelas bordas',
  trokk: 'pernas escondidas na água (corpo pela metade)',
  ghul: 'corpo partido pelo tronco da árvore',
  magra: 'corpo de lava partido em pedaços',
  grendar: 'maça de gelo encostada na borda',
  oculus: 'raios dos olhos cortados pelas bordas',
  kolossus: 'onda cortada pela borda de baixo',
  vharga: 'asas e sopro de fogo cortados',
  brunna: 'rastro da foice cortado e capa na borda',
  wex: 'de cabeça para baixo, lâminas na borda',
  morrigan: 'a cabeça sumiu no recorte',
  drakon: 'torre cortada pela borda',
  sanguis: 'asas cortadas pelas bordas',
};

/** O personagem pode ser Comandante adversário (tem recorte limpo)? */
export const isCleanCommander = (id: string): boolean => id in COMMANDER_LOOK;
