/**
 * v0.41.0 — feitiços colecionáveis: qual feitiço o tutorial dá e como fica a curva da região 1.
 * npx vite-node scripts/balance/v41.ts [jogadores] — Fácil, com a Loja, como o v28.ts.
 * SIM_TUT_SPELL=<id> (ou none) troca o feitiço do tutorial; SIM_ALL_SPELLS=1 = todos liberados (antes da v0.41.0).
 * Imprime a vitória ao chegar em cada fase, a média das fases 1–10 e quantos feitiços o jogador lançou por vitória.
 */
import { runCampaign, mean, median } from './progression';
import { STAGES } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 100);
const stats = runCampaign({ name: 'v41', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => STAGES[i].enemyHeroHp }, N);
const win = stats.map((s) => Math.round(100 * mean(s.winAtArrival)));
const casts = stats.map((s) => (s.winStats.length ? median(s.winStats.map((w) => w.spells)) : 0));
console.log(`${process.env.SIM_TUT_SPELL ?? (process.env.SIM_ALL_SPELLS === '1' ? 'todos' : 'padrão')} | ${win.join(' · ')} | média ${(win.reduce((a, b) => a + b, 0) / win.length).toFixed(1)} | feitiços/vitória ${casts.join(' ')}`);
