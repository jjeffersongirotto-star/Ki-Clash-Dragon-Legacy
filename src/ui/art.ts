import type { CharacterDef, Side } from '../core/types';
import { sceneSVG } from './scenes';

/**
 * Retratos e sprites de batalha em estilo anime gerados proceduralmente em SVG.
 * Cada personagem possui anatomia da sua raça (Humano, Extraterrestre, Monstro,
 * Mago, Androide, Necromante), pose de ação com arma/Ki e evolução visual de Comum a Mítico.
 */
function hairPath(style: number): string {
  switch (style) {
    case 0: // espetado para cima (shonen clássico)
      return 'M20 46 L14 28 L26 33 L20 10 L35 25 L40 2 L48 21 L57 1 L61 21 L72 6 L69 27 L83 14 L75 35 L86 33 L79 48 L70 35 L30 35 Z';
    case 1: // longo e esvoaçante em mechas
      return 'M22 74 L15 44 L21 24 Q30 8 50 8 Q70 8 79 24 L85 44 L78 74 L71 44 L66 29 L55 34 L46 27 L38 34 L32 29 L29 44 Z';
    case 2: // penteado dinâmico para trás em pontas
      return 'M23 44 L18 28 Q24 12 44 10 L65 6 L90 12 L77 19 L92 25 L77 30 L86 40 L74 38 L72 31 L29 31 Z';
    case 3: // corte estilizado com franja afiada
      return 'M23 46 Q19 16 50 12 Q81 16 77 46 L72 31 L66 40 L61 29 L56 39 L50 27 L44 39 L39 29 L34 40 L28 31 Z';
    case 4: // crista demoníaca / chifres de energia
      return 'M28 35 L12 4 L35 25 L50 7 L65 25 L88 4 L72 35 L62 31 L38 31 Z';
    case 6: // coque duplo/alto com mechas longas
      return 'M25 62 L21 40 Q24 20 50 18 Q76 20 79 40 L75 62 L70 38 L60 29 L40 29 L30 38 Z M38 20 Q36 3 50 2 Q64 3 62 20 Z';
    case 7: // juba colossal selvagem
      return 'M14 60 L10 38 L19 41 L12 22 L27 29 L24 9 L39 23 L46 3 L54 21 L65 3 L67 25 L82 12 L77 31 L92 27 L83 44 L90 60 L76 46 L72 33 L28 33 L24 46 Z';
    default: // crista guerreira / moicano largo
      return 'M36 32 L38 7 L45 12 L50 1 L55 12 L62 7 L64 32 Z';
  }
}

/** Esferas estelares e linhas de velocidade estilo anime no fundo da carta */
function animeCardMotif(id: string, t: number, aura: string): string {
  const rays = Array.from({ length: 6 + t * 2 }, (_, i) => {
    const ang = (i * 360) / (6 + t * 2);
    return `<path d="M50 56 L${(50 + Math.cos((ang * Math.PI) / 180) * 75).toFixed(1)} ${(56 + Math.sin((ang * Math.PI) / 180) * 75).toFixed(1)} L${(50 + Math.cos(((ang + 4) * Math.PI) / 180) * 75).toFixed(1)} ${(56 + Math.sin(((ang + 4) * Math.PI) / 180) * 75).toFixed(1)} Z" fill="${aura}" opacity="${(0.06 + t * 0.02).toFixed(2)}"/>`;
  }).join('');
  const orbs = Array.from({ length: Math.min(4, t) }, (_, i) => {
    const ox = i % 2 === 0 ? 15 + i * 4 : 85 - i * 4;
    const oy = 18 + i * 16;
    return `<circle cx="${ox}" cy="${oy}" r="${4.2 + (i % 2)}" fill="${aura}" opacity="0.16" stroke="#fff" stroke-width="0.4" stroke-opacity="0.3"/><path d="M${ox} ${oy - 1.8} L${ox + 1.2} ${oy + 1.2} L${ox - 1.5} ${oy - 0.4} H${ox + 1.5} L${ox - 1.2} ${oy + 1.2} Z" fill="#ffd23f" opacity="0.35"/>`;
  }).join('');
  return `<g class="anime-motif" id="${id}-motif">${rays}${orbs}</g>`;
}

/** Traços anatômicos por raça/origem (orelhas, chifres, visores, presas, marcas) */
function raceTraitsSVG(def: CharacterDef, t: number): string {
  const p = def.palette;
  switch (def.race) {
    case 'extraterrestre':
      // Orelhas pontiagudas longas cósmicas + cristal astral na testa
      return `<path d="M30 48 L15 ${41 - t} L29 57 Z M70 48 L85 ${41 - t} L71 57 Z" fill="${p.skin}" stroke="rgba(0,0,0,.35)" stroke-width=".7"/>` +
        `<path d="M50 ${38 - Math.min(2, t * 0.3)} L52.5 43 L50 47.5 L47.5 43 Z" fill="${p.aura}" stroke="#fff" stroke-width=".5"/>`;
    case 'monstro':
      // Presas inferiores + chifres laterais robustos
      return `<path d="M28 50 L20 46 L29 58 Z M72 50 L80 46 L71 58 Z" fill="${p.skin}" stroke="#000" stroke-opacity=".35" stroke-width=".6"/>` +
        `<path d="M42 66 L44 61 L46 66 Z M54 66 L56 61 L58 66 Z" fill="#fff8e7" stroke="#2b1a10" stroke-width=".5"/>` +
        (t >= 2 ? `<path d="M29 36 Q18 ${24 - t * 1.5} 23 ${14 - t} Q30 25 35 35 Z M71 36 Q82 ${24 - t * 1.5} 77 ${14 - t} Q70 25 65 35 Z" fill="${p.secondary}" stroke="#1a120b" stroke-width=".7"/>` : '');
    case 'androide':
      // Linhas de chassi cibernético no rosto + auriculares mecânicos com LED
      return `<rect x="25" y="47" width="5" height="11" rx="2" fill="#343a40" stroke="${p.aura}" stroke-width=".7"/><rect x="70" y="47" width="5" height="11" rx="2" fill="#343a40" stroke="${p.aura}" stroke-width=".7"/>` +
        `<circle cx="27.5" cy="52.5" r="1.5" fill="${p.aura}"/><circle cx="72.5" cy="52.5" r="1.5" fill="${p.aura}"/>` +
        `<path d="M34 60 L39 63 V68 M66 60 L61 63 V68" fill="none" stroke="#495057" stroke-width=".7"/>`;
    case 'necromante':
      // Orelhas sombrias + marca abissal + orbes de alma flutuantes
      return `<path d="M30 49 L19 43 L29 57 Z M70 49 L81 43 L71 57 Z" fill="${p.skin}" stroke="#000" stroke-opacity=".4" stroke-width=".6"/>` +
        `<circle cx="${16 - t}" cy="${46 - t}" r="${2.2 + t * 0.4}" fill="${p.aura}" opacity=".75"/><circle cx="${84 + t}" cy="${46 - t}" r="${2.2 + t * 0.4}" fill="${p.aura}" opacity=".75"/>` +
        `<path d="M40 58 L40 63 M60 58 L60 63" stroke="${p.primary}" stroke-width=".9" opacity=".7"/>`;
    case 'mago':
      // Símbolo arcano luminoso na testa + brincos de mana
      return `<path d="M30 50 L26 52 L30 58 Z M70 50 L74 52 L70 58 Z" fill="${p.skin}"/>` +
        `<circle cx="27" cy="59" r="1.6" fill="${p.aura}"/><circle cx="73" cy="59" r="1.6" fill="${p.aura}"/>` +
        `<circle cx="50" cy="43" r="${1.8 + t * 0.25}" fill="none" stroke="${p.aura}" stroke-width=".7" opacity=".85"/>`;
    default: // humano
      return `<path d="M30 50 L26 52 L30 58 Z M70 50 L74 52 L70 58 Z" fill="${p.skin}"/>`;
  }
}

