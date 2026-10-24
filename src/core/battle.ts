import { ABILITIES, has } from './abilities';
import { getChar } from './characters';
import { statsFor } from './progression';
import { shuffle } from './rng';
import type {
  BattleEvent,
  BattleState,
  CardInstance,
  RecordedEvent,
  Side,
  Snapshot,
  Unit,
} from './types';

export const ROWS = 2;
export const COLS = 7;
export const DEPLOY_DEPTH = 3;
export const HAND_MAX = 6;
export const START_HAND = 4;
export const MAX_ENERGY = 10;

export interface BattleSetup {
  playerDeck: CardInstance[];
  enemyDeck: CardInstance[];
  playerHeroHp: number;
  enemyHeroHp: number;
  seed?: number;
  rows?: number;
  cols?: number;
  maxTurns?: number;
}

/** Coletor de eventos: cada evento leva um retrato do estado para a UI animar. */
export class Ctx {
  events: RecordedEvent[] = [];
  emit(state: BattleState, ev: BattleEvent) {
    state.log.push(ev.text);
    this.events.push({ ...ev, snap: snapshot(state) } as RecordedEvent);
  }
}

export function snapshot(state: BattleState): Snapshot {
  return {
    units: state.units.map((u) => ({ ...u, abilities: u.abilities.slice() })),
    heroes: { player: { ...state.heroes.player }, enemy: { ...state.heroes.enemy } },
    energy: { ...state.energy },
    turn: state.turn,
    active: state.active,
  };
}

export const dir = (side: Side) => (side === 'player' ? 1 : -1);
export const enemyOf = (side: Side): Side => (side === 'player' ? 'enemy' : 'player');
export const energyFor = (turn: number) => Math.min(MAX_ENERGY, 2 + turn);

export function createBattle(setup: BattleSetup): BattleState {
  const state: BattleState = {
    rows: setup.rows ?? ROWS,
    cols: setup.cols ?? COLS,
    turn: 1,
    active: 'player',
    heroes: {
      player: { hp: setup.playerHeroHp, maxHp: setup.playerHeroHp },
      enemy: { hp: setup.enemyHeroHp, maxHp: setup.enemyHeroHp },
    },
    energy: { player: 0, enemy: 0 },
    units: [],
    decks: { player: { draw: [], hand: [] }, enemy: { draw: [], hand: [] } },
    winner: null,
    nextUid: 1,
    seed: setup.seed ?? Math.floor(Math.random() * 1e9),
    maxTurns: setup.maxTurns ?? 40,
    log: [],
  };
  state.decks.player.draw = shuffle(setup.playerDeck.map((c) => ({ ...c })), state);
  state.decks.enemy.draw = shuffle(setup.enemyDeck.map((c) => ({ ...c })), state);
  for (let i = 0; i < START_HAND - 1; i++) {
    drawCard(state, 'player');
    drawCard(state, 'enemy');
  }
  startTurn(state, new Ctx(), 'player');
  return state;
}

function drawCard(state: BattleState, side: Side) {
  const d = state.decks[side];
  if (d.hand.length >= HAND_MAX) return;
  const c = d.draw.shift();
  if (c) d.hand.push(c);
}

export function startTurn(state: BattleState, ctx: Ctx, side: Side) {
  state.active = side;
  state.energy[side] = energyFor(state.turn);
  drawCard(state, side);
  if (side === 'player' && furyBonus(state.turn) > furyBonus(state.turn - 1))
    ctx.emit(state, { type: 'aura', uid: 0, text: `🔥 Fúria de batalha! Todas as unidades ganham +${furyBonus(state.turn)} de ataque.` });
  ctx.emit(state, {
    type: 'turn',
    side,
    turn: state.turn,
    text: `— Turno ${state.turn}: ${side === 'player' ? 'sua vez' : 'vez do inimigo'} (energia ${state.energy[side]}) —`,
  });
}

// ---------- utilidades de grade ----------

export function unitAt(state: BattleState, row: number, col: number): Unit | undefined {
  return state.units.find((u) => u.hp > 0 && u.row === row && u.col === col);
}

