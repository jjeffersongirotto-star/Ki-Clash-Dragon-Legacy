/** v0.13.0 — confere a configuração FINAL do jogo (leaders.ts + campaign.ts) contra a de hoje. npx vite-node scripts/balance/final.ts [jogadores] */
import { runCampaign, report } from './progression';
import { STAGES } from '../../src/core/campaign';
import { LEADER_HP, LEADER_THRESHOLDS } from '../../src/core/leaders';

const N = Number(process.argv[2] ?? 40);
report('ANTES (v0.12.2): Líder 20 fixo, Líder inimigo 12 + 2·i', runCampaign({ name: 'antes', hp: Array(10).fill(20), thresholds: Array(9).fill(1e9), enemyHp: (i) => 12 + 2 * i }, N));
console.log('\nLíder inimigo por fase:', STAGES.map((s) => s.enemyHeroHp).join(', '));
report('v0.13.0: Líder +10/nível, requisitos de Poder, Líder inimigo 12 + 7·i', runCampaign({ name: 'final', hp: LEADER_HP, thresholds: LEADER_THRESHOLDS.slice(1), enemyHp: (i) => STAGES[i].enemyHeroHp }, N));
