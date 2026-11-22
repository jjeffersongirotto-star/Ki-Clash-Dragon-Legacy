/**
 * v0.67.1 — Mundo ESTENDIDO: as 100 fases de hoje + regiões extras em que as cartas inimigas sobem do Épico até o
 * Mítico++, para medir quantas fases (e quanto tempo de jogo) o jogador precisa para chegar ao fim enfrentando
 * Lendários e Míticos. Não muda o jogo.
 * npx vite-node scripts/balance/long.ts [jogadores] [primeiro] [saida.json]
 * SIM_SYNERGY=1 (baralho com sinergia). Joga as 300 fases: Fácil, Normal e Difícil.
 */
import { writeFileSync } from 'node:fs';
import { runCampaign, mean, median, STAGE_MAP } from './progression';
import { stageFor, type Difficulty } from '../../src/core/adventure';
import { WORLD_STAGES, type Stage } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';
import { STAGES_PER_REGION } from '../../src/core/world';

const N = Number(process.argv[2] ?? 2);
const first = Number(process.argv[3] ?? 0);
const out = process.argv[4];
// v0.67.1: as 300 fases do jogo em ordem — Fácil 1–100, depois Normal 1–100, depois Difícil 1–100
const DIFFS: Difficulty[] = ['facil', 'normal', 'dificil'];
const stages: Stage[] = DIFFS.flatMap((d) => WORLD_STAGES.map((s) => stageFor(s.id, d)));
STAGE_MAP.fn = (i) => ({ id: (i % 100) + 1, diff: DIFFS[Math.floor(i / 100)] });
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
  console.log(`${['Fácil', 'Normal', 'Difícil'][Math.floor((r - 1) / 10)]} região ${((r - 1) % 10) + 1} (inimigos até ${rar}): vitória ao chegar ${Math.round(100 * mean(ids.map((i) => mean(res.win[i] ?? [0]))))}% · tentativas ${att.join(' ')} · Poder ao chegar ${Math.round(median(res.pow[ids[0]] ?? [0]))} · batalhas acumuladas ${battles}`);
}
