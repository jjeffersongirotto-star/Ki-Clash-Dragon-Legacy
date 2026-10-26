/**
 * v0.13.0 — Simulação da PROGRESSÃO da campanha para decidir a vida do Líder.
 * Rodar: npx vite-node scripts/balance/progression.ts [jogadores]
 *
 * Jogador simulado (IA do Auto) começa como um save novo e segue a campanha:
 *  - antes de cada tentativa gasta todo o XP na equipe (menor nível primeiro) e desperta quem está no teto;
 *  - equipe = 10 cartas de maior Poder;
 *  - evolui o Líder sempre que o Poder do baralho alcança o requisito (grátis);
 *  - derrota: +1 Pergaminho, repete a maior fase vencida (50% da recompensa) e tenta de novo.
 * Mede por fase: Poder do baralho ao chegar, nível do Líder, taxa de vitória ao chegar,
 * tentativas, maior dano num único turno inimigo (burst) e maior ataque de uma unidade inimiga.
 */
import { simulate } from './sim';
import { STAGES, UNLOCKS } from '../../src/core/campaign';
import { STARTER_IDS } from '../../src/core/characters';
import { newOwned, feedXp, ascend, canAscend, ascendCost, cardMaxLevel, XP_ITEMS, type OwnedCard } from '../../src/core/progression';
import { cardPower, deckPower } from '../../src/core/power';
import type { CardInstance } from '../../src/core/types';
import { autoDeck, deckMaxFor, profileLevelFor } from '../../src/core/deckbuild';

export interface Schedule { name: string; hp: number[]; thresholds: number[]; enemyHp: (stageIdx: number) => number }

const XP = Object.fromEntries(XP_ITEMS.map((i) => [i.id, i.xp])) as Record<string, number>;

interface Player { cards: Record<string, OwnedCard>; items: Record<string, number>; ess: number; cleared: number; leader: number }

function team(p: Player): OwnedCard[] {
  return Object.values(p.cards).sort((a, b) => cardPower(b) - cardPower(a)).slice(0, 10);
}
const asDeck = (t: OwnedCard[]): CardInstance[] => t.map((c) => ({ charId: c.charId, level: c.level, stars: c.stars, plus: c.plus }));
/**
 * v0.17.0: baralho de batalha do jogador simulado — os 10 mais fortes × 3 e, quando o nível de perfil
 * (1 + fases vencidas) abre espaço além de 30, até 4 cartas de feitiço (2 feitiços × 2) que combinam com a equipe.
 * (Encher o resto do espaço dilui as melhores cartas: no simulador até uma 11ª carta de personagem piora.)
 * SIM_SPELLS=0 desliga os feitiços (para comparar).
 */
const SIM_SPELLS = process.env.SIM_SPELLS !== '0';
const battleDeck = (p: Player, cleared: number): CardInstance[] => {
  const max = deckMaxFor(profileLevelFor(cleared));
  const owned = asDeck(team(p));
  const room = Math.max(0, max - 3 * owned.length);
  return SIM_SPELLS ? autoDeck(owned, 3 * owned.length + Math.min(4, room), Math.min(4, room)) : autoDeck(owned, Math.min(max, 3 * owned.length), 0);
};

function spend(p: Player) {
  for (let guard = 0; guard < 2000; guard++) {
    const t = team(p);
    // desperta quem está no teto (mais barato primeiro)
    const asc = t.filter((c) => canAscend(c) && p.ess >= ascendCost(c)).sort((a, b) => ascendCost(a) - ascendCost(b))[0];
    if (asc) { p.ess -= ascend(asc, p.ess).cost; continue; }
    const target = t.filter((c) => c.level < cardMaxLevel(c)).sort((a, b) => a.level - b.level)[0];
    if (!target) return;
    const item = ['pergaminho', 'cristal', 'orbe'].find((id) => p.items[id] > 0);
    if (!item) return;
    p.items[item]--;
    feedXp(target, XP[item]);
  }
}

