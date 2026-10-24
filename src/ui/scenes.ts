/**
 * Cenários de fundo temáticos dos retratos (SVG puro, viewBox 100×100).
 * Cada personagem tem a sua cena; ela fica mais rica a cada estrela (t = 1..6):
 * mais camadas, luz, partículas e cores. Poucos elementos por cena, para rodar leve no celular.
 */
const r = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const f = (n: number) => n.toFixed(1);
/** posição nas laterais (fora da silhueta do personagem) */
const side = (u: number) => (u < 0.5 ? u * 52 : 74 + (u - 0.5) * 52);

function stars(n: number, seed: number, color = '#fff', maxY = 70): string {
  let o = '';
  for (let i = 0; i < n; i++) o += `<circle cx="${f(r(i, seed) * 100)}" cy="${f(r(i, seed + 1) * maxY)}" r="${f(0.4 + r(i, seed + 2) * 0.9)}" fill="${color}" opacity="${f(0.5 + r(i, seed + 3) * 0.5)}"/>`;
  return o;
}
function sky(g: string, top: string, bottom: string, mid?: string): string {
  return `<linearGradient id="${g}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>${mid ? `<stop offset=".55" stop-color="${mid}"/>` : ''}<stop offset="1" stop-color="${bottom}"/></linearGradient>`;
}
const glow = (g: string, name: string, c: string, o = 1) =>
  `<radialGradient id="${g}-${name}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

type Scene = (t: number, g: string) => string;

const SCENES: Record<string, Scene> = {
  // Riku — vento e céu aberto
  riku: (t, g) => {
    let o = `<defs>${sky(g, t >= 5 ? '#0b6e8a' : '#3d8fb8', '#bfeff0', t >= 3 ? '#7cc7d9' : undefined)}${glow(g, 'sun', '#fff6c8')}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    if (t >= 6) o += `<circle cx="78" cy="18" r="28" fill="url(#${g}-sun)"/>`;
    if (t >= 3) o += `<ellipse cx="18" cy="26" rx="18" ry="6" fill="#fff" opacity=".75"/><ellipse cx="84" cy="40" rx="16" ry="5" fill="#fff" opacity=".6"/>`;
    o += `<path d="M0 88 Q25 78 50 86 T100 82 V100 H0 Z" fill="#2f7d6d" opacity=".8"/>`;
    for (let i = 0; i < 1 + t; i++) {
      const y = 12 + i * (70 / (1 + t));
      o += `<path d="M${f(-5 + r(i, 3) * 20)} ${f(y)} Q${f(40 + r(i, 4) * 20)} ${f(y - 8)} ${f(80 + r(i, 5) * 25)} ${f(y + 2)}" fill="none" stroke="#fff" stroke-width="${f(0.8 + t * 0.15)}" stroke-linecap="round" opacity=".7"/>`;
    }
    if (t >= 2) o += `<path d="M0 92 Q30 84 60 92 T100 90 V100 H0 Z" fill="#1f5f52" opacity=".9"/>`;
    if (t >= 4) for (let i = 0; i < 2 * t - 4; i++) { const x = side(r(i, 6)), y = 20 + r(i, 7) * 60; o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.4" ry="1" fill="#7ee08a" transform="rotate(${f(r(i, 8) * 90 - 45)} ${f(x)} ${f(y)})"/>`; }
    if (t >= 5) o += `<path d="M6 70 Q20 50 8 34 Q30 48 22 70 M94 70 Q80 50 92 34 Q70 48 78 70" fill="none" stroke="#e8ffff" stroke-width="1.6" opacity=".8"/>`;
    return o;
  },
  // Nara — noite de luar
  nara: (t, g) => {
    let o = `<defs>${sky(g, '#07091f', t >= 4 ? '#3a3f8a' : '#262a52')}${glow(g, 'moon', '#e8e8ff', 0.8)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    o += stars(3 + t * 4, 11);
    const mr = 8 + t * 1.6;
    if (t >= 5) o += `<circle cx="76" cy="22" r="${f(mr * 2.4)}" fill="url(#${g}-moon)"/>`;
    o += `<circle cx="76" cy="22" r="${f(mr)}" fill="#f2f2ff"/><circle cx="${f(76 + mr * 0.45)}" cy="${f(22 - mr * 0.25)}" r="${f(mr * 0.85)}" fill="${t >= 4 ? '#2e336e' : '#1d2147'}"/>`;
    if (t >= 3) o += `<path d="M0 100 V74 L14 62 L26 72 L40 56 L56 70 L70 60 L86 72 L100 64 V100 Z" fill="#11132e"/>`;
    if (t >= 6) o += `<path d="M10 10 L34 22" stroke="#fff" stroke-width="1" opacity=".9"/><path d="M22 4 L40 14" stroke="#c0c0ff" stroke-width=".7"/>`;
    return o;
  },
  // Toru — templo das sombras
  toru: (t, g) => {
    let o = `<defs>${sky(g, '#1a0f14', t >= 4 ? '#5c2a2a' : '#3a2226')}${glow(g, 'lamp', '#ff7b54')}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    o += `<g fill="#0c0708"><rect x="8" y="24" width="84" height="6" rx="1"/><rect x="4" y="20" width="92" height="4" rx="2"/><rect x="16" y="34" width="68" height="3"/><rect x="18" y="30" width="5" height="70"/><rect x="77" y="30" width="5" height="70"/></g>`;
    if (t >= 3) o += `<path d="M30 100 L36 80 H64 L70 100 Z" fill="#140a0c"/><rect x="40" y="70" width="20" height="10" fill="#140a0c"/>`;
    if (t >= 2) for (const x of [12, 88].slice(0, t >= 4 ? 2 : 1)) o += `<circle cx="${x}" cy="56" r="${t >= 6 ? 11 : 7}" fill="url(#${g}-lamp)"/><rect x="${x - 2.5}" y="52" width="5" height="8" rx="1.5" fill="${t >= 6 ? '#b06bff' : '#ff9a5c'}"/>`;
    if (t >= 4) o += `<rect y="78" width="100" height="22" fill="#000" opacity=".35"/><ellipse cx="50" cy="90" rx="60" ry="8" fill="#6b3b4a" opacity=".35"/>`;
    if (t >= 5) o += stars(8, 21, '#ff9a5c', 90);
    return o;
  },
  // Aiko — acima das nuvens
  aiko: (t, g) => {
    let o = `<defs>${sky(g, t >= 5 ? '#ff9e7a' : '#8ecae6', '#ffe5d9', t >= 3 ? '#cdb4db' : undefined)}${glow(g, 'sun', '#fff1a8')}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    if (t >= 6) for (let i = 0; i < 7; i++) o += `<path d="M50 105 L${f(i * 16 - 2)} -5 L${f(i * 16 + 6)} -5 Z" fill="#fff6c8" opacity=".22"/>`;
    if (t >= 4) o += `<path d="M2 90 A48 48 0 0 1 98 90" fill="none" stroke="#ff8fab" stroke-width="2" opacity=".5"/><path d="M6 90 A44 44 0 0 1 94 90" fill="none" stroke="#ffd166" stroke-width="2" opacity=".5"/><path d="M10 90 A40 40 0 0 1 90 90" fill="none" stroke="#9bf6ff" stroke-width="2" opacity=".5"/>`;
    for (let i = 0; i < 2 + t; i++) o += `<ellipse cx="${f(r(i, 31) * 100)}" cy="${f(60 + r(i, 32) * 40)}" rx="${f(14 + r(i, 33) * 14)}" ry="${f(6 + r(i, 34) * 4)}" fill="#fff" opacity="${f(0.55 + r(i, 35) * 0.4)}"/>`;
    if (t >= 5) o += `<path d="M10 20 l2 -4 l2 4 l-2 4 Z M86 28 l2 -4 l2 4 l-2 4 Z" fill="#fff"/>`;
    return o;
  },
  // Lyra — campo de estrelas
  lyra: (t, g) => {
    let o = `<defs>${sky(g, '#05021a', '#2a0b3d')}${glow(g, 'neb', '#c77dff', 0.6)}${glow(g, 'neb2', '#4cc9f0', 0.5)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    if (t >= 3) o += `<ellipse cx="28" cy="30" rx="40" ry="22" fill="url(#${g}-neb)" transform="rotate(-25 28 30)"/>`;
    if (t >= 5) o += `<ellipse cx="78" cy="70" rx="34" ry="18" fill="url(#${g}-neb2)" transform="rotate(30 78 70)"/>`;
    o += stars(6 + t * 6, 41, '#fff', 100);
    if (t >= 4) o += `<polyline points="10,14 24,22 34,12 46,20" fill="none" stroke="#e0aaff" stroke-width=".5" opacity=".8"/><polyline points="70,8 82,16 92,10" fill="none" stroke="#e0aaff" stroke-width=".5" opacity=".8"/>`;
    if (t >= 6) o += `<g transform="translate(80 22)" fill="none" stroke="#f7d6ff" stroke-width=".8" opacity=".85"><path d="M0 0 Q8 -6 12 2 Q14 12 0 12 Q-14 10 -14 -2 Q-12 -18 6 -18"/></g>`;
    return o;
  },
  // Gorath — fortaleza de ferro
  gorath: (t, g) => {
    let o = `<defs>${sky(g, t >= 6 ? '#4a1a00' : '#2b2d31', t >= 4 ? '#6c5a3f' : '#4a4e52')}${glow(g, 'fire', '#ffb703')}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    const rows = 3 + Math.min(t, 4);
    for (let y = 0; y < rows; y++) {
      const yy = 100 - (y + 1) * 9;
      for (let x = 0; x < 6; x++) o += `<rect x="${f(x * 17 + (y % 2) * 8.5 - 8)}" y="${yy}" width="16" height="8" fill="#5f6368" stroke="#2b2d31" stroke-width=".8" opacity="${f(0.55 + y * 0.04)}"/>`;
    }
    if (t >= 3) {
      const top = 100 - rows * 9;
      for (let x = 0; x < 7; x++) o += `<rect x="${x * 15}" y="${top - 6}" width="8" height="6" fill="#5f6368" stroke="#2b2d31" stroke-width=".8"/>`;
    }
    if (t >= 4) for (const x of [10, 90]) o += `<circle cx="${x}" cy="40" r="${t >= 6 ? 14 : 9}" fill="url(#${g}-fire)"/><path d="M${x - 2} 44 Q${x} 34 ${x + 2} 44 Z" fill="#ffd166"/>`;
    if (t >= 5) o += `<path d="M0 30 L100 30" stroke="#ffd166" stroke-width=".6" opacity=".5"/>`;
    if (t >= 6) o += stars(10, 51, '#ffb703', 60);
    return o;
  },
  // Mei — lago de lótus
  mei: (t, g) => {
    let o = `<defs>${sky(g, t >= 4 ? '#ffd6e8' : '#cfe8e0', '#2a9d8f', '#8fd3c7')}${glow(g, 'ff', '#caffbf')}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    o += `<rect y="62" width="100" height="38" fill="#1f7a70" opacity=".65"/>`;
    if (t >= 3) for (let i = 0; i < 3; i++) o += `<path d="M${10 + i * 30} ${70 + i * 6} h20" stroke="#fff" stroke-width=".6" opacity=".6"/>`;
    for (let i = 0; i < 1 + t; i++) {
      const x = side(r(i, 61)), y = 66 + r(i, 62) * 30;
      o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="7" ry="2.6" fill="#2d6a4f"/>`;
      if (i % 2 === 0 || t >= 4) o += `<path d="M${f(x - 4)} ${f(y - 1)} Q${f(x - 3)} ${f(y - 6)} ${f(x)} ${f(y - 7)} Q${f(x + 3)} ${f(y - 6)} ${f(x + 4)} ${f(y - 1)} Z" fill="#ff8fab"/><path d="M${f(x - 1.5)} ${f(y - 2)} Q${f(x)} ${f(y - 8)} ${f(x + 1.5)} ${f(y - 2)} Z" fill="#ffc2d4"/>`;
    }
    if (t >= 5) for (let i = 0; i < (t >= 6 ? 8 : 5); i++) o += `<circle cx="${f(r(i, 63) * 100)}" cy="${f(10 + r(i, 64) * 55)}" r="2.6" fill="url(#${g}-ff)"/>`;
    if (t >= 6) o += `<circle cx="50" cy="20" r="26" fill="url(#${g}-ff)" opacity=".5"/>`;
    return o;
  },
  // Yume — caçada na floresta
  yume: (t, g) => {
    let o = `<defs>${sky(g, '#081c15', t >= 4 ? '#4a1424' : '#1b4332')}${glow(g, 'moon', '#ffd23f', 0.7)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    if (t >= 3) o += `<circle cx="82" cy="16" r="${t >= 5 ? 22 : 14}" fill="url(#${g}-moon)"/><circle cx="82" cy="16" r="7" fill="#ffe8a3" opacity=".85"/>`;
    for (let i = 0; i < 3 + Math.min(t, 4); i++) {
      const x = side((i + r(i, 71) * 0.8) / (3 + Math.min(t, 4))), w = 3 + r(i, 72) * 4;
      o += `<rect x="${f(x)}" y="0" width="${f(w)}" height="100" fill="#04100b" opacity="${f(0.7 + r(i, 73) * 0.3)}"/>`;
    }
    o += `<path d="M0 100 V80 Q20 70 40 82 T80 78 T100 82 V100 Z" fill="#03100a"/>`;
    if (t >= 4) for (let i = 0; i < t - 2; i++) { const x = side(r(i, 74)), y = 50 + r(i, 75) * 30; o += `<circle cx="${f(x)}" cy="${f(y)}" r="1" fill="#ff3d5a"/><circle cx="${f(x + 3)}" cy="${f(y)}" r="1" fill="#ff3d5a"/>`; }
    if (t >= 6) for (let i = 0; i < 6; i++) o += `<ellipse cx="${f(r(i, 76) * 100)}" cy="${f(r(i, 77) * 90)}" rx="2" ry="1" fill="#e94560" transform="rotate(${f(r(i, 78) * 180)} ${f(r(i, 76) * 100)} ${f(r(i, 77) * 90)})"/>`;
    return o;
  },
  // Zarek — eclipse
  zarek: (t, g) => {
    let o = `<defs>${sky(g, '#1a0505', t >= 4 ? '#7a2e00' : '#3d1206')}${glow(g, 'cor', '#fca311', 0.95)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    o += stars(2 + t * 2, 81, '#ffcf80');
    const R = 7 + t * 1.3, CX = 22, CY = 22;
    o += `<circle cx="${CX}" cy="${CY}" r="${f(R * 1.9)}" fill="url(#${g}-cor)" opacity="${f(0.35 + t * 0.1)}"/>`;
    if (t >= 4) for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; o += `<path d="M${f(CX + Math.cos(a) * R)} ${f(CY + Math.sin(a) * R)} L${f(CX + Math.cos(a) * R * (t >= 6 ? 2.4 : 1.8))} ${f(CY + Math.sin(a) * R * (t >= 6 ? 2.4 : 1.8))}" stroke="#ffd166" stroke-width="${t >= 6 ? 1.4 : 0.8}" opacity=".7"/>`; }
    o += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="#050203" stroke="#ffd166" stroke-width="${f(0.8 + t * 0.25)}"/>`;
    if (t >= 3) o += `<path d="M0 100 V84 L20 76 L36 86 L60 74 L80 84 L100 78 V100 Z" fill="#120404"/>`;
    return o;
  },
  // Kenji — dojô
  kenji: (t, g) => {
    let o = `<defs>${sky(g, '#5a3a1e', t >= 5 ? '#c98a3a' : '#8c5e34')}${glow(g, 'lt', '#ffe66d', 0.8)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    for (let x = 0; x < 100; x += 25) o += `<rect x="${x + 2}" y="8" width="21" height="62" fill="#f6e7c1" opacity=".82"/><path d="M${x + 12.5} 8 V70 M${x + 2} 29 H${x + 23} M${x + 2} 50 H${x + 23}" stroke="#5a3a1e" stroke-width="1"/>`;
    o += `<rect y="70" width="100" height="30" fill="#6b4423"/><path d="M0 78 H100 M0 88 H100" stroke="#4a2e15" stroke-width=".8"/>`;
    if (t >= 3) for (const x of t >= 6 ? [3, 83] : [3]) o += `<rect x="${x}" y="6" width="14" height="30" fill="#fff8e7" stroke="#8c2f1e" stroke-width="1.4"/><path d="M${x + 4} 13 h6 M${x + 7} 11 v18 M${x + 4} 24 l6 3" stroke="#1b1b1b" stroke-width="1.4"/>`;
    if (t >= 5) o += `<ellipse cx="50" cy="50" rx="58" ry="46" fill="url(#${g}-lt)" opacity=".6"/>`;
    if (t >= 6) for (const x of [8, 92]) o += `<path d="M${x - 6} 100 Q${x - 8} 80 ${x} 60 Q${x + 8} 80 ${x + 6} 100 Z" fill="#ff7b00" opacity=".75"/><path d="M${x - 3} 100 Q${x - 3} 86 ${x} 74 Q${x + 3} 86 ${x + 3} 100 Z" fill="#ffe66d"/>`;
    return o;
  },
  // Nyx-07 — laboratório tecnológico
  nyx: (t, g) => {
    let o = `<defs>${sky(g, '#061218', t >= 5 ? '#0b3b45' : '#12262e')}${glow(g, 'holo', '#00f5d4', 0.7)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    let grid = '';
    for (let i = 0; i <= 10; i++) grid += `M${i * 10} 0 V100 M0 ${i * 10} H100 `;
    o += `<path d="${grid}" stroke="#00f5d4" stroke-width=".25" opacity="${f(0.15 + t * 0.04)}"/>`;
    o += `<path d="M0 20 H18 L24 26 H40 M100 30 H82 L76 36 H62 M0 70 H12 L18 64 H30 M100 76 H86 L80 70 H70" fill="none" stroke="#00f5d4" stroke-width=".8" opacity=".6"/>`;
    if (t >= 3) o += `<rect x="4" y="34" width="20" height="14" rx="1.5" fill="#00f5d4" opacity=".18" stroke="#00f5d4" stroke-width=".6"/><rect x="76" y="44" width="20" height="14" rx="1.5" fill="#ff006e" opacity=".18" stroke="#ff006e" stroke-width=".6"/>`;
    if (t >= 5) o += `<ellipse cx="50" cy="94" rx="40" ry="7" fill="none" stroke="#00f5d4" stroke-width="1" opacity=".8"/><ellipse cx="50" cy="94" rx="30" ry="5" fill="url(#${g}-holo)"/>`;
    if (t >= 6) for (let i = 0; i < 8; i++) o += `<rect x="${f(r(i, 91) * 100)}" y="${f(r(i, 92) * 60)}" width=".8" height="${f(6 + r(i, 93) * 12)}" fill="#00f5d4" opacity=".7"/>`;
    return o;
  },
  // Vorax (e a Cria) — abismo sombrio
  vorax: (t, g) => {
    let o = `<defs>${sky(g, '#020403', t >= 5 ? '#2a0838' : '#0d1f17')}${glow(g, 'rift', '#b5ff3b', 0.7)}</defs><rect width="100" height="100" fill="url(#${g}-sky)"/>`;
    if (t >= 6) for (let i = 0; i < 3; i++) o += `<circle cx="50" cy="40" r="${18 + i * 12}" fill="none" stroke="#7b2cbf" stroke-width="1.2" opacity="${f(0.6 - i * 0.15)}" stroke-dasharray="6 4"/>`;
    for (let i = 0; i < Math.min(2 + t, 7); i++) { const x = side(r(i, 101)), y = 10 + r(i, 102) * 50; o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.6" ry=".8" fill="#ff0054" opacity=".85"/>`; }
    if (t >= 5) o += `<path d="M14 6 L20 30 L12 52" fill="none" stroke="url(#${g}-rift)" stroke-width="4"/><path d="M14 6 L20 30 L12 52" fill="none" stroke="#e0ffb0" stroke-width=".8"/>`;
    for (let i = 0; i < 2 + Math.min(t, 4); i++) { const x = 4 + i * (92 / (1 + Math.min(t, 4))), h = 20 + r(i, 103) * 20 + t * 2; o += `<path d="M${f(x - 4)} 100 Q${f(x - 6)} ${f(100 - h / 2)} ${f(x + (r(i, 104) - 0.5) * 10)} ${f(100 - h)} Q${f(x + 2)} ${f(100 - h / 2)} ${f(x + 4)} 100 Z" fill="#0a1a12" stroke="#2d6a4f" stroke-width=".6"/>`; }
    return o;
  },
};
SCENES.cria = SCENES.vorax;

export function sceneSVG(charId: string, t: number, gid: string, fallback: string): string {
  const s = SCENES[charId];
  return s ? s(t, gid) : `<rect width="100" height="100" fill="${fallback}"/>`;
}
export const SCENE_IDS = Object.keys(SCENES);
