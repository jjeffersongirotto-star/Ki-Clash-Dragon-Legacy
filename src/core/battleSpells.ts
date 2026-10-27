/**
 * v0.17.0 — Feitiços na batalha (lógica pura). v0.28.1: separado de battle.ts, que reexporta estas funções.
 */
import { addEffect, applyDamage, bringBack, computeDamage, Ctx, effectiveAtk, enemyOf, isDeployCell, nameOf, pushBack, unitAt, waitOf, type DamageSource } from './battle';
import { getChar } from './characters';
import { castFromHand } from './deck';
import { SPELL_NUM, getSpell, isSpell } from './spells';
import type { BattleState, RecordedEvent, Side, Unit } from './types';

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
  if (state.stats) {
    state.stats[side].cards++;
    state.stats[side].spells++;
  }
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
