import { ABILITIES } from '../core/abilities';
import { CATEGORY_INFO, RARITY_INFO, STAR_COLORS, getChar } from '../core/characters';
import { statsFor } from '../core/progression';
import type { CardInstance, CharacterDef } from '../core/types';
import { portraitSVG } from './art';

export const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

export function starsHTML(stars: number, max?: number): string {
  let s = '';
  for (let i = 1; i <= (max ?? stars); i++) s += `<span class="${i <= stars ? 'on' : 'off'}">★</span>`;
  return `<span class="stars">${s}</span>`;
}

/** Cor da carta pelas ESTRELAS: 1 cinza · 2 verde · 3 azul · 4 roxo · 5 laranja · 6 vermelho */
export function starStyle(stars: number): string {
  const c = STAR_COLORS[Math.max(1, Math.min(6, stars))];
  return `--rc:${c.color};--rg:${c.glow}`;
}

export function categoryHTML(def: CharacterDef, withLabel = false): string {
  const c = CATEGORY_INFO[def.category];
  return `<span class="cat-tag" title="${c.label}">${c.icon}${withLabel ? ` ${c.label}` : ''}</span>`;
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
  const cat = CATEGORY_INFO[def.category];
  return `<div class="card s${card.stars} ${opts.extraClass ?? ''} ${opts.locked ? 'locked' : ''}" style="${starStyle(card.stars)}" ${opts.attrs ?? ''}>
    <div class="card-cost" title="Custo">${def.cost}</div>
    <div class="card-cat" title="${cat.label}">${cat.icon}</div>
    <div class="card-art">${portraitSVG(def, { stars: card.stars })}${opts.badge ? `<div class="card-badge">${opts.badge}</div>` : ''}</div>
    <div class="card-body">
      <div class="card-name">${esc(def.name)}</div>
      <div class="card-meta">${starsHTML(card.stars)} <span class="lvl">Nv.${card.level}</span></div>
      <div class="card-stats"><span class="atk ${def.damageType}">${def.damageType === 'fisico' ? '👊' : '✨'}${st.atk}</span><span class="hp">❤${st.hp}</span><span class="ab">${def.abilities.map((a) => ABILITIES[a].icon).join('')}</span></div>
      <div class="card-rarity">${r.label} · ${cat.label}</div>
    </div>
  </div>`;
}

/** Lista de habilidades com a força atual (estrelas/nível) e a evolução por estrela. */
export function abilityListHTML(def: CharacterDef, stars?: number, level?: number): string {
  const s = stars ?? def.minStars;
  const l = level ?? 1;
  const rows = def.abilities.map((a) => {
    const ab = ABILITIES[a];
    const p = ab.power?.(s, l);
    const now = ab.powerLabel && p != null ? ` <span class="ab-now">agora: ${esc(ab.powerLabel(p))}</span>` : '';
    return `<li><b>${ab.icon} ${esc(ab.name)}</b> — ${esc(ab.description)}${now}${ab.scaling ? `<div class="ab-scale">⭐ ${esc(ab.scaling)}</div>` : ''}</li>`;
  });
  if (def.physRes) rows.push(`<li><b>🛡 Resistência física ${def.physRes}</b> — reduz cada golpe físico em ${def.physRes}.</li>`);
  if (def.magRes) rows.push(`<li><b>🔰 Resistência mágica ${def.magRes}</b> — reduz cada golpe mágico em ${def.magRes}.</li>`);
  return `<ul class="abilities">${rows.join('')}</ul>`;
}
