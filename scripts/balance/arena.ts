/**
 * v0.35.0 — compara tamanhos de arena (colunas). npx vite-node scripts/balance/arena.ts [jogadores] [colunas…]
 * Para cada tamanho: vitória ao chegar em cada fase (Fácil, jogador só com personagens e a Loja), turnos por batalha,
 * golpes entre personagens por batalha e dano que chega aos Comandantes por batalha.
 */
import { runCampaign, mean } from './progression';
import { ARENA, resetArena } from './sim';
import { STAGES } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 60);
const sizes = (process.argv.slice(3).length ? process.argv.slice(3) : ['12', '10', '7']).map(Number);
const rows: string[] = [];
for (const cols of sizes) {
  process.env.SIM_COLS = String(cols);
  resetArena();
  const st = runCampaign({ name: `c${cols}`, hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => STAGES[i].enemyHeroHp }, N);
  const b = ARENA.battles || 1;
  const win = st.map((s) => `${Math.round(100 * mean(s.winAtArrival))}%`).join(' · ');
  rows.push(`| ${cols} | ${(ARENA.turns / b).toFixed(1)} | ${(ARENA.clashes / b).toFixed(1)} | ${(ARENA.heroToEnemy / b).toFixed(1)} / ${(ARENA.heroToPlayer / b).toFixed(1)} | ${win} |`);
  console.error(`colunas ${cols}: ${b} batalhas`);
}
console.log('| colunas | turnos/batalha | golpes entre personagens/batalha | dano no Comandante inimigo / no seu, por batalha | vitória ao chegar, fases 1–10 |');
console.log('|---|---|---|---|---|');
for (const r of rows) console.log(r);
