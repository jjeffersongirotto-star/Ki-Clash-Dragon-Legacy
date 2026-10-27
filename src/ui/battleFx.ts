/**
 * Efeitos visuais da batalha (texto flutuante, seta de movimento, feixe/corte de ataque, faíscas).
 * v0.28.1: separados de battleView.ts. Cada função desenha na camada `.fx` do tabuleiro.
 */
import { allyBuff, auraPenalty } from '../core/battle';
import type { BattleState, Side, Unit } from '../core/types';

/** Texto padrão do painel de informações da batalha. */
export const INFO_DEFAULT = 'Toque numa carta e depois numa casa brilhante para invocar. Segure a carta (ou use 🔍 Detalhes) para ver os detalhes.';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Texto que sobe e some (dano, cura, "HIT!"). */
export function floatText(fx: Element, x: number, y: number, text: string, cls: string) {
  const d = document.createElement('div');
  d.className = `float ${cls}`;
  d.textContent = text;
  d.style.left = `${x}px`;
  d.style.top = `${y}px`;
  fx.appendChild(d);
  setTimeout(() => d.remove(), 1100);
}

/** Seta tática MOVE/JUMP e poeira quando o personagem caminha na arena (centros das casas de saída e chegada). */
export function moveTrail(fx: Element, from: [number, number], to: [number, number], right: boolean, label: string, ms: number) {
  const [x1, y1] = from;
  const [x2] = to;
  const trail = document.createElement('div');
  trail.className = `move-arrow ${right ? 'dir-r' : 'dir-l'}`;
  trail.style.left = `${Math.min(x1, x2)}px`;
  trail.style.top = `${y1 - 26}px`;
  trail.style.width = `${Math.max(36, Math.abs(x2 - x1))}px`;
  trail.innerHTML = `<span>${label}</span><i></i>`;
  fx.appendChild(trail);
  for (let i = 0; i < 3; i++) {
    const dust = document.createElement('div');
    dust.className = 'dust-puff';
    dust.style.left = `${x1 + ((x2 - x1) * i) / 3}px`;
    dust.style.top = `${y1 + 18}px`;
    fx.appendChild(dust);
    setTimeout(() => dust.remove(), 480);
  }
  setTimeout(() => trail.remove(), ms);
}

/** Feixe de Ki (ataque mágico à distância) ou onda de corte com "HIT!" (corpo a corpo). `dur` ajusta à velocidade. */
export function attackFX(fx: Element, ax: number, ay: number, tx: number, ty: number, ranged: boolean, damageType: string, side: Side, dur: (ms: number) => number) {
  const dx = tx - ax;
  const dy = ty - ay;
  const dist = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ranged && damageType === 'magico') {
    // Feixe de Ki contínuo estilo anime (Kamehameha / raio arcano)
    const beam = document.createElement('div');
    beam.className = `ki-beam side-${side}`;
    beam.style.left = `${ax}px`;
    beam.style.top = `${ay - 6}px`;
    beam.style.width = `${dist}px`;
    beam.style.transform = ` translateY(-50%) rotate(${angle}deg)`;
    fx.appendChild(beam);
    setTimeout(() => beam.remove(), dur(360));
  } else if (!ranged) {
    // Onda de corte corpo a corpo + selo HIT!
    const slash = document.createElement('div');
    slash.className = `melee-wave ${damageType} side-${side}`;
    slash.style.left = `${(ax + tx) / 2}px`;
    slash.style.top = `${(ay + ty) / 2 - 4}px`;
    slash.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    fx.appendChild(slash);
    floatText(fx, tx, ty - 26, 'HIT!', 'hit-tag');
    setTimeout(() => slash.remove(), dur(350));
  }
}

/** Faísca de impacto. */
export function spark(fx: Element, x: number, y: number, type: string) {
  const s = document.createElement('div');
  s.className = `spark ${type}`;
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  fx.appendChild(s);
  setTimeout(() => s.remove(), 500);
}

/** Selos de estado da unidade (aura, dreno e efeitos com duração) para a arena e o painel de informações. */
export function statusList(state: BattleState, u: Unit): { icon: string; label: string; key: string }[] {
  const out: { icon: string; label: string; key: string }[] = [];
  const buff = allyBuff(state, u);
  const pen = auraPenalty(state, u);
  if (buff > 0) out.push({ icon: '🥁', label: `aura +${buff} ATQ`, key: `b${buff}` });
  if (pen > 0) out.push({ icon: '🌀', label: `drenado −${pen} ATQ`, key: `p${pen}` });
  const ICON = { veneno: '🧪', queimadura: '🔥', atordoado: '💫', escudo: '🛡', anjo: '👼', sangramento: '🩸', lento: '🐌', congelado: '❄️', maldicao: '🕯️', imune: '⏳' } as const;
  if (u.atkMod) out.push({ icon: u.atkMod > 0 ? '📈' : '🌀', label: `${u.atkMod > 0 ? '+' : '−'}${Math.abs(u.atkMod)} ATQ (habilidade)`, key: `m${u.atkMod}` });
  for (const e of u.effects ?? []) {
    if (e.turns <= 0) continue;
    const label =
      e.kind === 'veneno' ? `veneno ${e.amount}/rodada (${e.turns})`
      : e.kind === 'queimadura' ? `queimadura ${e.amount}/rodada (${e.turns})`
      : e.kind === 'sangramento' ? `sangramento ${e.amount}/rodada (${e.turns})`
      : e.kind === 'atordoado' ? 'atordoado'
      : e.kind === 'congelado' ? 'congelado (não ataca)'
      : e.kind === 'lento' ? `lento (${e.turns})`
      : e.kind === 'maldicao' ? `amaldiçoado +25% de dano (${e.turns})`
      : e.kind === 'imune' ? 'imune até o fim do turno'
      : e.kind === 'escudo' ? (e.turns >= 99 ? `escudo ${e.amount}` : `escudo ${e.amount} (${e.turns})`)
      : 'Anjo da Guarda';
    out.push({ icon: ICON[e.kind], label, key: `${e.kind}${e.amount}` });
  }
  return out;
}
