import { ABILITIES } from '../core/abilities';
import { CATEGORY_INFO, RACE_INFO, STAR_COLORS, getChar } from '../core/characters';
import { statsFor, tierLabel } from '../core/progression';
import type { AbilityId, CardInstance, CharacterDef } from '../core/types';
import { portraitImg } from './art';
import { gridArtHTML } from './gridArt';
import { cardPower } from '../core/power';
import peitoralUrl from '../assets/card/ab-peitoral.svg';

/** v0.14.2: ícone de habilidade — a Resistência Física (Postura de Guarda) usa o peitoral de armadura (SVG) no lugar do 🛡. */
const ABILITY_SVG: Record<string, string> = { guarda: peitoralUrl };
export function abilityIconHTML(id: AbilityId): string {
  const svg = ABILITY_SVG[id];
  return svg ? `<img class="ab-svg" src="${svg}" alt="" draggable="false">` : ABILITIES[id].icon;
}

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
  opts: { extraClass?: string; attrs?: string; locked?: boolean; badge?: string; compact?: boolean; grid?: boolean; power?: number } = {},
): string {
  const def = getChar(card.charId);
  const st = statsFor(def, card.level, card.stars, !!card.plus);
  const tier = tierLabel(card.stars, !!card.plus);
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
      <div class="ck-cost" title="Custo de energia"><span>${def.cost}</span></div>
      <div class="ck-pow" title="Poder">⚡${power}</div>
      <div class="ck-star" title="Nível"><small>Nv.</small><b>${card.level}</b></div>
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

/** Lista de habilidades com a força atual (cor/nível) e a evolução por cor (o "+" não muda habilidades). */
export function abilityListHTML(def: CharacterDef, stars?: number, level?: number): string {
  const s = stars ?? def.minStars;
  const l = level ?? 1;
  const rows = def.abilities.map((a) => {
    const ab = ABILITIES[a];
    const p = ab.power?.(s, l);
    const now = ab.powerLabel && p != null ? ` <span class="ab-now">agora: ${esc(ab.powerLabel(p))}</span>` : '';
    return `<li><b>${abilityIconHTML(a)} ${esc(ab.name)}</b> — ${esc(ab.description)}${now}${ab.scaling ? `<div class="ab-scale">🎨 Por cor: ${esc(ab.scaling)}</div>` : ''}</li>`;
  });
  if (def.physRes) rows.push(`<li><b>${abilityIconHTML('guarda')} Resistência física ${def.physRes}</b> — reduz cada golpe físico em ${def.physRes}.</li>`);
  if (def.magRes) rows.push(`<li><b>🔰 Resistência mágica ${def.magRes}</b> — reduz cada golpe mágico em ${def.magRes}.</li>`);
  return `<ul class="abilities">${rows.join('')}</ul>`;
}
