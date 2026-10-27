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
/**
 * v0.28.7: ícone colorido do GRUPO no canto direito de cima da carta (no lugar da estrela do degrau,
 * que já aparece escrito em "Raro++" etc.). Desenhos próprios em SVG, sem círculo em volta.
 */
const grad = (id: string, a: string, b: string, c: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
export const CATEGORY_SVG: Record<string, string> = {
  suporte: `<svg viewBox="0 0 24 24"><defs>${grad('cg-sup', '#b9ffc8', '#3ddc6a', '#138a3a')}</defs><path d="M9 2.5h6v6.5h6.5v6H15v6.5H9V15H2.5V9H9z" fill="url(#cg-sup)" stroke="#0b3d1c" stroke-width="1.4" stroke-linejoin="round"/><path d="M10.2 3.8h1.6v6.4H5" fill="none" stroke="#eaffef" stroke-width=".9" opacity=".8"/></svg>`,
  tanque: `<svg viewBox="0 0 24 24"><defs>${grad('cg-tan', '#cfe8ff', '#3b9cff', '#0b4fa8')}</defs><path d="M12 2 20.5 5v6.2c0 5.3-3.6 9.2-8.5 10.8C7.1 20.4 3.5 16.5 3.5 11.2V5z" fill="url(#cg-tan)" stroke="#06244d" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 4.6v15" stroke="#e8f4ff" stroke-width="1.1" opacity=".75"/><path d="M6 7.2 12 5.2" stroke="#fff" stroke-width=".9" opacity=".7"/></svg>`,
  dps: `<svg viewBox="0 0 24 24"><defs>${grad('cg-dps', '#ffd0c8', '#ff4d3a', '#a3140a')}</defs><g stroke="#4a0700" stroke-width="1.2" stroke-linejoin="round" fill="url(#cg-dps)"><path d="M4 3l3 .3 9.3 9.3-2.7 2.7L4.3 6z"/><path d="M20 3l-3 .3-9.3 9.3 2.7 2.7L19.7 6z"/><path d="M5.5 15.8l2.7 2.7-2.3 2.3-2.7-2.7zM18.5 15.8l-2.7 2.7 2.3 2.3 2.7-2.7z"/><path d="M6.6 13.6l3.8 3.8M17.4 13.6l-3.8 3.8" stroke-width="2.4" stroke="#4a0700"/></g></svg>`,
  mago: `<svg viewBox="0 0 24 24"><defs>${grad('cg-mag', '#f1d4ff', '#b05cff', '#5a1499')}</defs><path d="M4 20.5 15 9.5l1.6 1.6-11 11z" fill="url(#cg-mag)" stroke="#2a0647" stroke-width="1.2" stroke-linejoin="round"/><path d="M17 1.8l1.4 3 3.2.5-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.5z" fill="url(#cg-mag)" stroke="#2a0647" stroke-width="1.1" stroke-linejoin="round"/><circle cx="17" cy="6.3" r="1" fill="#fff" opacity=".85"/></svg>`,
  arqueiro: `<svg viewBox="0 0 24 24"><defs>${grad('cg-arq', '#ffe7b8', '#ff9f1a', '#a85400')}</defs><path d="M6 2.5c8 2.5 10.5 7 10.5 9.5S14 19 6 21.5" fill="none" stroke="#4a2400" stroke-width="3.6" stroke-linecap="round"/><path d="M6 2.5c8 2.5 10.5 7 10.5 9.5S14 19 6 21.5" fill="none" stroke="url(#cg-arq)" stroke-width="2.2" stroke-linecap="round"/><path d="M6 2.5v19" stroke="#fff3d6" stroke-width=".9"/><path d="M3 12h17" stroke="#4a2400" stroke-width="2.2" stroke-linecap="round"/><path d="M3 12h17" stroke="#ffd27a" stroke-width="1"/><path d="M22 12l-3.4-2.2v4.4z" fill="url(#cg-arq)" stroke="#4a2400" stroke-width="1" stroke-linejoin="round"/></svg>`,
  assassino: `<svg viewBox="0 0 24 24"><defs>${grad('cg-ass', '#e9e9f2', '#9a9ab0', '#3d3d52')}</defs><path d="M12 2.5c4.9 0 8.3 3.4 8.3 7.9 0 2.6-1.2 4.4-3 5.4v3.4c0 1-.8 1.8-1.8 1.8h-7c-1 0-1.8-.8-1.8-1.8v-3.4c-1.8-1-3-2.8-3-5.4 0-4.5 3.4-7.9 8.3-7.9z" fill="url(#cg-ass)" stroke="#15151f" stroke-width="1.3" stroke-linejoin="round"/><circle cx="8.6" cy="11" r="2.3" fill="#15151f"/><circle cx="15.4" cy="11" r="2.3" fill="#15151f"/><path d="M12 13.4l-1.3 2.4h2.6z" fill="#15151f"/><path d="M10 18.3v2.4M12 18.3v2.4M14 18.3v2.4" stroke="#15151f" stroke-width="1"/></svg>`,
};

/** Ícone do grupo como imagem (data URI, em cache): a carta não leva SVG em linha (v0.10.1). */
const catURI = new Map<string, string>();
export function categoryIconURI(category: string): string {
  let u = catURI.get(category);
  if (!u) {
    u = `data:image/svg+xml;charset=utf-8,${encodeURIComponent((CATEGORY_SVG[category] ?? '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
    catURI.set(category, u);
  }
  return u;
}

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
      <div class="ck-cat" title="${cat.label}"><img src="${categoryIconURI(def.category)}" alt=""></div>
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

/**
 * v0.26.1: 🪙 Ouro de Dragão — a moeda Ryo dourada (redonda, com borda), com o dragão 🐉 dourado no lugar
 * do furo do meio. O dragão é o próprio 🐉, pintado de dourado pelo CSS (.coin-dragon).
 */
export const coinFace = () => `<span class="coin-face" aria-hidden="true"><span class="coin-field"><span class="coin-dragon">🐉</span></span></span>`;
/** Ouro de Dragão com quantidade (opcional). */
export const goldHTML = (count?: number | string) =>
  `<span class="coin" title="Ouro de Dragão" aria-label="Ouro de Dragão">${coinFace()}${count != null ? `<b>${count}</b>` : ''}</span>`;
/** v0.26.0: energia ⚡ atual / máxima (acima do máximo fica dourada). */
export const energyHTML = (cur: number, max: number) =>
  `<span class="energy${cur > max ? ' over' : ''}" title="Energia (Fácil 1 · Normal 3 · Difícil 6; recupera 1 a cada 6 min)">⚡<b>${cur}</b><small>/${max}</small></span>`;

/** v0.24.0: ícone de item de ascensão; a raridade aparece só na cor do fundo. */
export function gearHTML(id: string, rarity: number, count?: number | string, missing = false): string {
  const g = GEAR_BY_ID[id];
  const label = `${g.name} ${GEAR_RARITY_NAMES[rarity]} (${STAR_COLORS[rarity].label})`;
  return `<span class="gear${missing ? ' missing' : ''}" style="--gc:${STAR_COLORS[rarity].color}" title="${label}" aria-label="${label}"><i>${g.icon}</i>${count != null ? `<b>${count}</b>` : ''}</span>`;
}
