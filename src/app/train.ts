/**
 * Treinar: barra de XP, degraus, itens de ascensão e Despertar.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { CATEGORY_INFO, getChar } from '../core/characters';
import { MAX_STEP, TIER_NAMES, XP_ITEMS, ascendCost, ascendCostFor, barFull, canAscend, cardBarXp, feedXp, isMaxTier, nextTier, statsFor, stepOf, stepXp, tierLabel, xpProgress, type OwnedCard, type XpItemId } from '../core/progression';
import { portraitHTML, unitSpriteHTML } from '../ui/art';
import { abilityListHTML, catIcon, gearHTML, orbHTML, cardHTML, categoryHTML, esc, raceHTML, starStyle, tierHTML, essIcon } from '../ui/components';
import { ico } from '../ui/icons';
import { leaveBattleMode } from '../ui/orientation';
import { bindGearTaps, gearTapHTML } from './gearItem';
import { GEAR_CATEGORIES, GEAR_PER_STEP, GEAR_RARITIES, GEAR_SETS, reqRarity, ascendWithGear, charGear, gearCount, gearNeeded, hasGearFor } from '../core/gear';
import { app, save, trainSel, trainRef, setTrainSel, persist, track } from './state';
import { bestCopy, copyAt, copyList, materialize, pickOf } from '../core/copies';
import { cardPower } from '../core/power';
import { topbar, bindNav, modal, closeModal, bakeAllGrid } from './ui';

// ---------------- TREINO ----------------
/** Escada de Despertar do personagem: cada degrau com o tamanho da barra de XP e as Essências para subir (v0.23.0). */
export function ladderHTML(card: { charId: string; stars: number; plus?: number | boolean }): string {
  const def = getChar(card.charId);
  const rows: string[] = [];
  const cur = { s: card.stars, p: stepOf(card) };
  for (let s = def.minStars; s <= def.maxStars; s++) {
    for (let p = 0; p <= MAX_STEP; p++) {
      const isCur = s === cur.s && p === cur.p;
      const done = s < cur.s || (s === cur.s && p < cur.p);
      const last = s === def.maxStars && p === MAX_STEP;
      const up = last ? '—' : `${essIcon()} ${ascendCostFor(s, p)} + ${GEAR_PER_STEP[p]} itens → ${p === MAX_STEP ? `<b>${tierLabel(s + 1)}</b> <small>(nova raridade: habilidades e visual)</small>` : `<b>${tierLabel(s, p + 1)}</b>`}`;
      rows.push(`<tr class="${isCur ? 'cur' : done ? 'done' : ''}" style="${starStyle(s)}"><td><span class="tier-dot"></span>${tierLabel(s, p)}${isCur ? ' <small>(atual)</small>' : ''}</td><td>${last ? '—' : stepXp(s, p).toLocaleString('pt-BR')}</td><td>${up}</td></tr>`);
    }
  }
  return `<details class="ladder" open><summary>${ico('escada', '🪜')} Escada de Despertar</summary><table><thead><tr><th>Degrau</th><th>Barra de XP</th><th>Despertar</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    <p class="hint">Itens de ascensão de ${esc(getChar(card.charId).name)} na raridade ${TIER_NAMES[card.stars]} (1 de cada; alguns são da raridade <b>um acima</b> da carta): <b>"+"</b> ${charGear(card.charId).plus.map((r) => gearHTML(r.id, reqRarity(r, card.stars))).join('')} · <b>"++"</b> ${charGear(card.charId).plus2.map((r) => gearHTML(r.id, reqRarity(r, card.stars))).join('')} · <b>nova raridade</b> ${charGear(card.charId).awaken.map((r) => gearHTML(r.id, reqRarity(r, card.stars))).join('')}</p>
</details>`;
}

