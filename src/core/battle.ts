import { ABILITIES, AURA_CAP, BUFF_CAP, MINION_CAP, RES_CAP, abilityPower, has } from './abilities';
import { getChar } from './characters';
import { statsFor, tierLabel } from './progression';
import { castFromHand, createDeck, deckProblem, defeatCopy, drawOpening, drawStep, playFromHand, returnFromNecropolis, HAND_SIZE } from './deck';
import { SPELL_NUM, getSpell, isSpell } from './spells';
import type {
  AbilityId,
  BattleEvent,
  BattleState,
  CardInstance,
  Effect,
  EffectKind,
  RecordedEvent,
  Side,
  Snapshot,
  Unit,
} from './types';

export const ROWS = 2;
export const COLS = 12;
export const DEPLOY_DEPTH = 3;
export const HAND_MAX = HAND_SIZE;
/**
 * v0.16.0: contagem de rodadas no lugar da energia. Cada carta que entra na mão espera
 * `2 × custo − 1` rodadas (custo 2 → 3, 3 → 5, 4 → 7, 5 → 9, 6 → 11; a gota mostra quantas faltam)
 * e só pode ser invocada quando chega a 0. Escolhido pela simulação das 10 fases
 * (espera = custo deixava as fases 4–6 e 10 muito difíceis: enxurrada de unidades caras).
 */
export const waitFor = (charId: string) => (isSpell(charId) ? Math.max(1, getSpell(charId).cost - 1) : Math.max(1, 2 * getChar(charId).cost - 1));
/** A mão inicial começa 2 rodadas adiantada: cartas de custo 2 ficam prontas já no turno 1. */
export const OPENING_HEADSTART = 2;

export interface BattleSetup {
  playerDeck: CardInstance[];
  enemyDeck: CardInstance[];
  playerHeroHp: number;
  enemyHeroHp: number;
  seed?: number;
  rows?: number;
  cols?: number;
  maxTurns?: number;
  /** Fúria de batalha ligada (padrão: sim) */
  fury?: boolean;
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
    units: state.units.map((u) => ({ ...u, abilities: u.abilities.slice(), effects: u.effects?.map((e) => ({ ...e })) })),
    heroes: { player: { ...state.heroes.player }, enemy: { ...state.heroes.enemy } },
    turn: state.turn,
    active: state.active,
  };
}

export const dir = (side: Side) => (side === 'player' ? 1 : -1);
export const enemyOf = (side: Side): Side => (side === 'player' ? 'enemy' : 'player');

/**
 * Cria a batalha. Cada baralho precisa de exatamente 10 cartas diferentes (regra v0.8);
 * um baralho vazio só é aceito para cenários de teste (unidades colocadas à mão).
 */
export function createBattle(setup: BattleSetup): BattleState {
  for (const [who, cards] of [['jogador', setup.playerDeck], ['inimigo', setup.enemyDeck]] as const) {
    const problem = cards.length ? deckProblem(cards) : null;
    if (problem) throw new Error(`Baralho do ${who} inválido: ${problem}`);
  }
  const state: BattleState = {
    rows: setup.rows ?? ROWS,
    cols: setup.cols ?? COLS,
    turn: 1,
    active: 'player',
    heroes: {
      player: { hp: setup.playerHeroHp, maxHp: setup.playerHeroHp },
      enemy: { hp: setup.enemyHeroHp, maxHp: setup.enemyHeroHp },
    },
    units: [],
    decks: { player: createDeck([], { seed: 0 }), enemy: createDeck([], { seed: 0 }) },
    winner: null,
    nextUid: 1,
    seed: setup.seed ?? Math.floor(Math.random() * 1e9),
    maxTurns: setup.maxTurns ?? 40,
    fury: setup.fury ?? true,
    log: [],
  };
  // v0.18.0: grava a configuração com a semente INICIAL (o sorteio muda state.seed a cada uso)
  state.record = { version: 1, setup: JSON.parse(JSON.stringify({ ...setup, seed: state.seed })), actions: [] };
  state.decks.player = createDeck(setup.playerDeck, state);
  state.decks.enemy = createDeck(setup.enemyDeck, state);
  for (const side of ['player', 'enemy'] as const)
    for (const h of drawOpening(state.decks[side], state)) h.wait = Math.max(0, waitFor(h.charId) - OPENING_HEADSTART);
  startTurn(state, new Ctx(), 'player');
  return state;
}

/**
 * Compra da rodada: quantas cartas faltarem para a mão voltar a ter 6 (tudo numa compra só).
 * Mão cheia: não compra e a fila não anda.
 */
export function refillCount(state: BattleState, side: Side): number {
  return Math.max(0, HAND_SIZE - state.decks[side].hand.length);
}
function drawCard(state: BattleState, side: Side) {
  for (const h of drawStep(state.decks[side], state, refillCount(state, side))) h.wait = waitFor(h.charId);
}
/** Rodadas que faltam para a carta da mão poder ser invocada (0 = pronta). */
export const waitOf = (card: { charId: string; wait?: number }) => card.wait ?? 0;
/** Início do turno do lado: as cartas que já estavam na mão andam 1 rodada. */
function tickHand(state: BattleState, side: Side) {
  for (const h of state.decks[side].hand) h.wait = Math.max(0, waitOf(h) - 1);
}

