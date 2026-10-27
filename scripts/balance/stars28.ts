/**
 * v0.28.0 — as ⭐ de cada fase são possíveis? Para cada dificuldade e fase, um jogador com todos os personagens
 * 1 degrau acima dos inimigos joga no Auto com 3 jeitos: com feitiços, sem feitiços e "econômico" (para de invocar
 * depois de K cartas). Mostra a chance de vencer cumprindo cada objetivo (o melhor jeito para aquele objetivo).
 * npx vite-node scripts/balance/stars28.ts [partidas]
 */
import { createBattle, Ctx, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy } from '../../src/core/ai';
import { DIFFICULTIES, DIFFICULTY_RULES, STAGE_GOALS, goalMet, goalText, stageFor, type StarGoal } from '../../src/core/adventure';
import { ENEMY_STEPS, STAGES, enemyCard } from '../../src/core/campaign';
import { PLAYABLE } from '../../src/core/characters';
import { LEADER_HP } from '../../src/core/leaders';
import { autoDeck } from '../../src/core/deckbuild';
import type { CardInstance } from '../../src/core/types';

const N = Number(process.argv[2] ?? 40);
type Res = { win: boolean; playerHp: number; playerMaxHp: number; turn: number; stats: { cards: number; spells: number; kills: number } };

function play(deck: CardInstance[], enemy: CardInstance[], hp: number, ehp: number, seed: number, limit = Infinity): Res {
  const s = createBattle({ playerDeck: deck, enemyDeck: enemy, playerHeroHp: hp, enemyHeroHp: ehp, seed });
  let g = 0;
  while (!s.winner && g++ < 200) {
    if (s.stats!.player.cards < limit) aiDeploy(s, new Ctx(), 'player');
    endPlayerTurn(s, (st, ctx, side) => aiDeploy(st, ctx, side));
  }
  return { win: s.winner === 'player', playerHp: s.heroes.player.hp, playerMaxHp: s.heroes.player.maxHp, turn: s.turn, stats: { ...s.stats!.player } };
}

let seed = 1;
for (const diff of DIFFICULTIES) {
  console.log(`\n=== ${diff} ===`);
  STAGES.forEach((base, i) => {
    const st = stageFor(base.id, diff);
    const owned = PLAYABLE.filter((c) => !['kenji', 'vorax'].includes(c.id)).map((c) => enemyCard(c.id, ENEMY_STEPS[i], DIFFICULTY_RULES[diff].stepBonus + 1));
    const withSp = autoDeck(owned, 34, 4);
    const noSp = autoDeck(owned, 30, 0);
    const hp = LEADER_HP[Math.min(LEADER_HP.length - 1, diff === 'facil' ? i : LEADER_HP.length - 1)];
    const runs = (deck: CardInstance[], limit = Infinity) => Array.from({ length: N }, () => play(deck, st.enemyDeck, hp, st.enemyHeroHp, seed++, limit));
    const auto = runs(withSp), plain = runs(noSp);
    const rate = (rs: Res[], g: StarGoal) => rs.filter((r) => r.win && goalMet(g, r)).length / rs.length;
    const goals = STAGE_GOALS[diff][i];
    const out = goals.map((g) => {
      let best = Math.max(rate(auto, g), rate(plain, g));
      if (g.kind === 'cards') best = Math.max(best, rate(runs(noSp, g.n), g), rate(runs(withSp, g.n), g));
      return `${goalText(g)}: ${Math.round(best * 100)}%`;
    });
    console.log(`fase ${i + 1} · vitória ${Math.round((auto.filter((r) => r.win).length / N) * 100)}% | ${out.join(' | ')}`);
  });
}
