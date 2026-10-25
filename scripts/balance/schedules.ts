/** v0.13.0 — compara as curvas de vida do Líder. npx vite-node scripts/balance/schedules.ts [jogadores] */
import { runCampaign, report, median, type Schedule } from './progression';

const N = Number(process.argv[2] ?? 30);
const enemyNow = (i: number) => 12 + i * 2;
const flat = Array(10).fill(20);
// 1) base: como hoje (Líder fixo em 20) → Poder do baralho ao chegar em cada fase
const base = runCampaign({ name: 'base', hp: flat, thresholds: Array(10).fill(1e9), enemyHp: enemyNow }, N);
report('BASE (hoje: Líder 20, sem níveis)', base);
const arrive = base.map((s) => median(s.arrivePower));
// requisito do nível L (L = 2..10) = Poder típico (mediana) ao chegar na fase L, arredondado para baixo de 10 em 10
const thr = [0, ...arrive.slice(1).map((p) => Math.floor(p / 10) * 10)];
console.log('\nrequisitos (Poder do baralho) por nível:', JSON.stringify(thr));
const cum = (steps: number[]) => steps.reduce<number[]>((a, s) => [...a, a[a.length - 1] + s], [20]);
const curves: Record<string, number[]> = {
  'A (+5 por nível)': cum(Array(9).fill(5)),
  'B (+10 por nível)': cum(Array(9).fill(10)),
  'C (+3,+3,+3,+5,+5,+5,+10,+10,+10)': cum([3, 3, 3, 5, 5, 5, 10, 10, 10]),
};
const mode = process.argv[3] ?? 'both';
for (const [name, hp] of Object.entries(curves)) {
  console.log(name, JSON.stringify(hp));
  if (mode !== 'scaled') report(`${name} · Líder inimigo como hoje`, runCampaign({ name, hp, thresholds: thr.slice(1), enemyHp: enemyNow }, N));
  // inimigo acompanha: ganha o mesmo acréscimo de vida que o Líder do jogador deveria ter naquela fase
  if (mode !== 'now') report(`${name} · Líder inimigo +50% do acréscimo`, runCampaign({ name, hp, thresholds: thr.slice(1), enemyHp: (i) => enemyNow(i) + Math.round((hp[i] - 20) / 2) }, N));
  if (mode !== 'now') report(`${name} · Líder inimigo acompanha`, runCampaign({ name, hp, thresholds: thr.slice(1), enemyHp: (i) => enemyNow(i) + (hp[i] - 20) }, N));
}
