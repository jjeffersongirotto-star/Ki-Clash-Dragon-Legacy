/**
 * v0.47.0: cartas de grade "assadas" numa imagem só (Coleção e Baralho).
 *
 * Cada carta tem ~36 camadas e 6 imagens; rolando rápido, o celular não desenhava a tempo e apareciam buracos.
 * Aqui cada carta é fotografada UMA vez (html-to-image, mesmo visual) e trocada por uma única imagem por cima;
 * as camadas originais ficam escondidas (visibility) e continuam lá para toques, seleção e acessibilidade.
 * As fotos ficam guardadas na memória pela aparência exata da carta (outerHTML), então voltar à tela é imediato.
 * O trabalho roda aos poucos, um cartão por vez, só quando a tela está parada (não pesa na rolagem: 60 FPS).
 */
import { toBlob } from 'html-to-image';

const PAD = 24; // px de folga: gota de custo, números e brilho passam da borda
const CACHE = new Map<string, string>();
const MAX_CACHE = 400;
let queue: HTMLElement[] = [];
let running = false;
let lastScroll = 0;
let scrollHooked = false;

export const BAKE_SEL = '.card-grid .card, .deck-slots .card';

const keyOf = (el: HTMLElement, w: number, ratio: number) => `${w}x${ratio}|${el.outerHTML}`;
const ratio = () => Math.min(2, Math.max(1, Math.round((globalThis.devicePixelRatio || 1) * 4) / 4));

function apply(el: HTMLElement, url: string) {
  if (el.querySelector(':scope > img.card-bake')) return;
  const img = document.createElement('img');
  img.className = 'card-bake';
  img.alt = '';
  img.draggable = false;
  img.style.setProperty('--bp', `${PAD}px`);
  img.src = url;
  const done = () => {
    if (!el.isConnected) return;
    el.appendChild(img);
    el.classList.add('flat');
  };
  img.decode().then(done, () => {});
}

async function bakeOne(el: HTMLElement): Promise<void> {
  if (!el.isConnected || el.classList.contains('flat')) return;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;
  const r = ratio();
  const key = keyOf(el, w, r);
  const hit = CACHE.get(key);
  if (hit) return apply(el, hit);
  // palco invisível no mesmo lugar da árvore (mesmos seletores CSS) com folga em volta
  const stage = document.createElement('div');
  stage.className = 'bake-stage';
  stage.style.cssText = `position:absolute;left:0;top:0;box-sizing:border-box;width:${w + 2 * PAD}px;height:${h + 2 * PAD}px;padding:${PAD}px;opacity:0;pointer-events:none;z-index:-1;contain:layout;`;
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.width = `${w}px`;
  clone.style.height = `${h}px`;
  clone.style.margin = '0';
  clone.style.animation = 'none';
  stage.appendChild(clone);
  el.parentElement!.appendChild(stage);
  try {
    const blob = await toBlob(stage, { width: w + 2 * PAD, height: h + 2 * PAD, pixelRatio: r, cacheBust: false, style: { opacity: '1', position: 'static', zIndex: 'auto' }, skipFonts: true });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    if (CACHE.size >= MAX_CACHE) {
      const first = CACHE.keys().next().value as string;
      URL.revokeObjectURL(CACHE.get(first)!);
      CACHE.delete(first);
    }
    CACHE.set(key, url);
    apply(el, url);
  } catch {
    /* sem foto: a carta continua normal */
  } finally {
    stage.remove();
  }
}

const idle = (fn: () => void) => {
  const ric = (globalThis as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout: 400 });
  else setTimeout(fn, 30);
};

function pump() {
  if (running) return;
  running = true;
  const step = () => {
    if (performance.now() - lastScroll < 180) return void setTimeout(step, 120); // rolando: espera parar
    const el = queue.shift();
    if (!el) {
      running = false;
      return;
    }
    void bakeOne(el).finally(() => idle(step));
  };
  idle(step);
}

/** Troca as cartas de grade de `root` pela foto (na hora, se já existe; senão, aos poucos e visíveis primeiro). */
export function bakeCards(root: ParentNode): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (!scrollHooked) {
    scrollHooked = true;
    window.addEventListener('scroll', () => (lastScroll = performance.now()), { passive: true, capture: true });
  }
  const els = Array.from(root.querySelectorAll<HTMLElement>(BAKE_SEL));
  const r = ratio();
  const vh = window.innerHeight;
  const todo: HTMLElement[] = [];
  for (const el of els) {
    const hit = el.offsetWidth ? CACHE.get(keyOf(el, el.offsetWidth, r)) : undefined;
    if (hit) apply(el, hit);
    else todo.push(el);
  }
  const dist = (el: HTMLElement) => {
    const b = el.getBoundingClientRect();
    return b.bottom < 0 ? -b.bottom + vh : b.top > vh ? b.top : 0;
  };
  queue = todo.sort((a, b) => dist(a) - dist(b));
  pump();
}
