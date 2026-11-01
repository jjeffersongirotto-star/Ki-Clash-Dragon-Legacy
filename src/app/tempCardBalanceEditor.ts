/**
 * TEMP (v0.56.0) — editor TEMPORÁRIO de balanceamento das cartas (Baralho/Coleção: segurar a carta).
 *
 * Edita ATQ, Vida, raridade mínima/máxima, espera (rodadas na mão), tipo de ataque (físico/mágico),
 * alcance (1 = corpo a corpo, 4 = longe) e a lista de habilidades (adicionar/trocar/remover quantas quiser;
 * "nova" = texto livre, só anotação para eu implementar). Atacar de longe NÃO é habilidade: é o alcance.
 * As mudanças ficam no aparelho (localStorage) e valem no jogo enquanto o editor está ligado.
 * "Baixar alterações" gera um JSON só com as cartas mudadas, para mandar de volta e entrar no código.
 *
 * v0.58.0 — ABAS POR RARIDADE: uma aba para cada raridade da carta (mín..máx). Em cada aba: ATQ e Vida
 * daquela raridade (valem no jogo via TEMP_STATS), e para cada habilidade o NÍVEL (força naquela raridade)
 * e a DESCRIÇÃO (editável). Espera (rodadas) só se edita na aba da menor raridade; nas outras fica travada
 * mostrando o mesmo valor (uma espera por personagem). Mudar mín/máx refaz as abas sem perder o já digitado.
 *
 * COMO O ASSISTENTE APLICA O JSON EXPORTADO (fluxo combinado com o jogador):
 *   - ATQ/Vida/espera/raridades/habilidades da carta: aplica direto naquela carta.
 *   - Habilidade com descrição ou nível alterado: PERGUNTAR "mudar a habilidade para TODOS os personagens
 *     ou só para ESTE?". Se outra carta já editada (no JSON ou no código) tem essa habilidade com valor
 *     diferente, AVISAR com os nomes dessas cartas (lista em "_conflitos") e oferecer: "só cartas ainda não
 *     editadas" ou "todas". Sempre dar a opção de voltar/cancelar antes de gravar.
 *   - Habilidade "nova" (texto): criar a habilidade só nessa carta (perguntar se vira global).
 *
 * COMO DESLIGAR: TEMP_CARD_BALANCE_EDITOR = false (o jogo volta aos valores do código; o salvo é ignorado).
 * COMO REMOVER (tudo isolado):
 *   1. apagar este arquivo, src/core/tempOverrides.ts, as linhas TEMP em src/core/progression.ts e o bloco "TEMP v0.56.0 editor" no fim de src/ui/style.css;
 *   2. apagar as linhas marcadas "TEMP card balance editor" em src/core/battle.ts, src/app/collection.ts e src/main.ts;
 *   3. apagar tests/baralho/tempCardBalanceEditor.test.ts.
 */
import { ABILITIES } from "../core/abilities";
import { TIER_LABEL, TIER_ORDER, tierOf } from "./tempAbilityTiers";
import { CHAR_BY_ID } from "../core/characters";
import { TEMP_WAIT, TEMP_STATS } from "../core/tempOverrides";
import { statsFor } from "../core/progression";
import { abilityPower } from "../core/abilities";
import type { AbilityId, CharacterDef } from "../core/types";
import { waitFor } from "../core/battle";
import { esc } from "../ui/components";
import { showDialog, gameAlert } from "../ui/dialog";
import { onLongPress } from "../ui/battleModals";

export const TEMP_CARD_BALANCE_EDITOR = true; // v0.56.0: LIGADO para o balanceamento (pôr false para desligar)

export interface CardEdit {
  atk?: number;
  hp?: number;
  minStars?: number;
  maxStars?: number;
  wait?: number;
  damageType?: "fisico" | "magico";
  range?: number;
  abilities?: string[];
  /** v0.58.0: por raridade (chave = estrelas). lv/ds alinhados com `abilities`. */
  rar?: Record<string, RarEdit>;
}
export interface RarEdit {
  atk: number;
  hp: number;
  lv: number[];
  ds: string[];
}
export const BALANCE_KEY = "kiclash.tempCardBalance";
const ORIG: Record<string, CardEdit> = {};
const RARITY = ["", "Comum", "Incomum", "Raro", "Épico", "Lendário", "Mítico"];