/**
 * Pose de ação, mãos, armas e efeitos de Ki em primeiro plano para cada personagem.
 * Evolui visivelmente a cada estrela (Comum → Mítico).
 */
function actionPoseSVG(def: CharacterDef, t: number, gid: string): string {
  const p = def.palette;
  const r = 6 + t * 1.4;
  switch (def.id) {
    case 'riku': // Punho Vendaval em investida (estilo Turtle Master)
      return `<g class="pose-fg">
        <circle cx="24" cy="78" r="${r + 3}" fill="${p.aura}" opacity=".35"/>
        <path d="M6 72 Q22 ${60 - t * 2} 38 74 Q24 ${92 + t * 2} 6 72 Z" fill="#fff" stroke="${p.aura}" stroke-width="1.5" opacity=".9"/>
        <circle cx="25" cy="78" r="${5.5 + t * 0.4}" fill="${p.skin}" stroke="#2b1a10" stroke-width=".8"/>
        <path d="M18 74 Q26 66 35 76 M14 82 Q25 90 36 80" fill="none" stroke="${p.aura}" stroke-width="${1.4 + t * 0.3}" stroke-linecap="round"/>
        ${t >= 3 ? `<path d="M72 68 Q88 58 94 74 Q84 88 70 78 Z" fill="${p.aura}" opacity=".75"/><circle cx="78" cy="74" r="5" fill="${p.skin}" stroke="#2b1a10" stroke-width=".7"/>` : ''}
      </g>`;
    case 'nara': // Espada Crescente Lunar cortando em arco diagonal
      return `<g class="pose-fg">
        <path d="M12 ${94 - t} Q48 ${64 - t * 2} 92 ${26 - t * 2} Q62 ${76 - t} 18 98 Z" fill="${p.aura}" opacity=".75"/>
        <path d="M16 ${92 - t} Q52 ${66 - t * 2} 88 ${30 - t * 2}" fill="none" stroke="#fff" stroke-width="${2.2 + t * 0.4}" stroke-linecap="round"/>
        <circle cx="24" cy="86" r="4.8" fill="${p.skin}" stroke="#1d2147" stroke-width=".7"/>
        <rect x="18" y="82" width="12" height="4" rx="1.5" transform="rotate(-35 24 84)" fill="${p.secondary}" stroke="#111" stroke-width=".6"/>
      </g>`;
    case 'toru': // Escudo cibernético hexagonal + lâminas reversas
      return `<g class="pose-fg">
        <polygon points="22,64 34,70 34,86 22,92 10,86 10,70" fill="${p.aura}" fill-opacity=".35" stroke="${p.secondary}" stroke-width="${1.4 + t * 0.25}"/>
        <path d="M88 62 L96 ${44 - t * 2} L80 74 Z" fill="#e9ecef" stroke="${p.aura}" stroke-width="1"/>
        ${t >= 2 ? `<path d="M30 60 L70 60 L68 68 L32 68 Z" fill="#2b2d42" stroke="${p.secondary}" stroke-width=".8"/>` : ''}
      </g>`;
    case 'aiko': // Arco celeste de fótons disparando flechas de luz
      return `<g class="pose-fg">
        <path d="M18 46 Q4 72 22 96" fill="none" stroke="${p.secondary}" stroke-width="${2.2 + t * 0.3}" stroke-linecap="round"/>
        <path d="M18 46 L34 72 L22 96" fill="none" stroke="${p.aura}" stroke-width=".9"/>
        <path d="M34 72 L4 ${66 - t}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <path d="M2 ${66 - t} L10 ${62 - t} L8 ${70 - t} Z" fill="${p.aura}"/>
        ${t >= 3 ? `<path d="M34 76 L6 ${74 - t}" stroke="${p.aura}" stroke-width="1.8" stroke-linecap="round"/>` : ''}
      </g>`;
    case 'lyra': // Cajado Olho-de-Falcão disparando feixe perfurante
      return `<g class="pose-fg">
        <path d="M82 98 L76 46" stroke="#f7d6ff" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="76" cy="44" r="${5 + t * 0.7}" fill="${p.aura}" stroke="#fff" stroke-width="1"/>
        <ellipse cx="76" cy="44" rx="2" ry="4" fill="#2b0938"/>
        <path d="M76 44 L8 ${26 - t * 2} L4 ${36 - t * 2} Z" fill="${p.aura}" opacity=".55"/>
      </g>`;
    case 'gorath': // Punhos colossais blindados de aço
      return `<g class="pose-fg">
        <rect x="8" y="72" width="${18 + t}" height="${18 + t}" rx="4" fill="url(#${gid}-metal)" stroke="#111" stroke-width="1"/>
        <rect x="${74 - t}" y="72" width="${18 + t}" height="${18 + t}" rx="4" fill="url(#${gid}-metal)" stroke="#111" stroke-width="1"/>
        <circle cx="17" cy="81" r="${3 + t * 0.5}" fill="${p.aura}"/><circle cx="83" cy="81" r="${3 + t * 0.5}" fill="${p.aura}"/>
      </g>`;
    case 'mei': // Flor de Lótus sagrada brilhando entre as mãos
      return `<g class="pose-fg">
        <circle cx="50" cy="84" r="${8 + t * 1.5}" fill="${p.aura}" opacity=".4"/>
        <path d="M50 ${72 - t} Q56 80 50 88 Q44 80 50 ${72 - t} Z" fill="#ff8fab" stroke="#fff" stroke-width=".6"/>
        <path d="M50 88 Q62 78 60 ${74 - t} Q52 78 50 88 Z M50 88 Q38 78 40 ${74 - t} Q48 78 50 88 Z" fill="#ffc2d4" stroke="#ff8fab" stroke-width=".5"/>
        <circle cx="50" cy="82" r="3" fill="#fff"/>
      </g>`;
    case 'yume': // Foice carmesim ceifadora atravessando a carta
      return `<g class="pose-fg">
        <path d="M14 98 L82 36" stroke="#2b2d42" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M82 36 Q46 ${18 - t * 2} 18 ${44 - t} Q50 ${34 - t} 76 44 Z" fill="${p.secondary}" stroke="#fff" stroke-width=".8"/>
        <path d="M18 ${44 - t} Q48 ${26 - t * 2} 84 36" fill="none" stroke="${p.aura}" stroke-width="1.6"/>
      </g>`;
    case 'zarek': // Visor scouter do Eclipse + lâminas duplas de antimatéria
      return `<g class="pose-fg">
        <rect x="31" y="50" width="17" height="9" rx="2" fill="${p.aura}" fill-opacity=".65" stroke="${p.secondary}" stroke-width="1"/>
        <path d="M34 54 H45 M39 51 V58" stroke="#fff" stroke-width=".6"/>
        <path d="M8 94 L32 ${68 - t} L24 96 Z M92 94 L68 ${68 - t} L76 96 Z" fill="${p.secondary}" stroke="#fff" stroke-width=".7"/>
      </g>`;
    case 'kenji': // Punhos Espelhados Duplos com dragões de Ki dourado
      return `<g class="pose-fg">
        <circle cx="20" cy="78" r="${7 + t * 0.8}" fill="${p.aura}" opacity=".75"/>
        <circle cx="80" cy="78" r="${7 + t * 0.8}" fill="${p.aura}" opacity=".75"/>
        <circle cx="20" cy="78" r="4.5" fill="#fff"/><circle cx="80" cy="78" r="4.5" fill="#fff"/>
        <path d="M12 88 Q20 62 34 74 M88 88 Q80 62 66 74" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    case 'nyx': // Canhão Sifão cibernético drenando vórtice neon
      return `<g class="pose-fg">
        <rect x="10" y="68" width="18" height="12" rx="4" fill="#212529" stroke="${p.aura}" stroke-width="1.2"/>
        <circle cx="19" cy="74" r="${4 + t * 0.6}" fill="${p.aura}"/>
        <circle cx="19" cy="74" r="2" fill="#fff"/>
        <path d="M8 64 Q19 ${54 - t} 30 64 M8 84 Q19 ${94 + t} 30 84" fill="none" stroke="#ff006e" stroke-width="1.3"/>
      </g>`;
    case 'vorax': // Garras necromânticas abissais e crânio de energia verde
      return `<g class="pose-fg">
        <circle cx="22" cy="76" r="${6 + t * 0.8}" fill="${p.aura}" opacity=".65"/>
        <circle cx="20" cy="75" r="1.4" fill="#1b1b1b"/><circle cx="24" cy="75" r="1.4" fill="#1b1b1b"/>
        <path d="M12 86 L18 70 L22 84 L26 70 L30 86" fill="none" stroke="${p.aura}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M72 86 L76 70 L80 84 L84 70 L88 86" fill="none" stroke="#ff0054" stroke-width="1.6" stroke-linecap="round"/>
      </g>`;
    case 'daichi': // Manoplas de rocha viva com espinhos e magma
      return `<g class="pose-fg">
        <polygon points="8,88 14,68 24,64 30,78 24,94" fill="#7f5539" stroke="#2b1a10" stroke-width="1"/>
        <polygon points="92,88 86,68 76,64 70,78 76,94" fill="#7f5539" stroke="#2b1a10" stroke-width="1"/>
        <path d="M14 68 L10 ${58 - t} L20 66 Z M86 68 L90 ${58 - t} L80 66 Z" fill="${p.aura}" stroke="#2b1a10" stroke-width=".6"/>
      </g>`;
    case 'sora': // Leque de jade do vento curativo
      return `<g class="pose-fg">
        <path d="M14 82 Q16 60 36 66 L24 88 Z" fill="${p.secondary}" stroke="#fff" stroke-width="1"/>
        <path d="M10 74 Q36 ${58 - t * 2} 66 72" fill="none" stroke="${p.aura}" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    case 'tobi': // Tambores de guerra trovão flutuantes
      return `<g class="pose-fg">
        <circle cx="16" cy="48" r="${7 + t * 0.5}" fill="#9d0208" stroke="${p.secondary}" stroke-width="1.4"/>
        <circle cx="84" cy="48" r="${7 + t * 0.5}" fill="#9d0208" stroke="${p.secondary}" stroke-width="1.4"/>
        <circle cx="16" cy="48" r="3" fill="${p.secondary}"/><circle cx="84" cy="48" r="3" fill="${p.secondary}"/>
      </g>`;
    case 'kael': // Esferas duplas de fogo vulcânico
      return `<g class="pose-fg">
        <circle cx="18" cy="76" r="${6 + t}" fill="${p.aura}" opacity=".85"/>
        <circle cx="18" cy="76" r="${3 + t * 0.5}" fill="#ffba08"/>
        <circle cx="82" cy="76" r="${6 + t}" fill="${p.aura}" opacity=".85"/>
        <circle cx="82" cy="76" r="${3 + t * 0.5}" fill="#ffba08"/>
      </g>`;
    case 'suri': // Lanças de gelo e vórtice da maré
      return `<g class="pose-fg">
        <polygon points="16,58 22,74 16,90 10,74" fill="#caf0f8" stroke="#00b4d8" stroke-width=".8"/>
        <polygon points="84,58 90,74 84,90 78,74" fill="#caf0f8" stroke="#00b4d8" stroke-width=".8"/>
        <path d="M12 88 Q50 ${72 - t * 2} 88 88" fill="none" stroke="#90e0ef" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    case 'hana': // Arco florestal com flecha de vento esmeralda
      return `<g class="pose-fg">
        <path d="M80 48 Q94 72 78 94" fill="none" stroke="#bc6c25" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M66 72 L94 ${66 - t}" stroke="${p.aura}" stroke-width="2" stroke-linecap="round"/>
        <polygon points="96,${66 - t} 88,${62 - t} 90,${70 - t}" fill="#fff"/>
      </g>`;
    case 'jin': // Canhão-arco eletromagnético de trovão
      return `<g class="pose-fg">
        <path d="M16 52 L8 72 L16 92" fill="none" stroke="${p.secondary}" stroke-width="2.4"/>
        <circle cx="16" cy="72" r="${4 + t * 0.6}" fill="${p.aura}"/>
        <path d="M16 72 L4 ${68 - t} M16 72 L4 ${76 + t}" stroke="#fff" stroke-width="1.5"/>
      </g>`;
    case 'ren': // Adagas shinobi gêmeas cortando em X
      return `<g class="pose-fg">
        <path d="M16 88 L42 ${66 - t} L36 92 Z" fill="#e9ecef" stroke="${p.aura}" stroke-width="1"/>
        <path d="M84 88 L58 ${66 - t} L64 92 Z" fill="#e9ecef" stroke="${p.aura}" stroke-width="1"/>
      </g>`;
    case 'kuro': // Garras Noturnas gigantes rasgando a frente
      return `<g class="pose-fg">
        <path d="M14 64 Q36 ${76 - t} 26 96 M22 60 Q44 ${72 - t} 34 94 M30 58 Q52 ${70 - t} 42 92" fill="none" stroke="${p.aura}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M14 64 Q36 ${76 - t} 26 96 M22 60 Q44 ${72 - t} 34 94" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round"/>
      </g>`;
    default: // cria
      return `<g class="pose-fg"><circle cx="50" cy="82" r="6" fill="${p.aura}" opacity=".7"/></g>`;
  }
}

/**
 * Marcas próprias dos personagens iniciais da v0.8 (desenhadas por cima do rosto/cabelo),
 * para cada um ter uma silhueta reconhecível mesmo em Comum.
 */
function signature(def: CharacterDef, t: number): string {
  const p = def.palette;
  switch (def.id) {
    case 'daichi': // faixa de pedra com chifre e cicatriz
      return `<path d="M27 41 Q50 35 73 41 L73 46 Q50 40 27 46 Z" fill="#7f5539" stroke="#2b1a10" stroke-width=".6"/><path d="M46 38 L50 ${t >= 3 ? 24 : 30} L54 38 Z" fill="#b08968" stroke="#2b1a10" stroke-width=".6"/><path d="M60 58 L65 66" stroke="#5c2a12" stroke-width="1.4"/>` +
        `<path d="M${16 - t} 86 L22 74 L28 84 Z M${84 + t} 86 L78 74 L72 84 Z" fill="#b08968" stroke="#2b1a10" stroke-width=".6"/>`;
    case 'sora': // presilha de folha e fitas ao vento
      return `<path d="M58 22 Q66 14 72 20 Q66 26 58 22 Z" fill="${p.secondary}"/><path d="M60 22 L70 19" stroke="#1b4332" stroke-width=".6"/>` +
        `<path d="M28 44 Q14 54 ${10 - t} 72" fill="none" stroke="${p.secondary}" stroke-width="2" stroke-linecap="round"/><path d="M72 44 Q86 54 ${90 + t} 72" fill="none" stroke="${p.secondary}" stroke-width="2" stroke-linecap="round"/>`;
    case 'tobi': // pintura de guerra e baquetas
      return `<path d="M33 60 L40 58 M33 63 L40 61 M67 60 L60 58 M67 63 L60 61" stroke="${p.secondary}" stroke-width="1.4" stroke-linecap="round"/>` +
        `<path d="M10 ${92 - t} L26 70" stroke="#6f1d1b" stroke-width="2.4" stroke-linecap="round"/><circle cx="26" cy="70" r="2.6" fill="${p.secondary}"/><path d="M90 ${92 - t} L74 70" stroke="#6f1d1b" stroke-width="2.4" stroke-linecap="round"/><circle cx="74" cy="70" r="2.6" fill="${p.secondary}"/>`;
    case 'kael': // marca de chama na testa e brasas
      return `<path d="M50 38 Q46 44 50 48 Q54 44 50 38 Z" fill="${p.aura}" stroke="#ffba08" stroke-width=".6"/>` +
        Array.from({ length: 2 + t }, (_, i) => `<circle cx="${12 + ((i * 41) % 76)}" cy="${20 + ((i * 23) % 44)}" r="${1 + (i % 2) * 0.6}" fill="#ffba08" opacity=".85"/>`).join('');
    case 'suri': // tiara de gelo
      return `<path d="M32 36 L36 ${28 - t} L40 35 L44 ${26 - t} L48 34 L50 ${22 - t} L52 34 L56 ${26 - t} L60 35 L64 ${28 - t} L68 36 Z" fill="#caf0f8" stroke="#0077b6" stroke-width=".6" opacity=".95"/><path d="M36 64 Q50 70 64 64" stroke="${p.aura}" stroke-width=".8" fill="none" opacity=".7"/>`;
    case 'hana': // pena no cabelo e pintura de caçadora
      return `<path d="M70 30 Q86 14 ${88 + t} 4 Q78 18 72 34 Z" fill="${p.aura}" stroke="#386641" stroke-width=".6"/><path d="M72 32 L86 8" stroke="#386641" stroke-width=".5"/><path d="M34 60 L40 60 M60 60 L66 60" stroke="#6a994e" stroke-width="1.6" stroke-linecap="round"/>`;
    case 'jin': // óculos de atirador e raio
      return `<rect x="31" y="38" width="16" height="7" rx="3" fill="#14213d" stroke="${p.secondary}" stroke-width="1"/><rect x="53" y="38" width="16" height="7" rx="3" fill="#14213d" stroke="${p.secondary}" stroke-width="1"/><path d="M47 41 H53" stroke="${p.secondary}" stroke-width="1.2"/><circle cx="39" cy="41.5" r="2" fill="${p.aura}" opacity=".8"/><circle cx="61" cy="41.5" r="2" fill="${p.aura}" opacity=".8"/>` +
        `<polyline points="${82 + t},10 76,22 81,23 74,36" fill="none" stroke="${p.aura}" stroke-width="1.6"/>`;
    case 'ren': // lenço cobrindo a boca
      return `<path d="M30 60 Q50 58 70 60 L68 70 Q50 74 32 70 Z" fill="${p.secondary}" opacity=".95"/><path d="M68 64 L84 ${70 + t} L80 62 Z" fill="${p.secondary}"/>`;
    case 'kuro': // orelhas de gato e cicatrizes de garra
      return `<path d="M28 34 L24 ${14 - t} L40 28 Z M72 34 L76 ${14 - t} L60 28 Z" fill="${p.hair}" stroke="${p.aura}" stroke-width="1"/><path d="M29 31 L27 ${20 - t} L36 29 Z M71 31 L73 ${20 - t} L64 29 Z" fill="${p.aura}" opacity=".7"/>` +
        `<path d="M58 58 L64 66 M61 57 L67 65" stroke="${p.aura}" stroke-width="1" opacity=".85"/>`;
    default:
      return '';
  }
}

/**
 * Evolução visual por estrela (Comum → Mítico), cumulativa:
 * Comum roupa simples, sem aura · Incomum aura fraca, faixa de batalha e acabamento · Raro ombreiras metálicas, manoplas, cabelo maior
 * Épico peitoral com gema, capa esvoaçante, olhos brilhando · Lendário coroa/diadema, ombreiras com espinhos dourados, cabelo
 * energizado, partículas · Mítico forma suprema: cabelo radiante, halo divino, raios e aura dupla.
 * `layer`: 'all' (padrão) desenha cenário + personagem; 'bg' só o cenário (fundo da carta);
 * 'fg' só o personagem com aura e pose de ação, fundo transparente (para "sair" da moldura da carta).
 */
export function portraitSVG(def: CharacterDef, opts: { flip?: boolean; className?: string; stars?: number; layer?: 'all' | 'bg' | 'fg' } = {}): string {
  const layer = opts.layer ?? 'all';
  const p = def.palette;
  const t = Math.max(1, Math.min(6, opts.stars ?? def.minStars));
  const id = `g-${def.id}-${t}`;
  const isAndroid = def.id === 'nyx';
  const isParasite = def.id === 'vorax' || def.id === 'cria';
  const bigBuild = def.id === 'gorath' || def.id === 'kenji' || def.id === 'vorax' || def.id === 'daichi';
  const shoulder = Math.max(-2, (bigBuild ? 4 : 14) - (t - 1) * 1.8);
  const gold = '#ffd23f';
  const metal = t >= 5 ? gold : '#c9d1d9';
  // aura
  const nFl = t >= 2 ? 4 + t : 0;
  const flames = Array.from({ length: nFl }, (_, i) => {
    const x = 4 + (i * 92) / Math.max(1, nFl - 1);
    const h = (18 + ((i * 37) % 22)) * (0.55 + t * 0.15);
    return `<path d="M${x - 7} 100 Q${x - 4} ${100 - h * 0.6} ${x} ${100 - h - 14} Q${x + 4} ${100 - h * 0.6} ${x + 7} 100 Z" fill="url(#${id}-fl)" opacity="${(0.3 + t * 0.1).toFixed(2)}"/>`;
  }).join('');
  const outerAura = t >= 6 ? `<ellipse cx="50" cy="58" rx="49" ry="46" fill="none" stroke="${p.aura}" stroke-width="3" opacity=".55"/><ellipse cx="50" cy="58" rx="44" ry="41" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>` : '';
  const halo = t >= 6 ? `<circle cx="50" cy="40" r="30" fill="none" stroke="${gold}" stroke-width="2.5" opacity=".9"/><circle cx="50" cy="40" r="33" fill="none" stroke="${p.aura}" stroke-width="1" opacity=".7"/>` : '';
  const bolts = t >= 6 ? `<polyline points="8,20 16,34 11,36 20,52" fill="none" stroke="#fff" stroke-width="1.6"/><polyline points="92,18 84,32 89,34 80,50" fill="none" stroke="#fff" stroke-width="1.6"/><polyline points="8,20 16,34 11,36 20,52" fill="none" stroke="${p.aura}" stroke-width="3.5" opacity=".5"/><polyline points="92,18 84,32 89,34 80,50" fill="none" stroke="${p.aura}" stroke-width="3.5" opacity=".5"/>` : '';
  const particles = t >= 5 ? Array.from({ length: t === 6 ? 10 : 6 }, (_, i) => `<circle cx="${8 + ((i * 53) % 84)}" cy="${10 + ((i * 29) % 60)}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity=".85"/>`).join('') : '';
  const cape = t >= 4 ? `<path d="M${shoulder + 4} 100 L${shoulder + 10} 74 L50 70 L${90 - shoulder} 74 L${96 - shoulder} 100 Z" fill="${p.secondary}" opacity=".55"/><path d="M${shoulder + 2} 100 L${shoulder + 9} 76 L${shoulder + 14} 100 Z M${98 - shoulder} 100 L${91 - shoulder} 76 L${86 - shoulder} 100 Z" fill="${p.secondary}"/>` : '';
  const trim = t >= 2 ? `<path d="M${shoulder} 100 Q${shoulder + 4} 76 34 72 L50 80 L66 72 Q${100 - shoulder - 4} 76 ${100 - shoulder} 100" fill="none" stroke="${t >= 5 ? gold : p.secondary}" stroke-width="${t >= 3 ? 2 : 1.2}"/>` : '';
  const chest = t >= 4 ? `<path d="M38 84 L50 80 L62 84 L64 100 L36 100 Z" fill="url(#${id}-metal)" stroke="#000" stroke-opacity=".35" stroke-width=".6"/><path d="M50 84 L54 90 L50 96 L46 90 Z" fill="${p.aura}" ${t >= 6 ? `stroke="#fff" stroke-width="1"` : ''}/>` : '';
  const padL = shoulder + 13;
  const padR = 100 - shoulder - 13;
  const pads = t >= 3
    ? `<ellipse cx="${padL}" cy="82" rx="${9 + t}" ry="${6 + t * 0.6}" fill="url(#${id}-metal)" stroke="#000" stroke-opacity=".4" stroke-width=".6"/><ellipse cx="${padR}" cy="82" rx="${9 + t}" ry="${6 + t * 0.6}" fill="url(#${id}-metal)" stroke="#000" stroke-opacity=".4" stroke-width=".6"/>` +
      (t >= 5 ? [padL, padR].map((x) => `<path d="M${x - 7} 78 L${x - 5} ${68 - t} L${x - 2} 77 Z M${x - 1} 76 L${x + 1} ${64 - t} L${x + 3} 76 Z M${x + 4} 77 L${x + 7} ${68 - t} L${x + 8} 79 Z" fill="${gold}" stroke="#7a4b00" stroke-width=".5"/>`).join('') : '')
    : '';
  const brows = `<path d="M33 47 L46 51 L46 53 L33 50 Z" fill="${p.hair === '#e0e0ff' || p.hair === '#e5e5e5' ? '#555' : p.hair}"/><path d="M67 47 L54 51 L54 53 L67 50 Z" fill="${p.hair === '#e0e0ff' || p.hair === '#e5e5e5' ? '#555' : p.hair}"/>`;
  const iris = t >= 4 ? p.aura : p.eyes;
  const eyeGlow = t >= 4 ? `<circle cx="42" cy="56" r="${t >= 6 ? 4.5 : 3.5}" fill="${p.aura}" opacity=".45"/><circle cx="58" cy="56" r="${t >= 6 ? 4.5 : 3.5}" fill="${p.aura}" opacity=".45"/>` : '';
  const eyes = isAndroid
    ? `<rect x="31" y="52" width="38" height="6" rx="3" fill="#111"/><rect x="33" y="53.5" width="34" height="3" rx="1.5" fill="${t >= 4 ? p.aura : p.eyes}"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/></rect>${t >= 5 ? `<rect x="29" y="51" width="42" height="8" rx="4" fill="none" stroke="${gold}" stroke-width="1"/>` : ''}`
    : `<path d="M34 54 L46 54 L44 58.5 L36.5 58.5 Z" fill="${def.race === 'necromante' ? '#1a0a1e' : '#fff'}" stroke="#000" stroke-width=".4"/><path d="M66 54 L54 54 L56 58.5 L63.5 58.5 Z" fill="${def.race === 'necromante' ? '#1a0a1e' : '#fff'}" stroke="#000" stroke-width=".4"/>${eyeGlow}<circle cx="42" cy="56.2" r="2.2" fill="${iris}"/><circle cx="58" cy="56.2" r="2.2" fill="${iris}"/>${t >= 6 ? '' : '<circle cx="42" cy="56.2" r="0.9" fill="#000"/><circle cx="58" cy="56.2" r="0.9" fill="#000"/><circle cx="41" cy="55.3" r="0.6" fill="#fff"/><circle cx="57" cy="55.3" r="0.6" fill="#fff"/>'}`;
  const marks = isParasite
    ? `<path d="M36 60 L40 66 M64 60 L60 66" stroke="#1b4332" stroke-width="2"/><circle cx="50" cy="44" r="${2 + t * 0.3}" fill="${p.eyes}"/>`
    : def.id === 'zarek'
      ? `<path d="M30 60 L70 60 L68 68 L32 68 Z" fill="${p.primary}" opacity="0.95"/>`
      : '';
  const headband =
    def.id === 'riku' || def.id === 'kenji' || def.id === 'toru' || def.id === 'tobi'
      ? `<path d="M26 40 Q50 34 74 40 L74 45 Q50 39 26 45 Z" fill="${p.secondary}"/><path d="M74 42 L90 36 L86 44 L92 48 L74 45 Z" fill="${p.secondary}"/>`
      : '';
  const crown = t >= 5
    ? `<path d="M30 38 Q50 31 70 38 L70 41 Q50 34 30 41 Z" fill="${gold}" stroke="#7a4b00" stroke-width=".5"/><path d="M44 35 L50 ${t >= 6 ? 20 : 25} L56 35 Z" fill="${gold}" stroke="#7a4b00" stroke-width=".5"/><circle cx="50" cy="33" r="2.4" fill="${p.aura}" stroke="#fff" stroke-width=".6"/>`
    : '';
  const beard = def.id === 'gorath' || def.id === 'daichi' ? `<path d="M36 62 Q50 82 64 62 L60 74 Q50 84 40 74 Z" fill="${p.hair}"/>` : '';
  const emblem = `<circle cx="50" cy="90" r="5" fill="${p.secondary}" stroke="${p.aura}" stroke-width="1"/><path d="M50 86 L52 90 L50 94 L48 90 Z" fill="${p.primary}"/>`;
  const hs = 1 + (t - 1) * 0.06;
  const hairFill = t >= 5 ? `url(#${id}-hair)` : p.hair;
  const hairGlow = t >= 5 ? `<path d="${hairPath(def.hairStyle)}" fill="none" stroke="${p.aura}" stroke-width="${t >= 6 ? 4 : 2.5}" opacity=".55" transform="translate(50 34) scale(${hs}) translate(-50 -34)"/>` : '';
  const mouth =
    def.race === 'monstro' || def.id === 'kenji'
      ? `<path d="M43 64 H57 L55 67.5 H45 Z" fill="#fff" stroke="#2b1a10" stroke-width=".7"/>`
      : `<path d="M45 65 Q50 67.5 55 64.5" fill="none" stroke="#3b1f1f" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<svg class="portrait tier-${t} ${opts.className ?? ''}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${opts.flip ? 'style="transform:scaleX(-1)"' : ''} aria-hidden="true">
  <defs>
    <radialGradient id="${id}-bg" cx="50%" cy="58%" r="55%"><stop offset="0%" stop-color="${p.aura}" stop-opacity="${(0.18 + t * 0.08).toFixed(2)}"/><stop offset="100%" stop-color="${p.aura}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-vig" cx="50%" cy="50%" r="72%"><stop offset="70%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".45"/></radialGradient>
    <linearGradient id="${id}-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${p.aura}" stop-opacity="0.9"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.primary}"/><stop offset="100%" stop-color="#050714"/></linearGradient>
    <linearGradient id="${id}-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="${metal}"/><stop offset="100%" stop-color="#4a4e69"/></linearGradient>
    <linearGradient id="${id}-hair" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${t >= 6 ? p.aura : p.hair}"/><stop offset="100%" stop-color="${t >= 6 ? '#fff' : p.aura}"/></linearGradient>
  </defs>
  ${layer === 'fg' ? '' : `${sceneSVG(def.id, t, id + "-sc", p.primary)}
  ${animeCardMotif(id, t, p.aura)}
  <rect width="100" height="100" fill="url(#${id}-bg)"/>
  <rect width="100" height="100" fill="url(#${id}-vig)"/>`}
  ${layer === 'bg' ? '</svg>' : ''}${layer === 'bg' ? '' : `
  ${outerAura}
  ${halo}
  ${flames}
  ${bolts}
  ${cape}
  <path d="M${shoulder} 100 Q${shoulder + 4} 76 34 72 L50 80 L66 72 Q${100 - shoulder - 4} 76 ${100 - shoulder} 100 Z" fill="url(#${id}-body)" stroke="${p.secondary}" stroke-width="1.2"/>
  ${trim}
  ${t >= 2 ? `<path d="M34 76 L40 74 L68 100 L60 100 Z" fill="${t >= 5 ? gold : p.secondary}" opacity=".9"/>` : ''}
  <path d="M38 72 L50 92 L62 72 L56 72 L50 82 L44 72 Z" fill="${p.secondary}"/>
  ${chest}
  ${pads}
  ${isAndroid ? `<rect x="44" y="64" width="12" height="10" fill="#6c757d"/>` : `<rect x="44" y="64" width="12" height="10" fill="${p.skin}"/>`}
  <path d="M30 44 Q30 70 50 72 Q70 70 70 44 Q70 28 50 28 Q30 28 30 44 Z" fill="${p.skin}"/>
  <path d="M31 48 Q33 67 50 71 Q40 66 35 48 Z" fill="rgba(0,0,0,.14)"/>
  <path d="M49 56 L47 61 L51 61.5" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".9" stroke-linecap="round"/>
  ${raceTraitsSVG(def, t)}
  ${marks}
  ${brows}
  ${eyes}
  ${mouth}
  ${beard}
  ${hairGlow}
  <path d="${hairPath(def.hairStyle)}" fill="${hairFill}" stroke="rgba(0,0,0,.35)" stroke-width="0.8" transform="translate(50 34) scale(${hs}) translate(-50 -34)"/>
  ${headband}
  ${signature(def, t)}
  ${crown}
  ${t >= 4 ? '' : emblem}
  ${actionPoseSVG(def, t, id)}
  ${particles}`}${layer === 'bg' ? '' : '\n</svg>'}`;
}

/** Arma / efeito de mão para o sprite de corpo inteiro na arena */
function arenaWeaponSVG(def: CharacterDef, t: number): string {
  const p = def.palette;
  switch (def.category) {
    case 'arqueiro':
      return `<path d="M74 44 Q90 64 74 84" fill="none" stroke="${p.secondary}" stroke-width="3" stroke-linecap="round"/>` +
        `<line x1="74" y1="44" x2="74" y2="84" stroke="#fff" stroke-width="1"/>` +
        `<path d="M66 64 H92" stroke="${p.aura}" stroke-width="2.4" stroke-linecap="round"/><polygon points="95,64 88,60 88,68" fill="#fff"/>`;
    case 'mago':
      return `<line x1="74" y1="88" x2="80" y2="42" stroke="${p.secondary}" stroke-width="2.8" stroke-linecap="round"/>` +
        `<circle cx="80" cy="40" r="${6 + t * 0.7}" fill="${p.aura}" stroke="#fff" stroke-width="1.2"/>` +
        `<circle cx="80" cy="40" r="3" fill="#fff"/>`;
    case 'suporte':
      return `<circle cx="80" cy="58" r="${6 + t * 0.6}" fill="${p.aura}" opacity=".75" stroke="#fff" stroke-width="1"/>` +
        `<path d="M80 51 V65 M73 58 H87" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
    case 'assassino':
      return `<path d="M74 66 L96 48 L82 74 Z" fill="#e9ecef" stroke="${p.aura}" stroke-width="1.2"/>` +
        `<path d="M70 72 L90 84 L76 64 Z" fill="${p.secondary}" opacity=".85"/>`;
    case 'tanque':
      return `<polygon points="74,48 88,54 88,78 74,84 64,78 64,54" fill="${p.primary}" stroke="${t >= 4 ? '#ffd23f' : p.secondary}" stroke-width="2.2"/>` +
        `<circle cx="76" cy="66" r="4.5" fill="${p.aura}"/>`;
    default: // dps (artista marcial / espadachim)
      return def.id === 'nara'
        ? `<path d="M74 68 Q92 48 96 30 Q82 54 70 64 Z" fill="#fff" stroke="${p.aura}" stroke-width="1.4"/>`
        : `<circle cx="80" cy="64" r="${6.5 + t * 0.6}" fill="${p.aura}" opacity=".8"/><circle cx="80" cy="64" r="3.5" fill="#fff"/>`;
  }
}

/**
 * Sprite de corpo inteiro (estilo anime/chibi tático) para a arena de batalha 2×7.
 * Possui grupos separados (.spr-legs, .spr-torso, .spr-head, .spr-arm-f) que animam
 * quando o personagem anda (MOVE), ataca (HIT / disparo), sofre dano ou é derrotado.
 */
export function unitSpriteSVG(def: CharacterDef, opts: { flip?: boolean; stars?: number; side?: Side } = {}): string {
  const p = def.palette;
  const t = Math.max(1, Math.min(6, opts.stars ?? def.minStars));
  const sideColor = opts.side === 'enemy' ? '#ff3d6e' : '#2fb8ff';
  const gold = '#ffd23f';
  const uid = `u-${def.id}-${t}-${opts.side ?? 'p'}`;
  const isAndroid = def.id === 'nyx';
  return `<svg class="unit-sprite tier-${t}" viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg" ${opts.flip ? 'style="transform:scaleX(-1)"' : ''} aria-hidden="true">
  <defs>
    <radialGradient id="${uid}-aura" cx="50%" cy="55%" r="50%">
      <stop offset="0%" stop-color="${p.aura}" stop-opacity="${(0.35 + t * 0.08).toFixed(2)}"/>
      <stop offset="100%" stop-color="${p.aura}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}-suit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.primary}"/>
      <stop offset="100%" stop-color="#090c1d"/>
    </linearGradient>
  </defs>
  <!-- Círculo de invocação tático na base -->
  <ellipse class="spr-ring" cx="50" cy="104" rx="34" ry="9" fill="rgba(0,0,0,.45)" stroke="${sideColor}" stroke-width="2"/>
  <ellipse cx="50" cy="104" rx="26" ry="5.5" fill="none" stroke="${p.aura}" stroke-width="1" stroke-dasharray="5 3" opacity=".8"/>
  <!-- Aura de Ki do lutador -->
  <g class="spr-aura">
    <ellipse cx="50" cy="60" rx="${34 + t * 2}" ry="${42 + t * 2}" fill="url(#${uid}-aura)"/>
    ${t >= 3 ? `<path d="M18 98 Q12 64 26 36 Q22 68 28 98 Z M82 98 Q88 64 74 36 Q78 68 72 98 Z" fill="${p.aura}" opacity=".45"/>` : ''}
    ${t >= 5 ? `<ellipse cx="50" cy="58" rx="42" ry="48" fill="none" stroke="${gold}" stroke-width="1.4" stroke-dasharray="6 4" opacity=".75"/>` : ''}
  </g>
  <g class="spr-figure">
    <!-- Capa (Épico+) -->
    ${t >= 4 ? `<path class="spr-cape" d="M30 58 L14 98 L38 92 L62 92 L84 98 L68 58 Z" fill="${p.secondary}" opacity=".85" stroke="#000" stroke-width=".8"/>` : ''}
    <!-- Braço de trás -->
    <g class="spr-arm-b">
      <path d="M34 60 L20 74 L26 80 L38 68 Z" fill="url(#${uid}-suit)" stroke="#000" stroke-width=".8"/>
      <circle cx="22" cy="77" r="4.5" fill="${p.skin}" stroke="#000" stroke-width=".7"/>
    </g>
    <!-- Pernas animadas -->
    <g class="spr-legs">
      <g class="spr-leg-l">
        <path d="M36 80 L30 98 L41 98 L45 82 Z" fill="url(#${uid}-suit)" stroke="#000" stroke-width=".8"/>
        <rect x="28" y="96" width="14" height="7" rx="3" fill="${t >= 5 ? gold : p.secondary}" stroke="#000" stroke-width=".8"/>
      </g>
      <g class="spr-leg-r">
        <path d="M55 82 L59 98 L70 98 L64 80 Z" fill="url(#${uid}-suit)" stroke="#000" stroke-width=".8"/>
        <rect x="58" y="96" width="14" height="7" rx="3" fill="${t >= 5 ? gold : p.secondary}" stroke="#000" stroke-width=".8"/>
      </g>
    </g>
    <!-- Torso, faixa e armadura por estrela -->
    <g class="spr-torso">
      <path d="M32 56 L68 56 L64 84 L36 84 Z" fill="url(#${uid}-suit)" stroke="${t >= 5 ? gold : p.secondary}" stroke-width="1.2"/>
      <path d="M38 56 L50 70 L62 56" fill="${p.secondary}"/>
      <rect x="34" y="77" width="32" height="5.5" rx="2" fill="${t >= 5 ? gold : p.secondary}" stroke="#000" stroke-width=".7"/>
      <path d="M50 80 L58 94 L52 95 L47 82 Z" fill="${t >= 5 ? gold : p.secondary}"/>
      ${t >= 3 ? `<ellipse cx="30" cy="59" rx="8" ry="5" fill="${t >= 5 ? gold : '#d0d6dd'}" stroke="#000" stroke-width=".8"/><ellipse cx="70" cy="59" rx="8" ry="5" fill="${t >= 5 ? gold : '#d0d6dd'}" stroke="#000" stroke-width=".8"/>` : ''}
      ${t >= 4 ? `<polygon points="50,61 55,68 50,75 45,68" fill="${p.aura}" stroke="#fff" stroke-width=".8"/>` : ''}
    </g>
    <!-- Cabeça estilo anime/chibi expressiva -->
    <g class="spr-head" transform="translate(0, -10)">
      <path d="M30 44 Q30 68 50 70 Q70 68 70 44 Q70 28 50 28 Q30 28 30 44 Z" fill="${p.skin}" stroke="rgba(0,0,0,.45)" stroke-width=".9"/>
      ${raceTraitsSVG(def, t)}
      <path d="M34 47 L46 50 L46 52 L34 49 Z M66 47 L54 50 L54 52 L66 49 Z" fill="${p.hair}"/>
      ${isAndroid
        ? `<rect x="33" y="51" width="34" height="6" rx="3" fill="#111"/><rect x="35" y="52.5" width="30" height="3" rx="1.5" fill="${p.aura}"/>`
        : `<ellipse cx="42" cy="55" rx="4.2" ry="4.5" fill="#fff" stroke="#000" stroke-width=".5"/><ellipse cx="58" cy="55" rx="4.2" ry="4.5" fill="#fff" stroke="#000" stroke-width=".5"/><circle cx="43" cy="55" r="2.5" fill="${t >= 4 ? p.aura : p.eyes}"/><circle cx="59" cy="55" r="2.5" fill="${t >= 4 ? p.aura : p.eyes}"/><circle cx="42" cy="53.8" r="1" fill="#fff"/><circle cx="58" cy="53.8" r="1" fill="#fff"/>`
      }
      <path d="M46 63 Q50 65.5 55 63" fill="none" stroke="#3b1f1f" stroke-width="1.4" stroke-linecap="round"/>
      <path d="${hairPath(def.hairStyle)}" fill="${p.hair}" stroke="rgba(0,0,0,.4)" stroke-width=".9" transform="translate(50 34) scale(${1 + (t - 1) * 0.04}) translate(-50 -34)"/>
      ${t >= 5 ? `<path d="M34 38 L50 26 L66 38 Z" fill="${gold}" stroke="#7a4b00" stroke-width=".7"/>` : ''}
    </g>
    <!-- Braço da frente e arma/Ki -->
    <g class="spr-arm-f">
      <path d="M62 60 L78 62 L76 70 L60 68 Z" fill="url(#${uid}-suit)" stroke="#000" stroke-width=".8"/>
      <circle cx="76" cy="65" r="4.8" fill="${p.skin}" stroke="#000" stroke-width=".7"/>
      ${arenaWeaponSVG(def, t)}
    </g>
  </g>
</svg>`;
}

/** Líderes de equipe (Heróis) em corpo inteiro nas pontas da arena */
export function heroSVG(side: 'player' | 'enemy'): string {
  const isP = side === 'player';
  const primary = isP ? '#0077b6' : '#7209b7';
  const secondary = isP ? '#ffd166' : '#ff006e';
  const aura = isP ? '#00f5d4' : '#ff4d6d';
  const hair = isP ? '#ffbe0b' : '#e0aaff';
  const skin = isP ? '#ffe0bd' : '#e5d4ef';
  return `<svg viewBox="0 0 100 120" class="hero-svg hero-leader-${side}" ${isP ? '' : 'style="transform:scaleX(-1)"'} aria-hidden="true">
  <defs>
    <radialGradient id="hero-${side}" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="${aura}" stop-opacity="0.75"/>
      <stop offset="65%" stop-color="${primary}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="50" cy="110" rx="38" ry="8" fill="rgba(0,0,0,.55)" stroke="${aura}" stroke-width="2"/>
  <ellipse cx="50" cy="62" rx="44" ry="50" fill="url(#hero-${side})"/>
  <path d="M24 56 L10 106 L40 98 L60 98 L90 106 L76 56 Z" fill="${secondary}" opacity=".85" stroke="#000" stroke-width="1"/>
  <path d="M36 80 L30 104 L43 104 L47 82 Z M53 82 L57 104 L70 104 L64 80 Z" fill="${primary}" stroke="#000" stroke-width="1"/>
  <rect x="28" y="100" width="16" height="8" rx="3" fill="${secondary}" stroke="#000" stroke-width=".8"/>
  <rect x="56" y="100" width="16" height="8" rx="3" fill="${secondary}" stroke="#000" stroke-width=".8"/>
  <path d="M30 52 L70 52 L65 84 L35 84 Z" fill="${primary}" stroke="${secondary}" stroke-width="1.5"/>
  <polygon points="50,56 57,66 50,76 43,66" fill="${aura}" stroke="#fff" stroke-width="1"/>
  <ellipse cx="28" cy="55" rx="10" ry="6" fill="${secondary}" stroke="#000" stroke-width=".9"/>
  <ellipse cx="72" cy="55" rx="10" ry="6" fill="${secondary}" stroke="#000" stroke-width=".9"/>
  <path d="M32 34 Q32 56 50 58 Q68 56 68 34 Q68 20 50 20 Q32 20 32 34 Z" fill="${skin}" stroke="#000" stroke-width=".9"/>
  <ellipse cx="43" cy="43" rx="3.8" ry="4" fill="#fff"/><ellipse cx="57" cy="43" rx="3.8" ry="4" fill="#fff"/>
  <circle cx="44" cy="43" r="2.2" fill="${aura}"/><circle cx="58" cy="43" r="2.2" fill="${aura}"/>
  <path d="M20 36 L14 18 L28 24 L24 6 L38 20 L48 2 L54 18 L66 4 L64 22 L80 12 L74 30 L86 28 L76 40 L26 40 Z" fill="${hair}" stroke="#000" stroke-width=".9"/>
  <path d="M34 28 L50 16 L66 28 Z" fill="${secondary}" stroke="#000" stroke-width=".7"/>
  <circle cx="82" cy="62" r="9" fill="${aura}" opacity=".85"/><circle cx="82" cy="62" r="4.5" fill="#fff"/>
</svg>`;
}

// ---------------- v0.10.1: cache de retratos como imagem ----------------
const PORTRAIT_IMG_CACHE = new Map<string, string>();

/**
 * Mesmo desenho de `portraitSVG`, mas entregue como `<img>` com o SVG em data-URL,
 * gerado UMA vez por (personagem, cor, camada) e reaproveitado. Assim cada carta tem
 * 1 nó em vez de centenas de nós SVG; o navegador rasteriza e guarda a imagem, e os
 * ids de gradiente deixam de se repetir no documento. Visual idêntico ao SVG em linha.
 */
export function portraitImg(def: CharacterDef, opts: { stars?: number; layer?: 'all' | 'bg' | 'fg' } = {}): string {
  const t = Math.max(1, Math.min(6, opts.stars ?? def.minStars));
  const layer = opts.layer ?? 'all';
  const key = `${def.id}|${t}|${layer}`;
  let src = PORTRAIT_IMG_CACHE.get(key);
  if (!src) {
    const svg = portraitSVG(def, { stars: t, layer }).replace(/>\s+</g, '><').trim();
    src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    PORTRAIT_IMG_CACHE.set(key, src);
  }
  return `<img class="portrait tier-${t}" src="${src}" alt="" draggable="false">`;
}

/**
 * Pré-aquece o cache de retratos (e a decodificação das imagens) em tempo ocioso, para que
 * abrir a Coleção / Treinar / Batalha não precise gerar tudo no mesmo quadro do toque.
 */
export function warmPortraits(list: { def: CharacterDef; stars: number }[]): void {
  const queue: (() => void)[] = [];
  for (const { def, stars } of list) {
    for (const layer of ['bg', 'fg'] as const) {
      queue.push(() => {
        const html = portraitImg(def, { stars, layer });
        const src = html.slice(html.indexOf('src="') + 5, html.indexOf('" alt'));
        const img = new Image();
        img.src = src;
        img.decode?.().catch(() => {});
      });
    }
  }
  const ric: (cb: (d: { timeRemaining(): number }) => void) => void =
    (window as unknown as { requestIdleCallback?: typeof ric }).requestIdleCallback ?? ((cb) => setTimeout(() => cb({ timeRemaining: () => 8 }), 16));
  const step = (d: { timeRemaining(): number }) => {
    while (queue.length && d.timeRemaining() > 2) queue.shift()!();
    if (queue.length) ric(step);
  };
  ric(step);
}
