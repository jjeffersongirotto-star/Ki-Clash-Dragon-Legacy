/**
 * v0.67.4 — Calibração da escada do Normal e do Difícil pela VITÓRIA AO CHEGAR.
 * npx vite-node scripts/balance/ladder.ts [jogadores] [primeiro] [saida.json]
 *
 * Ordem de jogo intercalada, como o jogo foi pensado: a Normal k entra logo depois da Fácil 5 + 2·(k − 1) (a de mesma
 * dificuldade) e a Difícil k logo depois da Normal 5 + 2·(k − 1). Em cada fase do Normal/Difícil, procura (bisseção) o
 * degrau extra das cartas inimigas para a vitória ao chegar ficar no alvo:
 *   Normal: 65% na fase 1 → 25% na fase 100 · Difícil: 55% na fase 1 → 15% na fase 100.
 * O degrau extra nunca é negativo (nunca fica mais fácil que a escada de antes). Grava o degrau extra de cada fase.
 */
import { writeFileSync } from 'node:fs';
import { runCampaign, mean, STAGE_MAP } from './progression';
import { easyCurve, hardStageAt, stageFor, type Difficulty } from '../../src/core/adventure';
import { WORLD_STAGES, type Stage } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 1);
const first = Number(process.argv[3] ?? 0);
const out = process.argv[4];
const PROBE = Number(process.env.PROBE ?? 12);
export const target = (d: 'normal' | 'dificil', k: number) => (d === 'normal' ? 0.65 : 0.55) - (0.4 * (k - 1)) / 99;
const base = (d: 'normal' | 'dificil', k: number) => easyCurve(d === 'normal' ? 5 + 2 * (k - 1) : 13 + 4 * (k - 1));

// ordem intercalada
const order: { id: number; diff: Difficulty }[] = [];
let n = 0, h = 0;
const doHard = () => { while (h < 100 && 5 + 2 * h <= n) order.push({ id: ++h, diff: 'dificil' }); };
const doNormal = (f: number) => { while (n < 100 && 5 + 2 * n <= f) { order.push({ id: ++n, diff: 'normal' }); doHard(); } };
for (let f = 1; f <= 100; f++) { order.push({ id: f, diff: 'facil' }); doNormal(f); }
while (n < 100) { order.push({ id: ++n, diff: 'normal' }); doHard(); }
while (h < 100) order.push({ id: ++h, diff: 'dificil' });

const stages: Stage[] = order.map((o) => (o.diff === 'facil' ? WORLD_STAGES[o.id - 1] : stageFor(o.id, o.diff)));
STAGE_MAP.fn = (i) => order[i];
const bonus: Record<'normal' | 'dificil', number[][]> = { normal: [], dificil: [] };
const t0 = Date.now();
const stats = runCampaign({ name: 'escada', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => stages[i].enemyHeroHp }, N, 8, {
  stages, bannerGold: true, maxAttempts: 60, firstPlayer: first,
  onPlayer: (pi) => console.error(`jogador ${pi} (${Math.round((Date.now() - t0) / 1000)} s)`),
  pick: (i, winAt) => {
    const { id: k, diff: d } = order[i];
    if (d === 'facil') return undefined;
    const T = target(d, k), s0 = base(d, k);
    const at = (b: number) => hardStageAt(k, d, Math.min(17.99, s0 + b));
    let lo = 0, hi = Math.min(6, 17.99 - s0);
    if (winAt(at(0), PROBE) <= T) hi = 0;
    else for (let it = 0; it < 6; it++) { const m = (lo + hi) / 2; if (winAt(at(m), PROBE) > T) lo = m; else hi = m; }
    (bonus[d][k - 1] ??= []).push(hi);
    return at(hi);
  },
});
const res = { order, bonus, win: stats.map((s) => s.winAtArrival) };
if (out) writeFileSync(out, JSON.stringify(res));
for (const d of ['normal', 'dificil'] as const)
  for (let r = 0; r < 10; r++) {
    const idx = order.map((o, i) => (o.diff === d && o.id > r * 10 && o.id <= r * 10 + 10 ? i : -1)).filter((i) => i >= 0);
    console.log(`${d} região ${r + 1}: vitória ao chegar ${Math.round(100 * mean(idx.map((i) => mean(res.win[i]))))}% · degrau extra ${mean(idx.map((i) => mean(bonus[d][order[i].id - 1] ?? [0]))).toFixed(2)}`);
  }