/** v0.24.0: mochila de itens de ascensão, por categoria (só os que o jogador tem). */
export function gearBagDialog() {
  const bag = save.gear ?? {};
  const rows = GEAR_CATEGORIES.map((cat) => {
    const owned = GEAR_SETS[cat].flatMap((g) => GEAR_RARITIES.filter((r) => gearCount(bag, g.id, r) > 0).map((r) => gearTapHTML(g.id, r, gearCount(bag, g.id, r))));
    return `<div class="gear-cat">${catIcon(cat)} ${CATEGORY_INFO[cat].label}: <small>${GEAR_SETS[cat].map((g) => g.name).join(', ')}</small></div><div class="gear-bag">${owned.join('') || '<small>nenhum ainda</small>'}</div>`;
  }).join('');
  modal(`<h2>${ico('inventario', '🎒')} Itens de ascensão</h2><p class="hint">Cada fase dá 3 itens. A cor do fundo é a raridade (cinza, verde, azul, roxo, laranja). Cada degrau pede 3 / 4 / 5 itens ("+" / "++" / nova raridade): 1 / 2 / 3 deles da raridade <b>um acima</b> da carta e 2 da raridade dela (cartas Lendárias e Míticas: só laranja). Cores: <b>Fácil</b> cinza até azul (roxo só no fim) · <b>Normal</b> azul a laranja · <b>Difícil</b> roxo e laranja. <b>Toque num item</b> para fundir (3 iguais → 1 da cor acima, com Essências) e ver onde conseguir.</p>${rows}<div class="row"><button class="btn primary" data-m="close">Fechar</button></div>`, (m) => {
    m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
    bindGearTaps(m, gearBagDialog);
  });
}

export function train() {
  leaveBattleMode();
  void bakeAllGrid();
  if (!save.cards[trainSel]) setTrainSel(Object.keys(save.cards)[0]);
  // v0.71.0: o Treinar vale para UMA cópia (cada cópia tem a sua cor, degrau e XP, e paga o preço inteiro)
  if (!copyAt(save, trainSel, trainRef)) setTrainSel(trainSel, 0);
  const card = copyAt(save, trainSel, trainRef)!;
  if (orbKey !== `${trainSel}:${trainRef}`) orbPick = {}; // outra carta: a escolha de Orbes recomeça
  orbKey = `${trainSel}:${trainRef}`;
  const def = getChar(card.charId);
  const plus = stepOf(card);
  const st = statsFor(def, card.stars, plus);
  const top = isMaxTier(card);
  const full = barFull(card);
  const nt = nextTier(card);
  const ntLabel = nt ? tierLabel(nt.stars, nt.plus) : '';
  const nextSt = nt ? statsFor(def, nt.stars, nt.plus) : st;
  const need = gearNeeded(card);
  const gearOk = hasGearFor(save.gear, card);
  const needHTML = need.length
    ? `<div class="gear-need"><span>Itens (${need.length}):</span>${need.map((n) => gearTapHTML(n.id, n.rarity, `${Math.min(1, gearCount(save.gear, n.id, n.rarity))}/1`, gearCount(save.gear, n.id, n.rarity) < 1)).join('')}</div>`
    : '';
  const ascendBtn = nt
    ? `${needHTML}<button class="btn primary" id="ascend" ${canAscend(card) && gearOk && save.essencias >= ascendCost(card) ? '' : 'disabled'}>✨ Subir para ${ntLabel} (${essIcon()} ${ascendCost(card)})</button>
       <p class="hint">${full ? '' : 'Encha a barra de XP para subir o degrau. '}${gearOk ? '' : `<span class="warn">Faltam itens de ascensão (as fases dão itens; veja quais em ${ico('inventario', '🎒')} Itens).</span> `}${nt.stars === card.stars ? `${ntLabel} ${nt.plus === 1 ? 'dá +1 de vida' : card.stars >= getChar(card.charId).maxStars ? 'dá +1 de ataque' : 'prepara a próxima raridade'} (visual igual).` : `${ntLabel} é uma <b>nova raridade</b>: evolui roupa, armadura, aura, habilidades e status.`}${save.essencias < ascendCost(card) ? ` <span class="warn">Você tem ${essIcon()} ${save.essencias}.</span>` : ''}</p>`
    : '<p class="hint">Raridade máxima com "++": este personagem chegou ao topo!</p>';
  app.innerHTML = `<div class="screen">${topbar('Treinar')}
    <div class="row"><button class="btn small" id="gearBag">🎒 Itens de ascensão</button></div>
    <div class="train-list">${Object.values(save.cards)
      .map((c) => cardHTML(bestCopy(save, c.charId) ?? c, { compact: true, grid: true, extraClass: `train-pick ${c.charId === trainSel ? 'sel' : ''}`, attrs: `data-sel="${c.charId}"` }))
      .join('')}</div>
    ${copyTabsHTML(trainSel, trainRef)}
    <div class="train-main" style="${starStyle(card.stars)}">
      <div class="train-visuals">
        <div class="train-art">${cardHTML(card)}</div>
        <div class="detail-sprite-box">
          <div class="ds-sprite">${unitSpriteHTML(def, { stars: card.stars, side: 'player' })}</div>
          <div class="ds-label">Lutador na Arena (${tierLabel(card.stars, plus)})</div>
        </div>
      </div>
      <div class="train-info">
        <div class="detail-badges">${tierHTML(card.stars, plus)} ${raceHTML(def, true)} ${categoryHTML(def, true)}</div>
        <h2>${esc(def.name)}</h2>
        <div><b>${tierLabel(card.stars, plus)}</b> · <span class="ess">${essIcon()} ${save.essencias} Essências</span></div>
        <div class="xpbar" id="xpbar">${xpBarInner(card)}</div>
        <div class="stat-row"><span>Ataque <b>${st.atk}</b>${nextSt.atk > st.atk ? ` <em>→ ${nextSt.atk}</em>` : ''}</span><span>Vida <b>${st.hp}</b>${nextSt.hp > st.hp ? ` <em>→ ${nextSt.hp}</em>` : ''}</span></div>
        ${abilityListHTML(def, card.stars, plus)}
        <div class="orb-feed">${orbFeedHTML(card)}</div>
        ${ascendBtn}
        ${top || full ? '' : `<p class="hint">Alimente Orbes 🔮 até encher a barra (o XP que passar do cheio se perde). Com a barra cheia, suba o degrau com Essências ${essIcon()}.</p>`}
        ${ladderHTML(card)}
      </div>
    </div></div>`;
  bindNav();
  bindGearTaps(app, train); // v0.69.0: tocar num item que falta abre fusão e onde conseguir
  app.querySelectorAll<HTMLElement>('[data-sel]').forEach((el) =>
    el.addEventListener('click', () => {
      setTrainSel(el.dataset.sel!, strongestRef(el.dataset.sel!));
      train();
    }),
  );
  app.querySelectorAll<HTMLElement>('[data-cref]').forEach((el) =>
    el.addEventListener('click', () => {
      setTrainSel(trainSel, Number(el.dataset.cref));
      train();
    }),
  );
  // cópia guardada: vira uma cópia própria para poder treinar
  app.querySelectorAll<HTMLElement>('[data-cbox]').forEach((el) =>
    el.addEventListener('click', () => {
      const ref = materialize(save, trainSel, Number(el.dataset.cbox));
      if (ref == null) return;
      persist();
      setTrainSel(trainSel, ref);
      train();
    }),
  );
  bindOrbFeed(card);
  app.querySelector('#gearBag')?.addEventListener('click', gearBagDialog);
  app.querySelector('#ascend')?.addEventListener('click', () => {
    const from = { stars: card.stars, plus: stepOf(card) };
    const before = statsFor(def, card.stars, stepOf(card));
    const r = ascendWithGear(card, save.essencias, (save.gear ??= {}));
    if (r.ok) {
      save.essencias -= r.cost;
      persist();
      train();
      evolutionReveal(card.charId, from, { stars: card.stars, plus: stepOf(card) }, before);
    }
  });
}