export function startTurn(state: BattleState, ctx: Ctx, side: Side) {
  state.active = side;
  tickHand(state, side);
  drawCard(state, side);
  if (side === 'player' && state.fury && furyBonus(state.turn) > furyBonus(state.turn - 1))
    ctx.emit(state, { type: 'aura', uid: 0, text: `🔥 Fúria de batalha! Todas as unidades ganham +${furyBonus(state.turn)} de ataque.` });
  ctx.emit(state, {
    type: 'turn',
    side,
    turn: state.turn,
    text: `— Turno ${state.turn}: ${side === 'player' ? 'sua vez' : 'vez do inimigo'} (${state.decks[side].hand.filter((h) => !waitOf(h)).length} carta(s) pronta(s)) —`,
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
  const s = statsFor(def, card.level, card.stars, !opts.minion && !!card.plus);
  const hp = opts.hp ?? s.hp;
  // v0.17.0 (decisão 14): resistência só vem de habilidade
  let physRes = 0;
  let magRes = 0;
  for (const id of def.abilities) {
    const rb = ABILITIES[id].resBonus?.(card.stars);
    if (rb) {
      physRes += rb.phys;
      magRes += rb.mag;
    }
  }
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
    physRes: Math.min(RES_CAP, physRes),
    magRes: Math.min(RES_CAP, magRes),
    move: def.move,
    range: def.range,
    abilities: def.abilities.slice(),
    level: card.level,
    stars: card.stars,
    plus: !opts.minion && !!card.plus,
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

const pw = (u: Unit, id: AbilityId) => (u.abilities.includes(id) ? abilityPower(id, u.stars, u.level) : 0);

export function auraPenalty(state: BattleState, u: Unit): number {
  let p = 0;
  for (const e of state.units) {
    if (e.hp <= 0 || e.side === u.side) continue;
    if (has(e.abilities, (x) => x.enemyAtkAura)) p += pw(e, 'sifao');
  }
  return Math.min(AURA_CAP, p);
}

/** Fúria de batalha: a partir do turno FURY_START, todos ganham +1 de ataque a cada FURY_EVERY turnos (evita empates travados). */
export const FURY_START = 8;
export const FURY_EVERY = 3;
export function furyBonus(turn: number): number {
  return turn < FURY_START ? 0 : 1 + Math.floor((turn - FURY_START) / FURY_EVERY);
}

/** Tambor de Guerra: o maior bônus entre os aliados vizinhos (não acumula), com teto. */
export function allyBuff(state: BattleState, u: Unit): number {
  if (u.isMinion && u.charId === 'cria') return 0;
  let b = 0;
  for (const a of state.units) {
    if (a === u || a.hp <= 0 || a.side !== u.side) continue;
    if (Math.abs(a.row - u.row) > 1 || Math.abs(a.col - u.col) > 1) continue;
    if (has(a.abilities, (x) => x.allyAtkAura)) b = Math.max(b, pw(a, 'tambor'));
  }
  return Math.min(BUFF_CAP, b);
}

export function effectiveAtk(state: BattleState, u: Unit): number {
  return Math.max(1, u.atk - auraPenalty(state, u)) + allyBuff(state, u) + (state.fury ? furyBonus(state.turn) : 0);
}

/** Dano após resistência. Resistência física 1 contra 3 de dano físico = 2. Mínimo 1. `pierce` ignora parte da resistência. */
export function computeDamage(atk: number, type: 'fisico' | 'magico', target: { physRes: number; magRes: number }, pierce = 0): number {
  const res = Math.max(0, (type === 'fisico' ? target.physRes : target.magRes) - pierce);
  return Math.max(1, atk - res);
}

export function distanceToEnemyHero(state: BattleState, u: Unit): number {
  return u.side === 'player' ? state.cols - u.col : u.col + 1;
}

/**
 * Mira. Regras (arena 2 × 12):
 * - Ninguém ataca unidades da OUTRA fileira, exceto as habilidades diagonais (Corte Diagonal / Golpe Reverso)
 *   e o respingo lateral da Explosão de Brasas.
 * - Básico: inimigo na casa logo à frente (alcance 1). Longo alcance: o inimigo MAIS PRÓXIMO até 4 casas à frente (v0.16.0).
 * - Miras especiais (retaguarda = mais distante; menor vida) olham só a própria fileira até `reach` casas.
 * - Comandante: funciona como uma unidade numa coluna virtual logo após o fim da arena, alcançável pelas duas
 *   fileiras. Sem unidade inimiga válida, qualquer unidade ataca o Comandante com seu alcance.
 */
export function findTarget(state: BattleState, u: Unit): Unit | 'hero' | null {
  const enemies = state.units.filter((e) => e.hp > 0 && e.side !== u.side);
  const ab = has(u.abilities, (a) => a.targeting);
  const targeting = ab?.targeting;
  const d = dir(u.side);
  const r = rangeOf(u);
  const reach = Math.max(r, ab?.reach ?? 0);
  const fwd = (e: Unit) => (e.col - u.col) * d;
  const rowAhead = enemies.filter((e) => e.row === u.row && fwd(e) >= 1 && fwd(e) <= reach);

  if (targeting === 'menorVida' && rowAhead.length) {
    return rowAhead.sort((a, b) => a.hp - b.hp || fwd(a) - fwd(b))[0];
  }
  if (targeting === 'longoAlcance') {
    const casters = rowAhead.filter((e) => hasRangeBonus(e)).sort((a, b) => fwd(a) - fwd(b));
    if (casters.length) return casters[0];
  }
  if (targeting === 'maiorAtaque' && rowAhead.length) {
    return rowAhead.sort((a, b) => b.atk - a.atk || fwd(a) - fwd(b))[0];
  }
  if (targeting === 'retaguarda' && rowAhead.length) {
    return rowAhead.sort((a, b) => fwd(b) - fwd(a))[0];
  }
  if (targeting === 'diagTras') {
    const back = enemies.filter((e) => fwd(e) === -1 && Math.abs(e.row - u.row) === 1);
    if (back.length) return back.sort((a, b) => a.hp - b.hp)[0];
  }
  const straight = enemies.filter((e) => e.row === u.row && fwd(e) >= 1 && fwd(e) <= r).sort((a, b) => fwd(a) - fwd(b));
  if (straight.length) return straight[0];
  if (targeting === 'diagFrente') {
    const diag = enemies.filter((e) => fwd(e) === 1 && Math.abs(e.row - u.row) === 1);
    if (diag.length) return diag.sort((a, b) => a.hp - b.hp)[0];
  }
  if (distanceToEnemyHero(state, u) <= reach) return 'hero';
  return null;
}

function isMeleeFrontAttack(att: Unit, target: Unit): boolean {
  if (att.damageType !== 'fisico' || hasRangeBonus(att)) return false;
  if (att.row !== target.row) return false;
  return (att.col - target.col) * dir(target.side) === 1;
}

const nameOf = (u: Unit) => `${getChar(u.charId).name}${u.side === 'enemy' ? ' (inimigo)' : ''}`;

function checkWinner(state: BattleState, ctx: Ctx) {
  if (state.winner) return;
  if (state.heroes.enemy.hp <= 0) state.winner = 'player';
  else if (state.heroes.player.hp <= 0) state.winner = 'enemy';
  if (state.winner)
    ctx.emit(state, { type: 'end', winner: state.winner, text: state.winner === 'player' ? '🏆 Vitória! O Comandante inimigo caiu.' : '💀 Derrota... seu Comandante caiu.' });
}

export interface AttackOpts {
  /** multiplicador do ataque (contra-golpe) */
  mult?: number;
  /** é um contra-ataque (não gera outro contra) */
  counter?: boolean;
  /** bônus somado ao ataque */
  bonus?: number;
  /** porcentagem do ataque (golpes secundários) */
  pct?: number;
  /** ataque fixo (2ª flecha) */
  fixed?: number;
  /** golpe secundário: não aciona contra-golpe */
  secondary?: boolean;
  label?: string;
}

// ---------- v0.17.0: efeitos com duração, dano centralizado, salvamentos ----------

export const effectOf = (u: Unit, kind: EffectKind): Effect | undefined => u.effects?.find((e) => e.kind === kind && e.turns > 0);
export const isStunned = (u: Unit) => !!effectOf(u, 'atordoado');
const EFFECT_ICON: Record<EffectKind, string> = { veneno: '🧪', queimadura: '🔥', atordoado: '💫', escudo: '🛡', anjo: '👼' };
const EFFECT_NAME: Record<EffectKind, string> = { veneno: 'envenenado', queimadura: 'em chamas', atordoado: 'atordoado', escudo: 'com escudo', anjo: 'protegido pelo Anjo da Guarda' };

/**
 * Aplica um efeito com duração. Veneno/queimadura: fica o mais forte e a duração maior (não acumula).
 * Escudo: soma os pontos (teto 99) e fica a duração maior. Atordoar/anjo: só renova.
 */
export function addEffect(state: BattleState, ctx: Ctx, u: Unit, kind: EffectKind, amount: number, turns: number) {
  if (u.hp <= 0) return;
  u.effects ??= [];
  const cur = u.effects.find((e) => e.kind === kind);
  if (cur) {
    cur.amount = kind === 'escudo' ? Math.min(99, cur.amount + amount) : Math.max(cur.amount, amount);
    cur.turns = Math.max(cur.turns, turns);
  } else u.effects.push({ kind, amount, turns });
  const extra = kind === 'veneno' || kind === 'queimadura' ? ` (${amount}/rodada, ${turns} rodada${turns > 1 ? 's' : ''})` : kind === 'escudo' ? ` (${amount}, ${turns} rodadas)` : '';
  ctx.emit(state, { type: 'effect', uid: u.uid, kind, text: `  ${EFFECT_ICON[kind]} ${nameOf(u)} fica ${EFFECT_NAME[kind]}${extra}.` });
}

function dropExpired(u: Unit) {
  if (u.effects) u.effects = u.effects.filter((e) => e.turns > 0 && (e.kind !== 'escudo' || e.amount > 0));
}

/** Início do lado: veneno (ignora resistência) e queimadura (reduzida pela resistência mágica) fazem dano. */
function tickDots(state: BattleState, ctx: Ctx, side: Side) {
  for (const u of state.units.filter((x) => x.side === side && x.hp > 0)) {
    for (const kind of ['veneno', 'queimadura'] as const) {
      const e = effectOf(u, kind);
      if (!e || state.winner || u.hp <= 0) continue;
      const dmg = kind === 'veneno' ? e.amount : computeDamage(e.amount, 'magico', u);
      e.turns--;
      ctx.emit(state, { type: 'effect', uid: u.uid, kind, text: `${EFFECT_ICON[kind]} ${nameOf(u)} sofre ${dmg} de ${kind === 'veneno' ? 'veneno' : 'queimadura'}.` });
      applyDamage(state, ctx, u, dmg, kind === 'veneno' ? 'fisico' : 'magico', { side: enemyOf(side), dot: true });
    }
    dropExpired(u);
  }
}

/**
 * Fim do lado: o atordoar das unidades desse lado perde 1 rodada; o escudo temporário perde 1 rodada
 * no fim do turno do ADVERSÁRIO (v0.17.1: escudo de 2 rodadas protege contra 2 turnos inimigos).
 */
function tickEnd(state: BattleState, side: Side) {
  for (const u of state.units) {
    for (const e of u.effects ?? []) {
      if (e.kind === 'atordoado' && u.side === side) e.turns--;
      if (e.kind === 'escudo' && u.side !== side) e.turns--;
    }
    dropExpired(u);
  }
}

export interface DamageSource {
  side: Side;
  unit?: Unit;
  spell?: boolean;
  dot?: boolean;
}

/**
 * Aplica dano numa unidade: escudo temporário absorve primeiro; Reflexo de Magia devolve parte do dano mágico
 * ou de feitiço (só se ela continuar de pé); depois confere morte (Anjo da Guarda e Renascer salvam). Retorna true se a unidade caiu.
 */
export function applyDamage(state: BattleState, ctx: Ctx, target: Unit, dmg: number, type: 'fisico' | 'magico', src: DamageSource, note = ''): boolean {
  let amount = Math.max(0, dmg);
  // Reflexo de Magia (só contra dano mágico de ataque ou de feitiço; não reflete veneno/queimadura)
  const refl = !src.dot && (type === 'magico' || src.spell) ? pw(target, 'reflexo') : 0;
  let reflected = 0;
  if (refl && amount > 0) {
    reflected = Math.floor((amount * refl) / 100);
    amount -= reflected;
  }
  const sh = effectOf(target, 'escudo');
  let absorbed = 0;
  if (sh && amount > 0) {
    absorbed = Math.min(sh.amount, amount);
    sh.amount -= absorbed;
    amount -= absorbed;
    dropExpired(target);
  }
  target.hp -= amount;
  if (!src.dot || absorbed)
    ctx.emit(state, {
      type: 'damage',
      uid: target.uid,
      amount,
      damageType: type,
      text: `  → ${amount} de dano ${type === 'fisico' ? 'físico' : 'mágico'}${note}${absorbed ? ` (🛡 escudo absorve ${absorbed})` : ''}.`,
    });
  else ctx.emit(state, { type: 'damage', uid: target.uid, amount, damageType: type, text: `  → ${amount} de dano.` });
  const dead = target.hp <= 0 ? checkDeath(state, ctx, target, src.unit) : false;
  // v0.20.1: só reflete quem continua de pé (derrotada, a Nyx não devolve dano; salva pelo Anjo/Renascer, devolve)
  if (reflected > 0 && !dead) {
    ctx.emit(state, { type: 'effect', uid: target.uid, kind: 'reflexo', text: `  🪞 ${nameOf(target)} reflete ${reflected} de dano mágico!` });
    if (src.unit && !src.spell && src.unit.hp > 0 && state.units.includes(src.unit)) applyDamage(state, ctx, src.unit, reflected, 'magico', { side: target.side, unit: target, dot: false, spell: false });
    else if (src.spell) hitHero(state, ctx, src.side, reflected, `🪞 O reflexo atinge o Comandante ${src.side === 'player' ? 'aliado' : 'inimigo'}`);
  }
  return dead;
}

function hitHero(state: BattleState, ctx: Ctx, side: Side, amount: number, why: string) {
  if (state.winner) return;
  state.heroes[side].hp = Math.max(0, state.heroes[side].hp - amount);
  ctx.emit(state, { type: 'hero', side, amount, text: `${why}: ${amount} de dano (${state.heroes[side].hp}/${state.heroes[side].maxHp}).` });
  checkWinner(state, ctx);
}

/** A unidade chegou a 0: Anjo da Guarda (efeito do feitiço, depois a habilidade de um vizinho) e Renascer salvam. */
function checkDeath(state: BattleState, ctx: Ctx, victim: Unit, killer?: Unit): boolean {
  if (victim.hp > 0) return false;
  const shield = effectOf(victim, 'anjo');
  if (shield) {
    shield.turns = 0;
    dropExpired(victim);
    victim.hp = 1;
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'anjo', text: `  👼 O Anjo da Guarda salva ${nameOf(victim)} (fica com 1 de vida)!` });
    return false;
  }
  const angel = state.units.find((a) => a.side === victim.side && (a.hp > 0 || a === victim) && !a.angelUsed && a.abilities.includes('anjo') && Math.abs(a.row - victim.row) <= 1 && Math.abs(a.col - victim.col) <= 1);
  if (angel) {
    angel.angelUsed = true;
    victim.hp = 1;
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'anjo', text: angel === victim ? `  👼 ${nameOf(angel)} (Anjo da Guarda) se salva: fica com 1 de vida!` : `  👼 ${nameOf(angel)} (Anjo da Guarda) salva ${nameOf(victim)}: fica com 1 de vida!` });
    return false;
  }
  if (victim.abilities.includes('renascer') && !victim.revived && !victim.isMinion) {
    victim.revived = true;
    victim.effects = [];
    victim.hp = Math.max(1, Math.ceil((victim.maxHp * pw(victim, 'renascer')) / 100));
    ctx.emit(state, { type: 'effect', uid: victim.uid, kind: 'renascer', text: `  ♻ ${nameOf(victim)} renasce com ${victim.hp} de vida!` });
    return false;
  }
  kill(state, ctx, victim, killer);
  return true;
}

