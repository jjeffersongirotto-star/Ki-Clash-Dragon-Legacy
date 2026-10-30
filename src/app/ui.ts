/**
 * Peças de tela comuns: barra do topo, navegação, janelas (modal) e cartas de grade.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { PLAYABLE } from '../core/characters';
import { XP_ITEMS } from '../core/progression';
import { orbHTML, essIcon } from '../ui/components';
import { ico } from '../ui/icons';
import { bakeGridArt } from '../ui/gridArt';
import { app, save, resPills } from './state';
import { home } from './home';
import { adventure } from './adventure';
import { collection } from './collection';
import { train } from './train';
import { shop } from './shop';
import { help } from './help';
import { inventory } from './inventory';

/** v0.51.0: `res` troca os recursos da direita (ex.: Loja só com Ouro) e centraliza o título. */
export function topbar(title: string, back = true, res?: string) {
  return `<header class="topbar${res != null ? ' tb-center' : ''}">
    ${back ? `<button class="btn small ghost" data-nav="home">${ico('voltar', '←')} Base</button>` : '<span></span>'}
    <h2>${title}</h2>
    ${res != null ? `<div class="res">${res}</div>` : `<div class="res">${resPills()}<span title="Essências Estelares">${essIcon()} ${save.essencias}</span>${XP_ITEMS.filter((i) => save.items[i.id] > 0).map((i) => `<span class="orb-pill">${orbHTML(i.id, save.items[i.id])}</span>`).join('')}</div>`}
  </header>`;
}

export function bindNav() {
  app.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => el.addEventListener('click', () => go(el.dataset.nav!)));
}

export function go(screen: string) {
  window.scrollTo(0, 0);
  if (screen === 'home') home();
  else if (screen === 'adventure') adventure();
  else if (screen === 'collection') collection();
  else if (screen === 'train') train();
  else if (screen === 'help') help();
  else if (screen === 'shop') shop();
  else if (screen === 'inventory') inventory();
}

export function resultModalWith(html: string, buttons: { label: string; primary?: boolean; run: () => void }[]) {
  modal(`${html}<div class="row">${buttons.map((b, i) => `<button class="btn ${b.primary ? 'primary' : ''}" data-b="${i}">${b.label}</button>`).join('')}</div>`, (m) => {
    m.querySelectorAll<HTMLButtonElement>('[data-b]').forEach((el) =>
      el.addEventListener('click', () => {
        closeModal();
        buttons[Number(el.dataset.b)].run();
      }),
    );
  });
}

// ---------------- MODAL ----------------
export function modal(html: string, bind: (m: HTMLElement) => void) {
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal-bg';
  m.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(m);
  bind(m);
  addCornerX(m);
}

/** v0.52.0: todo modal fecha pelo ✕ no canto de cima à direita. Um botão que só fecha
 *  (Fechar / OK / ✕ fora do lugar) some e o ✕ do canto faz o mesmo que ele fazia. */
export function addCornerX(m: HTMLElement) {
  const box = m.querySelector<HTMLElement>('.modal')!;
  if (box.querySelector(':scope > .modal-x')) return;
  const dismiss = [...box.querySelectorAll<HTMLButtonElement>('[data-m=close], [data-m=ok]')].find((b) => /^(Fechar|OK|Ok|Entendi|✕)?$/.test(b.textContent!.trim()) || b.classList.contains('pull-x'));
  if (!dismiss && box.querySelector('[data-b]')) return; // resultado de batalha: os botões são as próprias ações
  const x = document.createElement('button');
  x.className = 'modal-x';
  x.setAttribute('aria-label', 'Fechar');
  x.title = 'Fechar';
  x.innerHTML = ico('fechar', '✕');
  x.addEventListener('click', () => (dismiss ? dismiss.click() : closeModal()));
  box.prepend(x);
  if (dismiss) {
    dismiss.hidden = true;
    const row = dismiss.closest('.row') as HTMLElement | null;
    if (row && ![...row.children].some((c) => !(c as HTMLElement).hidden)) row.hidden = true;
  }
}
export function closeModal() {
  document.querySelector('.modal-bg')?.remove();
}

/** v0.10.2: bitmaps das cartas de grade (Coleção, Equipe, Treinar, troca) para a cor atual de cada personagem */
export function bakeAllGrid() {
  return bakeGridArt(PLAYABLE.map((def) => ({ def, stars: save.cards[def.id]?.stars ?? def.minStars, locked: !save.cards[def.id] })));
}