// ---------------- ORBES (v0.72.2) ----------------
// Tocar num Orbe só escolhe: a barra mostra até onde o XP vai chegar. Só gasta ao tocar em "Usar".
let orbPick: Partial<Record<XpItemId, number>> = {};
let orbKey = '';
const pickXp = () => XP_ITEMS.reduce((a, it) => a + (orbPick[it.id as XpItemId] ?? 0) * it.xp, 0);
const pickCount = () => XP_ITEMS.reduce((a, it) => a + (orbPick[it.id as XpItemId] ?? 0), 0);

function xpBarInner(card: OwnedCard): string {
  if (isMaxTier(card)) return '<i style="width:100%"></i><span>TOPO: RARIDADE MÁXIMA "++"</span>';
  const cap = cardBarXp(card);
  if (barFull(card)) return '<i style="width:100%"></i><span>BARRA CHEIA: PODE SUBIR O DEGRAU</span>';
  const pct = Math.round(xpProgress(card) * 100);
  const add = pickXp();
  if (!add) return `<i style="width:${pct}%"></i><span>${card.xp} / ${cap} XP (${pct}%)</span>`;
  const to = Math.min(cap, card.xp + add);
  const toPct = Math.round((100 * to) / cap);
  return `<b class="xp-ghost" style="width:${toPct}%"></b><i style="width:${pct}%"></i><span>${card.xp} → <em>${to}</em> / ${cap} XP (${toPct}%)</span>`;
}

