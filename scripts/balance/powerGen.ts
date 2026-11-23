/**
 * v0.67.3 — Calibração do Poder, parte 1: joga batalhas IA × IA com baralhos e raridades sorteados.
 * npx vite-node scripts/balance/powerGen.ts [semente] [partidas] [saida.json]  (rodar 4 sementes, ex.: 1 a 4, com 20 000)
 */
// gera partidas aleatórias (baralhos de 10 cartas, raridade e degrau sorteados) e grava os resultados
import { writeFileSync } from 'node:fs';
import { simulate } from './sim';
import { PLAYABLE } from '../../src/core/characters';
import { nextRandom } from '../../src/core/rng';
import type { CardInstance } from '../../src/core/types';
const seed = Number(process.argv[2]), n = Number(process.argv[3]), out = process.argv[4];
const rng = { seed };
const R = () => nextRandom(rng);
const card = (id: string): CardInstance => { const d = PLAYABLE.find((c) => c.id === id)!; return { charId: id, stars: d.minStars + Math.floor(R() * (d.maxStars - d.minStars + 1)), plus: Math.floor(R() * 3), copies: 3 } as CardInstance; };
const deck = () => PLAYABLE.map((c) => c.id).sort(() => R() - 0.5).slice(0, 10).map(card);
const res: { a: [string, number, number][]; b: [string, number, number][]; y: number }[] = [];
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  const a = deck(), b = deck();
  const r = simulate(a, b, 40, 40, seed * 1000 + i);
  if (r.winner === 'empate') continue;
  res.push({ a: a.map((c) => [c.charId, c.stars, c.plus as number]), b: b.map((c) => [c.charId, c.stars, c.plus as number]), y: r.winner === 'player' ? 1 : 0 });
  if (i % 500 === 0) { console.error(i, Math.round((Date.now() - t0) / 1000) + 's'); writeFileSync(out, JSON.stringify(res)); }
}
writeFileSync(out, JSON.stringify(res));
