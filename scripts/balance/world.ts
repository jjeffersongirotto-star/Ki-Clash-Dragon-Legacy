/**
 * v0.39.0 — Jogador de longo prazo nas 100 fases do mundo (Fácil).
 * npx vite-node scripts/balance/world.ts [jogadores] [primeiro] [saida.json]
 * Começa como quem acabou o tutorial, gasta o XP, desperta, compra itens na Loja e, com o Ouro que sobra,
 * cartas do Banner; perdeu → repete a fase anterior e tenta de novo. Mede a vitória ao chegar em cada fase e a média
 * por região. Vários processos em paralelo: rode com primeiros diferentes e junte com `--juntar a.json b.json …`.
 * STEPS="3,4.5;4.5,6;…" (faixas de degrau por região 2–10), HP="50,70;…" e XPG=2 testam a curva sem mudar o jogo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { runCampaign, mean, median } from './progression';
import { WORLD_STAGES, WORLD_STEP_RANGE, WORLD_HP_RANGE, WORLD_SPELLS, enemyDeckFor } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';
import { REGION_COUNT, STAGES_PER_REGION, localOf, regionOf } from '../../src/core/world';

if (process.argv[2] === '--juntar') {
  const parts = process.argv.slice(3).map((f) => JSON.parse(readFileSync(f, 'utf8')) as { win: number[][]; att: number[][]; pow: number[][] });
  const win = parts[0].win.map((_, i) => parts.flatMap((p) => p.win[i]));
  const att = parts[0].att.map((_, i) => parts.flatMap((p) => p.att[i]));
  const pow = parts[0].pow.map((_, i) => parts.flatMap((p) => p.pow[i]));
  console.log(`jogadores: ${win[0].length}`);
  console.log('região | vitória ao chegar (média) | fases 1–10 | tentativas (mediana por fase) | Poder ao chegar na fase 1');
  for (let r = 1; r <= REGION_COUNT; r++) {
    const ids = Array.from({ length: STAGES_PER_REGION }, (_, k) => (r - 1) * STAGES_PER_REGION + k);
    console.log(`${r} | ${Math.round(100 * mean(ids.map((i) => mean(win[i]))))}% | ${ids.map((i) => Math.round(100 * mean(win[i]))).join(' · ')} | ${ids.map((i) => median(att[i])).join(' ')} | ${Math.round(median(pow[ids[0]]))}`);
  }
  process.exit(0);
}

const N = Number(process.argv[2] ?? 4);
const first = Number(process.argv[3] ?? 0);
const out = process.argv[4];
const ranges = (v: string | undefined, def: [number, number][]) => (v ? (v.split(';').map((x) => x.split(',').map(Number)) as [number, number][]) : def);
const steps = ranges(process.env.STEPS, WORLD_STEP_RANGE);
const hps = ranges(process.env.HP, WORLD_HP_RANGE);
const lerp = ([a, b]: [number, number], local: number) => a + ((b - a) * (local - 1)) / (STAGES_PER_REGION - 1);
// curva de teste (só no simulador): baralhos e vida das regiões 2–10
WORLD_STAGES.forEach((s, i) => {
  if (i < STAGES_PER_REGION) return;
  const r = regionOf(i + 1), l = localOf(i + 1);
  s.enemyDeck = enemyDeckFor(i, lerp(steps[r - 2], l), WORLD_SPELLS[i]);
  s.enemyHeroHp = Math.round(lerp(hps[r - 2], l));
});
const t0 = Date.now();
const stats = runCampaign({ name: 'mundo', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => WORLD_STAGES[i].enemyHeroHp }, N, Number(process.env.PROBE ?? 8), {
  stages: WORLD_STAGES,
  bannerGold: true,
  maxAttempts: 60,
  firstPlayer: first,
  onPlayer: (pi) => console.error(`jogador ${pi} (${Math.round((Date.now() - t0) / 1000)} s)`),
});
const res = { win: stats.map((s) => s.winAtArrival), att: stats.map((s) => s.attempts), pow: stats.map((s) => s.arrivePower) };
if (out) writeFileSync(out, JSON.stringify(res));
for (let r = 1; r <= REGION_COUNT; r++) {
  const ids = Array.from({ length: STAGES_PER_REGION }, (_, k) => (r - 1) * STAGES_PER_REGION + k);
  console.log(`região ${r}: ${Math.round(100 * mean(ids.map((i) => mean(res.win[i]))))}% · ${ids.map((i) => Math.round(100 * mean(res.win[i]))).join(' ')} · tentativas ${ids.map((i) => median(res.att[i])).join(' ')}`);
}