/** Empurra a unidade 1 casa para trás (do ponto de vista dela), se a casa estiver livre e ela não for Inabalável. */
export function pushBack(state: BattleState, ctx: Ctx, u: Unit): boolean {
  if (u.hp <= 0 || has(u.abilities, (a) => a.unpushable)) return false;
  const newCol = u.col - dir(u.side);
  if (!inBoard(state, u.row, newCol) || unitAt(state, u.row, newCol)) return false;
  const from: [number, number] = [u.row, u.col];
  u.col = newCol;
  ctx.emit(state, { type: 'push', uid: u.uid, from, to: [u.row, u.col], text: `  ${nameOf(u)} é empurrado para trás.` });
  return true;
}

export function attack(state: BattleState, ctx: Ctx, u: Unit, target: Unit | 'hero', opts: AttackOpts = {}) {
  let atk = opts.fixed ?? Math.round(effectiveAtk(state, u) * (opts.mult ?? 1)) + (opts.bonus ?? 0);
  if (opts.pct != null && opts.fixed == null) atk = Math.max(1, Math.ceil((atk * opts.pct) / 100));
  const verb = opts.label ?? (opts.counter ? 'contra-ataca' : 'ataca');
  if (target === 'hero') {
    if (!opts.counter && !opts.secondary) atk += pw(u, 'mare');
    const side = enemyOf(u.side);
    ctx.emit(state, { type: 'attack', uid: u.uid, target: 'hero', targetSide: side, ranged: true, damageType: u.damageType, text: `${nameOf(u)} ${verb} o Comandante ${side === 'enemy' ? 'inimigo' : 'aliado'}!` });
    state.heroes[side].hp = Math.max(0, state.heroes[side].hp - atk);
    ctx.emit(state, { type: 'hero', side, amount: atk, text: `Comandante ${side === 'enemy' ? 'inimigo' : 'aliado'} sofre ${atk} de dano (${state.heroes[side].hp}/${state.heroes[side].maxHp}).` });
    checkWinner(state, ctx);
    return;
  }
  // execução (Instinto Predador)
  if (!opts.counter && u.abilities.includes('menorVida') && target.hp * 2 <= target.maxHp) atk += pw(u, 'menorVida');
  const dist = Math.max(Math.abs(target.col - u.col), Math.abs(target.row - u.row));
  if (!opts.counter && !opts.secondary && opts.fixed == null) {
    // Olho de Águia (2+ casas), Caça-Conjuradores (alvo de longo alcance), Ataque Surpresa (vida cheia)
    if (dist >= 2) atk += pw(u, 'olhoAguia');
    if (hasRangeBonus(target)) atk += pw(u, 'cacaMagos');
    if (target.hp >= target.maxHp) atk += pw(u, 'surpresa');
  }
  const pierce = pw(u, 'retaguarda') + pw(u, 'precisao');
  const ranged = !(u.damageType === 'fisico' && dist <= 1 && !hasRangeBonus(u));
  const dmg = computeDamage(atk, u.damageType, target, pierce);
  ctx.emit(state, { type: 'attack', uid: u.uid, target: target.uid, targetSide: target.side, ranged, damageType: u.damageType, text: `${nameOf(u)} ${verb} ${nameOf(target)}` });
  const resisted = atk - dmg;
  const front = isMeleeFrontAttack(u, target);
  if (applyDamage(state, ctx, target, dmg, u.damageType, { side: u.side, unit: u }, resisted > 0 ? ` (${resisted} resistido)` : '')) return;
  if (state.winner || u.hp <= 0 || !state.units.includes(u)) return;
  // gancho: Couraça de Espinhos (só golpe principal, físico corpo a corpo de frente)
  if (!opts.counter && !opts.secondary && has(target.abilities, (a) => a.thorns) && front) {
    const back = pw(target, 'espinhos');
    if (applyDamage(state, ctx, u, back, 'fisico', { side: target.side, unit: target }, ` 🌵 dos espinhos de ${nameOf(target)} em ${nameOf(u)}`)) return;
  }
  // gancho: contra-golpe
  if (!opts.counter && !opts.secondary && u.hp > 0 && has(target.abilities, (a) => a.counter) && front) {
    ctx.emit(state, { type: 'counter', uid: target.uid, target: u.uid, text: `🔁 ${nameOf(target)} ativa ${ABILITIES.contraGolpe.name}!` });
    attack(state, ctx, target, u, { mult: pw(target, 'contraGolpe'), counter: true });
    if (u.hp > 0 && state.units.includes(u)) pushBack(state, ctx, u);
    return;
  }
  // v0.17.0 gancho: Ombrada (Gorath) — empurra o alvo ao acertar corpo a corpo de frente
  if (!opts.counter && !opts.secondary && front && has(u.abilities, (a) => a.pushOnHit) && target.hp > 0 && state.units.includes(target)) pushBack(state, ctx, target);
}

