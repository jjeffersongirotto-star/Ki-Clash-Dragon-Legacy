/**
 * TEMP (v0.67.8) — editor TEMPORÁRIO dos feitiços (Heróis: segurar o feitiço), irmão do editor das cartas.
 *
 * Edita a espera (rodadas na mão), a raridade inicial (em que raridade sai no Banner) e a final, os tipos que conjuram,
 * os números do efeito (porcentagens e rodadas de SPELL_NUM) e a descrição.
 * Fica no aparelho (localStorage) e vale no jogo na hora. "⬇ Balanceamento" baixa junto com as cartas.
 *
 * COMO REMOVER: apagar este arquivo e as linhas "TEMP spell editor" em src/app/heroes.ts,
 * src/app/tempCardBalanceEditor.ts e src/main.ts; apagar tests/baralho/tempSpellEditor.test.ts.
 */
import { CATEGORY_INFO } from '../core/characters';
import { SPELL_BY_ID, SPELL_NUM, type SpellNumKey } from '../core/spells';
import { TEMP_WAIT } from '../core/tempOverrides';
import { waitFor } from '../core/battle';
import type { Category } from '../core/types';
import { esc } from '../ui/components';
import { showDialog, gameAlert } from '../ui/dialog';

export const SPELL_KEY = 'kiclash.tempSpellBalance';
const RARITY = ['', 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico'];
const CATS: Category[] = ['tanque', 'dps', 'assassino', 'arqueiro', 'mago', 'suporte'];

/** Números de cada feitiço (SPELL_NUM) com o rótulo que aparece no editor. */
export const SPELL_FIELDS: Record<string, [SpellNumKey, string][]> = {
  'f-investida': [['investida', 'Dano (% do ataque)']],
  'f-giratoria': [['giratoria', 'Dano na fileira (% do ataque)']],
  'f-muralha': [['muralhaHp', 'Escudo (% da vida máx. do conjurador)'], ['muralhaTurns', 'Rodadas do escudo']],
  'f-tremor': [['tremor', 'Dano (% do ataque)']],
  'f-chuva': [['chuva', 'Dano na fileira (% do ataque)']],
  'f-flecha-veneno': [['flechaHit', 'Dano (% do ataque)'], ['flechaDot', 'Veneno por rodada (% do ataque)'], ['flechaTurns', 'Rodadas de veneno']],
  'f-bola-fogo': [['bolaHit', 'Dano (% do ataque)'], ['bolaDot', 'Queimadura por rodada (% do ataque)'], ['bolaTurns', 'Rodadas de queimadura']],
  'f-raio': [['raio', 'Dano (% do ataque)']],
  'f-veneno': [['veneno', 'Veneno por rodada (% do ataque)'], ['venenoTurns', 'Rodadas de veneno']],
  'f-sombras': [['sombras', 'Dano (% do ataque, ignora resistência)']],
  'f-cura': [['cura', 'Cura (% da vida máx. de cada um)']],
  'f-anjo': [],
  'f-explosao-ki': [['kiAtk', 'Ataque ganho'], ['kiBurn', 'Queimadura por rodada'], ['kiTurns', 'Rodadas de queimadura']],
  'f-necropolis': [],
};

export interface SpellEdit {
  wait?: number;
  rarity?: number;
  /** raridade final (máxima); sem efeito na batalha por enquanto, só anotada */
  maxRarity?: number;
  categories?: Category[];
  description?: string;
  num?: Partial<Record<SpellNumKey, number>>;
}

/** Valores do código, guardados antes da 1ª mudança (para restaurar e para o "original" do arquivo). */
const ORIG_NUM: Record<SpellNumKey, number> = { ...SPELL_NUM };
const ORIG: Record<string, { rarity: number; maxRarity: number; categories: Category[]; description: string; wait: number }> = Object.fromEntries(
  Object.values(SPELL_BY_ID).map((s) => [s.id, { rarity: s.rarity, maxRarity: s.maxRarity ?? s.rarity, categories: [...s.categories], description: s.description, wait: Math.max(1, s.cost - 1) }]),
);

export function loadSpellEdits(): Record<string, SpellEdit> {
  try {
    return JSON.parse(localStorage.getItem(SPELL_KEY) ?? '{}') as Record<string, SpellEdit>;
  } catch {
    return {};
  }
}

/** Aplica as mudanças salvas nos feitiços do jogo (ao abrir e depois de salvar). */
export function applySpellEdits(edits = loadSpellEdits()) {
  Object.assign(SPELL_NUM, ORIG_NUM);
  for (const [id, o] of Object.entries(ORIG)) {
    Object.assign(SPELL_BY_ID[id], { rarity: o.rarity, maxRarity: o.maxRarity === o.rarity ? undefined : o.maxRarity, categories: [...o.categories], description: o.description });
    delete TEMP_WAIT[id];
  }
  for (const [id, e] of Object.entries(edits)) {
    const s = SPELL_BY_ID[id];
    if (!s) continue;
    if (e.rarity) s.rarity = e.rarity;
    if (e.maxRarity) s.maxRarity = e.maxRarity;
    if (s.maxRarity != null && s.maxRarity <= s.rarity) s.maxRarity = undefined;
    if (e.categories?.length) s.categories = [...e.categories];
    if (e.description?.trim()) s.description = e.description;
    if (e.wait != null) TEMP_WAIT[id] = e.wait;
    for (const [k, v] of Object.entries(e.num ?? {})) if (k in SPELL_NUM && Number.isFinite(v)) SPELL_NUM[k as SpellNumKey] = v as number;
  }
}

/** Só os feitiços mudados, com o original ao lado (vai no arquivo do "⬇ Balanceamento"). */
export function exportSpells(edits = loadSpellEdits()): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  for (const [id, e] of Object.entries(edits)) {
    const s = SPELL_BY_ID[id];
    if (!s) continue;
    const o = ORIG[id];
    out[id] = {
      nome: s.name,
      ...e,
      original: { ...o, num: Object.fromEntries((SPELL_FIELDS[id] ?? []).map(([k]) => [k, ORIG_NUM[k]])) },
    };
  }
  return Object.keys(out).length ? out : null;
}

