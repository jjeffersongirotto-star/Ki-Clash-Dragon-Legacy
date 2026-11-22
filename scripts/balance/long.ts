/**
 * v0.67.1 — Mundo ESTENDIDO: as 100 fases de hoje + regiões extras em que as cartas inimigas sobem do Épico até o
 * Mítico++, para medir quantas fases (e quanto tempo de jogo) o jogador precisa para chegar ao fim enfrentando
 * Lendários e Míticos. Não muda o jogo.
 * npx vite-node scripts/balance/long.ts [jogadores] [primeiro] [saida.json]
 * EXTRA=4 (regiões a mais) · RSTEP=1.5 (subida do degrau por região) · SIM_SYNERGY=1 (baralho com sinergia).
 */
import { writeFileSync } from 'node:fs';
import { runCampaign, mean, median } from './progression';
import { WORLD_STAGES, enemyCard, type Stage } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { REGIONS, STAGES_PER_REGION } from '../../src/core/world';
import { shuffle } from '../../src/core/rng';

const N = Number(process.argv[2] ?? 2);
const first = Number(process.argv[3] ?? 0);
const out = process.argv[4];
const EXTRA = Number(process.env.EXTRA ?? 4);
const RSTEP = Number(process.env.RSTEP ?? 1.5);
const last = WORLD_STAGES[WORLD_STAGES.length - 1];
const stages: Stage[] = [...WORLD_STAGES];
const rarityOfStep = (t: number) => Math.max(1, Math.min(6, Math.floor(t / 3) + 1));
for (let k = 0; k < EXTRA; k++) {
  const from = 11 + RSTEP * k;
  const races = REGIONS[1 + (k % 9)].races;
  for (let l = 1; l <= STAGES_PER_REGION; l++) {
    const step = Math.min(17, from + (RSTEP * (l - 1)) / (STAGES_PER_REGION - 1));
    const r = rarityOfStep(step);
    const st = { seed: 104729 * (k * 10 + l) };
    const fit = shuffle(PLAYABLE.filter((d) => d.minStars <= r && d.maxStars >= r).map((d) => d.id), st);
    const mine = fit.filter((id) => races.includes(getChar(id).race)).slice(0, 7);
    const pool = [...mine, ...fit.filter((id) => !mine.includes(id))].slice(0, 10);
    stages.push({
      id: stages.length + 1,
      name: `Extra ${k + 1}-${l}`,
      enemyHeroHp: last.enemyHeroHp + 2 * (k + 1),
      enemyDeck: pool.map((id) => ({ ...enemyCard(id, Math.floor(step) + (l % 2 && step % 1 >= 0.5 ? 1 : 0)), copies: 3 })),
      rewards: { essencias: last.rewards.essencias + 30 * (k + 1), orbs: Object.fromEntries(Object.entries(last.rewards.orbs).map(([o, n]) => [o, Math.round((n as number) * Math.pow(2, k + 1))])) },
      pack: [],
      aiLevel: 3,
    });
  }
}
const t0 = Date.now();
const stats = runCampaign({ name: 'longo', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => stages[i].enemyHeroHp }, N, Number(process.env.PROBE ?? 8), {
  stages,
  bannerGold: true,
  maxAttempts: 60,
  firstPlayer: first,
  onPlayer: (pi) => console.error(`jogador ${pi} (${Math.round((Date.now() - t0) / 1000)} s)`),
});
const res = { win: stats.map((s) => s.winAtArrival), att: stats.map((s) => s.attempts), pow: stats.map((s) => s.arrivePower) };
if (out) writeFileSync(out, JSON.stringify(res));
let battles = 0;
for (let r = 1; r <= stages.length / STAGES_PER_REGION; r++) {
  const ids = Array.from({ length: STAGES_PER_REGION }, (_, k) => (r - 1) * STAGES_PER_REGION + k);
  const att = ids.map((i) => median(res.att[i] ?? [0]));
  battles += att.reduce((a, b) => a + b, 0);
  const rar = ['', 'C', 'I', 'R', 'É', 'L', 'M'][Math.max(...stages[ids[ids.length - 1]].enemyDeck.filter((c) => !c.charId.startsWith('f-')).map((c) => c.stars))];
  console.log(`região ${r} (inimigos até ${rar}): vitória ao chegar ${Math.round(100 * mean(ids.map((i) => mean(res.win[i] ?? [0]))))}% · tentativas ${att.join(' ')} · Poder ao chegar ${Math.round(median(res.pow[ids[0]] ?? [0]))} · batalhas acumuladas ${battles}`);
}
