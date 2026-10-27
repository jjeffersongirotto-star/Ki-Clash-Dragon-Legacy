/**
 * Regras de combate (lógica pura): alcance, bônus, ataque efetivo, dano e escolha do alvo.
 * v0.28.1: separado de battle.ts, que reexporta estas funções.
 */
import { ABILITIES, AURA_CAP, BUFF_CAP, abilityPower, has } from './abilities';
import { dir } from './battle';
import type { AbilityId, BattleState, Unit } from './types';
export function rangeOf(u: Unit): number {
  return u.range + u.abilities.reduce((s, id) => s + (ABILITIES[id]?.rangeBonus ?? 0), 0);
}

export function hasRangeBonus(u: Unit): boolean {
  return !!has(u.abilities, (a) => a.rangeBonus);
}

export const pw = (u: Unit, id: AbilityId) => (u.abilities.includes(id) ? abilityPower(id, u.stars, u.plus) : 0);

export function auraPenalty(state: BattleState, u: Unit): number {
  let p = 0;
  for (const e of state.units) {
    if (e.hp <= 0 || e.side === u.side) continue;
    if (has(e.abilities, (x) => x.enemyAtkAura)) p += pw(e, 'sifao') + pw(e, 'dominio');
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
  // v0.30.0: Grito de Guerra — aliados da mesma fileira (qualquer distância); não soma com o Tambor
  for (const a of state.units)
    if (a !== u && a.hp > 0 && a.side === u.side && a.row === u.row && a.abilities.includes('gritoGuerra')) b = Math.max(b, pw(a, 'gritoGuerra'));
  return Math.min(BUFF_CAP, b);
}

export function effectiveAtk(state: BattleState, u: Unit): number {
  return Math.max(1, u.atk + (u.atkMod ?? 0) - auraPenalty(state, u)) + allyBuff(state, u) + (state.fury ? furyBonus(state.turn) : 0);
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
  // v0.30.0: Provocar — quem pode atingir um provocador é obrigado a atacá-lo
  const canHit = (e: Unit) =>
    (e.row === u.row && fwd(e) >= 1 && fwd(e) <= reach) ||
    (Math.abs(e.row - u.row) === 1 && ((fwd(e) === 1 && u.abilities.includes('diagFrente')) || (fwd(e) === -1 && u.abilities.includes('diagTras')))) ||
    (e.row === u.row && fwd(e) === -1 && u.abilities.includes('ataqueCostas'));
  const taunt = enemies.filter((e) => e.abilities.includes('provocar') && canHit(e)).sort((a, b) => Math.abs(fwd(a)) - Math.abs(fwd(b)) || a.uid - b.uid)[0];
  if (taunt) return taunt;
  if (targeting === 'costas') {
    const back = enemies.find((e) => e.row === u.row && fwd(e) === -1);
    if (back) return back;
  }

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