export function loadEdits(): Record<string, CardEdit> {
  if (!TEMP_CARD_BALANCE_EDITOR) return {};
  try {
    return JSON.parse(localStorage.getItem(BALANCE_KEY) ?? "{}") as Record<
      string,
      CardEdit
    >;
  } catch {
    return {};
  }
}

const snap = (d: CharacterDef): CardEdit => ({
  atk: d.atk,
  hp: d.hp,
  minStars: d.minStars,
  maxStars: d.maxStars,
  damageType: d.damageType,
  range: d.range,
  abilities: [...d.abilities],
});

/** Aplica as mudanças salvas nas cartas do jogo (chamar ao abrir e depois de salvar). */
export function applyEdits(edits = loadEdits()) {
  if (!TEMP_CARD_BALANCE_EDITOR) return;
  for (const [id, e] of Object.entries(ORIG))
    Object.assign(CHAR_BY_ID[id], {
      ...e,
      abilities: [...(e.abilities ?? [])],
    });
  for (const k of Object.keys(TEMP_WAIT)) delete TEMP_WAIT[k];
  for (const k of Object.keys(TEMP_STATS)) delete TEMP_STATS[k];
  for (const [id, e] of Object.entries(edits)) {
    const d = CHAR_BY_ID[id];
    if (!d) continue;
    ORIG[id] ??= snap(d);
    const { wait, abilities, rar, ...rest } = e;
    if (rar)
      TEMP_STATS[id] = Object.fromEntries(
        Object.entries(rar).map(([k, r]) => [+k, { atk: r.atk, hp: r.hp }]),
      );
    Object.assign(d, rest);
    if (abilities)
      d.abilities = abilities.filter((a) => a in ABILITIES) as AbilityId[];
    if (wait != null) TEMP_WAIT[id] = wait;
  }
}

/** Descrição padrão de uma habilidade (registro ou texto da "nova"). */
export const defaultDesc = (a: string) =>
  a in ABILITIES ? ABILITIES[a as AbilityId].description : splitCustom(a).desc;
/** Nível padrão = força atual da habilidade naquela raridade (abilityPower), 0 se não escala / "nova". */
export const defaultLevel = (a: string, stars: number) =>
  a in ABILITIES
    ? Math.round(abilityPower(a as AbilityId, stars) * 100) / 100
    : 0;
/** Valores iniciais de uma aba: o que está no jogo agora (já com overrides salvos). */
export function defaultRar(
  d: CharacterDef,
  stars: number,
  abil: string[],
): RarEdit {
  const s = statsFor(d, stars, 0);
  return {
    atk: s.atk,
    hp: s.hp,
    lv: abil.map((a) => defaultLevel(a, stars)),
    ds: abil.map(defaultDesc),
  };
}

/** Só as cartas mudadas, com o valor original ao lado e dados por raridade (fácil de passar para o código). */
export function exportJSON(edits = loadEdits()): string {
  const out: Record<string, unknown> = {};
  const uses: Record<
    string,
    { card: string; desc: string; changed: boolean }[]
  > = {};
  for (const [id, e] of Object.entries(edits)) {
    const d = CHAR_BY_ID[id];
    if (!d) continue;
    const o = ORIG[id] ?? snap(d);
    const { rar, ...rest } = e;
    const abil = e.abilities ?? [...d.abilities];
    const raridades: Record<string, unknown> = {};
    for (const [k, r] of Object.entries(rar ?? {})) {
      const st = +k;
      raridades[k] = {
        raridade: RARITY[st],
        atk: r.atk,
        hp: r.hp,
        habilidades: abil.map((a, i) => {
          const known = a in ABILITIES;
          const desc = r.ds[i] ?? defaultDesc(a);
          const changed =
            desc.trim() !== defaultDesc(a).trim() ||
            (known && (r.lv[i] ?? 0) !== defaultLevel(a, st));
          const key = known
            ? a
            : `nova:${splitCustom(a).name || splitCustom(a).desc}`;
          (uses[key] ??= []).push({ card: d.name, desc: desc.trim(), changed });
          return {
            ...(known
              ? { id: a, nome: ABILITIES[a as AbilityId].name }
              : { nova: true, nome: splitCustom(a).name }),
            nivel: r.lv[i] ?? 0,
            nivelOriginal: defaultLevel(a, st),
            descricao: desc,
            ...(desc.trim() !== defaultDesc(a).trim()
              ? { descricaoOriginal: defaultDesc(a), descricaoAlterada: true }
              : {}),
          };
        }),
      };
    }
    out[id] = {
      nome: d.name,
      ...rest,
      ...(rar ? { raridades } : {}),
      original: { ...o, wait: Math.max(1, 2 * d.cost - 1) },
    };
  }
  if (!Object.keys(out).length) return "{}";
  const conflitos: Record<string, string[]> = {};
  for (const [k, list] of Object.entries(uses)) {
    const cards = [...new Set(list.map((u) => u.card))];
    if (
      cards.length > 1 &&
      list.some((u) => u.changed) &&
      new Set(list.map((u) => u.desc)).size > 1
    )
      conflitos[k] = cards; // mesma habilidade com textos diferentes entre cartas
  }
  out._comoAplicar =
    'Habilidade com descrição/nível alterado: perguntar se muda para TODOS os personagens ou só para esta carta; se houver conflito (outras cartas editadas com valor diferente), avisar os nomes e oferecer "só não editadas" ou "todas"; sempre com opção de voltar.';
  out._conflitos = conflitos;
  return JSON.stringify(out, null, 2);
}