export function inBoard(state: BattleState, row: number, col: number) {
  return row >= 0 && row < state.rows && col >= 0 && col < state.cols;
}

export function isDeployCell(state: BattleState, side: Side, row: number, col: number) {
  if (!inBoard(state, row, col)) return false;
  return side === 'player' ? col < DEPLOY_DEPTH : col >= state.cols - DEPLOY_DEPTH;
}

export function deployCells(state: BattleState, side: Side): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < state.rows; r++)
    for (let c = 0; c < state.cols; c++)
      if (isDeployCell(state, side, r, c) && !unitAt(state, r, c)) out.push([r, c]);
  return out;
}

// ---------- criação de unidades ----------

export function makeUnit(
  state: BattleState,
  card: CardInstance,
  side: Side,
  row: number,
  col: number,
  opts: { minion?: boolean; atk?: number; hp?: number } = {},
): Unit {
  const def = getChar(card.charId);
  const s = statsFor(def, card.level, card.stars);
  const hp = opts.hp ?? s.hp;
  return {
    uid: state.nextUid++,
    charId: def.id,
    side,
    row,
    col,
    atk: opts.atk ?? s.atk,
    maxHp: hp,
    hp,
    damageType: def.damageType,
    physRes: def.physRes,
    magRes: def.magRes,
    move: def.move,
    range: def.range,
    abilities: def.abilities.slice(),
    level: card.level,
    stars: card.stars,
    isMinion: !!opts.minion,
    card: opts.minion ? undefined : { ...card },
  };
}

/** Coloca uma unidade diretamente (útil para testes e cenários). */
export function placeUnit(state: BattleState, card: CardInstance, side: Side, row: number, col: number, opts?: { minion?: boolean; atk?: number; hp?: number }): Unit {
  const u = makeUnit(state, card, side, row, col, opts);
  state.units.push(u);
  return u;
}

// ---------- regras de combate ----------

export function rangeOf(u: Unit): number {
  return u.range + u.abilities.reduce((s, id) => s + (ABILITIES[id]?.rangeBonus ?? 0), 0);
}

export function hasRangeBonus(u: Unit): boolean {
  return !!has(u.abilities, (a) => a.rangeBonus);
}

export function auraPenalty(state: BattleState, u: Unit): number {
  let p = 0;
  for (const e of state.units) {
    if (e.hp <= 0 || e.side === u.side) continue;
    const a = has(e.abilities, (x) => x.enemyAtkAura);
    if (a) p += (a.enemyAtkAura ?? 0) + (e.stars >= 6 ? 1 : 0);
  }
  return p;
}

/** Fúria de batalha: a partir do turno FURY_START, todos ganham +1 de ataque a cada FURY_EVERY turnos (evita empates travados). */
export const FURY_START = 8;
export const FURY_EVERY = 3;
export function furyBonus(turn: number): number {
  return turn < FURY_START ? 0 : 1 + Math.floor((turn - FURY_START) / FURY_EVERY);
}

export function effectiveAtk(state: BattleState, u: Unit): number {
  return Math.max(1, u.atk - auraPenalty(state, u)) + furyBonus(state.turn);
}

/** Dano após resistência. Resistência física 1 contra 3 de dano físico = 2. Mínimo 1. */
export function computeDamage(atk: number, type: 'fisico' | 'magico', target: { physRes: number; magRes: number }): number {
  const res = type === 'fisico' ? target.physRes : target.magRes;
  return Math.max(1, atk - res);
}

export function distanceToEnemyHero(state: BattleState, u: Unit): number {
  return u.side === 'player' ? state.cols - u.col : u.col + 1;
}

/**
 * Mira. Regras (arena 2x7):
 * - Básico: inimigo na casa logo à frente (alcance 1). Longo alcance: até 2 casas à frente na fileira.
 * - Herói: atingido quando o herói está dentro do alcance (corpo a corpo: na última coluna).
 * - Miras especiais (último da fila, retaguarda, menor vida) só enxergam até `reach` colunas à frente.
 * - Diagonais: apenas a casa diagonal adjacente (à frente ou atrás).
 */
