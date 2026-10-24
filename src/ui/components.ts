import { ABILITIES } from '../core/abilities';
import { CATEGORY_INFO, RACE_INFO, STAR_COLORS, getChar } from '../core/characters';
import { statsFor, tierLabel } from '../core/progression';
import type { CardInstance, CharacterDef } from '../core/types';
import { portraitImg } from './art';

export const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

/** v0.10: selo com o nome da cor/tier (ex.: "Raro+"), no lugar das estrelas. */
export function tierHTML(stars: number, plus = false): string {
  return `<span class="tier-tag" style="${starStyle(stars)}">${tierLabel(stars, plus)}</span>`;
}

/** Cor da carta pelo TIER (campo `stars`): 1 Comum cinza · 2 Incomum verde · 3 Raro azul · 4 Épico roxo · 5 Lendário laranja · 6 Mítico vermelho */
export function starStyle(stars: number): string {
  const c = STAR_COLORS[Math.max(1, Math.min(6, stars))];
  return `--rc:${c.color};--rg:${c.glow}`;
}

export function categoryHTML(def: CharacterDef, withLabel = false): string {
  const c = CATEGORY_INFO[def.category];
  return `<span class="cat-tag" title="${c.label}">${c.icon}${withLabel ? ` ${c.label}` : ''}</span>`;
}

export function raceHTML(def: CharacterDef, withLabel = true): string {
  const r = RACE_INFO[def.race];
  return `<span class="race-tag" style="--race-c:${r.color}" title="${esc(r.desc)}">${r.icon}${withLabel ? ` ${r.label}` : ''}</span>`;
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

/**
 * Carta estilo Anime TCG (inspirada em Legend of Dragon):
 * - Moldura metálica chanfrada na cor do tier (Comum cinza, Incomum verde, Raro azul, Épico roxo, Lendário laranja, Mítico vermelho)
 * - Topo: Medalhão espinhoso verde de custo à esquerda, barra escura chanfrada com o NOME DO TIER (ex.: "Raro+") no centro,
 *   orbe de facção/raça e categoria à direita
 * - Centro: Arte vertical anime com cenário evolutivo, raios de energia, aura e personagem em pose de ação
 * - Base: Emblema explosivo de Ataque (punho) à esquerda, placa metálica chanfrada com o nome no centro,
 *   e gota rubra de Vida à direita.
 */
export function cardHTML(
  card: CardInstance,
  opts: { extraClass?: string; attrs?: string; locked?: boolean; badge?: string; compact?: boolean } = {},
): string {
  const def = getChar(card.charId);
  const st = statsFor(def, card.level, card.stars, !!card.plus);
  const tier = tierLabel(card.stars, !!card.plus);
  const cat = CATEGORY_INFO[def.category];
  const race = RACE_INFO[def.race];
  const t = Math.max(1, Math.min(6, card.stars));
  const sparks = t >= 5 && !opts.locked ? Array.from({ length: t === 6 ? 7 : 4 }, (_, i) => `<i class="spk" style="--i:${i}"></i>`).join('') : '';
  const stats = opts.compact
    ? ''
    : `<div class="card-stats"><span class="atk ${def.damageType}" title="Ataque">${def.damageType === 'fisico' ? '👊' : '✨'}${st.atk}</span><span class="hp" title="Vida">❤${st.hp}</span><span class="ab">${def.abilities.map((a) => ABILITIES[a].icon).join('')}</span></div>
      <div class="card-rarity">${race.icon} ${race.label} · ${tier} · ${cat.label}</div>`;
  return `<div class="card s${t} race-${def.race} ${opts.compact ? 'compact' : ''} ${opts.extraClass ?? ''} ${opts.locked ? 'locked' : ''}" style="${starStyle(t)};--ac:${def.palette.aura};--race-c:${race.color}" ${opts.attrs ?? ''}>
    <div class="card-metal"><div class="card-frame">
      <div class="card-art">
        <div class="card-bg">${portraitImg(def, { stars: t, layer: 'bg' })}</div>
        <div class="card-aura"></div>
        ${t >= 3 ? '<div class="card-shine"></div>' : ''}
      </div>
      <div class="card-fig">${portraitImg(def, { stars: t, layer: 'fg' })}</div>
      <div class="card-top"><span class="card-tier">${tier}</span></div>
      <div class="medal card-cost" title="Custo de energia">${def.cost}</div>
      <div class="medal card-cat" title="${race.label} · ${cat.label}">${cat.icon}</div>
      <div class="medal card-lvl" title="Nível"><small>Nv</small>${card.level}</div>
      ${opts.badge ? `<div class="card-badge">${opts.badge}</div>` : ''}
      <div class="card-bottom-bar">
        <div class="card-orb-atk ${def.damageType}" title="Ataque: ${st.atk}"><span>${st.atk}</span></div>
        <div class="card-ribbon"><span class="card-name"><span class="full">${esc(def.name)}</span><span class="short">${esc(def.name.split(' ')[0])}</span></span></div>
        <div class="card-orb-hp" title="Vida: ${st.hp}"><span>${st.hp}</span></div>
      </div>
      ${stats}
      ${sparks}
    </div></div>
  </div>`;
}

/** Lista de habilidades com a força atual (cor/nível) e a evolução por cor (o "+" não muda habilidades). */
export function abilityListHTML(def: CharacterDef, stars?: number, level?: number): string {
  const s = stars ?? def.minStars;
  const l = level ?? 1;
  const rows = def.abilities.map((a) => {
    const ab = ABILITIES[a];
    const p = ab.power?.(s, l);
    const now = ab.powerLabel && p != null ? ` <span class="ab-now">agora: ${esc(ab.powerLabel(p))}</span>` : '';
    return `<li><b>${ab.icon} ${esc(ab.name)}</b> — ${esc(ab.description)}${now}${ab.scaling ? `<div class="ab-scale">🎨 Por cor: ${esc(ab.scaling)}</div>` : ''}</li>`;
  });
  if (def.physRes) rows.push(`<li><b>🛡 Resistência física ${def.physRes}</b> — reduz cada golpe físico em ${def.physRes}.</li>`);
  if (def.magRes) rows.push(`<li><b>🔰 Resistência mágica ${def.magRes}</b> — reduz cada golpe mágico em ${def.magRes}.</li>`);
  return `<ul class="abilities">${rows.join('')}</ul>`;
}
