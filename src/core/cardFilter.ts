/**
 * v0.55.1 — filtros da Coleção & Baralho: Raça e Tipo (categoria) com várias escolhas.
 * Dentro do mesmo filtro vale qualquer uma (OU); entre filtros diferentes, todas (E).
 * Ex.: Humano + Elfo e DPS + Tanque = (Humano OU Elfo) E (DPS OU Tanque). Feitiço não tem raça: some com filtro de raça.
 */
export function cardMatches(race: string | null, categories: readonly string[], races: ReadonlySet<string>, types: ReadonlySet<string>): boolean {
  if (races.size && (race == null || !races.has(race))) return false;
  if (types.size && !categories.some((c) => types.has(c))) return false;
  return true;
}

export function toggleSel(set: Set<string>, k: string): void {
  if (set.has(k)) set.delete(k);
  else set.add(k);
}