export function findTarget(state: BattleState, u: Unit): Unit | 'hero' | null {
  const enemies = state.units.filter((e) => e.hp > 0 && e.side !== u.side);
  const ab = has(u.abilities, (a) => a.targeting);
  const targeting = ab?.targeting;
  const d = dir(u.side);
  const r = rangeOf(u);
  const reach = Math.max(r, ab?.reach ?? 0);
  const fwd = (e: Unit) => (e.col - u.col) * d;
  const ahead = (e: Unit) => fwd(e) >= 1 && fwd(e) <= reach;

  if (targeting === 'menorVida') {
    const c = enemies.filter(ahead).sort((a, b) => a.hp - b.hp || fwd(a) - fwd(b) || a.uid - b.uid);
    if (c.length) return c[0];
  } else if (targeting === 'retaguarda') {
    const c = enemies.filter(ahead).sort((a, b) => fwd(b) - fwd(a) || Math.abs(a.row - u.row) - Math.abs(b.row - u.row) || a.uid - b.uid);
    if (c.length) return c[0];
  } else if (targeting === 'ultimoDaFila') {
    const c = enemies.filter((e) => e.row === u.row && ahead(e)).sort((a, b) => fwd(b) - fwd(a));
    if (c.length) return c[0];
  }

  const straight: Unit[] = [];
  const diagF: Unit[] = [];
  const diagB: Unit[] = [];
  for (const e of enemies) {
    const f = fwd(e);
    const dr = Math.abs(e.row - u.row);
    if (dr === 0 && f >= 1 && f <= r) straight.push(e);
    else if (targeting === 'diagFrente' && f === 1 && dr === 1) diagF.push(e);
    else if (targeting === 'diagTras' && f === -1 && dr === 1) diagB.push(e);
  }
  if (diagB.length) return diagB.sort((a, b) => a.hp - b.hp)[0];
  if (straight.length) return straight.sort((a, b) => fwd(a) - fwd(b))[0];
  if (diagF.length) return diagF.sort((a, b) => a.hp - b.hp)[0];
  if (distanceToEnemyHero(state, u) <= r) return 'hero';
  return null;
}

function isMeleeFrontAttack(att: Unit, target: Unit): boolean {
  if (att.damageType !== 'fisico' || hasRangeBonus(att)) return false;
  if (att.row !== target.row) return false;
  const f = (att.col - target.col) * dir(target.side);
  return f === 1;
}

const nameOf = (u: Unit) => `${getChar(u.charId).name}${u.side === 'enemy' ? ' (inimigo)' : ''}`;

function checkWinner(state: BattleState, ctx: Ctx) {
  if (state.winner) return;
  if (state.heroes.enemy.hp <= 0) state.winner = 'player';
  else if (state.heroes.player.hp <= 0) state.winner = 'enemy';
  if (state.winner)
    ctx.emit(state, { type: 'end', winner: state.winner, text: state.winner === 'player' ? '🏆 Vitória! O herói inimigo caiu.' : '💀 Derrota... seu herói caiu.' });
}

