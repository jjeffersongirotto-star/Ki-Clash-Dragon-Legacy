/**
 * v0.13.0 — Simulação da PROGRESSÃO da campanha para decidir a vida do Líder.
 * Rodar: npx vite-node scripts/balance/progression.ts [jogadores]
 *
 * Jogador simulado (IA do Auto) começa como um save novo que acabou o tutorial (v0.25.0) e segue a campanha:
 *  - antes de cada tentativa gasta todo o XP na equipe (menor degrau primeiro) e desperta quem está com a barra cheia (v0.23.0);
 *  - equipe = 10 cartas de maior Poder;
 *  - evolui o Líder sempre que o Poder do baralho alcança o requisito (grátis);
 *  - derrota: +1 Pergaminho, repete a maior fase vencida (50% da recompensa) e tenta de novo.
 * Mede por fase: Poder do baralho ao chegar, nível do Líder, taxa de vitória ao chegar,
 * tentativas, maior dano num único turno inimigo (burst) e maior ataque de uma unidade inimiga.
 */
import { simulate } from './sim';
import { STAGES as CAMPAIGN, STAGE_PACKS, stagePack, type Stage } from '../../src/core/campaign';
import { BANNERS, bankXp, feedCopy, generalXp, pull } from '../../src/core/banner';
import { isSpell } from '../../src/core/spells';
import { STARTER_IDS } from '../../src/core/characters';
import { TUTORIAL_CHARS, TUTORIAL_GEMS, TUTORIAL_REWARD, TUTORIAL_SPELL, TUTORIAL_SPELL_COPIES, tutorialGear } from '../../src/core/tutorial';
import { newOwned, feedXp, ascend, canAscend, ascendCost, barFull, isMaxTier, stepIndex, xpProgress, XP_ITEMS, playXp, type OwnedCard } from '../../src/core/progression';
import { FIRST_WIN_XP_MULT, gemsFor, rewardsFor, spellRewardFor, type Difficulty } from '../../src/core/adventure';
import { FUSE_COST, FUSE_INPUT, addGear, gearCount, gearKey, gearNeeded, hasGearFor, isGearUnlocked, spendGearFor, stageGearDrop, type GearBag } from '../../src/core/gear';
import { FIRST_WIN_MULT, goldFor } from '../../src/core/profile';
import { GEAR_PRICE } from '../../src/core/shop';
import { cardPower, deckPower } from '../../src/core/power';
import type { CardInstance } from '../../src/core/types';
import { getChar } from '../../src/core/characters';
import { BALANCE_V2 } from '../../src/core/balanceV2';
import { autoDeck, deckMaxFor, profileLevelFor } from '../../src/core/deckbuild';
import { MISSIONS, missionReward } from '../../src/core/missions';
import { TOWER_FLOORS, TOWER_UNLOCK_STAGE, towerReward, towerStage } from '../../src/core/tower';

/**
 * v0.73.0 — dias de jogo: a cada SIM_DAY batalhas o simulador conta um dia. SIM_MISSIONS=1 dá as missões diárias
 * (todas, com o Baú); SIM_TOWER=1 tenta a Torre (até SIM_TOWER_TRIES derrotas por dia). SIM_GOLD = multiplicador do
 * Ouro das fases (teste de "mais dinheiro / menos dinheiro").
 */
const SIM_DAY = Number(process.env.SIM_DAY ?? 25);
const SIM_MISSIONS = process.env.SIM_MISSIONS === '1';
const SIM_TOWER = process.env.SIM_TOWER === '1';
const SIM_TOWER_TRIES = Number(process.env.SIM_TOWER_TRIES ?? 3);
const SIM_GOLD = Number(process.env.SIM_GOLD ?? 1);
export const simDays = { total: 0 };

export interface Schedule { name: string; hp: number[]; thresholds: number[]; enemyHp: (stageIdx: number) => number }

const XP = Object.fromEntries(XP_ITEMS.map((i) => [i.id, i.xp])) as Record<string, number>;

interface Player { prog: { cleared: number[]; clearedDiff: { normal: number[]; dificil: number[] } }; tower: number; plays: number; days: number; towerGems: number; dailyGold: number; cards: Record<string, OwnedCard>; items: Record<string, number>; ess: number; cleared: number; leader: number; gear: GearBag; seen: string[]; gold: number; extra: Record<string, OwnedCard[]>; spells: Record<string, number>; bank: { xp: number }; rng: () => number }