function kill(state: BattleState, ctx: Ctx, victim: Unit, killer?: Unit) {
  victim.hp = 0;
  state.units = state.units.filter((x) => x !== victim);
  if (victim.slot != null) defeatCopy(state.decks[victim.side], victim.slot);
  ctx.emit(state, { type: 'death', uid: victim.uid, text: `✖ ${nameOf(victim)} foi derrotado.` });
  if (!killer) return;
  // v0.15.0: sem "passo da vitória" — quem derrota fica onde está.
  const oldPos: [number, number] = [killer.row, killer.col];
  // gancho: invocar ao derrotar
  const summon = has(killer.abilities, (a) => a.onKillSummon)?.onKillSummon;
  if (summon && killer.side !== victim.side) {
    const alive = state.units.filter((x) => x.side === killer.side && x.charId === summon).length;
    if (alive < MINION_CAP) {
      const spot = [[victim.row, victim.col], oldPos].find(([r, c]) => inBoard(state, r, c) && !unitAt(state, r, c));
      if (spot) {
        const atk = criaAtk(killer.stars);
        const hp = pw(killer, 'prole') || 1;
        const m = placeUnit(state, { charId: summon, level: killer.level, stars: killer.stars }, killer.side, spot[0], spot[1], { minion: true, atk, hp });
        ctx.emit(state, { type: 'spawn', uid: m.uid, text: `🥚 Uma ${getChar(summon).name} surge dos restos!` });
      }
    }
  }
}

