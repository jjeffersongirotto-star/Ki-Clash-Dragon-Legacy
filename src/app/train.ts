/**
 * Treinar: barra de XP, degraus, itens de ascensão e Despertar.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { CATEGORY_INFO, STAR_COLORS, getChar } from '../core/characters';
import { MAX_STEP, TIER_NAMES, XP_ITEMS, ascendCost, ascendCostFor, barFull, canAscend, cardBarXp, feedXp, isMaxTier, nextTier, statsFor, stepOf, stepXp, tierLabel, xpProgress, type XpItemId } from '../core/progression';
import { portraitHTML, unitSpriteHTML } from '../ui/art';
import { abilityListHTML, catIcon, gearHTML, orbHTML, cardHTML, categoryHTML, esc, raceHTML, starStyle, tierHTML, essIcon } from '../ui/components';
import { ico } from '../ui/icons';
import { leaveBattleMode } from '../ui/orientation';
import { GEAR_CATEGORIES, GEAR_DROP, GEAR_PER_STEP, GEAR_RARE_CHANCE, GEAR_RARITIES, GEAR_SETS, reqRarity, ascendWithGear, charGear, gearCount, gearNeeded, hasGearFor } from '../core/gear';
import { DIFFICULTIES, DIFFICULTY_LABEL } from '../core/adventure';
import { app, save, trainSel, setTrainSel, persist } from './state';
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
    const owned = GEAR_SETS[cat].flatMap((g) => GEAR_RARITIES.filter((r) => gearCount(bag, g.id, r) > 0).map((r) => gearHTML(g.id, r, gearCount(bag, g.id, r))));
    return `<div class="gear-cat">${catIcon(cat)} ${CATEGORY_INFO[cat].label}: <small>${GEAR_SETS[cat].map((g) => g.name).join(', ')}</small></div><div class="gear-bag">${owned.join('') || '<small>nenhum ainda</small>'}</div>`;
  }).join('');
  modal(`<h2>🎒 Itens de ascensão</h2><p class="hint">Cada fase dá 3 itens. A cor do fundo é a raridade (cinza, verde, azul, roxo, laranja). Cada degrau pede 3 / 4 / 5 itens ("+" / "++" / nova raridade): 1 / 2 / 3 deles da raridade <b>um acima</b> da carta e 2 da raridade dela (cartas Lendárias e Míticas: só laranja). ${DIFFICULTIES.map((d) => `${DIFFICULTY_LABEL[d]}: ${STAR_COLORS[GEAR_DROP[d][0]].label} ${100 - GEAR_RARE_CHANCE[d] * 100}% / ${STAR_COLORS[GEAR_DROP[d][1]].label} ${GEAR_RARE_CHANCE[d] * 100}%`).join(' · ')}.</p>${rows}<div class="row"><button class="btn primary" data-m="close">Fechar</button></div>`, (m) => {
    m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
  });
}

export function train() {
  leaveBattleMode();
  void bakeAllGrid();
  if (!save.cards[trainSel]) setTrainSel(Object.keys(save.cards)[0]);
  const card = save.cards[trainSel];
  const def = getChar(card.charId);
  const plus = stepOf(card);
  const st = statsFor(def, card.stars, plus);
  const top = isMaxTier(card);
  const full = barFull(card);
  const pct = Math.round(xpProgress(card) * 100);
  const nt = nextTier(card);
  const ntLabel = nt ? tierLabel(nt.stars, nt.plus) : '';
  const nextSt = nt ? statsFor(def, nt.stars, nt.plus) : st;
  const need = gearNeeded(card);
  const gearOk = hasGearFor(save.gear, card);
  const needHTML = need.length
    ? `<div class="gear-need"><span>Itens (${need.length}):</span>${need.map((n) => gearHTML(n.id, n.rarity, `${Math.min(1, gearCount(save.gear, n.id, n.rarity))}/1`, gearCount(save.gear, n.id, n.rarity) < 1)).join('')}</div>`
    : '';
  const ascendBtn = nt
    ? `${needHTML}<button class="btn primary" id="ascend" ${canAscend(card) && gearOk && save.essencias >= ascendCost(card) ? '' : 'disabled'}>✨ Subir para ${ntLabel} (${essIcon()} ${ascendCost(card)})</button>
       <p class="hint">${full ? '' : 'Encha a barra de XP para subir o degrau. '}${gearOk ? '' : '<span class="warn">Faltam itens de ascensão (as fases dão itens; veja quais em 🎒 Itens).</span> '}${nt.stars === card.stars ? `${ntLabel} dá +17% de ataque e de vida (habilidades e visual iguais).` : `${ntLabel} é uma <b>nova raridade</b>: evolui roupa, armadura, aura, habilidades e status.`}${save.essencias < ascendCost(card) ? ` <span class="warn">Você tem ${essIcon()} ${save.essencias}.</span>` : ''}</p>`
    : '<p class="hint">Raridade máxima com "++": este personagem chegou ao topo!</p>';
  app.innerHTML = `<div class="screen">${topbar('Treinar')}
    <div class="row"><button class="btn small" id="gearBag">🎒 Itens de ascensão</button></div>
    <div class="train-list">${Object.values(save.cards)
      .map((c) => cardHTML(c, { compact: true, grid: true, extraClass: `train-pick ${c.charId === trainSel ? 'sel' : ''}`, attrs: `data-sel="${c.charId}"` }))
      .join('')}</div>
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
        <div class="xpbar"><i style="width:${pct}%"></i><span>${top ? 'TOPO: RARIDADE MÁXIMA "++"' : full ? 'BARRA CHEIA: PODE SUBIR O DEGRAU' : `${card.xp} / ${cardBarXp(card)} XP (${pct}%)`}</span></div>
        <div class="stat-row"><span>Ataque <b>${st.atk}</b>${nextSt.atk > st.atk ? ` <em>→ ${nextSt.atk}</em>` : ''}</span><span>Vida <b>${st.hp}</b>${nextSt.hp > st.hp ? ` <em>→ ${nextSt.hp}</em>` : ''}</span></div>
        ${abilityListHTML(def, card.stars, plus)}
        <div class="items">${XP_ITEMS.map((it) => `<button class="item-btn" data-item="${it.id}" ${save.items[it.id] > 0 && !top && !full ? '' : 'disabled'}><span class="ic">${orbHTML(it.id)}</span><b>${it.name}</b><small>+${it.xp} XP · você tem ${save.items[it.id]}</small></button>`).join('')}</div>
        ${ascendBtn}
        ${top || full ? '' : `<p class="hint">Alimente Orbes 🔮 até encher a barra (o XP que passar do cheio se perde). Com a barra cheia, suba o degrau com Essências ${essIcon()}.</p>`}
        ${ladderHTML(card)}
      </div>
    </div></div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-sel]').forEach((el) =>
    el.addEventListener('click', () => {
      setTrainSel(el.dataset.sel!);
      train();
    }),
  );
  app.querySelectorAll<HTMLElement>('[data-item]').forEach((el) =>
    el.addEventListener('click', () => {
      const it = XP_ITEMS.find((x) => x.id === el.dataset.item)!;
      if (save.items[it.id as XpItemId] <= 0) return;
      save.items[it.id as XpItemId]--;
      const r = feedXp(card, it.xp);
      persist();
      train();
      if (r.filled) {
        const fx = document.createElement('div');
        fx.className = 'levelup';
        fx.textContent = 'BARRA CHEIA!';
        document.body.appendChild(fx);
        setTimeout(() => fx.remove(), 1400);
      }
    }),
  );
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
