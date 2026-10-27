/**
 * v0.32.0 — 🎒 Inventário: Itens e Personagens repetidos (Desmanchar).
 *
 * - Itens: Essências, Orbes (e o XP guardado do Desmanchar geral) e os itens de ascensão.
 * - Personagens repetidos: as cópias guardadas de cada personagem. O baralho usa até 3 cópias de cada;
 *   as que sobram podem ser desmanchadas:
 *   · 🎯 Direcionado: a cópia vira XP do PRÓPRIO personagem (Orbe da raridade da cópia, com a sorte ×2/×5/×10);
 *   · ♻ Geral: a cópia vira 25% desse XP, guardado como Orbes (serve para qualquer personagem).
 *   Nunca dá para desmanchar a última cópia nem as que o baralho está usando.
 */
import { getChar } from '../core/characters';
import { TIER_NAMES, XP_ITEMS, stepOf, type OrbBag } from '../core/progression';
import { GEAR_CATEGORIES, GEAR_RARITIES, GEAR_SETS, gearCount } from '../core/gear';
import { CATEGORY_INFO } from '../core/characters';
import { bankXp, feedCopy, generalXp, spareCopies, takeDupe, dupBaseXp, type CopyXp } from '../core/banner';
import { cardHTML, esc, gearHTML, orbBagHTML, orbHTML, starStyle } from '../ui/components';
import { leaveBattleMode } from '../ui/orientation';
import { copiesIn, ownedCopies } from '../ui/save';
import { app, save, persist, fmt } from './state';
import { topbar, bindNav, modal, closeModal } from './ui';

let tab: 'itens' | 'repetidos' = 'itens';
let mode: 'direcionado' | 'geral' = 'direcionado';

export const setInventoryTab = (t: typeof tab) => (tab = t);

/** Cópias que o baralho está usando agora (0 se o personagem não está no baralho). */
const deckUse = (id: string) => (save.deck.includes(id) ? copiesIn(save, id) : 0);

export function inventory() {
  leaveBattleMode();
  const dupes = (save.dupes ??= {});
  const body = tab === 'itens' ? itemsHTML() : dupesHTML(dupes);
  app.innerHTML = `<div class="screen inventory">${topbar('🎒 Inventário')}
    <div class="inv-tabs">
      <button class="btn ${tab === 'itens' ? 'primary on' : ''}" data-tab="itens">🎒 Itens</button>
      <button class="btn ${tab === 'repetidos' ? 'primary on' : ''}" data-tab="repetidos">🃏 Personagens repetidos</button>
    </div>
    ${body}
  </div>`;
  bindNav();
  const rerender = () => {
    const y = window.scrollY;
    persist();
    inventory();
    window.scrollTo(0, y);
  };
  app.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab as typeof tab; rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode as typeof mode; rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-dis]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.dis!;
      const stars = Number(b.dataset.r);
      const all = b.dataset.n === 'all';
      const res = mode === 'direcionado' ? dismantleDirected(id, stars, all) : dismantleGeneral(id, stars, all);
      persist();
      if (res) resultDialog(res, rerender);
    }),
  );
}

function itemsHTML(): string {
  const bag = save.gear ?? {};
  const orbs = XP_ITEMS.map((o) => `<div class="inv-item">${orbHTML(o.id)}<b>${fmt(save.items[o.id] ?? 0)}</b><small>${esc(o.name)} · +${fmt(o.xp)} XP</small></div>`).join('');
  const gear = GEAR_CATEGORIES.map((cat) => {
    const owned = GEAR_SETS[cat].flatMap((g) => GEAR_RARITIES.filter((r) => gearCount(bag, g.id, r) > 0).map((r) => gearHTML(g.id, r, gearCount(bag, g.id, r))));
    return `<div class="gear-cat">${CATEGORY_INFO[cat].icon} ${CATEGORY_INFO[cat].label}</div><div class="gear-bag">${owned.join('') || '<small>nenhum ainda</small>'}</div>`;
  }).join('');
  return `<div class="inv-section"><h3>✴ Essências: ${fmt(save.essencias)}</h3></div>
    <div class="inv-section"><h3>🔮 Orbes</h3><div class="inv-grid">${orbs}</div>
      <p class="hint">XP guardado do Desmanchar geral: <b>${fmt(save.genXp ?? 0)}</b> (vira Orbe ao completar 100).</p></div>
    <div class="inv-section"><h3>🎒 Itens de ascensão</h3>${gear}</div>`;
}

