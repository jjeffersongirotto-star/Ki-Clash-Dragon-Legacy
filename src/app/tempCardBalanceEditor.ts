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
 * v0.58.1 — ESCOPO DA HABILIDADE NA EDIÇÃO (não no export): ao Salvar, cada habilidade com descrição/nível
 * alterado pergunta "Todos os personagens" / "Apenas este personagem" / "Voltar". Em "Todos", se outras
 * cartas já editadas têm essa habilidade com outro valor, avisa os nomes e oferece "Só nas cartas ainda não
 * editadas" / "Para todos" / "Voltar". A escolha é aplicada na hora nas outras cartas (propagateAbility) e
 * fica salva em `escopo`/`conflitos`/`via` — o export só carrega o que já foi decidido.
 *
 * (Histórico v0.58.0) COMO O ASSISTENTE APLICA O JSON EXPORTADO:
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
  /** v0.58.1: escolhido AO SALVAR, por habilidade alterada: todos | só esta carta | só cartas não editadas. */
  escopo?: Record<string, AbilityScope>;
  /** v0.58.1: cartas (nomes) que já tinham essa habilidade editada com outro valor, avisadas ao salvar. */
  conflitos?: Record<string, string[]>;
  /** v0.58.1: carta criada/alterada por propagação de habilidade de outra carta (id da origem). */
  via?: Record<string, string>;
}
export type AbilityScope = "all" | "this" | "uneditedOnly";
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
            ...(known && e.escopo?.[a] ? { escopo: e.escopo[a] } : {}),
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
    'O escopo de cada habilidade alterada já foi escolhido no editor ao salvar (campo "escopo": all = todos os personagens, this = só esta carta, uneditedOnly = só cartas ainda não editadas). Aplicar como está.';
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
    "O escopo de cada habilidade alterada (todos / só esta carta) já foi escolhido ao salvar e vai junto no arquivo.",
    "ℹ️",
  );
}

/** v0.58.1: habilidades do registro que a carta alterou (descrição ou nível diferente do padrão em alguma raridade). */
export function changedAbilities(e: CardEdit): string[] {
  const abil = e.abilities ?? [];
  return abil.filter(
    (a, i) =>
      a in ABILITIES &&
      Object.entries(e.rar ?? {}).some(
        ([k, r]) =>
          (r.ds[i] ?? defaultDesc(a)).trim() !== defaultDesc(a).trim() ||
          (r.lv[i] ?? defaultLevel(a, +k)) !== defaultLevel(a, +k),
      ),
  );
}
const abilAt = (e: CardEdit, a: string, st: number) => {
  const i = (e.abilities ?? []).indexOf(a);
  const r = e.rar?.[st];
  return i < 0 || !r
    ? undefined
    : {
        ds: (r.ds[i] ?? defaultDesc(a)).trim(),
        lv: r.lv[i] ?? defaultLevel(a, st),
      };
};
/** v0.58.1: ids das outras cartas já editadas com essa habilidade alterada e valor DIFERENTE do da carta salva. */
export function abilityConflicts(
  edits: Record<string, CardEdit>,
  cardId: string,
  a: string,
  e: CardEdit,
): string[] {
  return Object.entries(edits)
    .filter(
      ([oid, oe]) =>
        oid !== cardId &&
        changedAbilities(oe).includes(a) &&
        Object.keys(oe.rar ?? {}).some((k) => {
          const mine =
            abilAt(e, a, +k) ?? abilAt(e, a, +Object.keys(e.rar ?? {})[0]);
          const theirs = abilAt(oe, a, +k);
          return (
            !!theirs &&
            (!mine || mine.ds !== theirs.ds || mine.lv !== theirs.lv)
          );
        }),
    )
    .map(([oid]) => oid);
}
/** v0.58.1: copia descrição/nível da habilidade da carta salva para os outros personagens que a têm. */
export function propagateAbility(
  edits: Record<string, CardEdit>,
  cardId: string,
  a: string,
  scope: AbilityScope,
) {
  if (scope === "this") return;
  const src = edits[cardId];
  const keys = Object.keys(src.rar ?? {}).map(Number);
  for (const d of Object.values(CHAR_BY_ID)) {
    if (d.id === cardId) continue;
    const oe = edits[d.id];
    const abil = oe?.abilities ?? [...d.abilities];
    const i = abil.indexOf(a);
    if (i < 0) continue;
    if (scope === "uneditedOnly" && oe && changedAbilities(oe).includes(a))
      continue;
    const lo = oe?.minStars ?? d.minStars;
    const hi = oe?.maxStars ?? d.maxStars;
    const ne: CardEdit = oe
      ? { ...oe, abilities: [...abil], rar: { ...(oe.rar ?? {}) } }
      : { abilities: [...abil], rar: {} };
    for (let st = lo; st <= hi; st++) {
      const r = ne.rar![st]
        ? { ...ne.rar![st], lv: [...ne.rar![st].lv], ds: [...ne.rar![st].ds] }
        : defaultRar(d, st, abil);
      const near = keys.length
        ? keys.reduce((b, k) => (Math.abs(k - st) < Math.abs(b - st) ? k : b))
        : st;
      const v = abilAt(src, a, st) ?? abilAt(src, a, near);
      if (v) {
        r.ds[i] = v.ds;
        r.lv[i] = abilAt(src, a, st) ? v.lv : defaultLevel(a, st);
      }
      ne.rar![st] = r;
    }
    ne.escopo = { ...(ne.escopo ?? {}), [a]: scope };
    ne.via = { ...(ne.via ?? {}), [a]: cardId };
    edits[d.id] = ne;
  }
}

