/**
 * 🏪 Loja e 🎴 Banner.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import type { Category } from '../core/types';
import { CATEGORY_INFO, STAR_COLORS, getChar } from '../core/characters';
import { TIER_NAMES, XP_ITEMS, type XpItemId } from '../core/progression';
import { unitSpriteHTML } from '../ui/art';
import { ico } from '../ui/icons';
import { cardDetails, onLongPress } from '../ui/battleModals';
import { catIcon, gemHTML, goldHTML, gearHTML, orbHTML, esc, starStyle } from '../ui/components';
import { leaveBattleMode } from '../ui/orientation';
import { GEAR_BY_ID, GEAR_CATEGORIES, GEAR_RARITIES, GEAR_SETS, gearCount, gearNeeded } from '../core/gear';
import { BANNERS, PITY_EVERY, PITY_RARITY as PITY_RARITY_LABEL, bannerPrice, grantCard, pityCount, pull, type Banner } from '../core/banner';
import { GEAR_PRICE, ORB_PRICE, buyGear, buyOrb } from '../core/shop';
import { app, save, persist, teamCards, fmt, prof } from './state';
import { topbar, bindNav, modal, closeModal } from './ui';
import { showDialog } from '../ui/dialog';
import { grantedHTML } from './adventure';

// ---------------- LOJA (v0.26.0) ----------------
let shopCat: (typeof GEAR_CATEGORIES)[number] | 'need' = 'need';
let shopRarity = 1;
/** v0.51.0: aba principal da Loja (itens de ascensão ou Orbes) */
let shopTab: 'gear' | 'orbs' = 'gear';
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
  app.innerHTML = `<div class="screen shop-screen">${topbar(`${ico('loja', '🏪')} Loja`, true, `<span>${gemHTML(fmt(save.gems ?? 0))}</span><span>${goldHTML(fmt(gold))}</span>`)}
  <div class="shop">
    ${BANNERS.map((b) => bannerHTML(b, gold)).join('')}
    <div class="shop-maintabs" role="tablist">
      <button class="shop-mtab ${shopTab === 'gear' ? 'on' : ''}" data-tab="gear" role="tab">${ico('inventario', '🎒')} Itens de Ascensão</button>
      <button class="shop-mtab ${shopTab === 'orbs' ? 'on' : ''}" data-tab="orbs" role="tab">${ico('orbe3', '🔮')} Orbes</button>
    </div>
    <div class="shop-panel">
    ${shopTab === 'gear' ? `<div class="shop-tabs">
      <button class="btn small ${shopCat === 'need' ? 'on primary' : ''}" data-cat="need">${ico('faltando', '⭐')} Faltando no baralho${need.size ? ` (${need.size})` : ''}</button>
      ${GEAR_CATEGORIES.map((c) => `<button class="btn small ${shopCat === c ? 'on primary' : ''}" data-cat="${c}">${catIcon(c)} ${CATEGORY_INFO[c].label}</button>`).join('')}
    </div>
    ${shopCat === 'need' ? '' : `<div class="shop-tabs">${GEAR_RARITIES.map((r) => `<button class="btn small ${shopRarity === r ? 'on primary' : ''}" data-rar="${r}">${gearHTML(GEAR_SETS[shopCat as Category][0].id, r)} ${STAR_COLORS[r].label} · ${goldHTML(fmt(GEAR_PRICE[r]))}</button>`).join('')}</div>`}
    <div class="shop-grid">${list}</div>` : `<div class="shop-grid">${XP_ITEMS.map((o) => `<div class="shop-item">${orbHTML(o.id)}<span>${esc(o.name)}</span><small>+${fmt(o.xp)} XP · tem ${save.items[o.id]}</small><button class="btn small ${gold >= ORB_PRICE[o.id] ? 'primary' : ''}" data-orb="${o.id}" ${gold >= ORB_PRICE[o.id] ? '' : 'disabled'}>Comprar ${goldHTML(fmt(ORB_PRICE[o.id]))}</button></div>`).join('')}</div>`}
    </div>
  </div></div>`;
  bindNav();
  const rerender = () => {
    const y = window.scrollY;
    persist();
    shop();
    window.scrollTo(0, y);
  };
  app.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.addEventListener('click', () => { shopTab = b.dataset.tab as typeof shopTab; rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-binfo]').forEach((b) => b.addEventListener('click', () => bannerInfo(BANNERS.find((x) => x.id === b.dataset.binfo)!)));
  app.querySelectorAll<HTMLElement>('[data-cat]').forEach((b) => b.addEventListener('click', () => { shopCat = b.dataset.cat as typeof shopCat; rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-rar]').forEach((b) => b.addEventListener('click', () => { shopRarity = Number(b.dataset.rar); rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-gear]').forEach((b) => b.addEventListener('click', () => { if (buyGear(prof(), bag, b.dataset.gear!, Number(b.dataset.r)).ok) rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-orb]').forEach((b) => b.addEventListener('click', () => { if (buyOrb(prof(), save.items, b.dataset.orb as XpItemId).ok) rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-pull]').forEach((b) =>
    b.addEventListener('click', () => buyCards(BANNERS.find((x) => x.id === b.dataset.banner)!, Number(b.dataset.pull) as 1 | 10, shop, b.dataset.pay as 'gem' | 'gold')),
  );
}

/**
 * v0.33.0: como pagar `n` cartas: com 💠 Gemas se tiver `n` (1 gema = 1 carta), senão com Ouro de Dragão.
 * `null` = não dá para comprar.
 */
export function payWith(banner: Banner, n: 1 | 10, kind?: 'gem' | 'gold'): { kind: 'gem' | 'gold'; cost: number } | null {
  if (kind !== 'gold' && (save.gems ?? 0) >= n) return { kind: 'gem', cost: n };
  if (kind === 'gem') return null;
  const price = bannerPrice(banner, n);
  return prof().gold >= price ? { kind: 'gold', cost: price } : null;
}

/** v0.52.1: cada compra tem as duas opções lado a lado — com 💠 Gemas ou com Ouro de Dragão. */
export function buyPair(banner: Banner, n: 1 | 10, attr: (n: number, kind: 'gem' | 'gold') => string): string {
  const one = (kind: 'gem' | 'gold') => {
    const ok = !!payWith(banner, n, kind);
    const cost = kind === 'gem' ? gemHTML(n) : goldHTML(fmt(bannerPrice(banner, n)));
    return `<button class="btn buy-opt ${ok ? 'primary' : ''}" ${attr(n, kind)} data-pay="${kind}" ${ok ? '' : 'disabled'} title="${kind === 'gem' ? 'Pagar com Gemas de Invocação' : 'Pagar com Ouro de Dragão'}">${cost}</button>`;
  };
  return `<div class="buy-pair"><span class="buy-pair-t">${n === 1 ? 'Comprar 1 carta' : 'Comprar 10 cartas'}</span>${one('gem')}${one('gold')}</div>`;
}

/**
 * Compra 1 ou 10 cartas do banner e mostra o resultado.
 * v0.31.0: o resultado traz "Comprar 1" e "Comprar 10" (de novo, direto) e um ✕ embaixo, no meio, para sair.
 * v0.33.0: paga com 💠 Gemas primeiro (se tiver a quantidade), senão com Ouro.
 */
export function buyCards(banner: Banner, n: 1 | 10, after: () => void = shop, kind?: 'gem' | 'gold') {
  const pay = payWith(banner, n, kind);
  if (!pay) return;
  if (pay.kind === 'gem') save.gems = (save.gems ?? 0) - pay.cost;
  else prof().gold -= pay.cost;
  const got = pull(banner, n, Math.random, (save.bannerPity ??= {})).map((c) => grantCard(save.cards, c, (save.dupes ??= {}), (save.spells ??= {})));
  persist();
  const best = Math.max(...got.map((g) => g.stars));
  const again = (k: 1 | 10) => buyPair(banner, k, (q) => `data-again="${q}"`);
  modal(
    `<h2 class="win">${ico('pacote', '🎴')} ${esc(banner.name)}</h2><div class="pull-reveal pull-${n}" style="${starStyle(best)}">${got.map((g, i) => `<div class="pull-card r${g.stars}" style="animation-delay:${i * 0.12}s">${grantedHTML(g)}</div>`).join('')}</div>
    <p class="hint pity-line">${ico('pity', '🎯')} Lendária garantida: <b>${pityCount(banner, save.bannerPity)}/${PITY_EVERY}</b> · você tem ${save.gems ? `${gemHTML(fmt(save.gems))} ` : ''}${goldHTML(fmt(prof().gold))}</p>
    <div class="row pull-again">${again(1)}${again(10)}</div>
    <div class="row pull-exit"><button class="btn ghost pull-x" data-m="close" aria-label="Sair" title="Sair">${ico('fechar', '✕')}</button></div>`,
    (m) => {
      m.querySelector('[data-m=close]')!.addEventListener('click', () => {
        closeModal();
        after();
      });
      // v0.53.0: segurar a carta tirada mostra as habilidades (como na partida)
      m.querySelectorAll<HTMLElement>('.pull-card').forEach((el, i) => onLongPress(el, () => cardDetails(got[i])));
      m.querySelectorAll<HTMLElement>('[data-again]').forEach((el) => el.addEventListener('click', () => buyCards(banner, Number(el.dataset.again) as 1 | 10, after, el.dataset.pay as 'gem' | 'gold')));
    },
  );
}

/** v0.51.0: ⓘ do banner — chances por raridade e garantias numa janela do jogo. */
export function bannerInfo(b: Banner) {
  const odds = Object.entries(b.odds).map(([r, p]) => `<span style="${starStyle(Number(r))}">${TIER_NAMES[Number(r)]} ${String(Math.round(p * 1000) / 10).replace('.', ',')}%</span>`).join('');
  void showDialog({
    title: b.name,
    icon: 'ℹ️',
    html: `<p class="hint">Chance de cada raridade por carta:</p><div class="banner-odds">${odds}</div>
      <p>${ico('pity', '🎯')} A cada <b>${PITY_EVERY}</b> cartas compradas, 1 <b>${TIER_NAMES[PITY_RARITY_LABEL]}</b> ou melhor garantida (volta a 0 quando sai uma). Agora: <b>${pityCount(b, save.bannerPity)}/${PITY_EVERY}</b>.</p>
      <p>🔟 <b>Comprar 10</b> garante pelo menos 1 carta <b>${TIER_NAMES[b.guarantee10]}</b> ou melhor.</p>
      <p>${gemHTML()} Pague com Gemas de Invocação (1 gema = 1 carta) ou com Ouro de Dragão: cada botão de compra tem as duas opções.</p>`,
    buttons: [{ label: 'Entendi', value: 'ok', kind: 'primary' }],
  });
}

/** v0.27.0: 🎴 banner estilizado (paisagem, destaque dos mais fortes, chances e botões 1 / 10). */
export function bannerHTML(b: Banner, gold: number): string {
  const feat = b.featured.map((id) => getChar(id));
  const btn = (n: 1 | 10) => (gold < 0 ? '' : buyPair(b, n, (q) => `data-banner="${b.id}" data-pull="${q}"`));
  return `<div class="banner-box">
    <div class="banner-art">
      <div class="banner-sky"></div><div class="banner-mount"></div>
      <div class="banner-feat">${feat.map((d) => `<div class="banner-hero" style="${starStyle(b.featuredRarity)}">${unitSpriteHTML(d, { stars: b.featuredRarity, side: 'player' })}<b>${esc(d.name.split(' ')[0])}</b></div>`).join('')}</div>
      <div class="banner-title"><h3>${ico('banner', '🎴')} ${esc(b.name)}</h3><button class="banner-info" data-binfo="${b.id}" aria-label="Informações do banner" title="Chances e garantias">i</button></div>
    </div>
    <div class="pity-mark" title="A cada ${PITY_EVERY} cartas compradas, 1 ${TIER_NAMES[PITY_RARITY_LABEL]} ou melhor garantida (volta a 0 quando sai uma)">${ico('pity', '🎯')} Lendária garantida <b>${pityCount(b, save.bannerPity)}/${PITY_EVERY}</b></div>
    <div class="row">${btn(1)}${btn(10)}</div>
  </div>`;
}
