/**
 * v0.14.4 — arrastar a carta da mão até uma casa do campo (toque e mouse, Pointer Events).
 * Funções puras usadas pela batalha (e testadas): quando um movimento vira arrasto e a
 * posição da "carta fantasma" que segue o dedo (só transform → não redesenha a página).
 */

/** distância mínima (px) para um toque virar arrasto; menos que isso continua sendo um toque (seleciona) */
export const DRAG_THRESHOLD = 10;

export function shouldStartDrag(dx: number, dy: number, threshold = DRAG_THRESHOLD): boolean {
  return dx * dx + dy * dy >= threshold * threshold;
}

/** transform da carta fantasma: o ponto onde o dedo pegou a carta fica embaixo do dedo */
export function ghostTransform(px: number, py: number, grabX: number, grabY: number, scale = 1.06): string {
  return `translate3d(${Math.round(px - grabX * scale)}px, ${Math.round(py - grabY * scale)}px, 0) scale(${scale})`;
}

/** solta numa casa válida (destacada) → invoca; em qualquer outro lugar → cancela e a carta volta */
export function dropAction(cell: { valid: boolean } | null): 'deploy' | 'cancel' {
  return cell && cell.valid ? 'deploy' : 'cancel';
}
