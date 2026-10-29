/**
 * v0.44.0: arte de fundo de cada fase (src/assets/arenas/NNN.webp, NNN = número da fase de 001 a 100, gerada por
 * scripts/art/build_arenas.py). Fácil, Normal e Difícil da mesma fase usam a mesma arena. Com arte, a batalha
 * ganha a classe `has-arena`: arena, quadros dos Comandantes e faixa da mão ficam transparentes por cima do cenário.
 */
const FILES = import.meta.glob('../assets/arenas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const ARENAS = new Map(Object.entries(FILES).map(([k, v]) => [Number(k.slice(k.lastIndexOf('/') + 1, k.lastIndexOf('/') + 4)), v]));

export const arenaUrl = (stageId: number): string | undefined => ARENAS.get(stageId);

/** Classe e estilo do contêiner da batalha para a fase. */
export function arenaAttrs(stageId: number): { cls: string; style: string } {
  const u = arenaUrl(stageId);
  return u ? { cls: ' has-arena', style: ` style="--arena-bg:url('${u}')"` } : { cls: '', style: '' };
}