/** v0.25.0: SIM_OLD_START=1 começa como antes do tutorial (todos os de Comum, sem pacotes de Comum nas fases). */
const SIM_OLD_START = process.env.SIM_OLD_START === '1';

/** v0.24.0: o Despertar pede itens de ascensão (SIM_GEAR=0 desliga, para comparar). */
const SIM_GEAR = process.env.SIM_GEAR !== '0';
const gearOk = (p: Player, c: OwnedCard) => !SIM_GEAR || hasGearFor(p.gear, c);

/** v0.71.0: cada cópia é uma carta própria — as cópias do personagem (a principal + até 2 outras). */
const copiesOfP = (p: Player, id: string): OwnedCard[] => [p.cards[id], ...(p.extra[id] ?? [])];
const charPower = (p: Player, id: string) => deckPower(copiesOfP(p, id));
/** os personagens do baralho (os 10 de maior Poder somando as cópias), representados pela cópia mais forte */
function teamChars(p: Player): OwnedCard[] {
  const rep = (id: string) => copiesOfP(p, id).slice().sort((a, b) => cardPower(b) - cardPower(a))[0];
  const ids = Object.keys(p.cards).sort((a, b) => charPower(p, b) - charPower(p, a));
  return SIM_SYNERGY ? synergyTeam(ids.map(rep)) : ids.slice(0, 10).map(rep);
}
/** v0.71.0: todas as cópias dos personagens do baralho (para treinar e para o Poder) */
function team(p: Player): OwnedCard[] {
  return teamChars(p).flatMap((c) => copiesOfP(p, c.charId));
}
/**
 * v0.67.1: SIM_SYNERGY=1 — o jogador monta o baralho com SINERGIA em vez de só os 10 de maior Poder: para cada raça,
 * a carta de Aura de raça que ele tiver puxa os aliados da raça (valem +25%); garante 1 tanque e 1 curandeiro.
 * Fica com a raça cuja equipe soma mais (ou com os 10 mais fortes, se nenhuma raça ganhar).
 */
const SIM_SYNERGY = process.env.SIM_SYNERGY === '1';
const HEALERS = new Set(['sopro', 'lotus', 'ondaCurativa', 'regeneracao']);
function synergyTeam(all: OwnedCard[]): OwnedCard[] {
  const val = (c: OwnedCard, race: string | null, auraRaces: Set<string>) => cardPower(c) * (race && getChar(c.charId).race === race && auraRaces.has(race) ? 1.25 : 1);
  let best = all.slice(0, 10);
  let bestScore = best.reduce((n, c) => n + cardPower(c), 0);
  const races = new Set(all.map((c) => getChar(c.charId).race));
  for (const race of races) {
    const auraRaces = new Set(all.filter((c) => BALANCE_V2[c.charId]?.aura).map((c) => BALANCE_V2[c.charId]!.aura!.race));
    const pick = all.slice().sort((a, b) => val(b, race, auraRaces) - val(a, race, auraRaces));
    const t: OwnedCard[] = [];
    // carta de aura dessa raça primeiro
    for (const c of pick) if (t.length < 10 && BALANCE_V2[c.charId]?.aura?.race === race) t.push(c);
    const need = (pred: (c: OwnedCard) => boolean) => { if (!t.some(pred)) { const c = pick.find((x) => pred(x) && !t.includes(x)); if (c) t.push(c); } };
    need((c) => getChar(c.charId).category === 'tanque');
    need((c) => getChar(c.charId).abilities.some((a) => HEALERS.has(a)));
    for (const c of pick) if (t.length < 10 && !t.includes(c)) t.push(c);
    const score = t.reduce((n, c) => n + val(c, race, auraRaces), 0);
    if (score > bestScore) { best = t; bestScore = score; }
  }
  return best;
}
const asDeck = (t: OwnedCard[]): CardInstance[] => t.map((c) => ({ charId: c.charId, stars: c.stars, plus: c.plus }));
/**
 * v0.17.0: baralho de batalha do jogador simulado — os 10 mais fortes × 3 e, quando o nível de perfil
 * (1 + fases vencidas) abre espaço além de 30, até 4 cartas de feitiço (2 feitiços × 2) que combinam com a equipe.
 * (Encher o resto do espaço dilui as melhores cartas: no simulador até uma 11ª carta de personagem piora.)
 * SIM_SPELLS=0 desliga os feitiços (para comparar).
 * v0.41.0: só os feitiços que o jogador tem (tutorial, fases 2/5/8 e Banner), com até 2 cópias e não mais do que tem.
 * SIM_ALL_SPELLS=1 volta ao jeito antigo (todos os feitiços liberados). SIM_TUT_SPELL=<id> troca o feitiço do
 * tutorial (SIM_TUT_SPELL=none: sem feitiço no tutorial).
 */