/** v0.58.1: pergunta o escopo de cada habilidade alterada. null = Voltar (não salva). */
async function askScopes(
  edits: Record<string, CardEdit>,
  id: string,
  e: CardEdit,
): Promise<Record<string, AbilityScope> | null> {
  const out: Record<string, AbilityScope> = {};
  for (const a of changedAbilities(e)) {
    const nm = ABILITIES[a as AbilityId].name;
    const prev = edits[id]?.escopo?.[a];
    for (;;) {
      const v = await showDialog({
        title: `Alterar ${nm}`,
        icon: "🛠",
        message: `A habilidade "${nm}" foi alterada. Aplicar a mudança para:${prev ? ` (antes: ${SCOPE_LABEL[prev]})` : ""}`,
        buttons: [
          { label: "Voltar", value: "back", kind: "ghost" },
          { label: "Apenas este personagem", value: "this" },
          { label: "Todos os personagens", value: "all", kind: "primary" },
        ],
      });
      if (v !== "this" && v !== "all") return null;
      if (v === "this") {
        out[a] = "this";
        break;
      }
      const conf = abilityConflicts(edits, id, a, e);
      if (!conf.length) {
        out[a] = "all";
        break;
      }
      const w = await showDialog({
        title: "Atenção",
        icon: "⚠️",
        message: `Estas cartas já têm "${nm}" editada com outro valor: ${conf.map((c) => CHAR_BY_ID[c]?.name ?? c).join(", ")}. Alterar:`,
        buttons: [
          { label: "Voltar", value: "back", kind: "ghost" },
          { label: "Só nas cartas ainda não editadas", value: "uneditedOnly" },
          { label: "Para todos", value: "all", kind: "primary" },
        ],
      });
      if (w === "uneditedOnly" || w === "all") {
        out[a] = w;
        e.conflitos = {
          ...(e.conflitos ?? {}),
          [a]: conf.map((c) => CHAR_BY_ID[c]?.name ?? c),
        };
        break;
      }
    }
  }
  return out;
}
const SCOPE_LABEL: Record<AbilityScope, string> = {
  all: "todos",
  this: "só este",
  uneditedOnly: "só não editadas",
};

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
      root
        .querySelector("[data-t=save]")!
        .addEventListener("click", async () => {
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
          if (edits[id]?.conflitos) e.conflitos = { ...edits[id].conflitos };
          const scopes = await askScopes(edits, id, e);
          if (!scopes) return; // Voltar: continua editando, nada salvo
          e.escopo = { ...(edits[id]?.escopo ?? {}), ...scopes };
          edits[id] = e;
          for (const [a, sc] of Object.entries(scopes))
            propagateAbility(edits, id, a, sc);
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
