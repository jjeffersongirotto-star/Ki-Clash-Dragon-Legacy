/**
 * v0.10.2 — Cartas das GRADES (Coleção, Equipe, lista do Treinar, janela de troca) viram
 * imagens prontas ("quadro congelado").
 *
 * Para cada (personagem, cor, bloqueada?) o jogo desenha UMA vez, num canvas, o fundo da arte
 * já com a aura de Ki e os raios (Épico+) misturados (modo "screen", igual ao CSS), e o
 * personagem já com a sombra. O resultado vira um bitmap (blob PNG) no tamanho certo para a
 * densidade de pixels da tela. Na grade, cada carta é então só 2 <img> estáticos + textos:
 * sem animação, sem filtro, sem mix-blend-mode, sem camadas extras — rolar a tela não
 * redesenha nenhuma carta. As cartas em foco (detalhes, Treinar, mão, inspeção, Despertar)
 * continuam com o visual animado completo.
 */
import type { CharacterDef } from '../core/types';
import { portraitImg, portraitSVG } from './art';

/** proporção da arte da carta (`.card-art { aspect-ratio: .82 }`) */
const ART_RATIO = 0.82;
/** opacidade da aura por cor (mesmos valores do CSS) */
const AURA_OPACITY = [0, 0.4, 0.55, 0.7, 0.85, 0.85, 0.85];

type Baked = { bg: string; fg: string };
const BAKED = new Map<string, Baked>();
const PENDING = new Map<string, Promise<void>>();

export const gridKey = (def: CharacterDef, t: number, locked: boolean) => `${def.id}|${t}|${locked ? 'L' : ''}`;

/** HTML da arte de uma carta de grade: bitmap pronto se existir; senão, o SVG estático (troca sozinho quando ficar pronto). */
export function gridArtHTML(def: CharacterDef, t: number, locked: boolean): { bg: string; fg: string; baked: boolean } {
  const key = gridKey(def, t, locked);
  const b = BAKED.get(key);
  const img = (src: string, layer: string) => `<img class="portrait" data-gk="${key}|${layer}" src="${src}" alt="" draggable="false" decoding="async">`;
  if (b) return { bg: img(b.bg, 'bg'), fg: img(b.fg, 'fg'), baked: true };
  const src = (h: string) => h.slice(h.indexOf('src="') + 5, h.indexOf('" alt'));
  return { bg: img(src(portraitImg(def, { stars: t, layer: 'bg' })), 'bg'), fg: img(src(portraitImg(def, { stars: t, layer: 'fg' })), 'fg'), baked: false };
}