const SIM_SPELLS = process.env.SIM_SPELLS !== '0';
const SIM_ALL_SPELLS = process.env.SIM_ALL_SPELLS === '1';
const SIM_TUT_SPELL = process.env.SIM_TUT_SPELL ?? TUTORIAL_SPELL;
const battleDeck = (p: Player, cleared: number): CardInstance[] => {
  const max = deckMaxFor(profileLevelFor(cleared));
  const owned = asDeck(teamChars(p));
  const room = Math.max(0, max - 3 * owned.length);
  const deck = SIM_SPELLS ? autoDeck(owned, 3 * owned.length + Math.min(4, room), Math.min(4, room), SIM_ALL_SPELLS ? undefined : p.spells) : autoDeck(owned, Math.min(max, 3 * owned.length), 0);
  // v0.32.0: o baralho só usa as cópias que o jogador tem (até 3). v0.71.0: cada cópia com a cor dela
  return deck.map((c) => {
    if (c.charId.startsWith('f-')) return c;
    const cs = copiesOfP(p, c.charId).slice().sort((a, b) => cardPower(b) - cardPower(a)).slice(0, Math.max(1, Math.min(c.copies ?? 3, 3)));
    return { charId: c.charId, stars: cs[0].stars, plus: cs[0].plus, copies: cs.length, variants: cs.map((x) => ({ stars: x.stars, plus: x.plus })) };
  });
};

/**
 * v0.33.0: 💠 Gemas de Invocação → cartas do banner (1 por gema). Personagem novo entra com 1 cópia; repetido:
 * até ter 3 cópias, guarda a cópia; depois desmancha (direcionado) em XP do próprio personagem.
 */
function pullCards(p: Player, n: number) {
  for (let k = 0; k < n; k++)
    for (const c of pull(BANNERS[0], 1, p.rng)) {
      // v0.41.0: feitiço do banner — até 3 cópias; a partir daí, desmancha (geral) em Orbes
      if (isSpell(c.charId)) {
        if ((p.spells[c.charId] ?? 0) < 3) p.spells[c.charId] = (p.spells[c.charId] ?? 0) + 1;
        else bankXp(p.bank, generalXp(c.stars), p.items);
        continue;
      }
      if (!p.cards[c.charId]) { p.cards[c.charId] = { ...newOwned(c.charId), stars: c.stars, plus: 0 }; continue; }
      // v0.71.0: a cópia é uma carta própria (na cor dela); com 3, a mais fraca vira XP da principal
      const row = (p.extra[c.charId] ??= []);
      row.push({ ...newOwned(c.charId), stars: c.stars, plus: 0 });
      if (row.length > 2) {
        row.sort((a, b) => cardPower(b) - cardPower(a));
        const w = row.pop()!;
        feedCopy(p.cards[c.charId], w.stars, w.plus, p.rng, p.items);
      }
    }
}

/**
 * v0.26.0: 🏪 Loja (SIM_SHOP=0 desliga). Política simples: quando um personagem da equipe está com a barra cheia e
 * com as Essências, mas faltam itens, compra os que faltam se o Ouro der para todos (mais barato primeiro).
 */
