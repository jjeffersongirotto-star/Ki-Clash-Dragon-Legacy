import type { CharacterDef } from '../core/types';

/**
 * Retratos originais gerados proceduralmente em SVG (sem assets externos).
 * Estilo anime: cabelo espetado, olhar afiado e aura de energia.
 */
function hairPath(style: number): string {
  switch (style) {
    case 0: // espetado para cima
      return 'M22 46 L18 30 L28 34 L24 12 L36 26 L40 4 L48 22 L56 2 L60 22 L70 8 L68 28 L80 16 L74 36 L84 34 L78 48 L70 36 L30 36 Z';
    case 1: // longo e esvoaçante
      return 'M24 70 L18 44 L22 26 Q30 10 50 10 Q70 10 78 26 L82 44 L76 70 L70 44 L66 30 L54 34 L46 28 L38 34 L32 30 L30 44 Z';
    case 2: // penteado para trás
      return 'M24 44 L20 30 Q24 14 44 12 L64 8 L88 14 L76 20 L90 26 L76 30 L84 40 L74 38 L72 32 L30 32 Z';
    case 3: // franja curta
      return 'M24 46 Q20 18 50 14 Q80 18 76 46 L72 32 L66 40 L62 30 L56 38 L50 28 L44 38 L38 30 L34 40 L28 32 Z';
    case 4: // crista / chifres
      return 'M30 34 L16 6 L36 26 L50 10 L64 26 L84 6 L70 34 Z';
    default: // moicano
      return 'M40 30 L42 8 L50 2 L58 8 L60 30 Z';
  }
}

export function portraitSVG(def: CharacterDef, opts: { flip?: boolean; className?: string } = {}): string {
  const p = def.palette;
  const id = `g-${def.id}`;
  const isAndroid = def.id === 'nyx';
  const isParasite = def.id === 'vorax' || def.id === 'cria';
  const bigBuild = def.id === 'gorath' || def.id === 'kenji' || def.id === 'vorax';
  const shoulder = bigBuild ? 4 : 14;
  const flames = Array.from({ length: 9 }, (_, i) => {
    const x = 6 + i * 11;
    const h = 30 + ((i * 37) % 25);
    return `<path d="M${x - 7} 100 Q${x - 4} ${100 - h * 0.6} ${x} ${100 - h - 20} Q${x + 4} ${100 - h * 0.6} ${x + 7} 100 Z" fill="url(#${id}-fl)" opacity="0.75"/>`;
  }).join('');
  const brows = `<path d="M33 47 L46 51 L46 53 L33 50 Z" fill="${p.hair === '#e0e0ff' || p.hair === '#e5e5e5' ? '#555' : p.hair}"/><path d="M67 47 L54 51 L54 53 L67 50 Z" fill="${p.hair === '#e0e0ff' || p.hair === '#e5e5e5' ? '#555' : p.hair}"/>`;
  const eyes = isAndroid
    ? `<rect x="31" y="52" width="38" height="6" rx="3" fill="#111"/><rect x="33" y="53.5" width="34" height="3" rx="1.5" fill="${p.eyes}"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/></rect>`
    : `<path d="M34 54 L46 54 L44 58 L37 58 Z" fill="#fff"/><path d="M66 54 L54 54 L56 58 L63 58 Z" fill="#fff"/><circle cx="42" cy="56" r="2" fill="${p.eyes}"/><circle cx="58" cy="56" r="2" fill="${p.eyes}"/><circle cx="42" cy="56" r="0.8" fill="#000"/><circle cx="58" cy="56" r="0.8" fill="#000"/>`;
  const marks = isParasite
    ? `<path d="M36 60 L40 66 M64 60 L60 66" stroke="#1b4332" stroke-width="2"/><circle cx="50" cy="44" r="2.4" fill="${p.eyes}"/>`
    : def.id === 'zarek'
      ? `<path d="M30 60 L70 60 L68 68 L32 68 Z" fill="${p.primary}" opacity="0.95"/>`
      : '';
  const headband =
    def.id === 'riku' || def.id === 'kenji' || def.id === 'toru'
      ? `<path d="M26 40 Q50 34 74 40 L74 45 Q50 39 26 45 Z" fill="${p.secondary}"/><path d="M74 42 L90 36 L86 44 L92 48 L74 45 Z" fill="${p.secondary}"/>`
      : '';
  const beard = def.id === 'gorath' ? `<path d="M36 62 Q50 82 64 62 L60 74 Q50 84 40 74 Z" fill="${p.hair}"/>` : '';
  const emblem = `<circle cx="50" cy="90" r="5" fill="${p.secondary}" stroke="${p.aura}" stroke-width="1"/><path d="M50 86 L52 90 L50 94 L48 90 Z" fill="${p.primary}"/>`;
  return `<svg class="portrait ${opts.className ?? ''}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${opts.flip ? 'style="transform:scaleX(-1)"' : ''} aria-hidden="true">
  <defs>
    <radialGradient id="${id}-bg" cx="50%" cy="55%" r="65%"><stop offset="0%" stop-color="${p.aura}" stop-opacity="0.85"/><stop offset="55%" stop-color="${p.primary}" stop-opacity="0.9"/><stop offset="100%" stop-color="#05060d"/></radialGradient>
    <linearGradient id="${id}-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${p.aura}" stop-opacity="0.9"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.primary}"/><stop offset="100%" stop-color="#000"/></linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#${id}-bg)"/>
  ${flames}
  <path d="M${shoulder} 100 Q${shoulder + 4} 76 34 72 L50 80 L66 72 Q${100 - shoulder - 4} 76 ${100 - shoulder} 100 Z" fill="url(#${id}-body)" stroke="${p.secondary}" stroke-width="1.2"/>
  <path d="M38 72 L50 92 L62 72 L56 72 L50 82 L44 72 Z" fill="${p.secondary}"/>
  ${isAndroid ? `<rect x="44" y="64" width="12" height="10" fill="#6c757d"/>` : `<rect x="44" y="64" width="12" height="10" fill="${p.skin}"/>`}
  <path d="M30 44 Q30 70 50 72 Q70 70 70 44 Q70 28 50 28 Q30 28 30 44 Z" fill="${p.skin}"/>
  <path d="M30 50 L26 52 L30 58 Z M70 50 L74 52 L70 58 Z" fill="${p.skin}"/>
  ${marks}
  ${brows}
  ${eyes}
  <path d="M45 65 L55 65" stroke="#3b1f1f" stroke-width="1.4" stroke-linecap="round"/>
  ${beard}
  <path d="${hairPath(def.hairStyle)}" fill="${p.hair}" stroke="rgba(0,0,0,.35)" stroke-width="0.8"/>
  ${headband}
  ${emblem}
</svg>`;
}

export function heroSVG(side: 'player' | 'enemy'): string {
  const c = side === 'player' ? ['#00b4d8', '#03045e', '#90e0ef'] : ['#ff006e', '#3a0ca3', '#ffafcc'];
  return `<svg viewBox="0 0 100 100" class="hero-svg" aria-hidden="true">
  <defs><radialGradient id="hero-${side}" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="${c[2]}"/><stop offset="60%" stop-color="${c[0]}"/><stop offset="100%" stop-color="${c[1]}"/></radialGradient></defs>
  <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="url(#hero-${side})" stroke="#fff" stroke-width="2"/>
  <path d="M50 18 L62 44 L88 50 L62 56 L50 82 L38 56 L12 50 L38 44 Z" fill="#fff" opacity="0.85"/>
  <circle cx="50" cy="50" r="10" fill="${c[1]}"/>
</svg>`;
}