/** Ataque da Cria Sombria: 2 com o Vorax Lendário (ou menos), 3 com o Vorax Mítico (o "+" não muda a Cria). */
export function criaAtk(stars: number): number {
  return stars >= 6 ? 3 : 2;
}

/** Salto Vendaval: anda até SALTO_MOVE casas em qualquer cor/nível (fixo, não escala). */
export const SALTO_MOVE = 3;

/** Quantas casas a unidade anda por ação (Salto Vendaval = 3 fixo; demais = atributo `move`). */
export function moveRange(u: Unit): number {
  return has(u.abilities, (a) => a.jump) ? SALTO_MOVE : u.move;
}

/**
 * Salto Vendaval (v0.15.4): o movimento do Riku É o salto. Casa de pouso = a 3ª casa à frente;
 * se estiver ocupada ou fora do campo, a 2ª; se também, a 1ª; se as três estiverem ocupadas (ou fora), ele fica.
 * Passa por cima de quem estiver no caminho (aliado ou inimigo). Nunca vai além da 3ª e não anda depois de cair.
 */
export function leapLanding(state: BattleState, u: Unit): number | null {
  const d = dir(u.side);
  for (const k of [SALTO_MOVE, 2, 1]) {
    const c = u.col + k * d;
    if (inBoard(state, u.row, c) && !unitAt(state, u.row, c)) return c;
  }
  return null;
}

function leapMove(state: BattleState, ctx: Ctx, u: Unit): boolean {
  const land = leapLanding(state, u);
  if (land == null) return false;
  const d = dir(u.side);
  const start = u.col;
  const from: [number, number] = [u.row, start];
  const through: [number, number][] = [];
  for (let c = start + d; (land - c) * d > 0; c += d) {
    const o = unitAt(state, u.row, c);
    if (o && o.side === u.side) through.push([u.row, c]);
  }
  u.col = land;
  ctx.emit(state, { type: 'move', uid: u.uid, from, to: [u.row, land], jumped: true, through, text: `${nameOf(u)} salta para a coluna ${land + 1}.` });
  return true;
}