/** Troca o número antigo pelo novo na descrição (a 1ª vez que ele aparece como número inteiro). */
export const swapNumber = (desc: string, from: number, to: number) => desc.replace(new RegExp(`(^|[^\\d.,])${from}(?![\\d])`), `$1${to}`);

export async function openSpellEditor(id: string, refresh: () => void) {
  const s = SPELL_BY_ID[id];
  if (!s) return;
  const edits = loadSpellEdits();
  const fields = SPELL_FIELDS[id] ?? [];
  const num: Partial<Record<SpellNumKey, number>> = Object.fromEntries(fields.map(([k]) => [k, SPELL_NUM[k]]));
  const cats = new Set<Category>(s.categories);
  const opts = (sel: number) => RARITY.map((n, i) => (i ? `<option value="${i}"${i === sel ? ' selected' : ''}>${n}</option>` : '')).join('');
  const v = await showDialog({
    title: `Editar ${s.name}`,
    icon: '🛠',
    html: `<form class="tbe tse" onsubmit="return false">
      <label>Espera (rodadas)<input type="number" min="1" id="tsWait" value="${waitFor(id)}"></label>
      <label>Raridade inicial<select id="tsRar">${opts(s.rarity)}</select></label>
      <label>Raridade final<select id="tsMax">${opts(s.maxRarity ?? s.rarity)}</select></label>
      <div class="tse-cats"><b>Quem conjura</b>${CATS.map((c) => `<label class="tse-cat"><input type="checkbox" data-cat="${c}"${cats.has(c) ? ' checked' : ''}> ${CATEGORY_INFO[c].label}</label>`).join('')}</div>
      ${fields.map(([k, label]) => `<label>${esc(label)}<input type="number" step="any" data-num="${k}" value="${SPELL_NUM[k]}"></label>`).join('')}
      <label class="tse-desc">Descrição<textarea id="tsDesc" rows="4">${esc(s.description)}</textarea></label>
      <div class="dialog-btns"><button type="button" class="btn ghost" data-t="reset">Restaurar</button><button type="button" class="btn primary" data-t="save">Salvar</button></div>
    </form>`,
    buttons: [],
    onMount: (root, close) => {
      const desc = root.querySelector<HTMLTextAreaElement>('#tsDesc')!;
      root.querySelectorAll<HTMLInputElement>('[data-num]').forEach((inp) =>
        inp.addEventListener('change', () => {
          const k = inp.dataset.num as SpellNumKey;
          const to = Number(inp.value);
          if (!Number.isFinite(to)) return;
          desc.value = swapNumber(desc.value, num[k]!, to); // a descrição acompanha o número
          num[k] = to;
        }),
      );
      root.querySelectorAll<HTMLInputElement>('[data-cat]').forEach((c) =>
        c.addEventListener('change', () => (c.checked ? cats.add(c.dataset.cat as Category) : cats.delete(c.dataset.cat as Category))),
      );
      const minSel = root.querySelector<HTMLSelectElement>('#tsRar')!;
      const maxSel = root.querySelector<HTMLSelectElement>('#tsMax')!;
      const onRange = (changed: HTMLSelectElement) => {
        // a final nunca fica abaixo da inicial (mexer numa empurra a outra)
        if (+maxSel.value < +minSel.value) (changed === minSel ? maxSel : minSel).value = changed.value;
      };
      minSel.addEventListener('change', () => onRange(minSel));
      maxSel.addEventListener('change', () => onRange(maxSel));
      root.querySelector('[data-t=reset]')!.addEventListener('click', () => close('reset'));
      root.querySelector('[data-t=save]')!.addEventListener('click', () => {
        if (!cats.size) return void gameAlert('Falta quem conjura', 'Marque pelo menos um tipo de personagem que conjura o feitiço.');
        if (!desc.value.trim()) return void gameAlert('Falta descrição', 'O feitiço precisa de uma descrição.');
        const o = ORIG[id];
        const e: SpellEdit = {};
        const wait = Math.max(1, Number(root.querySelector<HTMLInputElement>('#tsWait')!.value) || 1);
        if (wait !== o.wait) e.wait = wait;
        const rar = Number(root.querySelector<HTMLSelectElement>('#tsRar')!.value);
        if (rar !== o.rarity) e.rarity = rar;
        const max = Math.max(rar, Number(maxSel.value));
        if (max !== o.maxRarity) e.maxRarity = max;
        const cl = CATS.filter((c) => cats.has(c));
        if (cl.join() !== [...o.categories].sort((a, b) => CATS.indexOf(a) - CATS.indexOf(b)).join()) e.categories = cl;
        if (desc.value.trim() !== o.description.trim()) e.description = desc.value.trim();
        const changedNum = Object.fromEntries(Object.entries(num).filter(([k, x]) => x !== ORIG_NUM[k as SpellNumKey]));
        if (Object.keys(changedNum).length) e.num = changedNum;
        if (Object.keys(e).length) edits[id] = e;
        else delete edits[id];
        localStorage.setItem(SPELL_KEY, JSON.stringify(edits));
        applySpellEdits(edits);
        close('save');
      });
    },
  });
  if (v === 'reset') {
    delete edits[id];
    localStorage.setItem(SPELL_KEY, JSON.stringify(edits));
    applySpellEdits(edits);
  }
  refresh();
}
