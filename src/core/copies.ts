/**
 * v0.71.0 — Cada cópia de um personagem é uma carta própria: tem a sua raridade (cor), o seu degrau ("+", "++")
 * e a sua barra de XP. Treinar e Despertar valem para UMA cópia (cada uma paga o preço inteiro).
 *
 * Onde ficam as cópias:
 *  - `cards[id]`  → a 1ª cópia (a "principal"; o personagem nunca fica sem ela). Referência 0.
 *  - `extra[id]`  → as outras cópias que já foram usadas (entraram no baralho ou foram treinadas). Referências 1, 2, …
 *  - `dupes[id]`  → as cópias guardadas que nunca foram usadas (só a raridade; degrau base, XP 0). Elas viram uma
 *                   cópia de `extra` quando entram no baralho ou são treinadas, e voltam para cá se saírem do baralho
 *                   sem nunca terem sido treinadas (assim podem ser desmanchadas no Inventário).
 *  - `pick[id]`   → quais cópias (referências) estão no baralho: de 1 a 3, em qualquer combinação de raridades.
 */
import { MAX_COPIES } from './deck';
import { cardPower } from './power';
import { stepOf, type OwnedCard } from './progression';
import { addDupe, dupeCount, takeDupe, type Dupes } from './banner';

export interface CopySave {
  cards: Record<string, OwnedCard>;
  extra?: Record<string, OwnedCard[]>;
  dupes?: Dupes;
  pick?: Record<string, number[]>;
}

/** Todas as cópias usadas do personagem (a principal primeiro). */
export const copyList = (d: CopySave, id: string): OwnedCard[] => (d.cards[id] ? [d.cards[id], ...(d.extra?.[id] ?? [])] : []);
export const copyAt = (d: CopySave, id: string, ref: number): OwnedCard | undefined => copyList(d, id)[ref];
/** cópia nunca treinada (pode voltar a ser cópia guardada) */
export const untouched = (c: OwnedCard) => stepOf(c) === 0 && !(c.xp > 0);

/** Tira uma cópia guardada da raridade `stars` e a transforma numa cópia usada. Retorna a referência dela. */
export function materialize(d: CopySave, id: string, stars: number): number | null {
  if (!d.cards[id] || !takeDupe((d.dupes ??= {}), id, stars)) return null;
  const row = ((d.extra ??= {})[id] ??= []);
  row.push({ charId: id, xp: 0, stars, plus: 0 });
  return row.length;
}

/** Cópias no baralho (referências válidas, sem repetir, de 1 a 3). Sem escolha salva: a principal. */
export function pickOf(d: CopySave, id: string): number[] {
  const n = copyList(d, id).length;
  const raw = d.pick?.[id];
  const out: number[] = [];
  for (const r of Array.isArray(raw) ? raw : []) if (Number.isInteger(r) && r >= 0 && r < n && !out.includes(r) && out.length < MAX_COPIES) out.push(r);
  return out.length ? out : n ? [0] : [];
}
export const pickedCards = (d: CopySave, id: string): OwnedCard[] => pickOf(d, id).map((r) => copyAt(d, id, r)!);

/** As cópias fora do baralho: as usadas (por referência) e as guardadas (por raridade), da mais forte para a mais fraca. */
export function spareOptions(d: CopySave, id: string): { ref?: number; stars: number; plus: number; power: number }[] {
  const picked = pickOf(d, id);
  const out: { ref?: number; stars: number; plus: number; power: number }[] = [];
  copyList(d, id).forEach((c, ref) => {
    if (!picked.includes(ref)) out.push({ ref, stars: c.stars, plus: stepOf(c), power: cardPower(c) });
  });
  for (const [r, k] of Object.entries(d.dupes?.[id] ?? {})) if (k > 0) out.push({ stars: +r, plus: 0, power: cardPower({ charId: id, stars: +r, plus: 0 }) });
  return out.sort((a, b) => b.power - a.power || (a.ref == null ? 1 : 0) - (b.ref == null ? 1 : 0));
}

/** Põe no baralho a cópia escolhida (`ref`) ou uma guardada da raridade `stars`. Retorna a referência, ou null. */
export function pickCopy(d: CopySave, id: string, choice: { ref?: number; stars?: number }): number | null {
  const cur = pickOf(d, id);
  if (cur.length >= MAX_COPIES) return null;
  const ref = choice.ref ?? (choice.stars != null ? materialize(d, id, choice.stars) : null);
  if (ref == null || cur.includes(ref) || !copyAt(d, id, ref)) return null;
  (d.pick ??= {})[id] = [...cur, ref];
  return ref;
}
/** Põe no baralho a cópia mais forte que está fora dele. */
export function pickBest(d: CopySave, id: string): number | null {
  const best = spareOptions(d, id)[0];
  return best ? pickCopy(d, id, best) : null;
}

