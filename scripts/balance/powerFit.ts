/**
 * v0.67.3 — Calibração do Poder, parte 2: ajusta o peso de cada carta (regressão logística) com as partidas de powerGen.ts.
 * npx vite-node scripts/balance/powerFit.ts [pasta com cal1..cal4.json]  → calw.json (geo_w = pesos usados em power.ts)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { statsFor } from '../../src/core/progression';
import { abilityWeight } from '../../src/core/power';
const S = process.argv[2] ?? '.';
type C = [string, number, number];
const M: { a: C[]; b: C[]; y: number }[] = [1, 2, 3, 4].flatMap((k) => JSON.parse(readFileSync(`${S}/cal${k}.json`, 'utf8')));
const ids = PLAYABLE.map((c) => c.id); const idx = Object.fromEntries(ids.map((id, i) => [id, i])); const k = ids.length;
const cache = new Map<string, { atk: number; hp: number }>();
const st = (c: C) => { const key = c.join(); let v = cache.get(key); if (!v) { v = statsFor(getChar(c[0]), c[1], c[2]); cache.set(key, v); } return v; };
const forms: Record<string, (x: { atk: number; hp: number }) => number> = {
  geo: (x) => Math.sqrt(Math.max(0.5, x.atk) * x.hp),
  forca: (x) => 2 * x.atk + x.hp,
};
const split = Math.floor(M.length * 0.8);
function fit(form: (x: { atk: number; hp: number }) => number, perChar: boolean) {
  const X = M.map((m) => { const f = new Float64Array(k); for (const c of m.a) f[idx[c[0]]] += form(st(c)); for (const c of m.b) f[idx[c[0]]] -= form(st(c)); let sa = 0, sb = 0; for (const c of m.a) sa += form(st(c)); for (const c of m.b) sb += form(st(c)); const norm = (sa + sb) / 20; for (let j = 0; j < k; j++) f[j] /= norm; return f; });
  // params: b0, beta (soma), d_c (desvio por carta, ridge)
  const K = perChar ? k + 2 : 2; const beta = new Float64Array(K); const lam = 0.02;
  const row = (i: number) => { const r = new Float64Array(K); r[0] = 1; let s = 0; for (let j = 0; j < k; j++) s += X[i][j]; r[1] = s; if (perChar) for (let j = 0; j < k; j++) r[j + 2] = X[i][j]; return r; };
  const rows = Array.from({ length: split }, (_, i) => row(i));
  for (let it = 0; it < 25; it++) {
    const H = Array.from({ length: K }, () => new Float64Array(K)); const g = new Float64Array(K);
    for (let i = 0; i < split; i++) { const r = rows[i]; let z = 0; for (let j = 0; j < K; j++) z += beta[j] * r[j]; const p = 1 / (1 + Math.exp(-z)); const e = p - M[i].y; const w = p * (1 - p); for (let j = 0; j < K; j++) { if (r[j] === 0) continue; g[j] += e * r[j]; const rj = r[j] * w; for (let l = 0; l < K; l++) H[j][l] += rj * r[l]; } }
    for (let j = 2; j < K; j++) { H[j][j] += lam * split; g[j] += lam * split * beta[j]; }
    const A = H.map((r, j) => [...r, g[j]]);
    for (let c = 0; c < K; c++) { let pv = c; for (let r = c + 1; r < K; r++) if (Math.abs(A[r][c]) > Math.abs(A[pv][c])) pv = r; [A[c], A[pv]] = [A[pv], A[c]]; for (let r = 0; r < K; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let l = c; l <= K; l++) A[r][l] -= f * A[c][l]; } }
    let step = 0; for (let j = 0; j < K; j++) { const d = A[j][K] / A[j][j]; beta[j] -= d; step = Math.max(step, Math.abs(d)); } if (step < 1e-7) break;
  }
  let ll = 0, acc = 0; for (let i = split; i < M.length; i++) { const r = row(i); let z = 0; for (let j = 0; j < K; j++) z += beta[j] * r[j]; const p = Math.min(1 - 1e-9, Math.max(1e-9, 1 / (1 + Math.exp(-z)))); ll -= M[i].y * Math.log(p) + (1 - M[i].y) * Math.log(1 - p); acc += (p > 0.5 ? 1 : 0) === M[i].y ? 1 : 0; }
  const n = M.length - split; const w = perChar ? ids.map((_, j) => (beta[1] + beta[j + 2]) / beta[1]) : ids.map(() => 1);
  return { ll: ll / n, acc: acc / n, w };
}
// atual (peso antigo × geo): só a razão
{ let acc = 0; for (let i = split; i < M.length; i++) { let sa = 0, sb = 0; for (const c of M[i].a) sa += abilityWeight(c[0]) * forms.geo(st(c)); for (const c of M[i].b) sb += abilityWeight(c[0]) * forms.geo(st(c)); acc += (sa > sb ? 1 : 0) === M[i].y ? 1 : 0; } console.log('Poder atual: acerto', (100 * acc / (M.length - split)).toFixed(1)); }
const out: Record<string, unknown> = {};
for (const [name, f] of Object.entries(forms)) for (const pc of [false, true]) { const r = fit(f, pc); console.log(name, pc ? 'peso por carta' : 'sem peso', 'logloss', r.ll.toFixed(4), 'acerto', (100 * r.acc).toFixed(1)); out[`${name}${pc ? '_w' : ''}`] = Object.fromEntries(ids.map((id, j) => [id, +r.w[j].toFixed(3)])); }
writeFileSync(`${S}/calw.json`, JSON.stringify(out, null, 1));
