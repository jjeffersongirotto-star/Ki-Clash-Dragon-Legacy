/** v0.28.3: desenho do tabuleiro a partir de um retrato da batalha — separado de battleView.ts. */
import { effectiveAtk } from '../core/battle';
import { getChar } from '../core/characters';
import type { BattleState, RecordedEvent, Side, Snapshot } from '../core/types';
import { INFO_DEFAULT, statusList } from './battleFx';
import { ico } from './icons';
import { unitSpriteHTML } from './art';
import { esc, starStyle } from './components';
import type { BattleView } from './battleView';
import { HOLD_MS } from './battleHand';
import { hpStatClass } from './statColor';

export function renderSnapshot(view: BattleView, snap: Snapshot, _ev?: RecordedEvent) {
  const layer = view.root.querySelector('.units') as HTMLElement;
  const seen = new Set<number>();
  for (const u of snap.units) {
    seen.add(u.uid);
    view.lastUnits.set(u.uid, u);
    let el = view.tokens.get(u.uid);
    if (!el) {
      const def = getChar(u.charId);
      el = document.createElement('div');
      el.className = `unit side-${u.side} cat-${def.category} ${u.isMinion ? 'minion' : ''} appear`;
      el.setAttribute('style', `${starStyle(u.stars)};--ac:${def.palette.aura}`);
      el.innerHTML = `
        <div class="u-portrait">${unitSpriteHTML(def, { flip: u.side === 'enemy', stars: u.stars, side: u.side })}</div>
        <div class="u-hp"><i></i></div>
        <div class="u-stat-plate"><span class="u-atk"></span><b class="u-sep">|</b><span class="u-hpn"></span></div>
        <div class="u-fx"></div>
      `;
      // v0.35.0: tocar na unidade não abre mais a descrição; ela abre ao SEGURAR (ou com o botão direito no PC)
      const cur = () => view.state.units.find((x) => x.uid === u.uid);
      const info = () => {
        const c = cur();
        if (!c) return;
        view.showUnitInfo(c);
        view.onInfo?.('unit', c.uid);
      };
      let hold: ReturnType<typeof setTimeout> | undefined;
      let held = false;
      el.addEventListener('pointerdown', (ev) => {
        held = false;
        clearTimeout(hold);
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        hold = setTimeout(() => {
          held = true;
          info();
        }, HOLD_MS);
      });
      for (const t of ['pointerup', 'pointercancel', 'pointerleave'] as const) el.addEventListener(t, () => clearTimeout(hold));
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        clearTimeout(hold);
        info();
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (held) {
          held = false;
          return;
        }
        const c = cur();
        if (view.selected != null) view.onCell(c?.row ?? u.row, c?.col ?? u.col);
      });
      layer.appendChild(el);
      view.tokens.set(u.uid, el);
      setTimeout(() => el!.classList.remove('appear'), 500);
    }
    el.style.setProperty('--r', String(u.row));
    el.style.setProperty('--c', String(u.col));
    (el.querySelector('.u-hp i') as HTMLElement).style.width = `${Math.max(0, (u.hp / u.maxHp) * 100)}%`;
    const fake = { ...view.state, units: snap.units } as BattleState;
    const atk = effectiveAtk(fake, u);
    const atkEl = el.querySelector('.u-atk') as HTMLElement;
    atkEl.textContent = String(atk);
    atkEl.classList.toggle('debuff', atk < u.atk);
    atkEl.classList.toggle('buff', atk > u.atk);
    const hpEl = el.querySelector('.u-hpn') as HTMLElement;
    hpEl.textContent = String(Math.max(0, u.hp));
    // v0.45.1: cor pela modificação ativa da vida máxima, nunca pelo dano sofrido
    const hpCls = hpStatClass(u);
    hpEl.classList.toggle('buff', hpCls === 'buff');
    hpEl.classList.toggle('debuff', hpCls === 'debuff');
    // v0.17.0: selos estáticos de efeito/aura (só troca o HTML quando muda)
    const st = statusList(fake, u);
    const key = st.map((x) => x.key).join(',');
    const fxEl = el.querySelector('.u-fx') as HTMLElement;
    if (fxEl.dataset.k !== key) {
      fxEl.dataset.k = key;
      fxEl.innerHTML = st.map((x) => `<i title="${esc(x.label)}">${ico(x.img, x.icon)}</i>`).join('');
    }
    el.classList.toggle('stunned', !!u.effects?.some((e) => e.kind === 'atordoado' && e.turns > 0));
  }
  if (view.infoUid != null && !seen.has(view.infoUid)) {
    view.infoUid = null;
    if (view.selected == null) view.setInfo(INFO_DEFAULT);
  }
  for (const [uid, el] of view.tokens) {
    if (!seen.has(uid)) {
      view.tokens.delete(uid);
      el.classList.add('dying');
      setTimeout(() => el.remove(), 650);
    }
  }
  for (const side of ['player', 'enemy'] as Side[]) {
    const h = snap.heroes[side];
    const pct = `${Math.max(0, (h.hp / h.maxHp) * 100)}%`;
    const box = view.root.querySelector(`#hero-${side}`)!;
    (box.querySelector('.bar i') as HTMLElement).style.width = pct;
    box.querySelector('.hero-hp span')!.textContent = `${h.hp}/${h.maxHp}`;
    const topBar = view.root.querySelector(side === 'player' ? '#topBarP' : '#topBarE') as HTMLElement | null;
    const topHp = view.root.querySelector(side === 'player' ? '#topHpP' : '#topHpE') as HTMLElement | null;
    if (topBar) topBar.style.width = pct;
    if (topHp) topHp.textContent = `${h.hp}/${h.maxHp}`;
  }
  const depEl = view.root.querySelector('#deployedCount');
  if (depEl) depEl.textContent = String(snap.units.filter((u) => u.side === 'player' && u.hp > 0).length);
  view.root.querySelector('#turnNo')!.textContent = String(snap.turn);
}
