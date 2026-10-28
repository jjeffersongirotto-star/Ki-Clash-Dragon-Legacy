/**
 * v0.37.0 — compara a IA esperta (níveis 1–3) com a simples (nível 0) em baralhos espelhados.
 * Rodar: npx vite-node scripts/balance/aibench.ts [partidas] [níveis, ex. 0,1,2,3]
 * O jogador usa sempre a IA simples; o inimigo usa o nível testado. Mesmo baralho dos dois lados (fases 4–10).
 */
import { createBattle, Ctx, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy, simpleDeploy } from '../../src/core/ai';
import { AI_STATS } from '../../src/core/aiSmart';
import { STAGES } from '../../src/core/campaign';

const N = Number(process.argv[2] ?? 30);
const levels = (process.argv[3] ?? '0,1,2,3').split(',').map(Number);
for (const level of levels) {
  let wins = 0, losses = 0, turns = 0, enemyTurns = 0, ms = 0, worst = 0;
  AI_STATS.rollouts = 0;
  for (let k = 0; k < N; k++) {
    const st = STAGES[3 + (k % 7)];
    const s = createBattle({ playerDeck: st.enemyDeck, enemyDeck: st.enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 1000 + k, aiLevel: level });
    let g = 0;
    while (!s.winner && g++ < 200) {
      simpleDeploy(s, new Ctx(), 'player');
      endPlayerTurn(s, (state, ctx, side) => {
        const t0 = performance.now();
        aiDeploy(state, ctx, side);
        const dt = performance.now() - t0;
        ms += dt;
        worst = Math.max(worst, dt);
        enemyTurns++;
      });
    }
    if (s.winner === 'enemy') wins++;
    else if (s.winner === 'player') losses++;
    turns += s.turn;
  }
  console.log(`nível ${level}: inimigo vence ${((100 * wins) / N).toFixed(0)}% · perde ${((100 * losses) / N).toFixed(0)}% · turnos ${(turns / N).toFixed(1)} · ms/turno ${(ms / enemyTurns).toFixed(1)} (pior ${worst.toFixed(0)}) · simulações/turno ${(AI_STATS.rollouts / enemyTurns).toFixed(0)}`);
}
