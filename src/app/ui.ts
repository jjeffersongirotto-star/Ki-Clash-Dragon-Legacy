/**
 * Peças de tela comuns: barra do topo, navegação, janelas (modal) e cartas de grade.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { PLAYABLE } from '../core/characters';
import { XP_ITEMS } from '../core/progression';
import { orbHTML } from '../ui/components';
import { bakeGridArt } from '../ui/gridArt';
import { app, save, resPills } from './state';
import { home } from './home';
import { adventure } from './adventure';
import { collection } from './collection';
import { train } from './train';
import { shop } from './shop';
import { help } from './help';

export function topbar(title: string, back = true) {
  return `<header class="topbar">
    ${back ? '<button class="btn small ghost" data-nav="home">← Base</button>' : '<span></span>'}
    <h2>${title}</h2>
    <div class="res">${resPills()}<span title="Essências Estelares">✴ ${save.essencias}</span>${XP_ITEMS.filter((i) => save.items[i.id] > 0).map((i) => `<span class="orb-pill">${orbHTML(i.id, save.items[i.id])}</span>`).join('')}</div>
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
}
export function closeModal() {
  document.querySelector('.modal-bg')?.remove();
}

/** v0.10.2: bitmaps das cartas de grade (Coleção, Equipe, Treinar, troca) para a cor atual de cada personagem */
export function bakeAllGrid() {
  return bakeGridArt(PLAYABLE.map((def) => ({ def, stars: save.cards[def.id]?.stars ?? def.minStars, locked: !save.cards[def.id] })));
}
