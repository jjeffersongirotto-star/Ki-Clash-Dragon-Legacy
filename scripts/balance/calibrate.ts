/**
 * Calibração do PODER das cartas (v0.13.0).
 * Gera milhares de baralhos aleatórios (personagem, cor, "+", nível), joga IA × IA e ajusta uma
 * regressão logística: logit P(A vence) = b0 + Σ_c w_c · (f_c(A) − f_c(B)),
 * com f = ataque^a · vida^(1−a) / custo^g. O peso w_c de cada personagem é o "peso da habilidade".
 */
import { simulate } from './sim';
import { PLAYABLE } from '../../src/core/characters';
import { statsFor, maxLevel, stepStartLevel } from '../../src/core/progression';
import { nextRandom } from '../../src/core/rng';
import type { CardInstance } from '../../src/core/types';

const N_MATCH = Number(process.argv[2] ?? 6000);
const rng = { seed: 12345 };
const R = () => nextRandom(rng);
const chars = PLAYABLE;
const idx = Object.fromEntries(chars.map((c, i) => [c.id, i]));

function randomCard(id: string): CardInstance {
  const d = chars[idx[id]];
  const stars = d.minStars + Math.floor(R() * (d.maxStars - d.minStars + 1));
  const plus = R() < 0.5;
  const lo = stepStartLevel(stars, plus), hi = maxLevel(stars, plus);
  return { charId: id, stars, plus, level: lo + Math.floor(R() * (hi - lo + 1)) };
}
function randomDeck(): CardInstance[] {
  const ids = chars.map((c) => c.id).sort(() => R() - 0.5).slice(0, 10);
  return ids.map(randomCard);
}
const st = (c: CardInstance) => { const d = chars[idx[c.charId]]; return { ...statsFor(d, c.level, c.stars, !!c.plus), cost: d.cost }; };
const crude = (deck: CardInstance[]) => deck.reduce((s, c) => { const x = st(c); return s + Math.sqrt(x.atk * x.hp); }, 0);

// pares com força bruta parecida (partidas informativas)
const decks = Array.from({ length: N_MATCH * 2 }, randomDeck).map((d) => ({ d, s: crude(d) })); // pareamento ALEATÓRIO: precisamos de diferenças de força para medir o valor de cada carta
interface M { a: CardInstance[]; b: CardInstance[]; y: number }
const matches: M[] = [];
const t0 = performance.now();
for (let i = 0; i + 1 < decks.length; i += 2) {
  const a = decks[i].d, b = decks[i + 1].d;
  // joga as duas ordens (quem começa) para tirar a vantagem de iniciar
  for (const [p, e, sign] of [[a, b, 1], [b, a, -1]] as const) {
    const r = simulate(p, e, 20, 20, 1000 + matches.length);
    if (r.winner === 'empate') continue;
    const pw = r.winner === 'player' ? 1 : 0;
    matches.push(sign === 1 ? { a, b, y: pw } : { a: b, b: a, y: pw });
  }
}
// embaralha antes de separar treino/teste (os pares foram gerados em ordem de força)
matches.sort(() => R() - 0.5);
console.error('partidas', matches.length, 'tempo', ((performance.now() - t0) / 1000).toFixed(1), 's');

