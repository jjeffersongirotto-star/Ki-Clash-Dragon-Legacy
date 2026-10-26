/** v0.26.0 — Loja: vitória ao chegar em cada fase com e sem a Loja. npx vite-node scripts/balance/v26.ts [jogadores] [repetir] (SIM_SHOP=0 desliga a Loja) */
import { runCampaign, report } from './progression';
import { STAGES } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 100);
const R = Number(process.argv[3] ?? 0);
report(`${process.env.SIM_SHOP === '0' ? 'sem Loja' : 'com Loja'} · ${R} Repetir`, runCampaign({ name: 'v26', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => STAGES[i].enemyHeroHp }, N, 40, { repeats: R, repeatMult: 1 }));
