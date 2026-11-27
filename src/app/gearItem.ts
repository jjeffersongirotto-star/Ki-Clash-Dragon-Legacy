/**
 * v0.69.0 — Janela de um item de ascensão: quantos tem de cada cor, o cadeado, a fusão (3 → 1 da cor acima,
 * pagando Essências) e onde conseguir (as fases que dão o item em cada cor).
 * Abre ao tocar num item no Inventário, na mochila do Treinar ou nos itens que faltam para o Despertar.
 */
import { STAR_COLORS } from '../core/characters';
import { DIFFICULTY_LABEL } from '../core/adventure';
import { FUSE_COST, FUSE_INPUT, GEAR_BY_ID, GEAR_RARITIES, fuseGear, gearCount, gearSources, isGearUnlocked } from '../core/gear';
import { CATEGORY_INFO } from '../core/characters';
import { essIcon, gearHTML } from '../ui/components';
import { ico } from '../ui/icons';
import { showDialog } from '../ui/dialog';
import { save, persist, fmt } from './state';

/** Lista curta de fases: "1, 11, 21" (até 6 números; depois "…"). */
const stageList = (ids: number[]) => (ids.length > 6 ? `${ids.slice(0, 6).join(', ')}, …` : ids.join(', '));

function bodyHTML(id: string, sel: number): string {
  const bag = save.gear ?? {};
  const seen = save.gearSeen;
  const tabs = GEAR_RARITIES.map((r) => {
    const open = isGearUnlocked(seen, id, r);
    return `<button class="gi-tab${r === sel ? ' on' : ''}" data-gr="${r}" title="${STAR_COLORS[r].label}">${gearHTML(id, r, gearCount(bag, id, r))}${open ? '' : '<span class="gi-lock">🔒</span>'}</button>`;
  }).join('');
  const open = isGearUnlocked(seen, id, sel);
  const label = STAR_COLORS[sel].label;
  let fuse = '';
  if (sel >= 2) {
    const have = gearCount(bag, id, sel - 1);
    const cost = FUSE_COST[sel];
    const ok = open && have >= FUSE_INPUT && save.essencias >= cost;
    const why = !open
      ? `🔒 Ganhe este item ${label.toLowerCase()} numa fase para liberar a fusão e a Loja.`
      : have < FUSE_INPUT
        ? `Você tem ${have}/${FUSE_INPUT} ${STAR_COLORS[sel - 1].label.toLowerCase()}.`
        : save.essencias < cost
          ? `Faltam Essências (você tem ${essIcon()} ${fmt(save.essencias)}).`
          : '';
    fuse = `<div class="gi-fuse"><span>${FUSE_INPUT} × ${gearHTML(id, sel - 1)} → 1 × ${gearHTML(id, sel)}</span>
      <button class="btn small ${ok ? 'primary' : ''}" data-fuse="${sel}" ${ok ? '' : 'disabled'}>Fundir ${essIcon()} ${cost}</button></div>
      ${why ? `<p class="hint gi-why">${why}</p>` : ''}`;
  } else if (!open) fuse = `<p class="hint gi-why">🔒 Ganhe este item ${label.toLowerCase()} numa fase para liberar a Loja.</p>`;
  const src = gearSources(id, sel);
  const where = src.length
    ? `<ul class="gi-where">${src.map((s) => `<li><b>${DIFFICULTY_LABEL[s.diff]}:</b> ${[s.stages.length ? `fases ${stageList(s.stages)}` : '', s.chance.length ? `com chance nas fases ${stageList(s.chance)}` : ''].filter(Boolean).join(' · ')}</li>`).join('')}</ul>`
    : '<p class="hint">Nenhuma fase dá esta cor.</p>';
  return `<div class="gi-tabs">${tabs}</div>
    <p class="gi-color"><b style="color:${STAR_COLORS[sel].color}">${label}</b> · você tem <b>${gearCount(bag, id, sel)}</b>${open ? '' : ' · 🔒 bloqueado'}</p>
    ${fuse}
    <p class="gi-sub">${ico('mapa', '🗺️')} Onde conseguir</p>${where}`;
}

/** Abre a janela do item (`rarity` = cor selecionada no começo). `after` roda ao fechar se algo mudou. */
export function gearItemDialog(id: string, rarity = 1, after?: () => void) {
  const g = GEAR_BY_ID[id];
  if (!g) return;
  let sel = Math.max(1, Math.min(5, rarity));
  let changed = false;
  void showDialog({
    title: `${g.name} · ${CATEGORY_INFO[g.category].label}`,
    html: `<div class="gi-body">${bodyHTML(id, sel)}</div>`,
    buttons: [],
    onMount: (root) => {
      const body = root.querySelector<HTMLElement>('.gi-body')!;
      const bind = () => {
        body.querySelectorAll<HTMLElement>('[data-gr]').forEach((b) => b.addEventListener('click', () => { sel = Number(b.dataset.gr); body.innerHTML = bodyHTML(id, sel); bind(); }));
        body.querySelector<HTMLButtonElement>('[data-fuse]')?.addEventListener('click', () => {
          if (!fuseGear((save.gear ??= {}), save, save.gearSeen, id, sel).ok) return;
          changed = true;
          persist();
          body.innerHTML = bodyHTML(id, sel);
          bind();
        });
      };
      bind();
    },
  }).then(() => {
    if (changed) after?.();
  });
}

/** Liga o toque nos itens marcados com `data-gi="id:cor"` dentro de `root`. */
export function bindGearTaps(root: ParentNode, after?: () => void) {
  root.querySelectorAll<HTMLElement>('[data-gi]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const [id, r] = el.dataset.gi!.split(':');
      gearItemDialog(id, Number(r), after);
    }),
  );
}

/** Um item que abre a janela ao tocar. */
export const gearTapHTML = (id: string, rarity: number, count?: number | string, missing = false) =>
  `<button class="gi-tap" data-gi="${id}:${rarity}" aria-label="Ver item">${gearHTML(id, rarity, count, missing)}</button>`;