/**
 * Move a unidade. Retorna true só quando o Riku salta (Salto Vendaval: seta JUMP + investida).
 * Demais (v0.15.0): andam até `move` casas, atravessam ALIADOS mas só param em casa livre (senão ficam na
 * última casa livre antes deles); inimigos bloqueiam; param assim que um alvo entra no alcance (checado nas casas livres).
 */
export function moveUnit(state: BattleState, ctx: Ctx, u: Unit, opts: { leapFront?: boolean } = {}): boolean {
  if (has(u.abilities, (a) => a.jump)) {
    if (!opts.leapFront && findTarget(state, u)) return false;
    return leapMove(state, ctx, u);
  }
  const d = dir(u.side);
  const start = u.col;
  const from: [number, number] = [u.row, start];
  if (findTarget(state, u)) return false;
  let stop = start;
  const over: number[] = [];
  for (let k = 1; k <= u.move; k++) {
    const c = start + k * d;
    if (!inBoard(state, u.row, c)) break;
    const occ = unitAt(state, u.row, c);
    if (occ && occ !== u) {
      if (occ.side === u.side) {
        over.push(c);
        continue;
      }
      break;
    }
    stop = c;
    u.col = c;
    if (findTarget(state, u)) break;
  }
  u.col = stop;
  const passed = over.filter((c) => (c - start) * d > 0 && (stop - c) * d > 0);
  if (stop !== start) {
    const how = passed.length ? 'passa pelos aliados e avança' : 'avança';
    ctx.emit(state, { type: 'move', uid: u.uid, from, to: [u.row, stop], jumped: false, through: passed.map((c) => [u.row, c] as [number, number]), text: `${nameOf(u)} ${how} para a coluna ${stop + 1}.` });
  }
  return false;
}

/** Bênção do Lótus (v0.15.1): cura só os 2 aliados vizinhos mais feridos (mais vida perdida; empate: menos vida, depois quem entrou antes). */
export const LOTUS_TARGETS = 2;
function healNeighbors(state: BattleState, ctx: Ctx, u: Unit) {
  const amount = pw(u, 'lotus');
  if (!amount) return;
  const hurt = state.units
    .filter((a) => a !== u && a.side === u.side && a.hp > 0 && a.hp < a.maxHp && Math.abs(a.row - u.row) <= 1 && Math.abs(a.col - u.col) <= 1)
    .sort((a, b) => b.maxHp - b.hp - (a.maxHp - a.hp) || a.hp - b.hp || a.uid - b.uid)
    .slice(0, LOTUS_TARGETS);
  for (const a of hurt) {
    const h = Math.min(amount, a.maxHp - a.hp);
    a.hp += h;
    ctx.emit(state, { type: 'heal', uid: a.uid, amount: h, text: `✚ ${nameOf(u)} cura ${nameOf(a)} em ${h}.` });
  }
}

/** Sopro Restaurador: cura o aliado mais ferido da própria fileira. */
function healRow(state: BattleState, ctx: Ctx, u: Unit) {
  const amount = pw(u, 'sopro');
  if (!amount) return;
  const hurt = state.units
    .filter((a) => a !== u && a.side === u.side && a.hp > 0 && a.row === u.row && a.hp < a.maxHp)
    .sort((a, b) => b.maxHp - b.hp - (a.maxHp - a.hp) || a.hp - b.hp)[0];
  if (!hurt) return;
  const h = Math.min(amount, hurt.maxHp - hurt.hp);
  hurt.hp += h;
  ctx.emit(state, { type: 'heal', uid: hurt.uid, amount: h, text: `🍃 ${nameOf(u)} cura ${nameOf(hurt)} em ${h}.` });
}

/** Golpe completo de uma unidade: alvo principal + efeitos de habilidade. */
function strike(state: BattleState, ctx: Ctx, u: Unit, t: Unit | 'hero', bonus = 0) {
  if (t === 'hero') {
    attack(state, ctx, u, 'hero', { bonus });
    return;
  }
  const d = dir(u.side);
  const tRow = t.row;
  const tCol = t.col;
  attack(state, ctx, u, t, { bonus });
  if (state.winner || u.hp <= 0) return;
  // Corte Diagonal: ao bater em frente, também corta a diagonal
  const cleave = pw(u, 'diagFrente');
  if (cleave && tRow === u.row) {
    for (const e of state.units.filter((e) => e.side !== u.side && e.hp > 0 && Math.abs(e.row - u.row) === 1 && (e.col - u.col) * d === 1)) {
      attack(state, ctx, u, e, { pct: cleave, secondary: true, label: 'corta na diagonal' });
      if (state.winner || u.hp <= 0) return;
    }
  }
  // Feixe Perfurante: atinge os que estão atrás do alvo, na mesma fileira e no alcance
  if (u.abilities.includes('perfurante')) {
    const pct = pw(u, 'perfurante');
    const r = rangeOf(u);
    const behind = state.units.filter((e) => e.side !== u.side && e.hp > 0 && e.row === tRow && (e.col - tCol) * d > 0 && (e.col - u.col) * d <= r);
    for (const e of behind) {
      attack(state, ctx, u, e, { pct, secondary: true, label: 'atravessa e atinge' });
      if (state.winner || u.hp <= 0) return;
    }
  }
  // Explosão de Brasas: atinge o inimigo da mesma coluna na outra fileira
  const splash = pw(u, 'brasa');
  if (splash) {
    for (const e of state.units.filter((e) => e.side !== u.side && e.hp > 0 && e.col === tCol && e.row !== tRow)) {
      attack(state, ctx, u, e, { fixed: splash, secondary: true, label: 'explode em' });
      if (state.winner || u.hp <= 0) return;
    }
  }
  // Flecha Dupla
  const second = pw(u, 'flechaDupla');
  if (second && t.hp > 0 && state.units.includes(t)) attack(state, ctx, u, t, { fixed: second, secondary: true, label: 'dispara a 2ª flecha em' });
}

