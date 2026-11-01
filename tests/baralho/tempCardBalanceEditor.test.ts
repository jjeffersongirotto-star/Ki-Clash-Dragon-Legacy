import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { CHAR_BY_ID } from "../../src/core/characters";
import { waitFor } from "../../src/core/battle";
import {
  applyEdits,
  exportJSON,
  TEMP_CARD_BALANCE_EDITOR,
} from "../../src/app/tempCardBalanceEditor";

const mem: Record<string, string> = {};
beforeEach(() => {
  (globalThis as any).localStorage = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => (mem[k] = v),
    removeItem: (k: string) => delete mem[k],
  };
});

describe("v0.56.0 editor temporário de balanceamento", () => {
  it("ligado nesta versão (fácil de desligar)", () =>
    expect(TEMP_CARD_BALANCE_EDITOR).toBe(true));
  it("aplica ATQ/Vida/espera e volta ao original ao restaurar", () => {
    const id = Object.keys(CHAR_BY_ID)[0];
    const atk = CHAR_BY_ID[id].atk;
    const w = waitFor(id);
    applyEdits({
      [id]: { atk: 99, hp: 77, wait: 9, abilities: ["nova coisa"] },
    });
    expect(CHAR_BY_ID[id].atk).toBe(99);
    expect(CHAR_BY_ID[id].hp).toBe(77);
    expect(waitFor(id)).toBe(9);
    expect(CHAR_BY_ID[id].abilities).toEqual([]);
    expect(JSON.parse(exportJSON({ [id]: { atk: 99 } }))[id].atk).toBe(99);
    applyEdits({});
    expect(CHAR_BY_ID[id].atk).toBe(atk);
    expect(waitFor(id)).toBe(w);
  });
});

describe("v0.56.0 login, dica e gotas", () => {
  it("jogo abre na tela de login e Sair volta para ela", () => {
    expect(readFileSync("src/main.ts", "utf8")).toContain("loginScreen();");
    expect(readFileSync("src/app/profile.ts", "utf8")).toContain(
      "exitToLogin()",
    );
    const l = readFileSync("src/app/login.ts", "utf8");
    expect(l).toContain('id="lgEye"');
    expect(l).toContain('id="lgSave"');
  });
  it("dica com faixa nunca cai sobre a mão", () => {
    const s = readFileSync("src/ui/spotlight.ts", "utf8");
    expect(s).toContain("const useStrip = !!opts.strip;");
    expect(readFileSync("src/app/tutorial.ts", "utf8")).toContain(
      "root.querySelector('.board-wrap')",
    );
  });
  it("gota sem ::before (igual na carta assada e na viva)", () => {
    expect(readFileSync("src/ui/style.css", "utf8")).not.toContain(
      ".ck-cost::before",
    );
  });
});

describe("v0.58.0 editor: abas por raridade", () => {
  it("ATQ/Vida por raridade valem no jogo e o export traz raridades, nível e descrição", async () => {
    const { statsFor } = await import("../../src/core/progression");
    const id = Object.keys(CHAR_BY_ID).find(
      (k) =>
        CHAR_BY_ID[k].abilities.length &&
        CHAR_BY_ID[k].maxStars > CHAR_BY_ID[k].minStars,
    )!;
    const d = CHAR_BY_ID[id];
    const lo = d.minStars;
    const ab = d.abilities[0];
    const rar = {
      [lo]: { atk: 11, hp: 22, lv: [3], ds: ["texto novo"] },
      [lo + 1]: { atk: 13, hp: 25, lv: [4], ds: ["texto novo"] },
    };
    applyEdits({
      [id]: { minStars: lo, maxStars: lo + 1, wait: 2, abilities: [ab], rar },
    });
    expect(statsFor(d, lo, 0)).toEqual({ atk: 11, hp: 22 });
    expect(statsFor(d, lo + 1, 0)).toEqual({ atk: 13, hp: 25 });
    expect(waitFor(id)).toBe(2);
    const j = JSON.parse(
      exportJSON({
        [id]: { minStars: lo, maxStars: lo + 1, wait: 2, abilities: [ab], rar },
      }),
    );
    const h = j[id].raridades[String(lo + 1)].habilidades[0];
    expect(h).toMatchObject({
      id: ab,
      nivel: 4,
      descricao: "texto novo",
      descricaoAlterada: true,
    });
    expect(j._comoAplicar).toContain("TODOS");
    applyEdits({});
    expect(statsFor(d, lo, 0).atk).not.toBe(11);
  });
  it("conflito: mesma habilidade com textos diferentes em cartas editadas", () => {
    const ids = Object.keys(CHAR_BY_ID).filter(
      (k) => CHAR_BY_ID[k].abilities.length,
    );
    const first = ids.find((k) =>
      ids.some(
        (o) =>
          o !== k &&
          CHAR_BY_ID[o].abilities.includes(CHAR_BY_ID[k].abilities[0]),
      ),
    )!;
    ids.splice(ids.indexOf(first), 1);
    ids.unshift(first);
    const ab = CHAR_BY_ID[first].abilities[0];
    const other = ids.find(
      (k) => k !== first && CHAR_BY_ID[k].abilities.includes(ab),
    )!;
    const mk = (t: string, st: number) => ({
      abilities: [ab],
      rar: { [st]: { atk: 1, hp: 1, lv: [0], ds: [t] } },
    });
    const j = JSON.parse(
      exportJSON({
        [ids[0]]: mk("A", CHAR_BY_ID[ids[0]].minStars),
        [other]: mk("B", CHAR_BY_ID[other].minStars),
      }),
    );
    expect(j._conflitos[ab]).toEqual([
      CHAR_BY_ID[ids[0]].name,
      CHAR_BY_ID[other].name,
    ]);
  });
  it("espera só editável na raridade inicial (travada nas outras)", () => {
    const s = readFileSync("src/app/tempCardBalanceEditor.ts", "utf8");
    expect(s).toContain('disabled title="Só na raridade inicial"');
    expect(s).toContain("data-tab=");
  });
});
