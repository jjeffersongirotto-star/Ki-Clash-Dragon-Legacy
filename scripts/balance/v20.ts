/**
 * v0.20.1 — a economia da v0.20.0 (Repetir com recompensa inteira, 5 por dia) acelera demais a evolução?
 * Rodar: npx vite-node scripts/balance/v20.ts [jogadores]
 * Compara: antes (repetir = 50%, só depois de perder) × v0.20.0 (5 Repetir de recompensa inteira antes de cada fase nova).
 */
import { runCampaign, report } from './progression';
import { STAGES } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 100);
const sc = { name: 'v20', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i: number) => STAGES[i].enemyHeroHp };
const mode = process.argv[3] ?? 'ambos';
if (mode !== 'novo') report('ANTES (v0.18–v0.19): repetir dá 50%, só ao perder', runCampaign(sc, N, 40, { repeats: 0, repeatMult: 0.5 }));
if (mode !== 'antes') report('v0.20.0: 5 Repetir (recompensa inteira) antes de cada fase nova', runCampaign(sc, N, 40, { repeats: 5, repeatMult: 1 }));