function dupesHTML(dupes: NonNullable<typeof save.dupes>): string {
  const ids = Object.keys(dupes).filter((id) => save.cards[id]).sort((a, b) => getChar(b).minStars - getChar(a).minStars || getChar(a).name.localeCompare(getChar(b).name));
  const explain =
    mode === 'direcionado'
      ? 'A cópia vira <b>XP do próprio personagem</b> (Orbe da raridade da cópia; às vezes ×2, ×5 ou ×10). XP que passar da barra cheia: 25% volta em Orbes.'
      : 'A cópia vira <b>25% do XP</b> que daria ao próprio personagem, guardado como <b>Orbes</b> (para usar em qualquer personagem).';
  const rows = ids
    .map((id) => {
      const def = getChar(id);
      const use = deckUse(id);
      const spare = spareCopies(dupes, id, use);
      const owned = save.cards[id];
      const rarities = Object.keys(dupes[id]).map(Number).sort((a, b) => b - a);
      // as cópias "presas" ao baralho saem primeiro das raridades mais baixas
      let locked = Math.max(0, use - 1);
      const lines = [...rarities].reverse().map((r) => {
        const n = dupes[id][r];
        const lockedHere = Math.min(n, locked);
        locked -= lockedHere;
        return { r, n, free: n - lockedHere };
      }).reverse();
      const xpOf = (r: number) => (mode === 'direcionado' ? dupBaseXp(r) : generalXp(r));
      return `<div class="dupe-row" style="${starStyle(owned.stars)}">
        <div class="dupe-card">${cardHTML({ charId: id, stars: owned.stars, plus: stepOf(owned) }, { compact: true })}</div>
        <div class="dupe-info">
          <b>${esc(def.name)}</b>
          <small>Você tem <b>${ownedCopies(save, id)}</b> cópias · no baralho: <b>${use}</b> · dá para desmanchar: <b>${spare}</b></small>
          ${lines
            .map(
              (l) => `<div class="dupe-line"><span class="tier-tag" style="${starStyle(l.r)}">${TIER_NAMES[l.r]}</span> ×${l.n}${l.free < l.n ? ` <small>(${l.n - l.free} no baralho)</small>` : ''}
              <span class="dupe-xp">${mode === 'direcionado' ? '📈' : '🔮'} ${fmt(xpOf(l.r))} XP cada</span>
              <button class="btn small ${l.free ? 'primary' : ''}" data-dis="${id}" data-r="${l.r}" data-n="1" ${l.free ? '' : 'disabled'}>${mode === 'direcionado' ? 'Usar 1' : 'Desmanchar 1'}</button>
              <button class="btn small" data-dis="${id}" data-r="${l.r}" data-n="all" ${l.free > 1 ? '' : 'disabled'}>Todas (${l.free})</button></div>`,
            )
            .join('')}
        </div>
      </div>`;
    })
    .join('');
  return `<div class="inv-tabs inv-modes">
      <button class="btn small ${mode === 'direcionado' ? 'primary on' : ''}" data-mode="direcionado">🎯 Desmanchar direcionado</button>
      <button class="btn small ${mode === 'geral' ? 'primary on' : ''}" data-mode="geral">♻ Desmanchar geral</button>
    </div>
    <p class="hint">${explain} O baralho usa até 3 cópias de cada personagem; a última cópia e as que estão no baralho não podem ser desmanchadas.</p>
    ${rows || '<p class="hint">Nenhuma cópia repetida guardada. Personagens repetidos do 🎴 Banner aparecem aqui.</p>'}`;
}

