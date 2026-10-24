import { ABILITIES } from '../core/abilities';
import { RARITY_INFO, getChar } from '../core/characters';
import { statsFor } from '../core/progression';
import type { CardInstance, CharacterDef } from '../core/types';
import { portraitSVG } from './art';

export const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

export function starsHTML(stars: number, max?: number): string {
  let s = '';
  for (let i = 1; i <= (max ?? stars); i++) s += `<span class="${i <= stars ? 'on' : 'off'}">★</span>`;
  return `<span class="stars">${s}</span>`;
}

export function rarityStyle(def: CharacterDef): string {
  const r = RARITY_INFO[def.rarity];
  return `--rc:${r.color};--rg:${r.glow}`;
}

/** Alcance exibido: alcance básico + bônus; miras especiais mostram o alcance delas. */
export function reachLabel(def: CharacterDef): string {
  const r = def.range + def.abilities.reduce((s, a) => s + (ABILITIES[a].rangeBonus ?? 0), 0);
  const sp = Math.max(0, ...def.abilities.map((a) => ABILITIES[a].reach ?? 0));
  return sp > r ? `${r} (habilidade: ${sp})` : String(r);
}

export function dmgLabel(def: CharacterDef) {
  return def.damageType === 'fisico' ? '👊 Físico' : '✨ Mágico';
}

export function cardHTML(card: CardInstance, opts: { extraClass?: string; attrs?: string; locked?: boolean; badge?: string } = {}): string {
  const def = getChar(card.charId);
  const st = statsFor(def, card.level, card.stars);
  const r = RARITY_INFO[def.rarity];
  return `<div class="card r-${def.rarity} ${opts.extraClass ?? ''} ${opts.locked ? 'locked' : ''}" style="${rarityStyle(def)}" ${opts.attrs ?? ''}>
    <div class="card-cost" title="Custo">${def.cost}</div>
    ${opts.badge ? `<div class="card-badge">${opts.badge}</div>` : ''}
    <div class="card-art">${portraitSVG(def)}</div>
    <div class="card-body">
      <div class="card-name">${esc(def.name)}</div>
      <div class="card-meta">${starsHTML(card.stars)} <span class="lvl">Nv.${card.level}</span></div>
      <div class="card-stats"><span class="atk ${def.damageType}">${def.damageType === 'fisico' ? '👊' : '✨'}${st.atk}</span><span class="hp">❤${st.hp}</span><span class="ab">${def.abilities.map((a) => ABILITIES[a].icon).join('')}</span></div>
      <div class="card-rarity">${r.label}</div>
    </div>
  </div>`;
}

export function abilityListHTML(def: CharacterDef): string {
  const rows = def.abilities.map((a) => {
    const ab = ABILITIES[a];
    return `<li><b>${ab.icon} ${esc(ab.name)}</b> — ${esc(ab.description)}</li>`;
  });
  if (def.physRes) rows.push(`<li><b>🛡 Resistência física ${def.physRes}</b> — reduz cada golpe físico em ${def.physRes}.</li>`);
  if (def.magRes) rows.push(`<li><b>🔰 Resistência mágica ${def.magRes}</b> — reduz cada golpe mágico em ${def.magRes}.</li>`);
  return `<ul class="abilities">${rows.join('')}</ul>`;
}