const SIM_SHOP = process.env.SIM_SHOP !== '0';
/** v0.69.0: item ganho numa fase (libera a fusão e a Loja dele nessa cor). */
function gainGear(p: Player, id: string, rarity: number) {
  addGear(p.gear, id, rarity);
  const k = gearKey(id, rarity);
  if (!p.seen.includes(k)) p.seen.push(k);
}
/** v0.69.0: tenta conseguir 1 (id, cor) por fusão (3 da cor de baixo, que pode vir de outra fusão), se liberado. */
function fuseFor(p: Player, id: string, r: number, depth = 0): boolean {
  if (r < 2 || depth > 2 || !isGearUnlocked(p.seen, id, r) || p.ess < FUSE_COST[r]) return false;
  while (gearCount(p.gear, id, r - 1) < FUSE_INPUT) if (!fuseFor(p, id, r - 1, depth + 1)) return false;
  if (p.ess < FUSE_COST[r]) return false;
  p.ess -= FUSE_COST[r];
  addGear(p.gear, id, r - 1, -FUSE_INPUT);
  addGear(p.gear, id, r, 1);
  return true;
}
function shopBuy(p: Player) {
  if (!SIM_GEAR) return;
  const ready = team(p).filter((c) => canAscend(c) && p.ess >= ascendCost(c) && !hasGearFor(p.gear, c));
  // v0.69.0: primeiro a fusão (guardando as Essências do Despertar)
  for (const c of ready)
    for (const g of gearNeeded(c)) if (gearCount(p.gear, g.id, g.rarity) < 1) { p.ess -= ascendCost(c); fuseFor(p, g.id, g.rarity); p.ess += ascendCost(c); }
  if (!SIM_SHOP) return;
  const priced = ready.filter((c) => !hasGearFor(p.gear, c)).map((c) => { const miss = gearNeeded(c).filter((g) => gearCount(p.gear, g.id, g.rarity) < 1); return { miss, cost: miss.reduce((n, g) => n + GEAR_PRICE[g.rarity], 0) }; }).sort((a, b) => a.cost - b.cost);
  for (const { miss, cost } of priced) {
    if (miss.some((g) => !isGearUnlocked(p.seen, g.id, g.rarity))) continue; // v0.69.0: cadeado da Loja
    if (p.gold < cost) continue;
    p.gold -= cost;
    for (const g of miss) addGear(p.gear, g.id, g.rarity);
  }
}

/** v0.39.0: com o Ouro que sobra (guardando 1500 para itens), compra cartas do Banner de 10 em 10. */
function bannerBuy(p: Player) {
  while (p.gold >= BANNERS[0].price10 + 1500) {
    p.gold -= BANNERS[0].price10;
    pullCards(p, 10);
  }
  spend(p);
}