function features(deck: CardInstance[], a: number, g: number): Float64Array {
  const f = new Float64Array(chars.length);
  for (const c of deck) { const x = st(c); f[idx[c.charId]] += Math.pow(x.atk, a) * Math.pow(x.hp, 1 - a) / Math.pow(x.cost, g); }
  return f;
}
function fit(a: number, g: number) {
  // diferença RELATIVA: dividida pela força média dos dois baralhos (o que importa é a razão de forças)
  const X = matches.map((m) => { const fa = features(m.a, a, g), fb = features(m.b, a, g); const sa = fa.reduce((x, y) => x + y, 0), sb = fb.reduce((x, y) => x + y, 0); const norm = (sa + sb) / 2 / 10; return fa.map((v, i) => (v - fb[i]) / norm); });
  const n = X.length, k = chars.length;
  const split = Math.floor(n * 0.8);
  // Newton–Raphson (IRLS) com ridge leve: parâmetros = [b0, w_1..w_k]
  const K = k + 1;
  const beta = new Float64Array(K);
  const lam = 1e-4;
  const rows = Array.from({ length: split }, (_, i) => { const r = new Float64Array(K); r[0] = 1; for (let j = 0; j < k; j++) r[j + 1] = X[i][j]; return r; });
  for (let it = 0; it < 40; it++) {
    const H = Array.from({ length: K }, () => new Float64Array(K));
    const gr = new Float64Array(K);
    for (let i = 0; i < split; i++) {
      const r = rows[i]; let z = 0; for (let j = 0; j < K; j++) z += beta[j] * r[j];
      const p = 1 / (1 + Math.exp(-z)); const e = p - matches[i].y; const wt = p * (1 - p);
      for (let j = 0; j < K; j++) { gr[j] += e * r[j]; const rj = r[j] * wt; for (let l = 0; l < K; l++) H[j][l] += rj * r[l]; }
    }
    for (let j = 1; j < K; j++) { H[j][j] += lam * split; gr[j] += lam * split * beta[j]; }
    const A = H.map((r, j) => [...r, gr[j]]);
    for (let c = 0; c < K; c++) {
      let piv = c; for (let r = c + 1; r < K; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]];
      for (let r = 0; r < K; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let l = c; l <= K; l++) A[r][l] -= f * A[c][l]; }
    }
    let step = 0; for (let j = 0; j < K; j++) { const d = A[j][K] / A[j][j]; beta[j] -= d; step = Math.max(step, Math.abs(d)); }
    if (step < 1e-8) break;
  }
  const b0 = beta[0]; const w = beta.slice(1);
  let ll = 0, acc = 0;
  for (let i = split; i < n; i++) {
    let z = b0; for (let j = 0; j < k; j++) z += w[j] * X[i][j];
    const p = Math.min(1 - 1e-9, Math.max(1e-9, 1 / (1 + Math.exp(-z))));
    ll += -(matches[i].y * Math.log(p) + (1 - matches[i].y) * Math.log(1 - p));
    acc += (p > 0.5 ? 1 : 0) === matches[i].y ? 1 : 0;
  }
  return { a, g, w: Array.from(w), b0, ll: ll / (n - split), acc: acc / (n - split) };
}
const results = [];
for (const a of [0.4, 0.5, 0.6]) for (const g of [0, 0.25, 0.5]) { const r = fit(a, g); results.push(r); console.error(`a=${a} g=${g} logloss=${r.ll.toFixed(4)} acerto=${(r.acc * 100).toFixed(1)}%`); }
results.sort((x, y) => x.ll - y.ll);
const best = results[0];
console.log(JSON.stringify({ best: { a: best.a, g: best.g, b0: best.b0, ll: best.ll, acc: best.acc, w: Object.fromEntries(chars.map((c, i) => [c.id, +best.w[i].toFixed(4)])) }, all: results.map((r) => ({ a: r.a, g: r.g, ll: +r.ll.toFixed(4), acc: +r.acc.toFixed(3) })) }, null, 1));

// ---- Modelo escolhido: a = 0.5 (média geométrica ataque×vida), g = 0 (o custo já entra no peso do personagem) ----
const chosen = results.find((r) => r.a === 0.5 && r.g === 0)!;
const mean = chosen.w.reduce((x: number, y: number) => x + y, 0) / chosen.w.length;
const wn = Object.fromEntries(chars.map((c, i) => [c.id, +(chosen.w[i] / mean).toFixed(3)]));
// validação: só a RAZÃO de Poder dos baralhos prevê o vencedor?
const pw = (deck: CardInstance[]) => deck.reduce((s, c) => { const x = st(c); return s + wn[c.charId] * Math.sqrt(x.atk * x.hp); }, 0);
const bins: Record<string, { n: number; w: number }> = {};
for (const m of matches) {
  const r = pw(m.a) / pw(m.b);
  const k = r < 0.8 ? '<0.80' : r < 0.9 ? '0.80-0.90' : r < 0.97 ? '0.90-0.97' : r < 1.03 ? '0.97-1.03' : r < 1.1 ? '1.03-1.10' : r < 1.25 ? '1.10-1.25' : '>1.25';
  (bins[k] ??= { n: 0, w: 0 }).n++; bins[k].w += m.y;
}
console.error('peso normalizado (média 1):', JSON.stringify(wn));
for (const k of ['<0.80', '0.80-0.90', '0.90-0.97', '0.97-1.03', '1.03-1.10', '1.10-1.25', '>1.25']) if (bins[k]) console.error(`razão de Poder ${k}: n=${bins[k].n} vitória do jogador ${(100 * bins[k].w / bins[k].n).toFixed(1)}%`);