function reward(p: Player, i: number, first: boolean) {
  const r = STAGES[i].rewards;
  const f = first ? 1 : 0.5;
  p.items.pergaminho += Math.floor(r.pergaminho * f);
  p.items.cristal += Math.floor(r.cristal * f);
  if (first) p.items.orbe += r.orbe;
  p.ess += Math.floor(r.essencias * f);
  if (first && UNLOCKS[i + 1] && !p.cards[UNLOCKS[i + 1]]) p.cards[UNLOCKS[i + 1]] = newOwned(UNLOCKS[i + 1]);
}

function levelUp(p: Player, sc: Schedule) {
  const dp = deckPower(team(p));
  while (p.leader < sc.hp.length && dp >= sc.thresholds[p.leader - 1]) p.leader++; // thresholds[L-1] = requisito do nível L+1
}

export interface StageStat { arrivePower: number[]; leader: number[]; winAtArrival: number[]; attempts: number[]; burst: number[]; maxAtk: number[]; hpLeftWin: number[] }

export function runCampaign(sc: Schedule, players: number, probe = 40) {
  const stats: StageStat[] = STAGES.map(() => ({ arrivePower: [], leader: [], winAtArrival: [], attempts: [], burst: [], maxAtk: [], hpLeftWin: [] }));
  let seed = 7;
  for (let pi = 0; pi < players; pi++) {
    const p: Player = { cards: {}, items: { pergaminho: 10, cristal: 3, orbe: 0 }, ess: 10, cleared: 0, leader: 1 };
    for (const id of STARTER_IDS) p.cards[id] = newOwned(id);
    for (let i = 0; i < STAGES.length; i++) {
      spend(p); levelUp(p, sc);
      const st = stats[i];
      st.arrivePower.push(deckPower(team(p))); st.leader.push(p.leader);
      // taxa de vitória exatamente no momento em que chega à fase
      const hp = sc.hp[p.leader - 1];
      let w = 0;
      for (let k = 0; k < probe; k++) {
        const r = simulate(battleDeck(p, i), STAGES[i].enemyDeck, hp, sc.enemyHp(i), seed++);
        if (r.winner === 'player') { w++; st.hpLeftWin.push(r.playerHpLeft / hp); }
        st.burst.push(r.maxBurstOnPlayer / hp); st.maxAtk.push(r.maxEnemyAtk);
      }
      st.winAtArrival.push(w / probe);
      let attempts = 0;
      for (;;) {
        attempts++;
        spend(p); levelUp(p, sc);
        const r = simulate(battleDeck(p, i), STAGES[i].enemyDeck, sc.hp[p.leader - 1], sc.enemyHp(i), seed++);
        if (r.winner === 'player') { reward(p, i, true); break; }
        p.items.pergaminho += 1;
        if (attempts > 300) break;
        if (i > 0) {
          spend(p); levelUp(p, sc);
          const rr = simulate(battleDeck(p, i), STAGES[i - 1].enemyDeck, sc.hp[p.leader - 1], sc.enemyHp(i - 1), seed++);
          if (rr.winner === 'player') reward(p, i - 1, false); else p.items.pergaminho += 1;
        }
      }
      st.attempts.push(attempts);
    }
  }
  return stats;
}

export const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
export const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
export const pct = (a: number[], q: number) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; };

export function report(name: string, stats: StageStat[]) {
  console.log(`\n=== ${name} ===`);
  console.log('fase | Poder ao chegar | Líder | vitória ao chegar | tentativas | dano/turno p95 ÷ vida | máx ÷ vida | turnos ≥50% | atq. máx unidade');
  stats.forEach((s, i) => console.log(`${i + 1} | ${median(s.arrivePower)} | ${median(s.leader)} | ${(100 * mean(s.winAtArrival)).toFixed(0)}% | ${mean(s.attempts).toFixed(1)} | ${(100 * pct(s.burst, 0.95)).toFixed(0)}% | ${(100 * Math.max(...s.burst)).toFixed(0)}% | ${(100 * s.burst.filter((b) => b >= 0.5).length / s.burst.length).toFixed(0)}% | ${Math.max(...s.maxAtk)}`));
}