type DisResult = { kind: 'dir'; id: string; n: number; xp: CopyXp[] } | { kind: 'gen'; id: string; n: number; xp: number; orbs: OrbBag };

/** quantas cópias desta raridade estão livres (fora do baralho e sem ser a última) */
function freeAt(id: string, stars: number): number {
  const dupes = save.dupes ?? {};
  const rarities = Object.keys(dupes[id] ?? {}).map(Number).sort((a, b) => a - b);
  let locked = Math.max(0, deckUse(id) - 1);
  for (const r of rarities) {
    const n = dupes[id][r];
    const lockedHere = Math.min(n, locked);
    locked -= lockedHere;
    if (r === stars) return n - lockedHere;
  }
  return 0;
}

export function dismantleDirected(id: string, stars: number, all = false): DisResult | null {
  const owned = save.cards[id];
  const n = all ? freeAt(id, stars) : Math.min(1, freeAt(id, stars));
  if (!owned || n < 1) return null;
  const xp: CopyXp[] = [];
  for (let i = 0; i < n; i++) {
    if (!takeDupe((save.dupes ??= {}), id, stars)) break;
    xp.push(feedCopy(owned, stars, 0, Math.random, save.items));
  }
  return { kind: 'dir', id, n: xp.length, xp };
}

export function dismantleGeneral(id: string, stars: number, all = false): DisResult | null {
  const n = all ? freeAt(id, stars) : Math.min(1, freeAt(id, stars));
  if (n < 1) return null;
  let total = 0;
  let done = 0;
  for (let i = 0; i < n; i++) {
    if (!takeDupe((save.dupes ??= {}), id, stars)) break;
    total += generalXp(stars);
    done++;
  }
  const bank = { xp: save.genXp ?? 0 };
  const orbs = bankXp(bank, total, save.items);
  save.genXp = bank.xp;
  return { kind: 'gen', id, n: done, xp: total, orbs };
}

function resultDialog(r: DisResult, after: () => void) {
  const def = getChar(r.id);
  let html: string;
  if (r.kind === 'dir') {
    const xp = r.xp.reduce((a, x) => a + x.xp, 0);
    const lucky = r.xp.filter((x) => x.mult > 1).map((x) => `×${x.mult}`);
    const refund: OrbBag = {};
    for (const x of r.xp) for (const [k, v] of Object.entries(x.refund)) refund[k as keyof OrbBag] = (refund[k as keyof OrbBag] ?? 0) + (v ?? 0);
    const wasted = r.xp.reduce((a, x) => a + x.wasted, 0);
    html = `<h2 class="win">🎯 ${esc(def.name)}</h2><p>${r.n} ${r.n === 1 ? 'cópia virou' : 'cópias viraram'} <b>+${fmt(xp)} XP</b>${lucky.length ? ` <b class="dup-luck">${lucky.join(' ')}!</b>` : ''}.</p>${r.xp.some((x) => x.filled) ? '<p class="hint">Barra cheia: suba o degrau em 🔥 Treinar.</p>' : ''}${wasted > 0 ? `<p class="hint">${fmt(wasted)} XP passaram da barra cheia${Object.keys(refund).length ? `: ${orbBagHTML(refund, '+')}` : ''}.</p>` : ''}`;
  } else {
    html = `<h2 class="win">♻ Desmanchado</h2><p>${r.n} ${r.n === 1 ? 'cópia' : 'cópias'} de ${esc(def.name)} → <b>${fmt(r.xp)} XP</b> guardado.</p>${Object.keys(r.orbs).length ? `<div class="res big">${orbBagHTML(r.orbs, '+')}</div>` : ''}<p class="hint">XP guardado agora: <b>${fmt(save.genXp ?? 0)}</b> (cada 100 vira um Orbe).</p>`;
  }
  modal(`${html}<div class="row"><button class="btn primary" data-m="ok">OK</button></div>`, (m) =>
    m.querySelector('[data-m=ok]')!.addEventListener('click', () => {
      closeModal();
      after();
    }),
  );
}