/**
 * Salto Vendaval (v0.15.4): o alvo é o inimigo logo à frente (corpo a corpo) e existe casa de pouso livre
 * (3ª, senão 2ª) → o Riku salta por cima dele em vez de atacá-lo e ataca com investida quem estiver à frente ao cair.
 */
export function canLeapOver(state: BattleState, u: Unit, t: Unit | 'hero'): boolean {
  if (t === 'hero' || !has(u.abilities, (a) => a.jump)) return false;
  if (t.row !== u.row || t.col !== u.col + dir(u.side)) return false;
  return leapLanding(state, u) != null;
}

/** Ação automática: (cura) → ataca se houver alvo; senão anda e tenta atacar. */
export function act(state: BattleState, ctx: Ctx, u: Unit) {
  if (u.hp <= 0 || state.winner) return;
  if (isStunned(u)) {
    ctx.emit(state, { type: 'effect', uid: u.uid, kind: 'atordoado', text: `💫 ${nameOf(u)} está atordoado e perde a ação.` });
    return;
  }
  healNeighbors(state, ctx, u);
  healRow(state, ctx, u);
  let t = findTarget(state, u);
  if (t && canLeapOver(state, u, t)) {
    // Salto Vendaval (v0.15.2/v0.15.4): salta por cima do inimigo da frente e ataca com investida ao cair
    const jumped = moveUnit(state, ctx, u, { leapFront: true });
    t = findTarget(state, u);
    if (t) strike(state, ctx, u, t, jumped ? pw(u, 'salto') : 0);
    return;
  }
  if (t) {
    strike(state, ctx, u, t);
    return;
  }
  const jumped = moveUnit(state, ctx, u);
  t = findTarget(state, u);
  if (t) strike(state, ctx, u, t, jumped ? pw(u, 'salto') : 0);
}

/**
 * Ordem de ação do lado: primeiro os Vigias (v0.17.0), do mais recuado para o mais avançado;
 * depois os demais, do mais avançado para o mais recuado. Desempate: fileira de cima primeiro.
 */
export function actionOrder(state: BattleState, side: Side): Unit[] {
  const mine = state.units.filter((u) => u.side === side && u.hp > 0);
  const alert = (u: Unit) => !!has(u.abilities, (a) => a.alert);
  const watch = mine.filter(alert).sort((a, b) => (a.col - b.col) * dir(side) || a.row - b.row);
  const rest = mine.filter((u) => !alert(u)).sort((a, b) => (b.col - a.col) * dir(side) || a.row - b.row);
  return [...watch, ...rest];
}

export function resolveSide(state: BattleState, ctx: Ctx, side: Side) {
  tickDots(state, ctx, side);
  if (state.winner) return;
  const order = actionOrder(state, side).map((u) => u.uid);
  for (const uid of order) {
    if (state.winner) return;
    const u = state.units.find((x) => x.uid === uid);
    if (u) act(state, ctx, u);
  }
  tickEnd(state, side);
}

export function deploy(state: BattleState, side: Side, handIndex: number, row: number, col: number, ctx = new Ctx()): { ok: boolean; reason?: string; events: RecordedEvent[] } {
  if (state.winner) return { ok: false, reason: 'Batalha encerrada', events: [] };
  if (state.active !== side) return { ok: false, reason: 'Não é sua vez', events: [] };
  const card = state.decks[side].hand[handIndex];
  if (!card) return { ok: false, reason: 'Carta inválida', events: [] };
  if (isSpell(card.charId)) return { ok: false, reason: 'Feitiço: toque num alvo destacado', events: [] };
  const def = getChar(card.charId);
  const w = waitOf(card);
  if (w > 0) return { ok: false, reason: `Carta ainda não está pronta (falta${w > 1 ? 'm' : ''} ${w} rodada${w > 1 ? 's' : ''})`, events: [] };
  if (!isDeployCell(state, side, row, col)) return { ok: false, reason: 'Fora da zona de invocação', events: [] };
  if (unitAt(state, row, col)) return { ok: false, reason: 'Casa ocupada', events: [] };
  playFromHand(state.decks[side], handIndex);
  const u = placeUnit(state, { charId: card.charId, level: card.level, stars: card.stars, plus: !!card.plus }, side, row, col);
  u.slot = card.slot;
  ctx.emit(state, { type: 'deploy', uid: u.uid, text: `${side === 'player' ? 'Você invoca' : 'Inimigo invoca'} ${def.name} (${tierLabel(card.stars, !!card.plus)} Nv.${card.level}).` });
  const aura = has(u.abilities, (a) => a.enemyAtkAura);
  if (aura) ctx.emit(state, { type: 'aura', uid: u.uid, text: `🌀 ${def.name} drena o ataque de todos os inimigos!` });
  if (has(u.abilities, (a) => a.necro)) bringBack(state, ctx, side, u.uid, def.name);
  return { ok: true, events: ctx.events };
}

function bringBack(state: BattleState, ctx: Ctx, side: Side, uid: number, who: string) {
  const r = returnFromNecropolis(state.decks[side]);
  ctx.emit(state, {
    type: 'effect',
    uid,
    kind: 'necropolis',
    text: r ? `⚰️ ${who} traz ${getChar(r.card.charId).name} de volta da Necropolis${r.toHand ? ' para a mão (pronta)' : ' para o baralho'}.` : `⚰️ ${who}: a Necropolis está vazia.`,
  });
}

// ---------- v0.17.0: feitiços ----------

/** Aliados em campo que podem conjurar o feitiço (categoria do feitiço), o de maior ataque primeiro. */
export function spellCasters(state: BattleState, side: Side, spellId: string): Unit[] {
  const sp = getSpell(spellId);
  return state.units
    .filter((u) => u.side === side && u.hp > 0 && !u.isMinion && sp.categories.includes(getChar(u.charId).category))
    .sort((a, b) => effectiveAtk(state, b) - effectiveAtk(state, a) || a.uid - b.uid);
}

