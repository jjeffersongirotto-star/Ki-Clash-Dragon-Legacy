/**
 * 🏪 Loja e 🎴 Banner.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import type { Category } from '../core/types';
import { CATEGORY_INFO, STAR_COLORS, getChar } from '../core/characters';
import { TIER_NAMES, XP_ITEMS, type XpItemId } from '../core/progression';
import { unitSpriteHTML } from '../ui/art';
import { goldHTML, gearHTML, orbHTML, esc, starStyle } from '../ui/components';
import { leaveBattleMode } from '../ui/orientation';
import { GEAR_BY_ID, GEAR_CATEGORIES, GEAR_RARITIES, GEAR_SETS, gearCount, gearNeeded } from '../core/gear';
import { BANNERS, bannerPrice, grantCard, pull, type Banner } from '../core/banner';
import { GEAR_PRICE, ORB_PRICE, buyGear, buyOrb } from '../core/shop';
import { app, save, persist, teamCards, fmt, prof } from './state';
import { topbar, bindNav, resultModalWith } from './ui';
import { grantedHTML } from './adventure';

// ---------------- LOJA (v0.26.0) ----------------
let shopCat: (typeof GEAR_CATEGORIES)[number] | 'need' = 'need';
let shopRarity = 1;
/** 🏪 Loja: itens de ascensão e Orbes por Ouro de Dragão. */
export function shop() {
  leaveBattleMode();
  const bag = (save.gear ??= {});
  const gold = prof().gold;
  // itens que faltam para o próximo degrau dos personagens do baralho
  const need = new Map<string, { id: string; rarity: number; n: number }>();
  for (const c of teamCards())
    for (const g of gearNeeded(c))
      if (gearCount(bag, g.id, g.rarity) < 1) {
        const k = `${g.id}:${g.rarity}`;
        need.set(k, { ...g, n: (need.get(k)?.n ?? 0) + 1 });
      }
  const needKeys = new Set(need.keys());
  const gearCell = (id: string, rarity: number, extra = '') => {
    const price = GEAR_PRICE[rarity];
    return `<div class="shop-item${needKeys.has(`${id}:${rarity}`) ? ' need' : ''}">${gearHTML(id, rarity)}<span>${esc(GEAR_BY_ID[id].name)}</span><small>${STAR_COLORS[rarity].label} · tem ${gearCount(bag, id, rarity)}${extra}</small><button class="btn small ${gold >= price ? 'primary' : ''}" data-gear="${id}" data-r="${rarity}" ${gold >= price ? '' : 'disabled'}>Comprar ${goldHTML(fmt(price))}</button></div>`;
  };
  const list =
    shopCat === 'need'
      ? need.size
        ? [...need.values()].map((g) => gearCell(g.id, g.rarity, g.n > 1 ? ` · ${g.n} personagens pedem` : '')).join('')
        : '<p class="hint">Nenhum item faltando para o próximo degrau dos personagens do seu baralho. 🎉</p>'
      : GEAR_SETS[shopCat].map((g) => gearCell(g.id, shopRarity)).join('');
  app.innerHTML = `<div class="screen">${topbar('🏪 Loja')}
  <div class="shop">
    <p class="hint">Compre com ${goldHTML()} <b>Ouro de Dragão</b>, que vem de cada vitória e Repetir (em dobro na primeira vitória de cada fase).</p>
    ${BANNERS.map((b) => bannerHTML(b, gold)).join('')}
    <h3>🎒 Itens de ascensão</h3>
    <div class="shop-tabs">
      <button class="btn small ${shopCat === 'need' ? 'on primary' : ''}" data-cat="need">⭐ Faltando no baralho${need.size ? ` (${need.size})` : ''}</button>
      ${GEAR_CATEGORIES.map((c) => `<button class="btn small ${shopCat === c ? 'on primary' : ''}" data-cat="${c}">${CATEGORY_INFO[c].icon} ${CATEGORY_INFO[c].label}</button>`).join('')}
    </div>
    ${shopCat === 'need' ? '' : `<div class="shop-tabs">${GEAR_RARITIES.map((r) => `<button class="btn small ${shopRarity === r ? 'on primary' : ''}" data-rar="${r}">${gearHTML(GEAR_SETS[shopCat as Category][0].id, r)} ${STAR_COLORS[r].label} · ${goldHTML(fmt(GEAR_PRICE[r]))}</button>`).join('')}</div>`}
    <div class="shop-grid">${list}</div>
    <h3>🔮 Orbes</h3>
    <div class="shop-grid">${XP_ITEMS.map((o) => `<div class="shop-item">${orbHTML(o.id)}<span>${esc(o.name)}</span><small>+${fmt(o.xp)} XP · tem ${save.items[o.id]}</small><button class="btn small ${gold >= ORB_PRICE[o.id] ? 'primary' : ''}" data-orb="${o.id}" ${gold >= ORB_PRICE[o.id] ? '' : 'disabled'}>Comprar ${goldHTML(fmt(ORB_PRICE[o.id]))}</button></div>`).join('')}</div>
  </div></div>`;
  bindNav();
  const rerender = () => {
    const y = window.scrollY;
    persist();
    shop();
    window.scrollTo(0, y);
  };
  app.querySelectorAll<HTMLElement>('[data-cat]').forEach((b) => b.addEventListener('click', () => { shopCat = b.dataset.cat as typeof shopCat; rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-rar]').forEach((b) => b.addEventListener('click', () => { shopRarity = Number(b.dataset.rar); rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-gear]').forEach((b) => b.addEventListener('click', () => { if (buyGear(prof(), bag, b.dataset.gear!, Number(b.dataset.r)).ok) rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-orb]').forEach((b) => b.addEventListener('click', () => { if (buyOrb(prof(), save.items, b.dataset.orb as XpItemId).ok) rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-pull]').forEach((b) =>
    b.addEventListener('click', () => {
      const banner = BANNERS.find((x) => x.id === b.dataset.banner)!;
      const n = Number(b.dataset.pull) as 1 | 10;
      const price = bannerPrice(banner, n);
      if (prof().gold < price) return;
      prof().gold -= price;
      const got = pull(banner, n).map((c) => grantCard(save.cards, c, Math.random, save.items));
      persist();
      const best = Math.max(...got.map((g) => g.stars));
      resultModalWith(
        `<h2 class="win">🎴 ${esc(banner.name)}</h2><div class="pull-reveal pull-${n}" style="${starStyle(best)}">${got.map((g, i) => `<div class="pull-card r${g.stars}" style="animation-delay:${i * 0.12}s">${grantedHTML(g)}</div>`).join('')}</div>`,
        [{ label: 'Continuar', primary: true, run: shop }],
      );
    }),
  );
}

/** v0.27.0: 🎴 banner estilizado (paisagem, destaque dos mais fortes, chances e botões 1 / 10). */
export function bannerHTML(b: Banner, gold: number): string {
  const feat = b.featured.map((id) => getChar(id));
  const odds = Object.entries(b.odds).map(([r, p]) => `<span style="${starStyle(Number(r))}">${TIER_NAMES[Number(r)]} ${String(Math.round(p * 1000) / 10).replace('.', ',')}%</span>`).join('');
  const btn = (n: 1 | 10) => {
    const price = bannerPrice(b, n);
    return `<button class="btn ${gold >= price ? 'primary' : ''}" data-banner="${b.id}" data-pull="${n}" ${gold >= price ? '' : 'disabled'}>${n === 1 ? 'Comprar 1 carta' : 'Comprar 10 cartas'} ${goldHTML(fmt(price))}</button>`;
  };
  return `<div class="banner-box">
    <div class="banner-art">
      <div class="banner-sky"></div><div class="banner-mount"></div>
      <div class="banner-feat">${feat.map((d) => `<div class="banner-hero" style="${starStyle(b.featuredRarity)}">${unitSpriteHTML(d, { stars: b.featuredRarity, side: 'player' })}<b>${esc(d.name)}</b></div>`).join('')}</div>
      <div class="banner-title"><h3>🎴 ${esc(b.name)}</h3><small>${esc(b.subtitle)}</small></div>
    </div>
    <div class="banner-odds">${odds}</div>
    <p class="hint">Cada carta é um personagem na raridade sorteada. ${feat.map((d) => esc(d.name)).join(' e ')} saem só aqui, no ${TIER_NAMES[b.featuredRarity]}. No pacote de 10: pelo menos 1 ${TIER_NAMES[b.guarantee10]} ou melhor. Personagem repetido vira XP dele (às vezes ×2, ×5 ou ×10).</p>
    <div class="row">${btn(1)}${btn(10)}</div>
  </div>`;
}