/** Tira a cópia `ref` do baralho (fica pelo menos 1). */
export function unpickCopy(d: CopySave, id: string, ref: number): boolean {
  const cur = pickOf(d, id);
  if (cur.length <= 1 || !cur.includes(ref)) return false;
  (d.pick ??= {})[id] = cur.filter((r) => r !== ref);
  compactCopies(d, id);
  return true;
}
/** Tira do baralho a cópia mais fraca (fica pelo menos 1). */
export function unpickWeakest(d: CopySave, id: string): boolean {
  const cur = pickOf(d, id);
  if (cur.length <= 1) return false;
  const weakest = [...cur].sort((a, b) => cardPower(copyAt(d, id, a)!) - cardPower(copyAt(d, id, b)!) || b - a)[0];
  return unpickCopy(d, id, weakest);
}

/** Muda quantas cópias estão no baralho: entram as mais fortes de fora, saem as mais fracas. */
export function setPickCount(d: CopySave, id: string, n: number): number {
  const want = Math.max(1, Math.min(MAX_COPIES, Math.floor(n)));
  while (pickOf(d, id).length < want && pickBest(d, id) != null);
  while (pickOf(d, id).length > want && unpickWeakest(d, id));
  return pickOf(d, id).length;
}
/** Baralho com as `n` cópias mais fortes do personagem. */
export function pickStrongest(d: CopySave, id: string, n: number): number {
  if (d.pick) delete d.pick[id];
  compactCopies(d, id);
  // começa pela mais forte de todas (pode não ser a principal)
  const all = [...copyList(d, id).map((c, ref) => ({ ref, stars: c.stars, plus: stepOf(c), power: cardPower(c) })), ...spareOptions(d, id).filter((o) => o.ref == null)].sort((a, b) => b.power - a.power);
  const first = all[0];
  const ref0 = first.ref ?? materialize(d, id, first.stars)!;
  (d.pick ??= {})[id] = [ref0];
  return setPickCount(d, id, n);
}

/**
 * Devolve para as cópias guardadas as cópias usadas que estão fora do baralho e nunca foram treinadas
 * (a principal nunca sai). As referências do baralho são renumeradas.
 */
export function compactCopies(d: CopySave, id: string) {
  const row = d.extra?.[id];
  if (!row?.length) return;
  const picked = pickOf(d, id);
  const keep: OwnedCard[] = [];
  const map = new Map<number, number>([[0, 0]]);
  row.forEach((c, i) => {
    const ref = i + 1;
    if (!picked.includes(ref) && untouched(c)) addDupe((d.dupes ??= {}), id, c.stars);
    else {
      keep.push(c);
      map.set(ref, keep.length);
    }
  });
  if (keep.length) d.extra![id] = keep;
  else delete d.extra![id];
  if (d.pick?.[id]) d.pick[id] = picked.map((r) => map.get(r)!).filter((r) => r != null);
}

/** Total de cópias que você tem do personagem (usadas + guardadas). */
export const ownedCopyCount = (d: CopySave, id: string) => (d.cards[id] ? copyList(d, id).length + dupeCount(d.dupes, id) : 0);

/** Confere as cópias usadas (raridade 1–6, degrau 0–2, XP ≥ 0) e o que está no baralho. */
export function normalizeCopies(d: CopySave, valid: (id: string, stars: number) => number) {
  const ex: Record<string, OwnedCard[]> = {};
  for (const [id, row] of Object.entries(d.extra && typeof d.extra === 'object' ? d.extra : {})) {
    if (!d.cards[id] || !Array.isArray(row)) continue;
    const ok = row
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({ charId: id, stars: valid(id, Math.floor(Number(c.stars))), plus: Math.max(0, Math.min(2, Math.floor(Number(c.plus) || 0))), xp: Math.max(0, Number(c.xp) || 0) }));
    if (ok.length) ex[id] = ok;
  }
  d.extra = ex;
  const pk: Record<string, number[]> = {};
  for (const id of Object.keys(d.pick && typeof d.pick === 'object' ? d.pick : {})) if (d.cards[id]) pk[id] = pickOf(d, id);
  d.pick = pk;
}

/** A cópia mais forte que você tem do personagem (usada ou guardada) — a que aparece na Coleção. */
export function bestCopy(d: CopySave, id: string): OwnedCard | undefined {
  const used = copyList(d, id);
  if (!used.length) return undefined;
  let best = used[0];
  for (const c of used) if (cardPower(c) > cardPower(best)) best = c;
  for (const [r, k] of Object.entries(d.dupes?.[id] ?? {})) {
    const c: OwnedCard = { charId: id, stars: +r, plus: 0, xp: 0 };
    if (k > 0 && cardPower(c) > cardPower(best)) best = c;
  }
  return best;
}
