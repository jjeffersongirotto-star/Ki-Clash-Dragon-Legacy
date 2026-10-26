import { ABILITIES } from '../core/abilities';
import { CATEGORY_INFO, RACE_INFO, STAR_COLORS, getChar } from '../core/characters';
import { XP_ITEMS, statsFor, stepIndex, stepOf, tierLabel, type OrbBag, type XpItemId } from '../core/progression';
import type { AbilityId, CardInstance, CharacterDef } from '../core/types';
import { GEAR_BY_ID, GEAR_RARITY_NAMES } from '../core/gear';
import { portraitImg } from './art';
import { gridArtHTML } from './gridArt';
import { cardPower } from '../core/power';
import { waitFor } from '../core/battle';
import { getSpell, type SpellDef } from '../core/spells';
import peitoralUrl from '../assets/card/ab-peitoral.svg';

/** v0.14.2: ícone de habilidade — a Resistência Física (Postura de Guarda) usa o peitoral de armadura (SVG) no lugar do 🛡. */
const ABILITY_SVG: Record<string, string> = { guarda: peitoralUrl };
export function abilityIconHTML(id: AbilityId): string {
  const svg = ABILITY_SVG[id];
  return svg ? `<img class="ab-svg" src="${svg}" alt="" draggable="false">` : ABILITIES[id].icon;
}

export const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

