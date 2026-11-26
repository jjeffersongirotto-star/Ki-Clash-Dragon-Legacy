/**
 * v0.71.0 — Testa o começo do Fácil (fases 1–12) sem mudar o jogo: quantas cartas diferentes o inimigo tem (D),
 * a vida do Comandante inimigo (H), o nível da IA (A) e o degrau (S), fase a fase.
 * D="3,3,4,…" H="10,12,…" A="0,0,…" S="0,0,…" npx vite-node scripts/balance/region1.ts [jogadores]
 */
import { runCampaign, mean } from './progression';
import { POOLS_V8_FOR_TEST, WORLD_STAGES, enemyDeckFor } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 8);
const list = (v: string | undefined) => (v ? v.split(',').map(Number) : null);
const D = list(process.env.D), H = list(process.env.H), A = list(process.env.A), S = list(process.env.S);
const stages = WORLD_STAGES.slice(0, 12).map((s) => ({ ...s }));
stages.slice(0, 10).forEach((s, i) => {
  const step = S?.[i] ?? 0;
  if (D) {
    const pool = POOLS_V8_FOR_TEST(i, D[i]);
    s.enemyDeck = enemyDeckFor(i, step, undefined, 0, pool);
  } else if (S) s.enemyDeck = enemyDeckFor(i, step);
  if (H) s.enemyHeroHp = H[i];
  if (A) s.aiLevel = A[i];
});
const st = runCampaign({ name: 'r1', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => stages[i].enemyHeroHp }, N, 8, { stages, bannerGold: true, maxAttempts: 60 });
console.log('vitória ao chegar:', st.map((s, i) => `${i + 1}:${Math.round(100 * mean(s.winAtArrival))}`).join(' '));
console.log('tentativas:', st.map((s, i) => `${i + 1}:${mean(s.attempts).toFixed(1)}`).join(' '));