export function attack(state: BattleState, ctx: Ctx, u: Unit, target: Unit | 'hero', multiplier = 1, isCounter = false) {
  const atk = effectiveAtk(state, u) * multiplier;
  if (target === 'hero') {
    const side = enemyOf(u.side);
    ctx.emit(state, { type: 'attack', uid: u.uid, target: 'hero', targetSide: side, ranged: true, damageType: u.damageType, text: `${nameOf(u)} ataca o herói ${side === 'enemy' ? 'inimigo' : 'aliado'}!` });
    state.heroes[side].hp = Math.max(0, state.heroes[side].hp - atk);
    ctx.emit(state, { type: 'hero', side, amount: atk, text: `Herói ${side === 'enemy' ? 'inimigo' : 'aliado'} sofre ${atk} de dano (${state.heroes[side].hp}/${state.heroes[side].maxHp}).` });
    checkWinner(state, ctx);
    return;
  }
  const dist = Math.max(Math.abs(target.col - u.col), Math.abs(target.row - u.row));
  const ranged = !(u.damageType === 'fisico' && dist <= 1 && !hasRangeBonus(u));
  const dmg = computeDamage(atk, u.damageType, target);
  ctx.emit(state, {
    type: 'attack',
    uid: u.uid,
    target: target.uid,
    targetSide: target.side,
    ranged,
    damageType: u.damageType,
    text: `${nameOf(u)} ${isCounter ? 'contra-ataca' : 'ataca'} ${nameOf(target)}`,
  });
  target.hp -= dmg;
  const resisted = atk - dmg;
  ctx.emit(state, {
    type: 'damage',
    uid: target.uid,
    amount: dmg,
    damageType: u.damageType,
    text: `  → ${dmg} de dano ${u.damageType === 'fisico' ? 'físico' : 'mágico'}${resisted > 0 ? ` (${resisted} resistido)` : ''}.`,
  });
  if (target.hp <= 0) {
    kill(state, ctx, target, u);
    return;
  }
  // gancho: contra-golpe
  if (!isCounter && u.hp > 0) {
    const c = has(target.abilities, (a) => a.counter)?.counter;
    if (c && isMeleeFrontAttack(u, target)) {
      ctx.emit(state, { type: 'counter', uid: target.uid, target: u.uid, text: `🔁 ${nameOf(target)} ativa ${ABILITIES.contraGolpe.name}!` });
      attack(state, ctx, target, u, c.multiplier, true);
      if (u.hp > 0 && !has(u.abilities, (a) => a.unpushable)) {
        const newCol = u.col - dir(u.side) * c.push;
        if (inBoard(state, u.row, newCol) && !unitAt(state, u.row, newCol)) {
          const from: [number, number] = [u.row, u.col];
          u.col = newCol;
          ctx.emit(state, { type: 'push', uid: u.uid, from, to: [u.row, u.col], text: `  ${nameOf(u)} é empurrado para trás.` });
        }
      }
    }
  }
}

function kill(state: BattleState, ctx: Ctx, victim: Unit, killer: Unit) {
  victim.hp = 0;
  state.units = state.units.filter((x) => x !== victim);
  ctx.emit(state, { type: 'death', uid: victim.uid, text: `✖ ${nameOf(victim)} foi derrotado.` });
  // gancho: invocar ao derrotar
  const summon = has(killer.abilities, (a) => a.onKillSummon)?.onKillSummon;
  if (summon && !unitAt(state, victim.row, victim.col)) {
    const atk = 2 + Math.floor((killer.level - 1) / 10);
    const m = placeUnit(state, { charId: summon, level: killer.level, stars: 1 }, killer.side, victim.row, victim.col, { minion: true, atk, hp: 1 });
    ctx.emit(state, { type: 'spawn', uid: m.uid, text: `🥚 Uma ${getChar(summon).name} surge dos restos!` });
  }
}

export function moveUnit(state: BattleState, ctx: Ctx, u: Unit) {
  const d = dir(u.side);
  const canJump = !!has(u.abilities, (a) => a.jump);
  const from: [number, number] = [u.row, u.col];
  let steps = u.move;
  let jumped = false;
  while (steps > 0) {
    if (findTarget(state, u)) break;
    const next = u.col + d;
    if (!inBoard(state, u.row, next)) break;
    if (!unitAt(state, u.row, next)) {
      u.col = next;
      steps--;
      continue;
    }
    const land = next + d;
    if (canJump && inBoard(state, u.row, land) && !unitAt(state, u.row, land)) {
      u.col = land;
      steps -= 2;
      jumped = true;
      continue;
    }
    break;
  }
  if (u.col !== from[1]) {
    ctx.emit(state, { type: 'move', uid: u.uid, from, to: [u.row, u.col], jumped, text: `${nameOf(u)} ${jumped ? 'salta' : 'avança'} para a coluna ${u.col + 1}.` });
  }
}

