/**
 * Movimento das unidades (lógica pura): andar, atravessar aliados e o Salto Vendaval.
 * v0.28.1: separado de battle.ts, que reexporta estas funções.
 */
import { has } from './abilities';
import { Ctx, dir, inBoard, nameOf, unitAt } from './battle';
import { findTarget } from './battleRules';
import type { BattleState, Unit } from './types';
/** Salto Vendaval: anda até SALTO_MOVE casas em qualquer raridade/degrau (fixo, não escala). */
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
