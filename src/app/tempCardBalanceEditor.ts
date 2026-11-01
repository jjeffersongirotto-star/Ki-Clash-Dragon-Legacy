/**
 * TEMP (v0.56.0) — editor TEMPORÁRIO de balanceamento das cartas (Baralho/Coleção: segurar a carta).
 *
 * Edita ATQ, Vida, raridade mínima/máxima, espera (rodadas na mão), tipo de ataque (físico/mágico),
 * alcance (1 = corpo a corpo, 4 = longe) e a lista de habilidades (adicionar/trocar/remover quantas quiser;
 * "nova" = texto livre, só anotação para eu implementar). Atacar de longe NÃO é habilidade: é o alcance.
 * As mudanças ficam no aparelho (localStorage) e valem no jogo enquanto o editor está ligado.
 * "Baixar alterações" gera um JSON só com as cartas mudadas, para mandar de volta e entrar no código.
 *
 * COMO DESLIGAR: TEMP_CARD_BALANCE_EDITOR = false (o jogo volta aos valores do código; o salvo é ignorado).
 * COMO REMOVER (tudo isolado):
 *   1. apagar este arquivo, src/core/tempOverrides.ts e o bloco "TEMP v0.56.0 editor" no fim de src/ui/style.css;
 *   2. apagar as linhas marcadas "TEMP card balance editor" em src/core/battle.ts, src/app/collection.ts e src/main.ts;
 *   3. apagar tests/baralho/tempCardBalanceEditor.test.ts.
 */
import { ABILITIES } from '../core/abilities';
import { CHAR_BY_ID } from '../core/characters';
import { TEMP_WAIT } from '../core/tempOverrides';
import type { AbilityId, CharacterDef } from '../core/types';
import { waitFor } from '../core/battle';
import { esc } from '../ui/components';
import { showDialog, gameAlert } from '../ui/dialog';
import { onLongPress } from '../ui/battleModals';

export const TEMP_CARD_BALANCE_EDITOR = true; // v0.56.0: LIGADO para o balanceamento (pôr false para desligar)