function download() {
  const txt = exportJSON();
  if (txt === "{}")
    return void gameAlert(
      "Nada alterado",
      "Nenhuma carta foi alterada ainda.",
      "ℹ️",
    );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([txt], { type: "application/json" }));
  a.download = `ki-clash-balanceamento-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  void navigator.clipboard?.writeText(txt).catch(() => {});
  void gameAlert(
    "Exportado",
    "Ao aplicar, mudanças na descrição/nível de uma habilidade podem valer para todos os personagens ou só para esta carta — vou perguntar antes.",
    "ℹ️",
  );
}

export async function openCardEditor(id: string, refresh: () => void) {
  const d = CHAR_BY_ID[id];
  if (!d) return;
  const edits = loadEdits();
  const saved = edits[id];
  const abil = [...d.abilities] as string[];
  // estado por raridade (guarda também abas que saírem do intervalo, para não perder ao voltar)
  const rar: Record<number, RarEdit> = {};
  const ensure = (st: number) => {
    const sv = saved?.rar?.[st];
    rar[st] ??= sv
      ? {
          atk: sv.atk,
          hp: sv.hp,
          lv: abil.map((a, i) => sv.lv[i] ?? defaultLevel(a, st)),
          ds: abil.map((a, i) => sv.ds[i] ?? defaultDesc(a)),
        }
      : defaultRar(d, st, abil);
    return rar[st];
  };
  let lo = d.minStars;
  let hi = d.maxStars;
  let cur = lo;
  let wait = waitFor(id);
  const opts = (sel: number) =>
    RARITY.map((n, i) =>
      i
        ? `<option value="${i}"${i === sel ? " selected" : ""}>${n}</option>`
        : "",
    ).join("");
  const abilRow = (a: string, i: number, r: RarEdit) =>
    `<div class="tbe-ab" data-i="${i}"><select data-ab="${i}"><option value="">✏ nova (texto)</option>${TIER_ORDER.map(
      (t) =>
        `<optgroup label="${TIER_LABEL[t]}">${Object.values(ABILITIES)
          .filter((x) => tierOf(x.id) === t)
          .map(
            (x) =>
              `<option value="${x.id}"${x.id === a ? " selected" : ""}>[${TIER_LABEL[t]}] ${esc(x.name)}</option>`,
          )
          .join("")}</optgroup>`,
    ).join(
      "",
    )}</select>${a in ABILITIES ? "" : `<input data-abn="${i}" placeholder="nome (opcional)" value="${esc(splitCustom(a).name)}">`}<label class="tbe-lv">Nível<input type="number" step="any" data-lv="${i}" value="${r.lv[i] ?? 0}"></label><button type="button" class="btn small" data-rm="${i}">✕</button></div>` +
    `<div class="tbe-abd">${a in ABILITIES ? `<span class="tbe-tier tbe-tier-${tierOf(a)}">${TIER_LABEL[tierOf(a)]}</span>` : ""}<textarea data-ds="${i}" rows="2" placeholder="descrição${a in ABILITIES ? "" : " (obrigatória)"}">${esc(r.ds[i] ?? "")}</textarea></div>`;
  await showDialog({
    title: `Editar ${d.name}`,
    icon: "🛠",
    html: `<form class="tbe" onsubmit="return false">
      <label>Raridade inicial<select id="tbMin">${opts(lo)}</select></label>
      <label>Raridade final<select id="tbMax">${opts(hi)}</select></label>
      <label>Tipo de ataque<select id="tbDmg"><option value="fisico"${d.damageType === "fisico" ? " selected" : ""}>Físico</option><option value="magico"${d.damageType === "magico" ? " selected" : ""}>Mágico</option></select></label>
      <label>Alcance (casas)<input type="number" min="1" id="tbRange" value="${d.range}"></label>
      <div class="tbe-tabs" id="tbTabs"></div>
      <div class="tbe-pane" id="tbPane"></div>
      <p class="acc-warn">Atacar de longe é o <b>alcance</b>, não habilidade. Mudanças: ${Object.keys(edits).length} carta(s).</p>
      <div class="dialog-btns"><button type="button" class="btn ghost" data-t="dl">Baixar alterações</button><button type="button" class="btn ghost" data-t="reset">Restaurar</button><button type="button" class="btn primary" data-t="save">Salvar</button></div>
    </form>`,
    buttons: [],
    onMount: (root, close) => {
      const tabs = root.querySelector("#tbTabs") as HTMLElement;
      const pane = root.querySelector("#tbPane") as HTMLElement;
      const draw = () => {
        if (cur < lo || cur > hi) cur = lo;
        tabs.innerHTML = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)
          .map(
            (st) =>
              `<button type="button" class="btn small tbe-tab${st === cur ? " on" : ""}" data-tab="${st}">${RARITY[st]}</button>`,
          )
          .join("");
        const r = ensure(cur);
        const locked = cur !== lo;
        pane.innerHTML = `<div class="tbe-row"><label>Ataque<input type="number" id="tbAtk" value="${r.atk}"></label><label>Vida<input type="number" id="tbHp" value="${r.hp}"></label><label>Espera (rodadas)${locked ? " 🔒" : ""}<input type="number" min="0" id="tbWait" value="${wait}"${locked ? ' disabled title="Só na raridade inicial"' : ""}></label></div>
          <div class="tbe-abs"><b>Habilidades — ${RARITY[cur]}</b><div id="tbAbs">${abil.map((a, i) => abilRow(a, i, r)).join("")}</div><button type="button" class="btn small" id="tbAdd">+ Habilidade</button></div>`;
        tabs.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((b) =>
          b.addEventListener("click", () => {
            cur = +b.dataset.tab!;
            draw();
          }),
        );
        pane
          .querySelector("#tbAtk")!
          .addEventListener(
            "input",
            (ev) => (r.atk = Number((ev.target as HTMLInputElement).value)),
          );
        pane
          .querySelector("#tbHp")!
          .addEventListener(
            "input",
            (ev) => (r.hp = Number((ev.target as HTMLInputElement).value)),
          );
        if (!locked)
          pane
            .querySelector("#tbWait")!
            .addEventListener(
              "input",
              (ev) => (wait = Number((ev.target as HTMLInputElement).value)),
            );
        pane.querySelectorAll<HTMLSelectElement>("[data-ab]").forEach((s) =>
          s.addEventListener("change", () => {
            const i = +s.dataset.ab!;
            abil[i] = s.value;
            for (const [k, x] of Object.entries(rar)) {
              x.lv[i] = defaultLevel(s.value, +k);
              x.ds[i] = defaultDesc(s.value);
            }
            draw();
          }),
        );
        pane
          .querySelectorAll<HTMLInputElement>("[data-abn]")
          .forEach((t) =>
            t.addEventListener(
              "input",
              () =>
                (abil[+t.dataset.abn!] = joinCustom(
                  t.value,
                  splitCustom(abil[+t.dataset.abn!]).desc,
                )),
            ),
          );
        pane.querySelectorAll<HTMLTextAreaElement>("[data-ds]").forEach((t) =>
          t.addEventListener("input", () => {
            const i = +t.dataset.ds!;
            r.ds[i] = t.value;
            if (!(abil[i] in ABILITIES)) {
              abil[i] = joinCustom(splitCustom(abil[i]).name, t.value);
              for (const x of Object.values(rar))
                if (!x.ds[i]?.trim()) x.ds[i] = t.value; // "nova": texto vale para as outras abas vazias
            }
          }),
        );
        pane
          .querySelectorAll<HTMLInputElement>("[data-lv]")
          .forEach((t) =>
            t.addEventListener(
              "input",
              () => (r.lv[+t.dataset.lv!] = Number(t.value)),
            ),
          );
        pane.querySelectorAll<HTMLButtonElement>("[data-rm]").forEach((b) =>
          b.addEventListener("click", () => {
            const i = +b.dataset.rm!;
            abil.splice(i, 1);
            for (const x of Object.values(rar)) {
              x.lv.splice(i, 1);
              x.ds.splice(i, 1);
            }
            draw();
          }),
        );
        pane.querySelector("#tbAdd")!.addEventListener("click", () => {
          abil.push("");
          for (const x of Object.values(rar)) {
            x.lv.push(0);
            x.ds.push("");
          }
          draw();
        });
      };
      draw();
      const minSel = root.querySelector("#tbMin") as HTMLSelectElement;
      const maxSel = root.querySelector("#tbMax") as HTMLSelectElement;
      const onRange = () => {
        lo = +minSel.value;
        hi = Math.max(lo, +maxSel.value);
        maxSel.value = String(hi);
        draw();
      };
      minSel.addEventListener("change", onRange);
      maxSel.addEventListener("change", onRange);
      root
        .querySelector("[data-t=dl]")!
        .addEventListener("click", () => close("dl"));
      root
        .querySelector("[data-t=reset]")!
        .addEventListener("click", () => close("reset"));
      root.querySelector("[data-t=save]")!.addEventListener("click", () => {
        for (let st = lo; st <= hi; st++) ensure(st);
        if (
          abil.some(
            (a, i) =>
              !(a in ABILITIES) &&
              !(splitCustom(a).desc.trim() || rar[lo].ds[i]?.trim()),
          )
        ) {
          void gameAlert(
            "Falta descrição",
            "Habilidade nova precisa de descrição (o nome é opcional).",
          );
          return;
        }
        const keep = abil.map(
          (a, i) =>
            a in ABILITIES ||
            !!(splitCustom(a).desc.trim() || rar[lo].ds[i]?.trim()),
        );
        const outR: Record<string, RarEdit> = {};
        for (let st = lo; st <= hi; st++) {
          const x = rar[st];
          outR[st] = {
            atk: x.atk,
            hp: x.hp,
            lv: x.lv.filter((_, i) => keep[i]),
            ds: x.ds.filter((_, i) => keep[i]),
          };
        }
        const base = rar[lo];
        const e: CardEdit = {
          minStars: lo,
          maxStars: hi,
          wait,
          damageType: (root.querySelector("#tbDmg") as HTMLSelectElement)
            .value as "fisico" | "magico",
          range: Number(
            (root.querySelector("#tbRange") as HTMLInputElement).value,
          ),
          abilities: abil
            .map((a, i) =>
              a in ABILITIES
                ? a
                : joinCustom(
                    splitCustom(a).name.trim(),
                    (splitCustom(a).desc || base.ds[i]).trim(),
                  ),
            )
            .filter((_, i) => keep[i]),
          rar: outR,
        };
        edits[id] = e;
        localStorage.setItem(BALANCE_KEY, JSON.stringify(edits));
        applyEdits(edits);
        close("save");
      });
    },
  }).then((v) => {
    if (v === "dl") download();
    if (v === "reset") {
      delete edits[id];
      localStorage.setItem(BALANCE_KEY, JSON.stringify(edits));
      applyEdits(edits);
    }
    refresh();
  });
}

/** Habilidade nova (texto): "nome :: descrição"; nome vazio = a definir depois. */
export const splitCustom = (a: string) => {
  const k = a.indexOf(" :: ");
  return k < 0
    ? { name: "", desc: a }
    : { name: a.slice(0, k), desc: a.slice(k + 4) };
};
export const joinCustom = (name: string, desc: string) =>
  name || desc ? `${name} :: ${desc}` : "";

/** Liga o "segurar a carta" nas grades do Baralho/Coleção. */
export function bindCardEditor(root: HTMLElement, refresh: () => void) {
  if (!TEMP_CARD_BALANCE_EDITOR) return;
  root.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
    const id = el.dataset.card!;
    if (!CHAR_BY_ID[id]) return; // só personagens
    onLongPress(el, () => void openCardEditor(id, refresh), 550);
  });
  const bar = root.querySelector(".screen");
  if (bar && !root.querySelector("#tbExport")) {
    const b = document.createElement("button");
    b.id = "tbExport";
    b.className = "btn small tbe-export";
    b.textContent = "⬇ Balanceamento";
    b.addEventListener("click", download);
    bar.appendChild(b);
  }
}