function spend(p: Player) {
  for (let guard = 0; guard < 2000; guard++) {
    shopBuy(p);
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

/** v0.67.1: fase do simulador → fase do jogo e dificuldade (padrão: índice i = fase i+1 no Fácil). long.ts joga as 300. */
export const STAGE_MAP: { fn: (i: number) => { id: number; diff: Difficulty } } = { fn: (i) => ({ id: i + 1, diff: 'facil' }) };

function reward(p: Player, i0: number, first: boolean, repeatMult = 0.5) {
  // v0.22.0: recompensa em Orbes da fase e dificuldade (v0.67.1: STAGE_MAP)
  const { id: sid, diff } = STAGE_MAP.fn(i0);
  const i = sid - 1;
  const r = rewardsFor(i + 1, diff);
  const f = first ? 1 : repeatMult;
  for (const [id, k] of Object.entries(r.orbs)) p.items[id] = (p.items[id] ?? 0) + Math.floor((k ?? 0) * f);
  p.ess += Math.floor(r.essencias * f);
  if (f >= 1) for (const g of r.gear) gainGear(p, g.id, g.rarity); // v0.24.0: itens só com recompensa inteira
  p.gold += Math.floor(goldFor(i + 1, diff) * f * (first ? FIRST_WIN_MULT : 1) * SIM_GOLD); // v0.26.0: Ouro de Dragão
  if (first) (diff === 'facil' ? p.prog.cleared : p.prog.clearedDiff[diff]).push(i + 1);
  if (first) for (const g of stageGearDrop(i + 1, diff)) gainGear(p, g.id, g.rarity); // v0.24.1: bônus da 1ª vitória
  // v0.25.0: pacote da primeira vitória (o desbloqueio de sempre + um personagem de Comum) — desligado na v0.33.0
  if (first && STAGE_PACKS) for (const id of stagePack(i + 1)) if (!p.cards[id]) { p.cards[id] = newOwned(id); p.extra[id] = [newOwned(id), newOwned(id)]; }
  // v0.33.0: 💠 Gemas na primeira vitória (fases 3, 6, 9 e 10) viram cartas do banner
  if (first) pullCards(p, gemsFor(i + 1)); // em cada dificuldade (como no jogo)
  // v0.41.0: ✦ feitiço na primeira vitória das fases 2, 5 e 8 de cada região
  const sp = first ? spellRewardFor(i + 1, diff) : undefined;
  if (sp) p.spells[sp] = (p.spells[sp] ?? 0) + 1;
}

/** v0.22.0: XP por jogar — ao vencer jogando, a equipe ganha XP (SIM_PLAYXP=0 desliga, para comparar). */
const SIM_PLAYXP = process.env.SIM_PLAYXP !== '0';
function winXp(p: Player, i: number, first = false) {
  if (SIM_PLAYXP) for (const c of team(p)) feedXp(c, playXp(STAGE_MAP.fn(i).id) * (first ? FIRST_WIN_XP_MULT : 1));
}

function giveBag(p: Player, r: { gold?: number; essencias: number; orbs: Record<string, number | undefined>; gear: { id: string; rarity: number }[]; gems?: number }) {
  p.gold += r.gold ?? 0;
  p.ess += r.essencias;
  for (const [id, k] of Object.entries(r.orbs)) p.items[id] = (p.items[id] ?? 0) + (k ?? 0);
  for (const g of r.gear) gainGear(p, g.id, g.rarity);
  if (r.gems) pullCards(p, r.gems);
}
/** v0.73.0: conta uma batalha; a cada SIM_DAY, um dia novo (missões diárias e Torre). */
function played(p: Player, sc: Schedule) {
  if (++p.plays % SIM_DAY) return;
  p.days++;
  if (SIM_MISSIONS) {
    const open = p.prog.cleared.includes(TOWER_UNLOCK_STAGE);
    for (const d of MISSIONS) if (open || d.event !== 'tower') { const r = missionReward(p.prog, d.id, p.rng); p.dailyGold += r.gold; giveBag(p, r); }
    giveBag(p, missionReward(p.prog, 'chest', p.rng));
  }
  if (SIM_TOWER && p.prog.cleared.includes(TOWER_UNLOCK_STAGE)) {
    let losses = 0;
    while (p.tower < TOWER_FLOORS && losses < SIM_TOWER_TRIES) {
      spend(p); levelUp(p, sc);
      const st = towerStage(p.tower + 1);
      const r = simulate(battleDeck(p, p.prog.cleared.length), st.enemyDeck, sc.hp[p.leader - 1], st.enemyHeroHp, 5000000 + p.plays * 13 + losses, st.aiLevel);
      if (r.winner === 'player') { p.tower++; const rw = towerReward(p.tower, p.rng); p.towerGems += rw.gems; giveBag(p, rw); }
      else losses++;
    }
  }
}

function levelUp(p: Player, sc: Schedule) {
  const dp = deckPower(team(p));
  while (p.leader < sc.hp.length && dp >= sc.thresholds[p.leader - 1]) p.leader++; // thresholds[L-1] = requisito do nível L+1
}

export interface StageStat {
  /** v0.71.0: fração das cartas do baralho com a barra cheia, mas sem Essências ou itens para o Despertar (travadas por recurso) */
  blocked: number[];
  /** v0.73.0: dias de jogo (SIM_DAY batalhas cada) e andar da Torre ao chegar */
  days: number[]; tower: number[];
  arrivePower: number[]; leader: number[]; winAtArrival: number[]; attempts: number[]; burst: number[]; maxAtk: number[]; hpLeftWin: number[]; winStats: { cards: number; spells: number; kills: number }[] }

/**
 * v0.20.1: `opts.repeats` = quantos "Repetir" (recompensa inteira, sem batalha) o jogador usa na última fase vencida
 * antes de tentar cada fase nova (simula um dia: 5 Repetir e depois a fase nova). `opts.repeatMult` = fração da
 * recompensa nas repetições (v0.20.0: 1; antes: 0,5).
 */
export function runCampaign(sc: Schedule, players: number, probe = 40, opts: { repeats?: number; repeatMult?: number; stages?: Stage[]; bannerGold?: boolean; maxAttempts?: number; firstPlayer?: number; onPlayer?: (pi: number) => void; pick?: (i: number, winAt: (st: Stage, n: number) => number) => Stage | undefined } = {}) {
  const repeats = opts.repeats ?? 0;
  const repeatMult = opts.repeatMult ?? 0.5;
  // v0.39.0: `stages` = as 100 fases do mundo; `bannerGold` = o Ouro que sobra da Loja vira cartas do Banner (10 por vez)
  const STAGES = opts.stages ?? CAMPAIGN;
  const stats: StageStat[] = STAGES.map(() => ({ days: [], tower: [], blocked: [], arrivePower: [], leader: [], winAtArrival: [], attempts: [], burst: [], maxAtk: [], hpLeftWin: [], winStats: [] }));
  let seed = 7;
  for (let pi = opts.firstPlayer ?? 0; pi < (opts.firstPlayer ?? 0) + players; pi++) {
    opts.onPlayer?.(pi);
    let rs = 1000 + pi * 7919;
    const p: Player = { prog: { cleared: [], clearedDiff: { normal: [], dificil: [] } }, tower: 0, plays: 0, days: 0, towerGems: 0, dailyGold: 0, cards: {}, items: SIM_OLD_START ? { orbe1: 10, orbe3: 3 } : {}, ess: SIM_OLD_START ? 10 : 0, cleared: 0, leader: 1, gear: {}, seen: [], gold: 0, extra: {}, spells: {}, bank: { xp: 0 }, rng: () => ((rs = (rs * 16807) % 2147483647) / 2147483647) };
    if (SIM_OLD_START) for (const id of STARTER_IDS) { p.cards[id] = newOwned(id); p.extra[id] = [newOwned(id), newOwned(id)]; }
    else {
      // v0.25.0: jogador que acabou o tutorial — Riku, Sora e Nara e a recompensa do tutorial
      for (const id of TUTORIAL_CHARS) { p.cards[id] = newOwned(id); p.extra[id] = [newOwned(id), newOwned(id)]; } // 3 cópias de cada
      for (const [id, k] of Object.entries(TUTORIAL_REWARD.orbs)) p.items[id] = (p.items[id] ?? 0) + (k ?? 0);
      p.ess += TUTORIAL_REWARD.essencias;
      // v0.41.0: o feitiço do pacote do tutorial
      if (SIM_TUT_SPELL !== 'none') p.spells[SIM_TUT_SPELL] = TUTORIAL_SPELL_COPIES;
      for (const [k, n] of Object.entries(tutorialGear())) { p.gear[k] = (p.gear[k] ?? 0) + n; p.seen.push(k); }
      // v0.33.0: o tutorial também dá 2 Gemas (2 cartas do banner)
      pullCards(p, TUTORIAL_GEMS);
    }
    for (let i = 0; i < STAGES.length; i++) {
      if (i > 0) for (let k = 0; k < repeats; k++) reward(p, i - 1, false, repeatMult);
      spend(p); if (opts.bannerGold) bannerBuy(p); levelUp(p, sc);
      // v0.67.4: calibração — escolhe a fase (o degrau) pela vitória ao chegar
      if (opts.pick) {
        const hp0 = sc.hp[p.leader - 1];
        const chosen = opts.pick(i, (stg, n) => { let w = 0; for (let k = 0; k < n; k++) if (simulate(battleDeck(p, i), stg.enemyDeck, hp0, stg.enemyHeroHp, 900000 + seed * 31 + k, stg.aiLevel).winner === 'player') w++; return w / n; });
        if (chosen) STAGES[i] = chosen;
      }
      const st = stats[i];
      st.arrivePower.push(deckPower(team(p))); st.leader.push(p.leader); st.days.push(p.days); st.tower.push(p.tower);
      { const t = team(p); st.blocked.push(t.filter((c) => !isMaxTier(c) && barFull(c) && (p.ess < ascendCost(c) || !gearOk(p, c))).length / Math.max(1, t.length)); }
      // taxa de vitória exatamente no momento em que chega à fase
      const hp = sc.hp[p.leader - 1];
      let w = 0;
      for (let k = 0; k < probe; k++) {
        const r = simulate(battleDeck(p, i), STAGES[i].enemyDeck, hp, sc.enemyHp(i), seed++, STAGES[i].aiLevel);
        if (r.winner === 'player') { w++; st.hpLeftWin.push(r.playerHpLeft / hp); st.winStats.push(r.stats); }
        st.burst.push(r.maxBurstOnPlayer / hp); st.maxAtk.push(r.maxEnemyAtk);
      }
      st.winAtArrival.push(w / probe);
      let attempts = 0;
      for (;;) {
        attempts++;
        spend(p); levelUp(p, sc);
        const r = simulate(battleDeck(p, i), STAGES[i].enemyDeck, sc.hp[p.leader - 1], sc.enemyHp(i), seed++, STAGES[i].aiLevel);
        played(p, sc);
        if (r.winner === 'player') { reward(p, i, true, repeatMult); winXp(p, i, true); break; }
        p.items.orbe1 = (p.items.orbe1 ?? 0) + 1;
        if (attempts > (opts.maxAttempts ?? 300)) break;
        if (i > 0) {
          spend(p); levelUp(p, sc);
          const rr = simulate(battleDeck(p, i), STAGES[i - 1].enemyDeck, sc.hp[p.leader - 1], sc.enemyHp(i - 1), seed++, STAGES[i - 1].aiLevel);
          played(p, sc);
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
