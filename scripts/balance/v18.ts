/**
 * v0.18.0 — calibra a dificuldade por fase (com os feitiços da IA).
 * Rodar: npx vite-node scripts/balance/v18.ts [jogadores] ['[vida do Comandante inimigo × 10]'] ['[degraus das cartas da IA × 10]'] ['[[feitiços da fase 1], …]'] ['[requisitos de Poder do Comandante]']
 * Sem as listas, usa os valores de campaign.ts (v0.23.0: degraus no lugar do nível). Meta: vitória ao chegar caindo de fase em fase.
 */
import { runCampaign, report } from './progression';
import { ENEMY_STEPS, ENEMY_SPELLS, STAGES, enemyDeckFor } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 100);
const hpTable: number[] = process.argv[3] && process.argv[3] !== '-' ? JSON.parse(process.argv[3]) : STAGES.map((s) => s.enemyHeroHp);
const lvTable: number[] = process.argv[4] ? JSON.parse(process.argv[4]) : ENEMY_STEPS;
const spells: string[][] = process.argv[5] && process.argv[5] !== '-' ? JSON.parse(process.argv[5]) : ENEMY_SPELLS;
STAGES.forEach((s, i) => (s.enemyDeck = enemyDeckFor(i, lvTable[i], spells[i])));
const thr: number[] = process.argv[6] ? JSON.parse(process.argv[6]) : LEADER_THRESHOLDS;
console.log('Comandante inimigo:', hpTable.join(', '), '· degraus da IA:', lvTable.join(', '), '· feitiços:', JSON.stringify(spells), '· requisitos:', thr.join(', '));
report('v0.18.0', runCampaign({ name: 'v18', hp: LEADER_HP, thresholds: thr.slice(1), enemyHp: (i) => hpTable[i] }, N));
