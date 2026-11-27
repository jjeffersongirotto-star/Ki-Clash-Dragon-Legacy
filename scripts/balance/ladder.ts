/**
 * v0.67.4 — Calibração da escada do Normal e do Difícil pela VITÓRIA AO CHEGAR.
 * npx vite-node scripts/balance/ladder.ts [jogadores] [primeiro] [saida.json]
 *
 * Ordem de jogo intercalada, como o jogo foi pensado: a Normal k entra logo depois da Fácil 5 + 2·(k − 1) (a de mesma
 * dificuldade) e a Difícil k logo depois da Normal 5 + 2·(k − 1). Em cada fase (menos as 10 do primeiro mundo), procura
 * (bisseção) o degrau das cartas inimigas para a vitória ao chegar ficar no alvo. v0.70.0: Fácil 97% (fase 1) → 30%
 * (fase 100), todas as 100 fases (Fácil 1 e 2 só com Comuns) · Normal 50% → 20% · Difícil 45% → 12%.
 * Grava o degrau extra de cada fase. CALIB=0 só mede a escada que está no jogo.
 */
import { writeFileSync } from 'node:fs';
import { runCampaign, mean, STAGE_MAP } from './progression';
import { easyCurve, hardStageAt, ladderStep, stageFor, type Difficulty } from '../../src/core/adventure';
import { WORLD_STAGES, WORLD_STEPS, enemyDeckFor, type Stage } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 1);
const first = Number(process.argv[3] ?? 0);
const out = process.argv[4];
const PROBE = Number(process.env.PROBE ?? 12);
// v0.71.0 (pedido do jogador): curva mais suave — Fácil 97%→45%, Normal 55%→30%, Difícil 50%→20% (o simulador joga pior que uma pessoa)
// v0.70.0 (pedido do jogador): o Fácil começa perto de 100% e cai devagar até ~30% na fase 100
export const target = (d: Difficulty, k: number) =>
  d === 'facil' ? 0.97 - (0.52 * (k - 1)) / 99 : d === 'normal' ? 0.55 - (0.25 * (k - 1)) / 99 : 0.5 - (0.3 * (k - 1)) / 99;
const CALIB = process.env.CALIB !== '0';
// CALIB=2: refina a partir da tabela atual (LADDER_STEPS), com margem de 3 pontos abaixo do alvo
const REFINE = process.env.CALIB === '2';
const MARGIN = REFINE ? 0.03 : 0;
const base = (d: Difficulty, k: number) => (d === 'facil' ? WORLD_STEPS[k - 1] : CALIB && !REFINE ? easyCurve(d === 'normal' ? 5 + 2 * (k - 1) : 13 + 4 * (k - 1)) : ladderStep(d, k));
const stageAt = (d: Difficulty, k: number, s: number): Stage =>
  d === 'facil' ? { ...WORLD_STAGES[k - 1], enemyDeck: enemyDeckFor(k - 1, s) } : hardStageAt(k, d, s);

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
const bonus: Record<Difficulty, number[][]> = { facil: [], normal: [], dificil: [] };
const t0 = Date.now();
const stats = runCampaign({ name: 'escada', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => stages[i].enemyHeroHp }, N, 8, {
  stages, bannerGold: true, maxAttempts: 60, firstPlayer: first,
  onPlayer: (pi) => console.error(`jogador ${pi} (${Math.round((Date.now() - t0) / 1000)} s)`),
  pick: !CALIB ? undefined : (i, winAt) => {
    const { id: k, diff: d } = order[i];
    if (d === 'facil' && k <= 10) return undefined; // v0.71.0: região 1 ajustada à mão (baralhos menores, IA simples)
    const T = target(d, k) - MARGIN, s0 = base(d, k);
    // v0.70.0: Fácil 1 e 2 só com cartas Comuns (degrau até 2 = Comum++)
    const top = d === 'facil' && k <= 2 ? 2 : 17.99;
    const at = (b: number) => stageAt(d, k, Math.max(0, Math.min(top, s0 + b)));
    let lo: number, hi: number;
    const w0 = winAt(at(0), PROBE);
    // v0.71.0: já perto da meta → mantém o degrau, sem buscar (poupa ~6 medições por fase). Pedido do jogador: um pouco
    // abaixo da meta pode ficar (até 10 pontos) — mais recursos (missões diárias, torre…) ajudam a passar.
    if (w0 <= T + 0.06 && w0 >= T - 0.1) { (bonus[d][k - 1] ??= []).push(0); return at(0); }
    if (w0 > T) { lo = 0; hi = Math.min(6, 17.99 - s0); }
    else { lo = -Math.min(6, s0); hi = 0; }
    for (let it = 0; it < 6; it++) { const m = (lo + hi) / 2; if (winAt(at(m), PROBE) > T) lo = m; else hi = m; }
    // v0.71.0: fica com o lado que ainda passa da meta (lo). O `hi` caía às vezes logo depois de um "degrau" em que a
    // vitória despenca (troca de raridade dos inimigos) e a fase ficava com 0% ao chegar.
    (bonus[d][k - 1] ??= []).push(lo);
    return at(lo);
  },
});
const res = { order, bonus, win: stats.map((s) => s.winAtArrival), pow: stats.map((s) => s.arrivePower), blocked: stats.map((s) => s.blocked), days: stats.map((s) => s.days), tower: stats.map((s) => s.tower) };
if (out) writeFileSync(out, JSON.stringify(res));
for (const d of ['facil', 'normal', 'dificil'] as const)
  for (let r = 0; r < 10; r++) {
    const idx = order.map((o, i) => (o.diff === d && o.id > r * 10 && o.id <= r * 10 + 10 ? i : -1)).filter((i) => i >= 0);
    console.log(`${d} região ${r + 1}: vitória ao chegar ${Math.round(100 * mean(idx.map((i) => mean(res.win[i]))))}% · degrau extra ${mean(idx.map((i) => mean(bonus[d][order[i].id - 1] ?? [0]))).toFixed(2)} · travadas por recurso ${Math.round(100 * mean(idx.map((i) => mean(res.blocked[i]))))}% · dia ${Math.round(mean(res.days[idx[idx.length - 1]]))} · Torre ${Math.round(mean(res.tower[idx[idx.length - 1]]))}`);
  }
