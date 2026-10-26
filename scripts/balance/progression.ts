/**
 * v0.13.0 — Simulação da PROGRESSÃO da campanha para decidir a vida do Líder.
 * Rodar: npx vite-node scripts/balance/progression.ts [jogadores]
 *
 * Jogador simulado (IA do Auto) começa como um save novo e segue a campanha:
 *  - antes de cada tentativa gasta todo o XP na equipe (menor degrau primeiro) e desperta quem está com a barra cheia (v0.23.0);
 *  - equipe = 10 cartas de maior Poder;
 *  - evolui o Líder sempre que o Poder do baralho alcança o requisito (grátis);
 *  - derrota: +1 Pergaminho, repete a maior fase vencida (50% da recompensa) e tenta de novo.
 * Mede por fase: Poder do baralho ao chegar, nível do Líder, taxa de vitória ao chegar,
 * tentativas, maior dano num único turno inimigo (burst) e maior ataque de uma unidade inimiga.
 */
import { simulate } from './sim';
import { STAGES, UNLOCKS } from '../../src/core/campaign';
import { STARTER_IDS } from '../../src/core/characters';
import { newOwned, feedXp, ascend, canAscend, ascendCost, barFull, isMaxTier, stepIndex, xpProgress, XP_ITEMS, playXp, type OwnedCard } from '../../src/core/progression';
import { FIRST_WIN_XP_MULT, rewardsFor } from '../../src/core/adventure';
import { addGear, hasGearFor, spendGearFor, stageGearDrop, type GearBag } from '../../src/core/gear';
import { cardPower, deckPower } from '../../src/core/power';
import type { CardInstance } from '../../src/core/types';
import { autoDeck, deckMaxFor, profileLevelFor } from '../../src/core/deckbuild';

export interface Schedule { name: string; hp: number[]; thresholds: number[]; enemyHp: (stageIdx: number) => number }

const XP = Object.fromEntries(XP_ITEMS.map((i) => [i.id, i.xp])) as Record<string, number>;

interface Player { cards: Record<string, OwnedCard>; items: Record<string, number>; ess: number; cleared: number; leader: number; gear: GearBag }

/** v0.24.0: o Despertar pede itens de ascensão (SIM_GEAR=0 desliga, para comparar). */
const SIM_GEAR = process.env.SIM_GEAR !== '0';
const gearOk = (p: Player, c: OwnedCard) => !SIM_GEAR || hasGearFor(p.gear, c);

function team(p: Player): OwnedCard[] {
  return Object.values(p.cards).sort((a, b) => cardPower(b) - cardPower(a)).slice(0, 10);
}
const asDeck = (t: OwnedCard[]): CardInstance[] => t.map((c) => ({ charId: c.charId, stars: c.stars, plus: c.plus }));
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
    // desperta quem está com a barra cheia (mais barato primeiro)
    const asc = t.filter((c) => canAscend(c) && p.ess >= ascendCost(c) && gearOk(p, c)).sort((a, b) => ascendCost(a) - ascendCost(b))[0];
    if (asc) { if (SIM_GEAR) spendGearFor(p.gear, asc); p.ess -= ascend(asc, p.ess).cost; continue; }
    // v0.23.0: alimenta uma barra por vez — o menor degrau e, no empate, a barra mais cheia (o XP que passa do cheio
    // se perde, então não alimenta barra cheia; espalhar o XP deixaria todas as barras pela metade, sem subir degrau)
    const g = (c: OwnedCard) => stepIndex(c.stars, c.plus) - xpProgress(c) * 0.99;
    const target = t.filter((c) => !isMaxTier(c) && !barFull(c)).sort((a, b) => g(a) - g(b))[0];
    if (!target) return;
    // v0.22.0: Orbes, do mais fraco para o mais forte
    const item = XP_ITEMS.map((o) => o.id as string).find((id) => p.items[id] > 0);
    if (!item) return;
    p.items[item]--;
    feedXp(target, XP[item]);
  }
}

