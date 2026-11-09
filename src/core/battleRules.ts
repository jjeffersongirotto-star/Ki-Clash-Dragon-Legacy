/**
 * Regras de combate (lógica pura): alcance, bônus, ataque efetivo, dano e escolha do alvo.
 * v0.28.1: separado de battle.ts, que reexporta estas funções.
 */
import { hasTweak } from './balanceV2';
import { ABILITIES, abilityPower, has } from './abilities';
import { dir } from './battle';
import type { AbilityId, BattleState, Unit } from './types';
export function rangeOf(u: Unit): number {
  return u.range + u.abilities.reduce((s, id) => s + (ABILITIES[id]?.rangeBonus ?? 0), 0);
}

export function hasRangeBonus(u: Unit): boolean {
  // v0.64.6: "ataca de longe" = alcance 3+ (o Longo Alcance virou alcance 4) ou habilidade que soma alcance
  return u.range >= 3 || !!has(u.abilities, (a) => a.rangeBonus);
}

export const pw = (u: Unit, id: AbilityId) => (u.abilities.includes(id) ? abilityPower(id, u.stars, u.plus) : 0);

export function auraPenalty(state: BattleState, u: Unit): number {
  let p = 0;
  for (const e of state.units) {
    if (e.hp <= 0 || e.side === u.side) continue;
    if (has(e.abilities, (x) => x.enemyAtkAura)) p += pw(e, 'sifao') + pw(e, 'dominio');
  }
  return p; // v0.65.0: sem teto (o ataque pode chegar a 0)
}

/** Fúria de batalha: a partir do turno FURY_START, todos ganham +1 de ataque a cada FURY_EVERY turnos (evita empates travados). */
export const FURY_START = 8;
/** v0.62.0: a cada 5 turnos (antes 3) — na escala enxuta +1 de ataque pesa muito mais. */
export const FURY_EVERY = 5;
export function furyBonus(turn: number): number {
  return turn < FURY_START ? 0 : 1 + Math.floor((turn - FURY_START) / FURY_EVERY);
}

/** Tambor de Guerra: o maior bônus entre os aliados vizinhos (tambores não se somam) + Grito de Guerra (v0.65.0: soma, sem teto). */
export function allyBuff(state: BattleState, u: Unit): number {
  if (u.isMinion && u.charId === 'cria') return 0;
  let b = 0;
  for (const a of state.units) {
    if (a === u || a.hp <= 0 || a.side !== u.side) continue;
    if (Math.abs(a.row - u.row) > 1 || Math.abs(a.col - u.col) > 1) continue;
    if (has(a.abilities, (x) => x.allyAtkAura)) b = Math.max(b, pw(a, 'tambor'));
  }
  // Grito de Guerra — aliados da mesma fileira (qualquer distância); v0.65.0: soma com o Tambor, sem teto
  let g = 0;
  for (const a of state.units)
    if (a !== u && a.hp > 0 && a.side === u.side && a.row === u.row && a.abilities.includes('gritoGuerra')) g = Math.max(g, pw(a, 'gritoGuerra'));
  return b + g;
}

export function effectiveAtk(state: BattleState, u: Unit): number {
  // v0.65.0: com redução, o ataque pode chegar a 0
  return Math.max(0, u.atk + (u.atkMod ?? 0) - auraPenalty(state, u)) + allyBuff(state, u) + (state.fury ? furyBonus(state.turn) : 0);
}

/** Dano após resistência. Resistência física 1 contra 3 de dano físico = 2. v0.65.0: pode ser 0 (resistência ≥ ataque). `pierce` ignora parte da resistência. */
export function computeDamage(atk: number, type: 'fisico' | 'magico', target: { physRes: number; magRes: number }, pierce = 0): number {
  const res = Math.max(0, (type === 'fisico' ? target.physRes : target.magRes) - pierce);
  return Math.max(0, atk - res);
}

export function distanceToEnemyHero(state: BattleState, u: Unit): number {
  return u.side === 'player' ? state.cols - u.col : u.col + 1;
}

/**
 * v0.64.7: casas do Corte Diagonal em ordem de prioridade, como [deslocamento de fileira, colunas à frente]:
 * atrás, diagonal de trás e — do Raro em diante — ao lado e diagonal da frente. A frente é o ataque normal.
 */
export function diagCells(u: Unit): [number, number][] {
  const other = u.row === 0 ? 1 : -1;
  const cells: [number, number][] = [[0, -1], [other, -1]];
  if (u.stars >= 3) cells.push([other, 0], [other, 1]);
  return cells;
}

/**
 * Mira. Regras (arena 2 × 10):
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
    (u.abilities.includes('diagFrente') && diagCells(u).some(([dr, df]) => e.row - u.row === dr && fwd(e) === df)) ||
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
  // v0.64.6: Emboscada do Zarek — só quando há um aliado à frente dele na fileira (protegendo); senão, ataca o mais próximo
  const covered = () => state.units.some((a) => a !== u && a.hp > 0 && a.side === u.side && a.row === u.row && (a.col - u.col) * d >= 1);
  if (targeting === 'retaguarda' && rowAhead.length && (!hasTweak(u.charId, 'emboscadaComAliado') || covered())) {
    return rowAhead.sort((a, b) => fwd(b) - fwd(a))[0];
  }
  // v0.64.7: Corte Diagonal — antes da frente: 1 atrás, 2 diagonal de trás, (Raro+) 3 lado, 4 diagonal da frente
  if (u.abilities.includes('diagFrente')) {
    for (const [dr, df] of diagCells(u)) {
      const t = enemies.find((e) => e.row - u.row === dr && fwd(e) === df);
      if (t) return t;
    }
  }
  const straight = enemies.filter((e) => e.row === u.row && fwd(e) >= 1 && fwd(e) <= r).sort((a, b) => fwd(a) - fwd(b));
  if (straight.length) return straight[0];
  if (distanceToEnemyHero(state, u) <= reach) return 'hero';
  return null;
}
