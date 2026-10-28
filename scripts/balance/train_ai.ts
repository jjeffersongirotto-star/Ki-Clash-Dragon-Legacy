/**
 * v0.37.0 — treino da IA esperta contra ela mesma (evolução simples dos pesos da nota).
 * Rodar: npx vite-node scripts/balance/train_ai.ts [gerações] [filhos] [partidas] [nível]
 *
 * A cada geração, o campeão atual gera "filhos" com pesos sorteados por perto (sementes fixas — o treino é
 * reproduzível). Cada filho joga partidas espelhadas contra o campeão (mesmo baralho dos dois lados, cada um uma
 * vez de cada lado, fases 4–10). O filho que vencer mais de 55% vira o novo campeão. No fim grava src/core/aiWeights.ts.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { createBattle, Ctx, endPlayerTurn } from '../../src/core/battle';
import { simpleDeploy } from '../../src/core/ai';
import { smartDeploy } from '../../src/core/aiSmart';
import { AI_WEIGHTS, type AiWeights } from '../../src/core/aiWeights';
import { STAGES } from '../../src/core/campaign';
import type { BattleState } from '../../src/core/types';

const GENS = Number(process.argv[2] ?? 8);
const KIDS = Number(process.argv[3] ?? 6);
const MATCHES = Number(process.argv[4] ?? 28);
const LEVEL = Number(process.argv[5] ?? 2);

let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** partida: `p` joga de jogador, `e` de inimigo (os dois com a IA esperta, pesos diferentes) */
function match(p: AiWeights, e: AiWeights, k: number): 'player' | 'enemy' | 'empate' {
  const st = STAGES[3 + (k % 7)];
  const s: BattleState = createBattle({ playerDeck: st.enemyDeck, enemyDeck: st.enemyDeck, playerHeroHp: 60, enemyHeroHp: 60, seed: 5000 + k });
  let g = 0;
  while (!s.winner && g++ < 200) {
    smartDeploy(s, new Ctx(), 'player', LEVEL, simpleDeploy, p);
    endPlayerTurn(s, (state, ctx, side) => smartDeploy(state, ctx, side, LEVEL, simpleDeploy, e));
  }
  return (s.winner ?? 'empate') as 'player' | 'enemy' | 'empate';
}

/** placar do desafiante contra o campeão (0..1): cada semente jogada dos dois lados */
function score(challenger: AiWeights, champ: AiWeights): number {
  let pts = 0;
  for (let k = 0; k < MATCHES / 2; k++) {
    const a = match(challenger, champ, k);
    const b = match(champ, challenger, k);
    pts += a === 'player' ? 1 : a === 'empate' ? 0.5 : 0;
    pts += b === 'enemy' ? 1 : b === 'empate' ? 0.5 : 0;
  }
  return pts / (2 * Math.floor(MATCHES / 2));
}

const mutate = (w: AiWeights): AiWeights => {
  const out = { ...w };
  for (const k of Object.keys(out) as (keyof AiWeights)[]) if (rand() < 0.5) out[k] = Math.max(0, +(out[k] * (0.6 + rand() * 0.8)).toFixed(2));
  return out;
};

let champ: AiWeights = { ...AI_WEIGHTS };
const t0 = Date.now();
for (let g = 0; g < GENS; g++) {
  let best: { w: AiWeights; s: number } | null = null;
  for (let c = 0; c < KIDS; c++) {
    const kid = mutate(champ);
    const s = score(kid, champ);
    if (!best || s > best.s) best = { w: kid, s };
  }
  if (best && best.s > 0.55) champ = best.w;
  console.log(`geração ${g + 1}: melhor filho ${(100 * best!.s).toFixed(0)}% ${best!.s > 0.55 ? '→ novo campeão' : ''} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
const vsStart = score(champ, AI_WEIGHTS);
console.log(`campeão final contra os pesos iniciais: ${(100 * vsStart).toFixed(0)}%`, JSON.stringify(champ));
const file = 'src/core/aiWeights.ts';
const src = readFileSync(file, 'utf8').replace(/export const AI_WEIGHTS: AiWeights = \{[^}]*\};/, `export const AI_WEIGHTS: AiWeights = { ${Object.entries(champ).map(([k, v]) => `${k}: ${v}`).join(', ')} };`);
writeFileSync(file, src);