function reward(p: Player, i: number, first: boolean, repeatMult = 0.5) {
  // v0.22.0: recompensa do Fácil em Orbes (o simulador joga a campanha no Fácil)
  const r = rewardsFor(i + 1, 'facil');
  const f = first ? 1 : repeatMult;
  for (const [id, k] of Object.entries(r.orbs)) p.items[id] = (p.items[id] ?? 0) + Math.floor((k ?? 0) * f);
  p.ess += Math.floor(r.essencias * f);
  if (f >= 1) for (const g of r.gear) addGear(p.gear, g.id, g.rarity); // v0.24.0: itens só com recompensa inteira
  if (first) for (const g of stageGearDrop(i + 1, 'facil')) addGear(p.gear, g.id, g.rarity); // v0.24.1: bônus da 1ª vitória
  if (first && UNLOCKS[i + 1] && !p.cards[UNLOCKS[i + 1]]) p.cards[UNLOCKS[i + 1]] = newOwned(UNLOCKS[i + 1]);
}

/** v0.22.0: XP por jogar — ao vencer jogando, a equipe ganha XP (SIM_PLAYXP=0 desliga, para comparar). */
const SIM_PLAYXP = process.env.SIM_PLAYXP !== '0';
function winXp(p: Player, i: number, first = false) {
  if (SIM_PLAYXP) for (const c of team(p)) feedXp(c, playXp(i + 1) * (first ? FIRST_WIN_XP_MULT : 1));
}

function levelUp(p: Player, sc: Schedule) {
  const dp = deckPower(team(p));
  while (p.leader < sc.hp.length && dp >= sc.thresholds[p.leader - 1]) p.leader++; // thresholds[L-1] = requisito do nível L+1
}

export interface StageStat { arrivePower: number[]; leader: number[]; winAtArrival: number[]; attempts: number[]; burst: number[]; maxAtk: number[]; hpLeftWin: number[] }

/**
 * v0.20.1: `opts.repeats` = quantos "Repetir" (recompensa inteira, sem batalha) o jogador usa na última fase vencida
 * antes de tentar cada fase nova (simula um dia: 5 Repetir e depois a fase nova). `opts.repeatMult` = fração da
 * recompensa nas repetições (v0.20.0: 1; antes: 0,5).
 */
export function runCampaign(sc: Schedule, players: number, probe = 40, opts: { repeats?: number; repeatMult?: number } = {}) {
  const repeats = opts.repeats ?? 0;
  const repeatMult = opts.repeatMult ?? 0.5;
  const stats: StageStat[] = STAGES.map(() => ({ arrivePower: [], leader: [], winAtArrival: [], attempts: [], burst: [], maxAtk: [], hpLeftWin: [] }));
  let seed = 7;
  for (let pi = 0; pi < players; pi++) {
    const p: Player = { cards: {}, items: { orbe1: 10, orbe3: 3 }, ess: 10, cleared: 0, leader: 1, gear: {} };
    for (const id of STARTER_IDS) p.cards[id] = newOwned(id);
    for (let i = 0; i < STAGES.length; i++) {
      if (i > 0) for (let k = 0; k < repeats; k++) reward(p, i - 1, false, repeatMult);
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
        if (r.winner === 'player') { reward(p, i, true, repeatMult); winXp(p, i, true); break; }
        p.items.orbe1 = (p.items.orbe1 ?? 0) + 1;
        if (attempts > 300) break;
        if (i > 0) {
          spend(p); levelUp(p, sc);
          const rr = simulate(battleDeck(p, i), STAGES[i - 1].enemyDeck, sc.hp[p.leader - 1], sc.enemyHp(i - 1), seed++);
          if (rr.winner === 'player') { reward(p, i - 1, false, repeatMult); winXp(p, i - 1); } else p.items.orbe1 = (p.items.orbe1 ?? 0) + 1;
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