// ---------------- desenho no canvas (só no navegador) ----------------
function svgWithSize(svg: string, w: number, h: number, extra?: 'shadow'): string {
  let s = svg.replace(/>\s+</g, '><').trim().replace('<svg ', `<svg width="${w}" height="${h}" `);
  if (extra === 'shadow') {
    // mesma sombra do CSS (.card-fig drop-shadow 0 1.8cqw 1.8cqw rgba(0,0,0,.65)), em unidades do viewBox
    s = s.replace('<defs>', '<defs><filter id="gk-ds" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="1.67" stdDeviation="0.83" flood-color="#000" flood-opacity=".65"/></filter>');
    const i = s.indexOf('</defs>') + '</defs>'.length;
    const j = s.lastIndexOf('</svg>');
    s = `${s.slice(0, i)}<g filter="url(#gk-ds)">${s.slice(i, j)}</g></svg>`;
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

function hexRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

/** aura de Ki (gradiente elíptico) + raios girando no quadro inicial (Épico+), como no CSS */
function drawAura(W: number, H: number, t: number, aura: string): HTMLCanvasElement {
  const [c, g] = canvas(W, H);
  const [r, gg, b] = hexRgb(aura);
  // .card-aura: radial-gradient(ellipse 60% 65% at 50% 68%, mix(ac 80%, #fff) 0%, mix(ac 50%, transparent) 38%, transparent 72%)
  g.save();
  g.translate(W * 0.5, H * 0.68);
  g.scale(W * 0.6, H * 0.65);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  rg.addColorStop(0, `rgb(${Math.round(r * 0.8 + 51)},${Math.round(gg * 0.8 + 51)},${Math.round(b * 0.8 + 51)})`);
  rg.addColorStop(0.38, `rgba(${r},${gg},${b},.5)`);
  rg.addColorStop(0.72, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = rg;
  g.fillRect(-3, -3, 6, 6);
  g.restore();
  if (t >= 4 && 'createConicGradient' in g) {
    // ::before inset -40%, conic "from 0deg at 50% 62%" (raios de 6° a cada 20°), máscara radial 15%→55%
    const cx = W * 0.5, cy = -0.4 * H + 0.62 * 1.8 * H;
    const [rc, rgc] = canvas(W, H);
    const cg = rgc.createConicGradient(-Math.PI / 2, cx, cy);
    const col = `rgba(${r},${gg},${b},.55)`;
    for (let k = 0; k < 18; k++) {
      const a = (k * 20) / 360, e = (k * 20 + 6) / 360;
      cg.addColorStop(a, col);
      cg.addColorStop(e, col);
      cg.addColorStop(Math.min(1, e + 0.0001), 'rgba(0,0,0,0)');
      cg.addColorStop(Math.min(1, (k * 20 + 20) / 360 - 0.0001), 'rgba(0,0,0,0)');
    }
    rgc.fillStyle = cg;
    rgc.fillRect(0, 0, W, H);
    const corners = [[-0.4 * W, -0.4 * H], [1.4 * W, -0.4 * H], [-0.4 * W, 1.4 * H], [1.4 * W, 1.4 * H]];
    const far = Math.max(...corners.map(([x, y]) => Math.hypot(x - cx, y - cy)));
    const mg = rgc.createRadialGradient(cx, cy, 0, cx, cy, far);
    mg.addColorStop(0.15, 'rgba(0,0,0,1)');
    mg.addColorStop(0.55, 'rgba(0,0,0,0)');
    rgc.globalCompositeOperation = 'destination-in';
    rgc.fillStyle = mg;
    rgc.fillRect(0, 0, W, H);
    g.globalAlpha = t >= 6 ? 0.8 : 0.55;
    g.drawImage(rc, 0, 0);
    g.globalAlpha = 1;
  }
  return c;
}

function toUrl(c: HTMLCanvasElement): Promise<string> {
  return new Promise((res) => c.toBlob((bl) => res(bl ? URL.createObjectURL(bl) : c.toDataURL()), 'image/png'));
}

/** tamanho do bitmap: largura máx. de uma carta de grade × densidade de pixels (nem maior) */
function bitmapWidth(): number {
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  return Math.round(Math.min(480, Math.max(160, 170 * dpr)));
}

async function bake(def: CharacterDef, t: number, locked: boolean): Promise<void> {
  const key = gridKey(def, t, locked);
  const W = bitmapWidth();
  const H = Math.round(W / ART_RATIO);
  const FW = Math.round(W * 1.08);
  const [bgImg, fgImg] = await Promise.all([
    loadImg(svgWithSize(portraitSVG(def, { stars: t, layer: 'bg' }), W, H)),
    loadImg(svgWithSize(portraitSVG(def, { stars: t, layer: 'fg' }), FW, FW, 'shadow')),
  ]);
  const [bc0, bg0] = canvas(W, H);
  bg0.drawImage(bgImg, 0, 0, W, H);
  bg0.globalCompositeOperation = 'screen';
  bg0.globalAlpha = AURA_OPACITY[t];
  bg0.drawImage(drawAura(W, H, t, def.palette.aura), 0, 0);
  const [fc0, fg0] = canvas(FW, FW);
  fg0.drawImage(fgImg, 0, 0, FW, FW);
  let bc = bc0, fc = fc0;
  if (locked) {
    // bloqueada: o antigo `filter: grayscale(1)` + `brightness(.45)` + `opacity: .55` da carta
    // ficam prontos no bitmap (cinza escurecido), sem nenhum filtro CSS na grade
    const grey = (src: HTMLCanvasElement) => {
      const [c, g] = canvas(src.width, src.height);
      g.filter = 'grayscale(1) brightness(.45)';
      g.drawImage(src, 0, 0);
      g.filter = 'none';
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(11,13,26,.45)';
      g.fillRect(0, 0, c.width, c.height);
      return c;
    };
    bc = grey(bc0);
    fc = grey(fc0);
  }
  const [bgUrl, fgUrl] = await Promise.all([toUrl(bc), toUrl(fc)]);
  BAKED.set(key, { bg: bgUrl, fg: fgUrl });
  // decodifica fora da thread principal antes de trocar
  await Promise.all([bgUrl, fgUrl].map((u) => { const im = new Image(); im.src = u; return im.decode?.().catch(() => {}); }));
  // troca nas cartas já na tela (a grade foi aberta antes do bitmap ficar pronto)
  document.querySelectorAll<HTMLImageElement>(`img[data-gk^="${key}|"]`).forEach((im) => {
    im.src = im.dataset.gk!.endsWith('|bg') ? bgUrl : fgUrl;
    im.closest('.card')?.classList.add('baked');
  });
}

/** Prepara (em tempo ocioso, um por vez) os bitmaps das cartas de grade. */
export function bakeGridArt(list: { def: CharacterDef; stars: number; locked?: boolean }[]): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  const jobs = list.map(({ def, stars, locked }) => {
    const t = Math.max(1, Math.min(6, stars));
    const key = gridKey(def, t, !!locked);
    if (BAKED.has(key)) return Promise.resolve();
    let p = PENDING.get(key);
    if (!p) {
      p = new Promise<void>((res) => {
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
        const run = () => bake(def, t, !!locked).catch(() => {}).then(res);
        if (ric) ric(run, { timeout: 400 });
        else setTimeout(run, 0);
      });
      PENDING.set(key, p);
    }
    return p;
  });
  return Promise.all(jobs).then(() => {});
}