export interface CardEdit {
  atk?: number;
  hp?: number;
  minStars?: number;
  maxStars?: number;
  wait?: number;
  damageType?: 'fisico' | 'magico';
  range?: number;
  abilities?: string[];
}
export const BALANCE_KEY = 'kiclash.tempCardBalance';
const ORIG: Record<string, CardEdit> = {};
const RARITY = ['', 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico'];

export function loadEdits(): Record<string, CardEdit> {
  if (!TEMP_CARD_BALANCE_EDITOR) return {};
  try {
    return JSON.parse(localStorage.getItem(BALANCE_KEY) ?? '{}') as Record<string, CardEdit>;
  } catch {
    return {};
  }
}

const snap = (d: CharacterDef): CardEdit => ({ atk: d.atk, hp: d.hp, minStars: d.minStars, maxStars: d.maxStars, damageType: d.damageType, range: d.range, abilities: [...d.abilities] });

/** Aplica as mudanças salvas nas cartas do jogo (chamar ao abrir e depois de salvar). */
export function applyEdits(edits = loadEdits()) {
  if (!TEMP_CARD_BALANCE_EDITOR) return;
  for (const [id, e] of Object.entries(ORIG)) Object.assign(CHAR_BY_ID[id], { ...e, abilities: [...(e.abilities ?? [])] });
  for (const k of Object.keys(TEMP_WAIT)) delete TEMP_WAIT[k];
  for (const [id, e] of Object.entries(edits)) {
    const d = CHAR_BY_ID[id];
    if (!d) continue;
    ORIG[id] ??= snap(d);
    const { wait, abilities, ...rest } = e;
    Object.assign(d, rest);
    if (abilities) d.abilities = abilities.filter((a) => a in ABILITIES) as AbilityId[];
    if (wait != null) TEMP_WAIT[id] = wait;
  }
}

/** Só as cartas mudadas, com o valor original ao lado (fácil de ler e de passar para o código). */
export function exportJSON(edits = loadEdits()): string {
  const out: Record<string, unknown> = {};
  for (const [id, e] of Object.entries(edits)) {
    const d = CHAR_BY_ID[id];
    if (!d) continue;
    const o = ORIG[id] ?? snap(d);
    out[id] = { nome: d.name, ...e, original: { ...o, wait: Math.max(1, 2 * d.cost - 1) } };
  }
  return JSON.stringify(out, null, 2);
}

function download() {
  const txt = exportJSON();
  if (txt === '{}') return void gameAlert('Nada alterado', 'Nenhuma carta foi alterada ainda.', 'ℹ️');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
  a.download = `ki-clash-balanceamento-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  void navigator.clipboard?.writeText(txt).catch(() => {});
}

export async function openCardEditor(id: string, refresh: () => void) {
  const d = CHAR_BY_ID[id];
  if (!d) return;
  const edits = loadEdits();
  const abil = [...d.abilities] as string[];
  const opts = (sel: number) => RARITY.map((n, i) => (i ? `<option value="${i}"${i === sel ? ' selected' : ''}>${n}</option>` : '')).join('');
  const abilRow = (a: string, i: number) =>
    `<div class="tbe-ab" data-i="${i}"><select data-ab="${i}"><option value="">✏ nova (texto)</option>${Object.values(ABILITIES).map((x) => `<option value="${x.id}"${x.id === a ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>${a in ABILITIES ? '' : `<input data-abt="${i}" placeholder="descreva a habilidade" value="${esc(a)}">`}<button type="button" class="btn small" data-rm="${i}">✕</button></div>`;
  await showDialog({
    title: `Editar ${d.name}`,
    icon: '🛠',
    html: `<form class="tbe" onsubmit="return false">
      <label>Ataque<input type="number" id="tbAtk" value="${d.atk}"></label>
      <label>Vida<input type="number" id="tbHp" value="${d.hp}"></label>
      <label>Raridade inicial<select id="tbMin">${opts(d.minStars)}</select></label>
      <label>Raridade final<select id="tbMax">${opts(d.maxStars)}</select></label>
      <label>Espera (rodadas)<input type="number" min="0" id="tbWait" value="${waitFor(id)}"></label>
      <label>Tipo de ataque<select id="tbDmg"><option value="fisico"${d.damageType === 'fisico' ? ' selected' : ''}>Físico</option><option value="magico"${d.damageType === 'magico' ? ' selected' : ''}>Mágico</option></select></label>
      <label>Alcance (casas)<input type="number" min="1" id="tbRange" value="${d.range}"></label>
      <div class="tbe-abs"><b>Habilidades</b><div id="tbAbs"></div><button type="button" class="btn small" id="tbAdd">+ Habilidade</button></div>
      <p class="acc-warn">Atacar de longe é o <b>alcance</b>, não habilidade. Mudanças: ${Object.keys(edits).length} carta(s).</p>
      <div class="dialog-btns"><button type="button" class="btn ghost" data-t="dl">Baixar alterações</button><button type="button" class="btn ghost" data-t="reset">Restaurar</button><button type="button" class="btn primary" data-t="save">Salvar</button></div>
    </form>`,
    buttons: [],
    onMount: (root, close) => {
      const box = root.querySelector('#tbAbs') as HTMLElement;
      const draw = () => {
        box.innerHTML = abil.map(abilRow).join('');
        box.querySelectorAll<HTMLSelectElement>('[data-ab]').forEach((s) =>
          s.addEventListener('change', () => {
            abil[+s.dataset.ab!] = s.value;
            draw();
          }),
        );
        box.querySelectorAll<HTMLInputElement>('[data-abt]').forEach((t) => t.addEventListener('input', () => (abil[+t.dataset.abt!] = t.value)));
        box.querySelectorAll<HTMLButtonElement>('[data-rm]').forEach((b) =>
          b.addEventListener('click', () => {
            abil.splice(+b.dataset.rm!, 1);
            draw();
          }),
        );
      };
      draw();
      root.querySelector('#tbAdd')!.addEventListener('click', () => {
        abil.push('');
        draw();
      });
      const num = (s: string) => Number((root.querySelector(s) as HTMLInputElement).value);
      root.querySelector('[data-t=dl]')!.addEventListener('click', () => close('dl'));
      root.querySelector('[data-t=reset]')!.addEventListener('click', () => close('reset'));
      root.querySelector('[data-t=save]')!.addEventListener('click', () => {
        const e: CardEdit = {
          atk: num('#tbAtk'),
          hp: num('#tbHp'),
          minStars: num('#tbMin'),
          maxStars: Math.max(num('#tbMin'), num('#tbMax')),
          wait: num('#tbWait'),
          damageType: (root.querySelector('#tbDmg') as HTMLSelectElement).value as 'fisico' | 'magico',
          range: num('#tbRange'),
          abilities: abil.map((a) => a.trim()).filter(Boolean),
        };
        edits[id] = e;
        localStorage.setItem(BALANCE_KEY, JSON.stringify(edits));
        applyEdits(edits);
        close('save');
      });
    },
  }).then((v) => {
    if (v === 'dl') download();
    if (v === 'reset') {
      delete edits[id];
      localStorage.setItem(BALANCE_KEY, JSON.stringify(edits));
      applyEdits(edits);
    }
    refresh();
  });
}

/** Liga o "segurar a carta" nas grades do Baralho/Coleção. */
export function bindCardEditor(root: HTMLElement, refresh: () => void) {
  if (!TEMP_CARD_BALANCE_EDITOR) return;
  root.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => {
    const id = el.dataset.card!;
    if (!CHAR_BY_ID[id]) return; // só personagens
    onLongPress(el, () => void openCardEditor(id, refresh), 550);
  });
  const bar = root.querySelector('.screen');
  if (bar && !root.querySelector('#tbExport')) {
    const b = document.createElement('button');
    b.id = 'tbExport';
    b.className = 'btn small tbe-export';
    b.textContent = '⬇ Balanceamento';
    b.addEventListener('click', download);
    bar.appendChild(b);
  }
}