/** Casas válidas para o feitiço (vazio se não houver conjurador). */
export function spellTargets(state: BattleState, side: Side, spellId: string): [number, number][] {
  const sp = getSpell(spellId);
  if (!spellCasters(state, side, spellId).length) return [];
  const foe = enemyOf(side);
  if (sp.target === 'enemy') return state.units.filter((u) => u.side === foe && u.hp > 0).map((u) => [u.row, u.col]);
  if (sp.target === 'ally') return state.units.filter((u) => u.side === side && u.hp > 0).map((u) => [u.row, u.col]);
  const out: [number, number][] = [];
  if (sp.target === 'row') {
    for (let r = 0; r < state.rows; r++) for (let c = 0; c < state.cols; c++) out.push([r, c]);
    return out;
  }
  if (!state.decks[side].defeated.length) return [];
  for (let r = 0; r < state.rows; r++) for (let c = 0; c < state.cols; c++) if (isDeployCell(state, side, r, c)) out.push([r, c]);
  return out;
}

const pctOf = (v: number, p: number) => Math.max(1, Math.ceil((v * p) / 100));

/** Lança o feitiço da mão na casa (row, col). */
export function castSpell(state: BattleState, side: Side, handIndex: number, row: number, col: number, ctx = new Ctx()): { ok: boolean; reason?: string; events: RecordedEvent[] } {
  if (state.winner) return { ok: false, reason: 'Batalha encerrada', events: [] };
  if (state.active !== side) return { ok: false, reason: 'Não é sua vez', events: [] };
  const card = state.decks[side].hand[handIndex];
  if (!card || !isSpell(card.charId)) return { ok: false, reason: 'Carta inválida', events: [] };
  const w = waitOf(card);
  if (w > 0) return { ok: false, reason: `Carta ainda não está pronta (falta${w > 1 ? 'm' : ''} ${w} rodada${w > 1 ? 's' : ''})`, events: [] };
  const sp = getSpell(card.charId);
  const caster = spellCasters(state, side, sp.id)[0];
  if (!caster) return { ok: false, reason: `Precisa de um aliado ${sp.categories.map((c) => CAT_LABEL[c]).join(' ou ')} em campo para conjurar`, events: [] };
  if (!spellTargets(state, side, sp.id).some(([r, c]) => r === row && c === col)) return { ok: false, reason: 'Alvo inválido para este feitiço', events: [] };
  const foe = enemyOf(side);
  const target = unitAt(state, row, col);
  castFromHand(state.decks[side], handIndex);
  const atk = effectiveAtk(state, caster);
  ctx.emit(state, { type: 'cast', side, spellId: sp.id, caster: caster.uid, target: [row, col], text: `${sp.icon} ${nameOf(caster)} conjura ${sp.name}${sp.target === 'row' ? ` na fileira ${row + 1}` : target && sp.target !== 'none' ? ` em ${nameOf(target)}` : ''}!` });
  const src: DamageSource = { side, unit: caster, spell: true };
  const hit = (u: Unit, p: number, type: 'fisico' | 'magico', ignoreRes = false) => {
    const raw = pctOf(atk, p);
    const dmg = ignoreRes ? raw : computeDamage(raw, type, u);
    return applyDamage(state, ctx, u, dmg, type, src, raw > dmg ? ` (${raw - dmg} resistido)` : '');
  };
  const N = SPELL_NUM;
  const rowFoes = () => state.units.filter((u) => u.side === foe && u.hp > 0 && u.row === row);
  switch (sp.id) {
    case 'f-investida':
      if (target && !hit(target, N.investida, 'fisico')) pushBack(state, ctx, target);
      break;
    case 'f-giratoria':
      for (const u of rowFoes()) if (!state.winner) hit(u, N.giratoria, 'fisico');
      break;
    case 'f-muralha':
      if (target) addEffect(state, ctx, target, 'escudo', pctOf(caster.maxHp, N.muralhaHp), N.muralhaTurns);
      break;
    case 'f-tremor':
      if (target && !hit(target, N.tremor, 'fisico') && state.units.includes(target)) {
        addEffect(state, ctx, target, 'atordoado', 1, 1);
        pushBack(state, ctx, target);
      }
      break;
    case 'f-chuva':
      for (const u of rowFoes()) if (!state.winner) hit(u, N.chuva, 'fisico');
      break;
    case 'f-flecha-veneno':
      if (target && !hit(target, N.flechaHit, 'fisico') && state.units.includes(target)) addEffect(state, ctx, target, 'veneno', pctOf(atk, N.flechaDot), N.flechaTurns);
      break;
    case 'f-bola-fogo':
      if (target && !hit(target, N.bolaHit, 'magico') && state.units.includes(target)) addEffect(state, ctx, target, 'queimadura', pctOf(atk, N.bolaDot), N.bolaTurns);
      break;
    case 'f-raio':
      if (target && !hit(target, N.raio, 'magico') && state.units.includes(target)) addEffect(state, ctx, target, 'atordoado', 1, 1);
      break;
    case 'f-veneno':
      if (target) addEffect(state, ctx, target, 'veneno', pctOf(atk, N.veneno), N.venenoTurns);
      break;
    case 'f-sombras':
      if (target) hit(target, N.sombras, 'fisico', true);
      break;
    case 'f-cura':
      for (const u of state.units.filter((x) => x.side === side && x.hp > 0 && x.row === row && x.hp < x.maxHp)) {
        const h = Math.min(pctOf(u.maxHp, N.cura), u.maxHp - u.hp);
        u.hp += h;
        ctx.emit(state, { type: 'heal', uid: u.uid, amount: h, text: `💖 ${nameOf(u)} recupera ${h} de vida.` });
      }
      break;
    case 'f-anjo':
      if (target) addEffect(state, ctx, target, 'anjo', 1, 99);
      break;
    case 'f-necropolis':
      bringBack(state, ctx, side, caster.uid, nameOf(caster));
      break;
  }
  return { ok: true, events: ctx.events };
}

const CAT_LABEL: Record<string, string> = { tanque: 'Tanque', suporte: 'Suporte', dps: 'DPS', mago: 'Mago', arqueiro: 'Arqueiro', assassino: 'Assassino' };

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
