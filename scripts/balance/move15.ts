/** v0.15.0 — taxa de vitória por fase com a configuração atual (antes/depois da regra de movimento). npx vite-node scripts/balance/move15.ts [jogadores] */
import { runCampaign, report } from './progression';
import { STAGES } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 40);
report(process.argv[3] ?? 'atual', runCampaign({ name: 'atual', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => STAGES[i].enemyHeroHp }, N));
