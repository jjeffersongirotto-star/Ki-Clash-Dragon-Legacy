/** v0.28.3: janelas de detalhes de carta, unidade e feitiço — separado de battleView.ts. */
import { effectiveAtk, spellCasters, waitFor, waitOf } from '../core/battle';
import { getSpell, isSpell } from '../core/spells';
import { RACE_INFO, getChar } from '../core/characters';
import type { CardInstance, Side, Unit } from '../core/types';
import { stepOf } from '../core/progression';
import { statusList } from './battleFx';
import { abilityListHTML, cardHTML, categoryHTML, dmgLabel, esc, raceHTML, reachLabel, spellCardHTML, spellCastersLabel, spellInfoHTML, starStyle, tierHTML } from './components';
import type { BattleView } from './battleView';

export function showCardInfo(view: BattleView, i: number) {
  const c = view.state.decks.player.hand[i];
  if (!c) return;
  if (isSpell(c.charId)) {
    const sp = getSpell(c.charId);
    const caster = spellCasters(view.state, 'player', sp.id)[0];
    const w = waitOf(c);
    view.setInfo(
      `<div class="info-head"><span><b>${sp.icon} ${esc(sp.name)}</b> · feitiço · espera ${waitFor(sp.id)} rodada(s)${w ? ` (falta${w > 1 ? 'm' : ''} ${w})` : ' (pronto)'} · ${caster ? `conjurador: <b>${esc(getChar(caster.charId).name)}</b>` : `<span class="warn">precisa de um aliado ${esc(spellCastersLabel(sp))} em campo</span>`}</span><button class="btn small ghost info-inspect" data-inspect-hand="${i}">🔍 Detalhes</button></div>${spellInfoHTML(sp.id)}`,
    );
    view.root.querySelector('[data-inspect-hand]')?.addEventListener('click', () => view.openCardModal(c, 'player'));
    view.infoUid = null;
    return;
  }
  const def = getChar(c.charId);
  view.setInfo(
    `<div class="info-head"><span><b>${esc(def.name)}</b> ${tierHTML(c.stars, stepOf(c))} · ${raceHTML(def)} · espera ${waitFor(def.id)} rodada(s)${waitOf(c) ? ` (falta${waitOf(c) > 1 ? 'm' : ''} ${waitOf(c)})` : ' (pronta)'} · ${dmgLabel(def)} · alcance ${reachLabel(def)}</span><button class="btn small ghost info-inspect" data-inspect-hand="${i}">🔍 Detalhes</button></div>${abilityListHTML(def, c.stars, stepOf(c))}`,
  );
  view.root.querySelector('[data-inspect-hand]')?.addEventListener('click', () => view.openCardModal(c, 'player'));
  view.infoUid = null;
}

export function showUnitInfo(view: BattleView, u: Unit) {
  const def = getChar(u.charId);
  const fx = statusList(view.state, u);
  view.setInfo(
    `<div class="info-head"><span><b>${esc(def.name)}</b> ${u.side === 'enemy' ? '<span class="tag-e">inimigo</span>' : ''} ${tierHTML(u.stars, u.plus)} · ${raceHTML(def)} · ❤ ${u.hp}/${u.maxHp} · ATQ ${effectiveAtk(view.state, u)} (${dmgLabel(def)}) · alcance ${reachLabel(def)}</span><button class="btn small ghost info-inspect" data-inspect-unit="${u.uid}">🔍 Ver Carta</button></div>${fx.length ? `<div class="u-status-list">${fx.map((f) => `<span>${f.icon} ${esc(f.label)}</span>`).join('')}</div>` : ''}${abilityListHTML(def, u.stars, u.plus)}`,
  );
  view.root.querySelector('[data-inspect-unit]')?.addEventListener('click', () =>
    view.openCardModal({ charId: u.charId, stars: u.stars, plus: u.plus }, u.side),
  );
  view.infoUid = u.uid;
}

export function openCardModal(view: BattleView, card: CardInstance, side: Side) {
  document.querySelector('.battle-card-modal-bg')?.remove();
  if (isSpell(card.charId)) return view.openSpellModal(card.charId);
  const def = getChar(card.charId);
  const race = RACE_INFO[def.race];
  const bg = document.createElement('div');
  bg.className = 'battle-card-modal-bg';
  bg.innerHTML = `
    <div class="battle-card-modal" style="${starStyle(card.stars)}">
      <button class="bcm-close" aria-label="Fechar">✕</button>
      <div class="bcm-body">
      <div class="bcm-left">
        ${cardHTML(card)}
      </div>
      <div class="bcm-right">
        <div class="bcm-leader">Comandante: ${side === 'player' ? 'Você' : esc(view.stage.name)}</div>
        <h3 class="bcm-title">${esc(def.name)}</h3>
        <div class="bcm-sub">${esc(def.title)} · ${race.icon} ${race.label}</div>
        <div class="bcm-tags">${categoryHTML(def, true)} ${tierHTML(card.stars, stepOf(card))}</div>
        <div class="bcm-sec">Habilidades & Atributos</div>
        <div class="bcm-stats">Alcance: <b>${reachLabel(def)}</b> · Movimento: <b>${def.move} casas</b> · Dano: <b>${dmgLabel(def)}</b></div>
        ${abilityListHTML(def, card.stars, stepOf(card))}
        <p class="bcm-lore">${esc(def.lore)}</p>
      </div>
      </div>
    </div>
    <div class="bcm-hint">Toque no botão '✕' ou fora da janela para fechar os detalhes da carta.</div>
  `;
  document.body.appendChild(bg);
  // ao fechar, a carta não fica selecionada
  const close = () => {
    bg.remove();
    if (view.selected != null) view.clearSelection();
  };
  bg.querySelector('.bcm-close')!.addEventListener('click', close);
  bg.addEventListener('click', (e) => {
    if (e.target === bg) close();
  });
}

export function openSpellModal(view: BattleView, id: string) {
  const sp = getSpell(id);
  const bg = document.createElement('div');
  bg.className = 'battle-card-modal-bg';
  bg.innerHTML = `
    <div class="battle-card-modal" style="--rc:#7c5cff;--rg:#b9a8ff">
      <button class="bcm-close" aria-label="Fechar">✕</button>
      <div class="bcm-body">
      <div class="bcm-left">${spellCardHTML(id)}</div>
      <div class="bcm-right">
        <h3 class="bcm-title">${sp.icon} ${esc(sp.name)}</h3>
        <div class="bcm-sub">Feitiço · ${esc(spellCastersLabel(sp))}</div>
        <div class="bcm-sec">Efeito</div>
        ${spellInfoHTML(id)}
      </div>
      </div>
    </div>
    <div class="bcm-hint">Toque no botão '✕' ou fora da janela para fechar.</div>`;
  document.body.appendChild(bg);
  const close = () => {
    bg.remove();
    if (view.selected != null) view.clearSelection();
  };
  bg.querySelector('.bcm-close')!.addEventListener('click', close);
  bg.addEventListener('click', (e) => {
    if (e.target === bg) close();
  });
}
