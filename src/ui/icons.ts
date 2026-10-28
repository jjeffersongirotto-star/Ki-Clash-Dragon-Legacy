/**
 * v0.42.0: ícones desenhados do jogo (src/assets/icons/<nome>.webp, gerados por scripts/art/build_icons.py).
 * Sempre como <img> (o navegador guarda em cache; a carta não leva SVG em linha). Sem o arquivo, volta para o
 * texto/emoji de reserva.
 */
const FILES = import.meta.glob('../assets/icons/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const ICONS = new Map(Object.entries(FILES).map(([k, v]) => [k.slice(k.lastIndexOf('/') + 1, -'.webp'.length), v]));
const SPELL_FILES = import.meta.glob('../assets/spells/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const SPELL_ART = new Map(Object.entries(SPELL_FILES).map(([k, v]) => [k.slice(k.lastIndexOf('/') + 1, -'.webp'.length), v]));

export const iconURL = (name: string) => ICONS.get(name);
export const spellArtURL = (id: string) => SPELL_ART.get(id);

/** <img> do ícone `name` (classe `ico` + extra); sem o arquivo, devolve `fallback`. */
export function ico(name: string, fallback = '', cls = ''): string {
  const u = ICONS.get(name);
  return u ? `<img class="ico${cls ? ` ${cls}` : ''}" src="${u}" alt="" draggable="false">` : fallback;
}
