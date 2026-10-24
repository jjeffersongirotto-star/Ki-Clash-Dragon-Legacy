/**
 * v0.11.2 — Auditoria geométrica do cabelo × cabeça.
 * Achata o caminho SVG (M/L/Q/Z, coordenadas absolutas) em polígono e compara com a cabeça.
 */
export type Pt = [number, number];

export function flatten(d: string): Pt[][] {
  const tok = d.match(/[MLQZ]|-?\d*\.?\d+/g) ?? [];
  const polys: Pt[][] = [];
  let cur: Pt[] = [];
  let i = 0;
  let cmd = '';
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[MLQZ]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'Z') { if (cur.length) polys.push(cur); cur = []; continue; }
    if (cmd === 'M') { if (cur.length) polys.push(cur); cur = [[num(), num()]]; cmd = 'L'; continue; }
    if (cmd === 'L') { cur.push([num(), num()]); continue; }
    if (cmd === 'Q') {
      const p0 = cur[cur.length - 1]; const c: Pt = [num(), num()]; const p1: Pt = [num(), num()];
      for (let k = 1; k <= 8; k++) { const t = k / 8; cur.push([(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]]); }
    }
  }
  if (cur.length) polys.push(cur);
  return polys;
}

export function bbox(polys: Pt[][]) {
  const xs = polys.flat().map((p) => p[0]); const ys = polys.flat().map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

export function inside(polys: Pt[][], [x, y]: Pt): boolean {
  let n = false;
  for (const poly of polys) for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) n = !n;
  }
  return n;
}

export interface Head { cx: number; top: number; w: number; }
/** Mede o cabelo em relação à cabeça: largura relativa, deslocamento do centro e contato com o couro cabeludo. */
export function auditHair(d: string, head: Head) {
  const polys = flatten(d);
  const b = bbox(polys);
  const width = (b.x1 - b.x0) / head.w;
  const offset = ((b.x0 + b.x1) / 2 - head.cx) / head.w;
  // pontos do couro cabeludo logo abaixo do topo da cabeça (centro e laterais do alto da cabeça)
  const scalp: Pt[] = [[head.cx, head.top + 2], [head.cx - head.w * 0.2, head.top + 3.5], [head.cx + head.w * 0.2, head.top + 3.5]];
  const onScalp = scalp.every((p) => inside(polys, p));
  return { bbox: b, width, offset, onScalp, topInFrame: b.y0 >= 0 };
}