function orbFeedHTML(card: OwnedCard): string {
  const closed = isMaxTier(card) || barFull(card);
  const room = closed ? 0 : cardBarXp(card) - card.xp;
  const add = pickXp();
  const cards = XP_ITEMS.map((it) => {
    const id = it.id as XpItemId;
    const n = orbPick[id] ?? 0;
    const have = save.items[id];
    const canAdd = !closed && n < have && add < room;
    return `<div class="item-btn orb-pick${n ? ' on' : ''}${!closed && have > 0 ? '' : ' off'}" data-item="${id}" role="button">
      <span class="ic">${orbHTML(id)}</span><b>${it.name}</b><small>+${it.xp} XP · você tem ${have}</small>
      ${n ? `<span class="orb-step"><button class="btn small" data-orb-minus="${id}" aria-label="Tirar um">−</button><b>${n}</b><button class="btn small" data-orb-plus="${id}" aria-label="Pôr mais um" ${canAdd ? '' : 'disabled'}>+</button></span>` : ''}
    </div>`;
  }).join('');
  const lost = Math.max(0, add - room);
  const bar = pickCount()
    ? `<div class="orb-use"><span>${pickCount()} Orbe${pickCount() > 1 ? 's' : ''} · +${add} XP${lost ? ` <span class="warn">(${lost} XP passam do cheio e se perdem)</span>` : ''}</span><button class="btn small" id="orbClear">Limpar</button><button class="btn primary" id="orbUse">🔮 Usar</button></div>`
    : closed ? '' : '<p class="hint orb-tip">Toque num Orbe para escolher. A barra mostra até onde o XP vai; nada é gasto até tocar em <b>Usar</b>.</p>';
  return `<div class="items">${cards}</div>${bar}`;
}

function bindOrbFeed(card: OwnedCard) {
  const box = app.querySelector<HTMLElement>('.orb-feed');
  if (!box) return;
  const refresh = () => {
    box.innerHTML = orbFeedHTML(card);
    const bar = app.querySelector<HTMLElement>('#xpbar');
    if (bar) bar.innerHTML = xpBarInner(card);
  };
  const room = () => (isMaxTier(card) || barFull(card) ? 0 : cardBarXp(card) - card.xp);
  const inc = (id: XpItemId) => {
    if ((orbPick[id] ?? 0) >= save.items[id] || pickXp() >= room()) return;
    orbPick[id] = (orbPick[id] ?? 0) + 1;
  };
  box.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const minus = t.closest<HTMLElement>('[data-orb-minus]');
    const plus = t.closest<HTMLElement>('[data-orb-plus]');
    if (minus) {
      const id = minus.dataset.orbMinus as XpItemId;
      orbPick[id] = Math.max(0, (orbPick[id] ?? 0) - 1);
      if (!orbPick[id]) delete orbPick[id];
      return refresh();
    }
    if (plus) {
      inc(plus.dataset.orbPlus as XpItemId);
      return refresh();
    }
    if (t.closest('#orbClear')) {
      orbPick = {};
      return refresh();
    }
    if (t.closest('#orbUse')) return useOrbs(card);
    const pick = t.closest<HTMLElement>('[data-item]');
    if (pick && !orbPick[pick.dataset.item as XpItemId]) {
      inc(pick.dataset.item as XpItemId);
      refresh();
    }
  });
}

function useOrbs(card: OwnedCard) {
  let used = 0, filled = false;
  for (const it of XP_ITEMS) {
    const id = it.id as XpItemId;
    const n = Math.min(orbPick[id] ?? 0, save.items[id]);
    for (let k = 0; k < n; k++) {
      save.items[id]--;
      used++;
      if (feedXp(card, it.xp).filled) filled = true;
    }
  }
  orbPick = {};
  if (!used) return train();
  track('orb', used); // v0.72.0: missão diária
  persist();
  train();
  if (filled) {
    const fx = document.createElement('div');
    fx.className = 'levelup';
    fx.textContent = 'BARRA CHEIA!';
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 1400);
  }
}