/** v0.10: selo com o nome da cor/tier (ex.: "Raro+"), no lugar das estrelas. */
export function tierHTML(stars: number, step = 0): string {
  return `<span class="tier-tag" style="${starStyle(stars)}">${tierLabel(stars, step)}</span>`;
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
 * v0.14 — PADRÃO DE CARTA (referência do jogador): gota azul de custo (topo esq.), pílula Nv | ⚡Poder (topo dir.),
 * arte grande, faixa escura com o nome e cantos ornamentados, gema + palavra da cor, cápsula com raça e
 * categoria, ataque (emblema da CATEGORIA) embaixo à esquerda, coração de vida embaixo à direita e a
 * fileira de habilidades embaixo da carta. Texto antigo abaixo mantido como histórico.
 * Carta estilo Anime TCG (inspirada em Legend of Dragon):
 * - Moldura metálica chanfrada na cor do tier (Comum cinza, Incomum verde, Raro azul, Épico roxo, Lendário laranja, Mítico vermelho)
 * - Topo: Medalhão espinhoso verde de custo à esquerda, barra escura chanfrada com o NOME DO TIER (ex.: "Raro+") no centro,
 *   orbe de facção/raça e categoria à direita
 * - Centro: Arte vertical anime com cenário evolutivo, raios de energia, aura e personagem em pose de ação
 * - Base: Emblema explosivo de Ataque (punho) à esquerda, placa metálica chanfrada com o nome no centro,
 *   e gota rubra de Vida à direita.
 */
/** v0.10.3: carta bloqueada de grade — tons cinza diretos (no lugar de filter: grayscale + opacity) */
const LOCKED_GRID_STYLE = '--rc:#535559;--rg:#7b7d80;--ac:#55575a;--race-c:#55575a';

export function cardHTML(
  card: CardInstance,
  opts: { extraClass?: string; attrs?: string; locked?: boolean; badge?: string; compact?: boolean; grid?: boolean; power?: number; wait?: number } = {},
): string {
  const def = getChar(card.charId);
  const step = stepOf(card);
  const st = statsFor(def, card.stars, step);
  const tier = tierLabel(card.stars, step);
  const cat = CATEGORY_INFO[def.category];
  const race = RACE_INFO[def.race];
  const t = Math.max(1, Math.min(6, card.stars));
  const power = opts.power ?? cardPower(card);
  // v0.10.2: carta de grade = quadro congelado (bitmaps prontos, sem animação/filtro/blend)
  const ga = opts.grid ? gridArtHTML(def, t, !!opts.locked) : null;
  const sparks = t >= 5 && !opts.locked ? Array.from({ length: t === 6 ? 7 : 4 }, (_, i) => `<i class="spk" style="--i:${i}"></i>`).join('') : '';
  // v0.14.1: fileira de habilidades (bolinhas separadas por pontos) DENTRO da moldura, no centro de baixo
  // v0.14.3: as cartas pequenas (compactas, mão) também mostram a fileira, entre o ataque e a vida
  const abil = `${opts.compact ? '' : '<div class="ck-sep"><i></i><i></i><i></i></div>'}<div class="ck-abil n${def.abilities.length}">${def.abilities.map((a) => `<span class="ck-ab" title="${esc(ABILITIES[a].name)}">${abilityIconHTML(a)}</span>`).join('<i class="ck-dot"></i>')}</div>`;
  // v0.14.2: nomes com uma palavra muito comprida (ex.: "Tambor-de-Guerra") encolhem um pouco para caber inteiros
  const longest = Math.max(...def.name.split(' ').map((w) => w.length));
  const nfit = longest > 14 ? ` style="--nfit:${(13.6 / longest).toFixed(3)}"` : '';
  return `<div class="card s${t} race-${def.race} cat-${def.category} ${opts.compact ? 'compact' : 'ab'} ${opts.extraClass ?? ''} ${opts.locked ? 'locked' : ''}${ga ? ` grid-card${ga.baked ? ' baked' : ''}` : ''}" style="${ga && opts.locked ? LOCKED_GRID_STYLE : `${starStyle(t)};--ac:${def.palette.aura};--race-c:${race.color}`}" ${opts.attrs ?? ''}>
    <div class="card-metal"><div class="card-frame">
      <div class="card-art">
        <div class="card-bg">${ga ? ga.bg : portraitImg(def, { stars: t, layer: 'bg' })}</div>
        <div class="card-aura"></div>
        ${t >= 3 && !ga ? '<div class="card-shine"></div>' : ''}
      </div>
      <div class="card-fig">${ga ? ga.fg : portraitImg(def, { stars: t, layer: 'fg' })}</div>
      <div class="ck-cost${opts.wait === 0 ? ' ready' : ''}" title="${opts.wait == null ? `Espera ${waitFor(def.id)} rodada(s) na mão` : opts.wait ? `Falta(m) ${opts.wait} rodada(s)` : 'Pronta para invocar'}"><span>${opts.wait ?? waitFor(def.id)}</span></div>
      <div class="ck-pow" title="Poder">⚡${power}</div>
      ${step ? `<div class="ck-star" title="Degrau ${tier}"><b>${'+'.repeat(step)}</b></div>` : ''}
      ${opts.badge ? `<div class="card-badge">${opts.badge}</div>` : ''}
      <div class="ck-banner"><span class="ck-name"${nfit}><span class="full">${esc(def.name).replace(/-/g, '\u2011')}</span><span class="short">${esc(def.name.split(' ')[0])}</span></span><i class="ck-gem"></i></div>
      <div class="ck-panel">
        <div class="ck-atk ${def.damageType}" title="Ataque: ${st.atk} (${def.damageType === 'fisico' ? 'físico' : 'mágico'})"><span>${st.atk}</span></div>
        <div class="ck-rar">${tier}</div>
        <div class="ck-foot"><div class="ck-icons"><span title="${race.label}">${race.icon}</span><span title="${cat.label}">${cat.icon}</span></div></div>
        ${abil}
        <div class="ck-hp" title="Vida: ${st.hp}"><span>${st.hp}</span></div>
      </div>
      ${sparks}
    </div></div>
  </div>`;
}

/** Lista de habilidades com a força atual (raridade e degrau) e a evolução por raridade. */
export function abilityListHTML(def: CharacterDef, stars?: number, step = 0): string {
  const s = stars ?? def.minStars;
  const rows = def.abilities.map((a) => {
    const ab = ABILITIES[a];
    const p = ab.power?.(s, stepIndex(s, step));
    const now = ab.powerLabel && p != null ? ` <span class="ab-now">agora: ${esc(ab.powerLabel(p))}</span>` : '';
    return `<li><b>${abilityIconHTML(a)} ${esc(ab.name)}</b> — ${esc(ab.description)}${now}${ab.scaling ? `<div class="ab-scale">🎨 Por raridade: ${esc(ab.scaling)}</div>` : ''}</li>`;
  });
  if (def.physRes) rows.push(`<li><b>${abilityIconHTML('guarda')} Resistência física ${def.physRes}</b> — reduz cada golpe físico em ${def.physRes}.</li>`);
  if (def.magRes) rows.push(`<li><b>🔰 Resistência mágica ${def.magRes}</b> — reduz cada golpe mágico em ${def.magRes}.</li>`);
  return `<ul class="abilities">${rows.join('')}</ul>`;
}

// ---------- v0.17.0: cartas de FEITIÇO ----------

const CAT_COLOR: Record<string, string> = { tanque: '#64748b', suporte: '#22c55e', dps: '#ef4444', mago: '#a855f7', arqueiro: '#eab308', assassino: '#334155' };
const SPELL_TARGET_LABEL: Record<SpellDef['target'], string> = { enemy: '🎯 1 inimigo', ally: '🤝 1 aliado', row: '↔ 1 fileira', none: '✦ sem alvo' };
export const spellTargetLabel = (s: SpellDef) => SPELL_TARGET_LABEL[s.target];
export const spellCastersLabel = (s: SpellDef) => s.categories.map((c) => `${CATEGORY_INFO[c].icon} ${CATEGORY_INFO[c].label}`).join(' ou ');

/**
 * Carta de feitiço: mesma moldura/medidas da carta de personagem (cabe na mão e na grade), fundo estático
 * na cor da categoria e o ícone grande no lugar da arte. Sem animação nova.
 */
export function spellCardHTML(id: string, opts: { extraClass?: string; attrs?: string; badge?: string; compact?: boolean; wait?: number; copies?: number } = {}): string {
  const s = getSpell(id);
  const c1 = CAT_COLOR[s.categories[0]];
  const c2 = CAT_COLOR[s.categories[1] ?? s.categories[0]];
  const w = opts.wait ?? waitFor(id);
  return `<div class="card spell-card s3 ${opts.compact ? 'compact' : 'ab'} ${opts.extraClass ?? ''}" style="--rc:#7c5cff;--rg:#b9a8ff;--sc1:${c1};--sc2:${c2}" ${opts.attrs ?? ''}>
    <div class="card-metal"><div class="card-frame">
      <div class="card-art spell-art"><span class="spell-ico">${s.icon}</span></div>
      <div class="ck-cost${opts.wait === 0 ? ' ready' : ''}" title="${opts.wait == null ? `Espera ${w} rodada(s) na mão` : opts.wait ? `Falta(m) ${opts.wait} rodada(s)` : 'Pronto para lançar'}"><span>${w}</span></div>
      <div class="ck-pow spell-tag" title="Feitiço">✦ Feitiço</div>
      ${opts.copies ? `<div class="ck-star" title="Cópias no baralho"><small>×</small><b>${opts.copies}</b></div>` : ''}
      ${opts.badge ? `<div class="card-badge">${opts.badge}</div>` : ''}
      <div class="ck-banner"><span class="ck-name"><span class="full">${esc(s.name)}</span><span class="short">${esc(s.name.split(' ')[0])}</span></span><i class="ck-gem"></i></div>
      <div class="ck-panel spell-panel">
        <div class="ck-foot"><div class="ck-icons">${s.categories.map((k) => `<span title="${CATEGORY_INFO[k].label}">${CATEGORY_INFO[k].icon}</span>`).join('')}</div></div>
        <div class="spell-target">${spellTargetLabel(s)}</div>
      </div>
    </div></div>
  </div>`;
}

/** texto do feitiço (painel de informações, coleção) */
export function spellInfoHTML(id: string): string {
  const s = getSpell(id);
  return `<ul class="abilities"><li><b>${s.icon} ${esc(s.name)}</b> — ${esc(s.description)}</li><li><b>✦ Conjurador</b> — precisa de um aliado ${esc(spellCastersLabel(s))} em campo; o de maior ataque conjura (a força vem do ataque dele).</li><li><b>⏳ Espera</b> — ${waitFor(id)} rodada(s) na mão; depois de lançado volta para o baralho.</li></ul>`;
}

/** v0.22.0: 🔮 Orbe com a cor da raridade (e a quantidade, se houver). */
export function orbHTML(id: XpItemId, count?: number | string): string {
  const o = XP_ITEMS.find((x) => x.id === id)!;
  return `<span class="orb" style="--oc:${STAR_COLORS[o.rarity].color}" title="${o.name} (+${o.xp} XP)" aria-label="${o.name}"><i></i>${count != null ? `<b>${count}</b>` : ''}</span>`;
}
/** Os Orbes de uma recompensa, da raridade mais baixa para a mais alta. */
export const orbBagHTML = (bag: OrbBag, prefix = '') =>
  XP_ITEMS.filter((o) => (bag[o.id] ?? 0) > 0).map((o) => orbHTML(o.id, `${prefix}${bag[o.id]}`)).join('');

let coinSeq = 0;
/**
 * v0.26.0: 🪙 Ouro de Dragão — moeda oval japonesa (Ryo/koban) dourada, com listras gravadas e um dragão dourado
 * no meio (desenho próprio em SVG, sem emoji).
 */
export function coinSVG(): string {
  const g = `kc${coinSeq++}`;
  return `<svg class="coin-svg" viewBox="0 0 40 56" aria-hidden="true"><defs>
    <linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#ffd23f"/><stop offset=".7" stop-color="#e0a100"/><stop offset="1" stop-color="#9a6400"/></linearGradient>
    <linearGradient id="${g}b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c4"/><stop offset=".5" stop-color="#ffcf2e"/><stop offset="1" stop-color="#c98a00"/></linearGradient></defs>
    <ellipse cx="20" cy="28" rx="19" ry="27" fill="url(#${g}a)" stroke="#7a4d00" stroke-width="1.4"/>
    <ellipse cx="20" cy="28" rx="15.2" ry="23" fill="none" stroke="#8a5a00" stroke-width=".9" opacity=".8"/>
    <g stroke="#a86f00" stroke-width=".7" opacity=".35">${[12, 16, 20, 24, 32, 36, 40, 44].map((y) => `<line x1="${20 - 13 * Math.sqrt(1 - ((y - 28) / 23) ** 2)}" y1="${y}" x2="${20 + 13 * Math.sqrt(1 - ((y - 28) / 23) ** 2)}" y2="${y}"/>`).join('')}</g>
    <g stroke-linecap="round" stroke-linejoin="round">
      <g fill="url(#${g}b)" stroke="#5c3900" stroke-width=".7">
        <path d="M9.8 22.6 L7 20.4 L10.4 19.9 Z M24.6 30.8 L28.6 29.4 L26.8 32.6 Z M16.2 39.6 L13.6 42.6 L17.6 41.8 Z M27.6 34.4 L31 36 L27.4 37 Z M14.6 16.9 L11.6 16.4 L13.2 19.2 Z"/>
      </g>
      <path d="M12 46 C4 40 30 37 23 29 S8 21 18 14" fill="none" stroke="#5c3900" stroke-width="5.6"/>
      <path d="M12 46 C4 40 30 37 23 29 S8 21 18 14" fill="none" stroke="url(#${g}b)" stroke-width="3.6"/>
      <path d="M12.6 45 C6.6 40 27 37.4 21.6 29.6 S10.2 21.8 18 15" fill="none" stroke="#fff3b0" stroke-width=".8" opacity=".75"/>
      <path d="M12 46 c-3 .6 -5 3.6 -4.2 7 c.9 -1.8 2 -2.2 3 -1.4 c-.2 -2 .6 -3.6 1.2 -5.6 Z" fill="url(#${g}b)" stroke="#5c3900" stroke-width=".7"/>
      <path d="M23.6 30.6 l4 2.4 M27.6 33 l1.6 -1.4 M27.6 33 l1.9 .2 M27.6 33 l.9 1.6 M13.2 23.4 l-4 1.6 M9.2 25 l-1.4 -1.6 M9.2 25 l-1.8 .4 M9.2 25 l-.6 1.8" fill="none" stroke="#5c3900" stroke-width="2.2"/>
      <path d="M23.6 30.6 l4 2.4 M13.2 23.4 l-4 1.6" fill="none" stroke="#ffd84d" stroke-width="1"/>
      <path d="M18.4 9.6 C16.6 7.6 14.6 6.4 12.4 6 M20 9 C19 6.8 17.6 5.2 15.8 4.4" fill="none" stroke="#5c3900" stroke-width="1.5"/>
      <path d="M18.4 9.6 C16.6 7.6 14.6 6.4 12.4 6 M20 9 C19 6.8 17.6 5.2 15.8 4.4" fill="none" stroke="#ffe27a" stroke-width=".6"/>
      <path d="M16 13 C16 9.4 19.6 8.2 23 9 L29 10.6 C30.2 11 30.2 12.6 29 13 L24.4 13.6 L27.6 15.2 C26 16.6 23 16.6 21 15.8 C18 15.8 16 15.2 16 13 Z" fill="url(#${g}b)" stroke="#5c3900" stroke-width=".9"/>
      <path d="M28.6 12.4 C31.6 13 33 15 33.6 18.4 M27 15.6 C28.6 17.2 29 19.2 28.4 21.2" fill="none" stroke="#8a5a00" stroke-width=".7"/>
      <path d="M16.4 14.6 l-2.6 .4 l1.4 1.4 l-2.4 1" fill="none" stroke="#5c3900" stroke-width=".9"/>
    </g>
    <circle cx="21.6" cy="11.4" r=".9" fill="#5c3900"/>
    <circle cx="28.2" cy="11.4" r=".35" fill="#5c3900"/>
  </svg>`;
}
/** Ouro de Dragão com quantidade (opcional). */
export const goldHTML = (count?: number | string) =>
  `<span class="coin" title="Ouro de Dragão" aria-label="Ouro de Dragão">${coinSVG()}${count != null ? `<b>${count}</b>` : ''}</span>`;
/** v0.26.0: energia ⚡ atual / máxima (acima do máximo fica dourada). */
export const energyHTML = (cur: number, max: number) =>
  `<span class="energy${cur > max ? ' over' : ''}" title="Energia (Fácil 1 · Normal 3 · Difícil 6; recupera 1 a cada 6 min)">⚡<b>${cur}</b><small>/${max}</small></span>`;

/** v0.24.0: ícone de item de ascensão; a raridade aparece só na cor do fundo. */
export function gearHTML(id: string, rarity: number, count?: number | string, missing = false): string {
  const g = GEAR_BY_ID[id];
  const label = `${g.name} ${GEAR_RARITY_NAMES[rarity]} (${STAR_COLORS[rarity].label})`;
  return `<span class="gear${missing ? ' missing' : ''}" style="--gc:${STAR_COLORS[rarity].color}" title="${label}" aria-label="${label}"><i>${g.icon}</i>${count != null ? `<b>${count}</b>` : ''}</span>`;
}
