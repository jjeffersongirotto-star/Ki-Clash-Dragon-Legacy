/**
 * v0.28.0 — reequilíbrio do Fácil e estatísticas das estrelas.
 * npx vite-node scripts/balance/v28.ts [jogadores] — jogador só com personagens (SIM_SPELLS=0 recomendado), com a Loja.
 * STEPS="0,0.5,…", HP="12,…" e SPELLS='[[…],…]' testam degraus e vida do Comandante inimigo sem mudar o jogo.
 */
import { runCampaign, report, median, pct } from './progression';
import { STAGES, ENEMY_STEPS, ENEMY_SPELLS, enemyDeckFor } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 100);
const steps = process.env.STEPS ? process.env.STEPS.split(',').map(Number) : ENEMY_STEPS;
const hp = process.env.HP ? process.env.HP.split(',').map(Number) : STAGES.map((s) => s.enemyHeroHp);
const spells: string[][] = process.env.SPELLS ? JSON.parse(process.env.SPELLS) : ENEMY_SPELLS;
STAGES.forEach((s, i) => (s.enemyDeck = enemyDeckFor(i, steps[i], spells[i])));
const stats = runCampaign({ name: 'v28', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => hp[i] }, N);
report(`degraus ${steps.join(',')} · vida ${hp.join(',')}`, stats);
console.log('\nfase | vitórias | vida% p50/p25 | cartas p50/p25/p10 | feitiços p50 | abates p50/p75/p90');
stats.forEach((s, i) => {
  const w = s.winStats;
  if (!w.length) return console.log(`${i + 1} | 0`);
  const c = w.map((x) => x.cards), k = w.map((x) => x.kills), sp = w.map((x) => x.spells), h = s.hpLeftWin.map((x) => Math.round(x * 100));
  console.log(`${i + 1} | ${w.length} | ${median(h)}/${pct(h, 0.25)} | ${median(c)}/${pct(c, 0.25)}/${pct(c, 0.1)} | ${median(sp)} | ${median(k)}/${pct(k, 0.75)}/${pct(k, 0.9)}`);
});
