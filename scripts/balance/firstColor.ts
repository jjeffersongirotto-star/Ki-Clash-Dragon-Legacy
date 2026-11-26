/**
 * v0.71.0 — Onde cada cor de item aparece pela primeira vez (pedido do jogador): acha a primeira fase em que um baralho
 * de cartas que PRECISAM da cor (no máximo sem ela: raridade base, sem "+") cai abaixo de 30% de vitória; a cor passa a
 * cair ~5 fases antes. npx vite-node scripts/balance/firstColor.ts [batalhas por fase]
 */
import { gateWin } from './gates';
import type { Difficulty } from '../../src/core/adventure';

const N = Number(process.argv[2] ?? 24);
const scans: { name: string; diff: Difficulty; rarity: number; from: number }[] = [
  { name: 'azul (cartas Incomuns) no Fácil', diff: 'facil', rarity: 2, from: 11 },
  { name: 'roxo (cartas Raras) no Fácil', diff: 'facil', rarity: 3, from: 11 },
];
for (const s of scans) {
  let hit = 0;
  const line: string[] = [];
  let low = 0;
  for (let k = s.from; k <= 100; k++) {
    const w = gateWin(s.diff, k, s.rarity, N);
    line.push(`${k}:${Math.round(w * 100)}`);
    // trava = 2 fases seguidas abaixo de 30%
    low = w < 0.3 ? low + 1 : 0;
    if (low >= 2) { hit = k - 1; break; }
  }
  console.log(`${s.name}: começa a travar na fase ${hit || 'nunca'} → cor a partir da ${hit ? Math.max(s.from, hit - 5) : '-'}\n  ${line.join(' ')}`);
}
