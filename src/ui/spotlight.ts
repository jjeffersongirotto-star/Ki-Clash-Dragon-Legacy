/**
 * v0.33.0 — destaque do tutorial guiado ("spotlight").
 *
 * Escurece a tela inteira MENOS o alvo (que fica com as cores normais, enquadrado, com uma seta) e mostra a caixa
 * de texto do passo. Só o alvo recebe toques: 4 painéis escuros em volta dele bloqueiam o resto.
 * Sem alvo (ex.: enquanto a batalha anima), a tela toda fica bloqueada e só a caixa de texto aparece.
 */
let root: HTMLElement | null = null;
let lastHtml = '';

export interface SpotOptions {
  /** "Pular tutorial" na caixa de texto */
  onSkip?: () => void;
  /** folga em volta do alvo (px) */
  pad?: number;
}

function ensure(opts: SpotOptions): HTMLElement {
  if (root && document.body.contains(root)) return root;
  root = document.createElement('div');
  root.className = 'spot';
  root.innerHTML = `<div class="spot-b" data-b="t"></div><div class="spot-b" data-b="b"></div><div class="spot-b" data-b="l"></div><div class="spot-b" data-b="r"></div>
    <div class="spot-frame"></div><div class="spot-arrow">👇</div>
    <div class="spot-tip"><p class="spot-text"></p>${opts.onSkip ? '<button class="link-btn spot-skip">Pular tutorial</button>' : ''}</div>`;
  root.querySelector('.spot-skip')?.addEventListener('click', () => opts.onSkip?.());
  document.body.appendChild(root);
  lastHtml = '';
  return root;
}

const place = (el: HTMLElement, x: number, y: number, w: number, h: number) => {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${Math.max(0, w)}px`;
  el.style.height = `${Math.max(0, h)}px`;
};

/** Mostra (ou atualiza) o destaque no `target` com o texto `html`. */
export function spotlight(target: Element | null, html: string, opts: SpotOptions = {}) {
  const r = ensure(opts);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const [t, b, l, rt] = (['t', 'b', 'l', 'r'] as const).map((k) => r.querySelector<HTMLElement>(`[data-b="${k}"]`)!);
  const frame = r.querySelector<HTMLElement>('.spot-frame')!;
  const arrow = r.querySelector<HTMLElement>('.spot-arrow')!;
  const tip = r.querySelector<HTMLElement>('.spot-tip')!;
  if (html !== lastHtml) {
    r.querySelector('.spot-text')!.innerHTML = html;
    lastHtml = html;
  }
  const box = target?.getBoundingClientRect();
  if (!box || box.width === 0) {
    place(t, 0, 0, vw, vh);
    for (const el of [b, l, rt]) place(el, 0, 0, 0, 0);
    frame.style.display = arrow.style.display = 'none';
    tip.style.top = '';
    tip.style.bottom = '16px';
    return;
  }
  const pad = opts.pad ?? 6;
  const x0 = Math.max(0, box.left - pad);
  const y0 = Math.max(0, box.top - pad);
  const x1 = Math.min(vw, box.right + pad);
  const y1 = Math.min(vh, box.bottom + pad);
  place(t, 0, 0, vw, y0);
  place(b, 0, y1, vw, vh - y1);
  place(l, 0, y0, x0, y1 - y0);
  place(rt, x1, y0, vw - x1, y1 - y0);
  frame.style.display = arrow.style.display = '';
  place(frame, x0, y0, x1 - x0, y1 - y0);
  // seta acima do alvo (ou abaixo, se não couber) e caixa de texto do outro lado da tela
  const above = y0 > 70;
  arrow.textContent = above ? '👇' : '👆';
  arrow.style.left = `${(x0 + x1) / 2 - 18}px`;
  arrow.style.top = `${above ? y0 - 46 : y1 + 6}px`;
  const tipBelow = (y0 + y1) / 2 < vh / 2;
  tip.style.top = tipBelow ? `${Math.min(vh - 140, y1 + 56)}px` : '';
  tip.style.bottom = tipBelow ? '' : `${Math.min(vh - 140, vh - y0 + 56)}px`;
}

export function clearSpotlight() {
  root?.remove();
  root = null;
  lastHtml = '';
}
