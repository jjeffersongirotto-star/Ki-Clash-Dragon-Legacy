/**
 * v0.33.0 — destaque do tutorial guiado ("spotlight").
 *
 * Escurece a tela inteira MENOS o alvo (que fica com as cores normais, enquadrado, com uma seta) e mostra a caixa
 * de texto do passo. Só o alvo recebe toques: 4 painéis escuros em volta dele bloqueiam o resto.
 * Sem alvo (ex.: enquanto a batalha anima), a tela toda fica bloqueada e só a caixa de texto aparece.
 */
import { ico } from './icons';
let root: HTMLElement | null = null;
let lastHtml = '';

export interface SpotOptions {
  /** v0.52.1: tela clara (sem escurecer), como numa partida normal — só a caixa de texto aparece */
  clear?: boolean;
  /** v0.53.0: destaca o alvo com a moldura mas sem escurecer o resto (tudo continua tocável) */
  light?: boolean;
  /** "Pular tutorial" na caixa de texto */
  onSkip?: () => void;
  /** folga em volta do alvo (px) */
  pad?: number;
  /**
   * v0.42.1: área livre maior que o alvo (ex.: as 6 casas da zona de invocação). Ela fica clara, recebe toques e ganha
   * uma moldura própria; o alvo (se houver) ganha o círculo e a seta. Sem alvo, só a área fica destacada.
   */
  area?: Element[];
  /** v0.55.0: bloqueia TODOS os toques (menos a caixa de texto) — passo só de explicação */
  lock?: boolean;
  /** v0.55.0: botão "Continuar ›" na caixa de texto (passo de explicação que avança ao tocar) */
  onNext?: () => void;
  /** v0.55.0: força a caixa de texto no alto ou embaixo da tela (para não cobrir o conteúdo) */
  tipAt?: 'top' | 'bottom';
}
let nextFn: (() => void) | undefined;

function ensure(opts: SpotOptions): HTMLElement {
  if (root && document.body.contains(root)) return root;
  root = document.createElement('div');
  root.className = 'spot';
  root.innerHTML = `<div class="spot-lock"></div><div class="spot-b" data-b="t"></div><div class="spot-b" data-b="b"></div><div class="spot-b" data-b="l"></div><div class="spot-b" data-b="r"></div>
    <div class="spot-zone"></div><div class="spot-frame"></div><div class="spot-arrow">👇</div>
    <div class="spot-tip"><p class="spot-text"></p><button class="btn small primary spot-next">Continuar ›</button>${opts.onSkip ? '<button class="link-btn spot-skip">Pular tutorial</button>' : ''}</div>`;
  root.querySelector('.spot-next')?.addEventListener('click', () => nextFn?.());
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
  const zone = r.querySelector<HTMLElement>('.spot-zone')!;
  if (html !== lastHtml) {
    r.querySelector('.spot-text')!.innerHTML = html;
    lastHtml = html;
  }
  const tbox = target?.getBoundingClientRect();
  const boxes = (opts.area ?? []).map((el) => el.getBoundingClientRect()).filter((b) => b.width > 0);
  const abox = boxes.length ? { left: Math.min(...boxes.map((b) => b.left)), top: Math.min(...boxes.map((b) => b.top)), right: Math.max(...boxes.map((b) => b.right)), bottom: Math.max(...boxes.map((b) => b.bottom)) } : null;
  const hasT = !!tbox && tbox.width > 0;
  const box = abox ? { left: Math.min(abox.left, hasT ? tbox.left : abox.left), top: Math.min(abox.top, hasT ? tbox.top : abox.top), right: Math.max(abox.right, hasT ? tbox.right : abox.right), bottom: Math.max(abox.bottom, hasT ? tbox.bottom : abox.bottom), width: 1 } : tbox;
  zone.style.display = 'none';
  nextFn = opts.onNext;
  r.querySelector<HTMLElement>('.spot-next')!.style.display = opts.onNext ? '' : 'none';
  r.querySelector<HTMLElement>('.spot-lock')!.style.display = opts.lock ? '' : 'none';
  if (opts.clear) {
    for (const el of [t, b, l, rt]) place(el, 0, 0, 0, 0);
    frame.style.display = arrow.style.display = 'none';
    tip.style.top = '';
    tip.style.bottom = '16px';
    return;
  }
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
  if (opts.light) for (const el of [t, b, l, rt]) place(el, 0, 0, 0, 0);
  frame.style.display = arrow.style.display = '';
  place(frame, x0, y0, x1 - x0, y1 - y0);
  frame.classList.remove('ring');
  if (abox) {
    // a área (zona) com moldura própria; o alvo com círculo; sem alvo, nem círculo nem seta
    zone.style.display = '';
    place(zone, x0, y0, x1 - x0, y1 - y0);
    if (!hasT) {
      frame.style.display = arrow.style.display = 'none';
    } else {
      const rp = 4;
      place(frame, tbox.left - rp, tbox.top - rp, tbox.width + 2 * rp, tbox.height + 2 * rp);
      frame.classList.add('ring');
    }
  }
  const ax0 = abox && hasT ? tbox.left : x0;
  const ax1 = abox && hasT ? tbox.right : x1;
  const ay0 = abox && hasT ? tbox.top : y0;
  const ay1 = abox && hasT ? tbox.bottom : y1;
  // seta acima do alvo (ou abaixo, se não couber) e caixa de texto do outro lado da tela
  const above = ay0 > 70;
  // v0.42.0: a manopla dourada (aponta para baixo; virada quando fica embaixo do alvo)
  arrow.innerHTML = ico('seta-tutorial', above ? '👇' : '👆');
  arrow.classList.toggle('up', !above);
  arrow.style.left = `${(ax0 + ax1) / 2 - 18}px`;
  arrow.style.top = `${above ? ay0 - 46 : ay1 + 6}px`;
  const tipBelow = (y0 + y1) / 2 < vh / 2;
  tip.style.top = tipBelow ? `${Math.min(vh - 140, y1 + 56)}px` : '';
  tip.style.bottom = tipBelow ? '' : `${Math.min(vh - 140, vh - y0 + 56)}px`;
  if (opts.tipAt) {
    tip.style.top = opts.tipAt === 'top' ? '6px' : '';
    tip.style.bottom = opts.tipAt === 'bottom' ? '6px' : '';
  }
}

export function clearSpotlight() {
  root?.remove();
  root = null;
  lastHtml = '';
}