/** Ação automática: ataca se houver alvo; senão anda e tenta atacar. */
export function act(state: BattleState, ctx: Ctx, u: Unit) {
  if (u.hp <= 0 || state.winner) return;
  let t = findTarget(state, u);
  if (t) {
    attack(state, ctx, u, t);
    return;
  }
  moveUnit(state, ctx, u);
  t = findTarget(state, u);
  if (t) attack(state, ctx, u, t);
}

export function resolveSide(state: BattleState, ctx: Ctx, side: Side) {
  const order = state.units
    .filter((u) => u.side === side)
    .sort((a, b) => (b.col - a.col) * dir(side) || a.row - b.row)
    .map((u) => u.uid);
  for (const uid of order) {
    if (state.winner) return;
    const u = state.units.find((x) => x.uid === uid);
    if (u) act(state, ctx, u);
  }
}

export function deploy(state: BattleState, side: Side, handIndex: number, row: number, col: number, ctx = new Ctx()): { ok: boolean; reason?: string; events: RecordedEvent[] } {
  if (state.winner) return { ok: false, reason: 'Batalha encerrada', events: [] };
  if (state.active !== side) return { ok: false, reason: 'Não é sua vez', events: [] };
  const card = state.decks[side].hand[handIndex];
  if (!card) return { ok: false, reason: 'Carta inválida', events: [] };
  const def = getChar(card.charId);
  if (state.energy[side] < def.cost) return { ok: false, reason: 'Energia insuficiente', events: [] };
  if (!isDeployCell(state, side, row, col)) return { ok: false, reason: 'Fora da zona de invocação', events: [] };
  if (unitAt(state, row, col)) return { ok: false, reason: 'Casa ocupada', events: [] };
  state.decks[side].hand.splice(handIndex, 1);
  // a carta usada volta ao fim do baralho: pode ser comprada de novo mesmo com o personagem em campo
  state.decks[side].draw.push({ ...card });
  state.energy[side] -= def.cost;
  const u = placeUnit(state, card, side, row, col);
  ctx.emit(state, { type: 'deploy', uid: u.uid, text: `${side === 'player' ? 'Você invoca' : 'Inimigo invoca'} ${def.name} (${card.stars}★ Nv.${card.level}).` });
  const aura = has(u.abilities, (a) => a.enemyAtkAura);
  if (aura) ctx.emit(state, { type: 'aura', uid: u.uid, text: `🌀 ${def.name} drena o ataque de todos os inimigos!` });
  return { ok: true, events: ctx.events };
}

function endRoundIfNeeded(state: BattleState, ctx: Ctx) {
  if (state.winner) return;
  if (state.turn >= state.maxTurns) {
    const p = state.heroes.player.hp / state.heroes.player.maxHp;
    const e = state.heroes.enemy.hp / state.heroes.enemy.maxHp;
    state.winner = p > e ? 'player' : e > p ? 'enemy' : 'empate';
    ctx.emit(state, { type: 'end', winner: state.winner, text: `⏱ Limite de turnos! ${state.winner === 'player' ? 'Vitória por vida restante.' : state.winner === 'enemy' ? 'Derrota por vida restante.' : 'Empate.'}` });
  }
}

/**
 * Encerra o turno do jogador: suas unidades agem, a IA invoca e age,
 * e um novo turno começa. Retorna os eventos para animação.
 */
export function endPlayerTurn(state: BattleState, ai: (s: BattleState, ctx: Ctx, side: Side) => void): RecordedEvent[] {
  const ctx = new Ctx();
  if (state.winner || state.active !== 'player') return ctx.events;
  resolveSide(state, ctx, 'player');
  if (state.winner) return ctx.events;
  startTurn(state, ctx, 'enemy');
  ai(state, ctx, 'enemy');
  resolveSide(state, ctx, 'enemy');
  if (state.winner) return ctx.events;
  endRoundIfNeeded(state, ctx);
  if (state.winner) return ctx.events;
  state.turn++;
  startTurn(state, ctx, 'player');
  return ctx.events;
}