/** a cópia usada mais forte do personagem (a que abre no Treinar) */
function strongestRef(id: string): number {
  const list = copyList(save, id);
  let best = 0;
  list.forEach((c, i) => cardPower(c) > cardPower(list[best]) && (best = i));
  return best;
}

/** v0.71.0: escolher qual cópia treinar — as usadas (✔ = no baralho) e as guardadas (por cor). */
function copyTabsHTML(id: string, sel: number): string {
  // v0.71.0: no Treinar cada cópia aparece separada (cada uma tem a sua barra de XP); as do baralho ficam marcadas
  const inDeck = save.deck.includes(id) ? pickOf(save, id) : [];
  const used = copyList(save, id)
    .map((c, ref) => ({ c, ref, on: inDeck.includes(ref) }))
    .sort((a, b) => Number(b.on) - Number(a.on) || cardPower(b.c) - cardPower(a.c) || b.c.xp - a.c.xp)
    .map(({ c, ref, on }) => `<button class="copy-tab ${ref === sel ? 'sel' : ''} ${on ? 'on' : ''}" data-cref="${ref}" style="${starStyle(c.stars)}" title="${on ? 'No baralho' : 'Fora do baralho'}"><span class="tier-dot"></span>${on ? '<span class="copy-on">✔</span> ' : ''}<b>${tierLabel(c.stars, stepOf(c))}</b> <small>${isMaxTier(c) ? 'topo' : `${Math.round(xpProgress(c) * 100)}% XP`}</small></button>`);
  const box = Object.entries(save.dupes?.[id] ?? {})
    .filter(([, k]) => k > 0)
    .sort((a, b) => +b[0] - +a[0])
    .map(([r, k]) => `<button class="copy-tab box" data-cbox="${r}" style="${starStyle(+r)}" title="Cópia guardada (nunca treinada): toque para treinar"><span class="tier-dot"></span><b>${tierLabel(+r)}</b>${k > 1 ? ` <span class="copy-n">×${k}</span>` : ''} · guardada</button>`);
  return `<div class="copy-tabs"><span class="copy-tabs-lbl">Cópias de ${esc(getChar(id).name)}:</span>${[...used, ...box].join('')}</div>
    <p class="hint copy-hint">Cada cópia é uma carta própria: treine e desperte uma de cada vez (cada uma paga o preço inteiro). <span class="copy-on">✔</span> = no baralho de batalha.</p>`;
}

/**
 * Animação do Despertar. Nova cor: visual antigo → clarão → novo visual.
 * Degrau "+"/"++": o visual é o mesmo; mostra só o selo e o bônus de status.
 */
export function evolutionReveal(charId: string, from: { stars: number; plus: number }, to: { stars: number; plus: number }, before: { atk: number; hp: number }) {
  const def = getChar(charId);
  const st = statsFor(def, to.stars, to.plus);
  const newColour = to.stars !== from.stars;
  const gain = `Ataque <b>${before.atk} → ${st.atk}</b> · Vida <b>${before.hp} → ${st.hp}</b>`;
  const bg = document.createElement('div');
  bg.className = 'evo-bg';
  bg.innerHTML = `<div class="evo ${newColour ? '' : 'evo-plus'}">
    <div class="evo-title">${newColour ? 'DESPERTAR!' : `DESPERTAR ${'+'.repeat(to.plus)}`}</div>
    <div class="evo-stage" style="${starStyle(to.stars)}">
      ${newColour ? `<div class="evo-old" style="${starStyle(from.stars)}">${portraitHTML(def, { stars: from.stars })}</div><div class="evo-flash"></div>` : ''}
      <div class="evo-new ${newColour ? '' : 'static'}">${portraitHTML(def, { stars: to.stars })}</div>
      <div class="evo-rays"></div>
    </div>
    <div class="evo-name">${esc(def.name)}</div>
    <div class="evo-stars">${tierHTML(from.stars, from.plus)} <span>➜</span> ${tierHTML(to.stars, to.plus)}</div>
    <div class="evo-stats">${newColour ? `Ataque <b>${st.atk}</b> · Vida <b>${st.hp}</b> · nova raridade: habilidades e visual evoluem` : `${gain} · habilidades e visual iguais`}</div>
    <button class="btn primary">Continuar</button>
  </div>`;
  document.body.appendChild(bg);
  bg.querySelector('button')!.addEventListener('click', () => bg.remove());
  bg.addEventListener('keydown', (e) => e.key === 'Escape' && bg.remove());
}
