/** v0.28.3: mão do jogador (cartas, montes, arrastar) — separado de battleView.ts. */
import { spellTargets, waitOf } from '../core/battle';
import { isSpell } from '../core/spells';
import { pileCount } from '../core/deck';
import { dropAction, ghostTransform, shouldStartDrag } from './drag';
import { cardHTML, spellCardHTML } from './components';
import type { BattleView } from './battleView';

export function renderHand(view: BattleView) {
  const s = view.state;
  const hand = view.root.querySelector('#hand')!;
  hand.innerHTML = s.decks.player.hand
    .map((c, i) => {
      const afford = waitOf(c) === 0 && s.active === 'player' && !s.winner;
      const cls = `hand-card ${afford ? '' : 'cant'} ${view.selected === i ? 'sel' : ''}`;
      // v0.17.0: feitiço pronto mas sem conjurador/alvo fica apagado (mostra o motivo ao tocar)
      if (isSpell(c.charId)) return spellCardHTML(c.charId, { wait: waitOf(c), extraClass: `${cls} ${afford && !spellTargets(s, 'player', c.charId).length ? 'no-caster' : ''}`, attrs: `data-i="${i}"` });
      return cardHTML(c, { wait: waitOf(c), extraClass: cls, attrs: `data-i="${i}"` });
    })
    .join('') || '<div class="empty-hand">Sem cartas na mão</div>';
  hand.querySelectorAll<HTMLElement>('.hand-card').forEach((el) => {
    const i = +el.dataset.i!;
    // segurar a carta (~0,5 s) abre os detalhes; tocar seleciona; tocar de novo tira a seleção;
    // v0.14.4: ARRASTAR a carta até uma casa da sua zona também invoca (toque e mouse)
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => clearTimeout(timer);
    let drag: { id: number; x0: number; y0: number; gx: number; gy: number; ghost?: HTMLElement; over?: HTMLElement | null } | null = null;
    el.addEventListener('pointerdown', (ev) => {
      cancel();
      view.suppressClick = false;
      timer = setTimeout(() => {
        const c = s.decks.player.hand[i];
        if (!c || drag?.ghost) return;
        drag = null;
        view.suppressClick = true;
        view.openCardModal(c, 'player');
      }, 500);
      drag = null;
      if (view.busy || s.winner || s.active !== 'player' || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      const r = el.getBoundingClientRect();
      drag = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, gx: ev.clientX - r.left, gy: ev.clientY - r.top };
    });
    el.addEventListener('pointermove', (ev) => {
      if (!drag || ev.pointerId !== drag.id) return;
      if (!drag.ghost) {
        if (!shouldStartDrag(ev.clientX - drag.x0, ev.clientY - drag.y0)) return;
        cancel();
        try {
          el.setPointerCapture(ev.pointerId);
        } catch {
          /* sem captura: segue pelos eventos do próprio elemento */
        }
        drag.ghost = view.makeDragGhost(el);
        el.classList.add('dragging');
        view.highlightDeploy(i);
      }
      ev.preventDefault();
      drag.ghost.style.transform = ghostTransform(ev.clientX, ev.clientY, drag.gx, drag.gy);
      const cell = view.cellAt(ev.clientX, ev.clientY);
      if (cell !== drag.over) {
        drag.over?.classList.remove('drop-over');
        if (cell?.classList.contains('can')) cell.classList.add('drop-over');
        drag.over = cell;
      }
    });
    const end = (ev: PointerEvent, dropped: boolean) => {
      cancel();
      if (!drag || ev.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.ghost) return;
      view.suppressClick = true;
      d.over?.classList.remove('drop-over');
      const cell = dropped ? view.cellAt(ev.clientX, ev.clientY) : null;
      if (dropAction(cell ? { valid: cell.classList.contains('can') } : null) === 'deploy' && cell) {
        d.ghost.parentElement!.remove();
        el.classList.remove('dragging');
        void view.dropCard(i, +cell.dataset.r!, +cell.dataset.c!);
      } else {
        view.returnDragGhost(d.ghost, el);
        view.highlight();
      }
    };
    el.addEventListener('pointerup', (ev) => end(ev, true));
    el.addEventListener('pointercancel', (ev) => end(ev, false));
    el.addEventListener('pointerleave', () => {
      if (!drag?.ghost) cancel();
    });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('click', () => {
      if (view.suppressClick) {
        view.suppressClick = false;
        return;
      }
      if (view.selected === i) {
        view.clearSelection();
        return;
      }
      view.selected = i;
      view.showCardInfo(i);
      view.renderHand();
      view.highlight();
    });
  });
  const e = view.root.querySelector('#energy')!;
  // v0.16.0: no lugar da energia, quantas cartas da mão estão prontas (contagem 0)
  const inHand = s.decks.player.hand;
  const ready = inHand.filter((h) => waitOf(h) === 0).length;
  e.innerHTML = `<div class="energy-orb" title="Cartas prontas para invocar">⏳<b>${ready}</b></div><div class="energy-pips">${inHand.map((h) => `<i class="${waitOf(h) === 0 ? 'on' : ''}"></i>`).join('')}</div>`;
  view.setPile('#pileDraw', pileCount(s.decks.player));
  view.setPile('#pileDead', s.decks.player.defeated.length);
  const depCount = s.units.filter((u) => u.side === 'player' && u.hp > 0).length;
  const depEl = view.root.querySelector('#deployedCount');
  if (depEl) depEl.textContent = String(depCount);
  (view.root.querySelector('#fightBtn') as HTMLButtonElement).disabled = view.busy || !!s.winner;
}

export function setPile(view: BattleView, sel: string, n: number) {
  const el = view.root.querySelector<HTMLElement>(sel);
  if (!el) return;
  const b = el.querySelector('.pile-count')!;
  if (b.textContent !== String(n)) {
    b.textContent = String(n);
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
  if (sel === '#pileDead') el.classList.toggle('empty', n === 0);
}

export function makeDragGhost(view: BattleView, el: HTMLElement): HTMLElement {
  const r = el.getBoundingClientRect();
  const wrap = document.createElement('div');
  wrap.className = 'hand drag-ghost-wrap';
  const g = el.cloneNode(true) as HTMLElement;
  g.classList.remove('sel', 'dragging');
  g.classList.add('drag-ghost');
  g.style.width = `${r.width}px`;
  g.style.flex = 'none';
  g.style.transform = `translate3d(${Math.round(r.left)}px, ${Math.round(r.top)}px, 0)`;
  wrap.appendChild(g);
  view.root.appendChild(wrap);
  return g;
}

export function returnDragGhost(_view: BattleView, g: HTMLElement, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  g.style.transition = 'transform .16s ease-out';
  g.style.transform = `translate3d(${Math.round(r.left)}px, ${Math.round(r.top)}px, 0)`;
  setTimeout(() => {
    g.parentElement?.remove();
    el.classList.remove('dragging');
  }, 170);
}
