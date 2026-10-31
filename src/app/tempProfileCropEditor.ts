/**
 * TEMP (v0.54.0) — editor TEMPORÁRIO do recorte da foto de perfil.
 *
 * Serve só para o jogador acertar os rostos e mandar os números de volta; depois os valores entram
 * em scripts/art/build_thumbs.py (FACE_FIX) e este editor é apagado.
 *
 * COMO REMOVER (tudo isolado aqui):
 *   1. apagar este arquivo e o bloco "TEMP v0.54.0" no fim de src/ui/style.css;
 *   2. em src/app/profile.ts, apagar as linhas marcadas com "TEMP crop editor";
 *   3. apagar tests/visual/tempCropEditor.test.ts.
 * Ou só desligar: TEMP_PROFILE_CROP_EDITOR = false (o jogo volta ao normal, os recortes salvos são ignorados).
 */
import { charArtUrl } from '../ui/art';
import { getChar } from '../core/characters';
import { esc } from '../ui/components';
import { showDialog, gameAlert } from '../ui/dialog';
import { onLongPress } from '../ui/battleModals';

export const TEMP_PROFILE_CROP_EDITOR = true;

/** Recorte no mesmo formato do build_thumbs.py: centro x e lado em frações da LARGURA, centro y em fração da ALTURA. */
export interface TempCrop { cx: number; cy: number; sz: number; png: string }
const KEY = 'kiclash.tempProfileCrops';
const FACE_PX = 128;
const DEFAULT = { cx: 0.5, cy: 0.226, sz: 0.46 };

export function tempCrops(): Record<string, TempCrop> {
  if (!TEMP_PROFILE_CROP_EDITOR) return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, TempCrop>;
  } catch {
    return {};
  }
}
const store = (c: Record<string, TempCrop>) => localStorage.setItem(KEY, JSON.stringify(c));

/** Foto salva no editor (se houver) — usada no lugar do rosto padrão. */
export const tempFaceUrl = (id: string): string | undefined => tempCrops()[id]?.png;

/** Liga o "segurar = editar" nos rostos da grade da Foto de perfil. O toque normal continua escolhendo a foto. */
export function bindTempCropEditor(root: HTMLElement, onSaved: () => void) {
  if (!TEMP_PROFILE_CROP_EDITOR) return;
  root.querySelectorAll<HTMLElement>('[data-av]').forEach((el) => onLongPress(el, () => openEditor(el.dataset.av!, onSaved), 500));
  const n = Object.keys(tempCrops()).length;
  const grid = root.querySelector('.avatar-grid');
  if (!grid) return;
  const bar = document.createElement('div');
  bar.className = 'tcrop-bar';
  bar.innerHTML = `<small>Segure um rosto para ajustar o recorte.</small>${n ? `<button class="btn small primary" data-tcrop-export>Exportar ${n} ${n === 1 ? 'rosto' : 'rostos'}</button>` : ''}`;
  grid.after(bar);
  bar.querySelector('[data-tcrop-export]')?.addEventListener('click', () => void exportCrops());
}

/** Clamp do quadrado dentro da arte (em pixels da arte). */
function clampPx(x0: number, y0: number, s: number, w: number, h: number) {
  s = Math.max(w * 0.08, Math.min(s, w, h));
  return { x0: Math.min(Math.max(0, x0), w - s), y0: Math.min(Math.max(0, y0), h - s), s };
}

function openEditor(id: string, onSaved: () => void) {
  const url = charArtUrl(id);
  if (!url) return;
  const prev = tempCrops()[id] ?? DEFAULT;
  const bg = document.createElement('div');
  bg.className = 'tcrop-bg';
  bg.innerHTML = `<div class="tcrop">
    <div class="tcrop-stage"><img class="tcrop-img" src="${url}" alt="" draggable="false"><div class="tcrop-sq"></div></div>
    <div class="tcrop-side">
      <button class="dialog-x" data-tx aria-label="Fechar">✕</button>
      <b class="tcrop-name">${esc(getChar(id).name)}</b>
      <img class="tcrop-prev" alt="">
      <p class="hint tcrop-hint">Arraste para mover · pinça com 2 dedos (ou roda do mouse) para zoom · toque no quadrado para escolher</p>
      <div class="row"><button class="btn ghost" data-treset>Padrão</button><button class="btn primary" data-tsave>Salvar</button></div>
    </div>
  </div>`;
  document.body.appendChild(bg);
  const img = bg.querySelector<HTMLImageElement>('.tcrop-img')!;
  const sq = bg.querySelector<HTMLElement>('.tcrop-sq')!;
  const prevImg = bg.querySelector<HTMLImageElement>('.tcrop-prev')!;
  const close = () => bg.remove();
  bg.querySelector('[data-tx]')!.addEventListener('click', close);

  let w = 0, h = 0, k = 1; // tamanho natural da arte e escala tela/arte
  let c = { x0: 0, y0: 0, s: 0 };
  const draw = () => {
    sq.style.left = `${c.x0 * k}px`;
    sq.style.top = `${c.y0 * k}px`;
    sq.style.width = sq.style.height = `${c.s * k}px`;
  };
  const cropPng = () => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = FACE_PX;
    cv.getContext('2d')!.drawImage(img, c.x0, c.y0, c.s, c.s, 0, 0, FACE_PX, FACE_PX);
    return cv.toDataURL('image/png');
  };
  const preview = () => (prevImg.src = cropPng());
  const start = () => {
    w = img.naturalWidth;
    h = img.naturalHeight;
    k = img.clientWidth / w;
    const s = prev.sz * w;
    c = clampPx(prev.cx * w - s / 2, prev.cy * h - s / 2, s, w, h);
    draw();
    preview();
  };
  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start);

  // gestos: 1 dedo arrasta, 2 dedos fazem pinça (zoom em volta do centro do quadrado)
  const pts = new Map<number, { x: number; y: number }>();
  let moved = false;
  let pinch0 = 0, s0 = 0;
  const stage = bg.querySelector<HTMLElement>('.tcrop-stage')!;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const zoomTo = (s: number) => {
    const cx = c.x0 + c.s / 2, cy = c.y0 + c.s / 2;
    c = clampPx(cx - s / 2, cy - s / 2, s, w, h);
    draw();
  };
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    if (pts.size === 2) { pinch0 = dist(); s0 = c.s; }
  });
  stage.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
    if (pts.size >= 2) { if (pinch0) zoomTo(s0 * (pinch0 / Math.max(10, dist()))); }
    else { c = clampPx(c.x0 + dx / k, c.y0 + dy / k, c.s, w, h); draw(); }
  });
  const up = (e: PointerEvent) => {
    const was = pts.size;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch0 = 0;
    if (was === 1 && !moved) {
      // toque: dentro do quadrado = escolhe; fora = leva o quadrado para lá
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
      const inside = x >= c.x0 && x <= c.x0 + c.s && y >= c.y0 && y <= c.y0 + c.s;
      if (!inside) { c = clampPx(x - c.s / 2, y - c.s / 2, c.s, w, h); draw(); }
      sq.classList.add('picked');
    }
    preview();
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomTo(c.s * (e.deltaY > 0 ? 1.08 : 0.92)); preview(); }, { passive: false });

  bg.querySelector('[data-treset]')!.addEventListener('click', () => {
    const all = tempCrops();
    delete all[id];
    store(all);
    close();
    onSaved();
  });
  bg.querySelector('[data-tsave]')!.addEventListener('click', () => {
    const all = tempCrops();
    all[id] = { cx: +((c.x0 + c.s / 2) / w).toFixed(3), cy: +((c.y0 + c.s / 2) / h).toFixed(3), sz: +(c.s / w).toFixed(3), png: cropPng() };
    store(all);
    close();
    onSaved();
  });
}

/** Texto pronto para colar no FACE_FIX do build_thumbs.py. */
export function cropsPython(c: Record<string, TempCrop>): string {
  return `FACE_FIX.update({\n${Object.entries(c).map(([id, v]) => `    '${id}': (${v.cx}, ${v.cy}, ${v.sz}),`).join('\n')}\n})\n`;
}

/** Exporta SÓ os rostos editados: 1 arquivo JSON (números + imagem de cada um) e o texto para colar. */
async function exportCrops() {
  const c = tempCrops();
  const ids = Object.keys(c);
  if (!ids.length) return;
  const py = cropsPython(c);
  const json = JSON.stringify({ app: 'Ki-Clash', kind: 'profile-crops', format: '(cx, cy, sz) — cx/sz pela largura, cy pela altura', python: py, crops: c }, null, 1);
  const name = `ki-clash-rostos-${ids.length}.json`;
  const file = new File([json], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: 'Ki-Clash — rostos', text: py });
      return;
    }
  } catch {
    /* cancelado: cai no download/texto */
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  await showDialog({
    title: 'Rostos exportados',
    html: `<p class="hint">Baixado: <b>${esc(name)}</b> (${ids.length} ${ids.length === 1 ? 'rosto' : 'rostos'}). Se o download não abrir, copie o texto abaixo e mande.</p><textarea class="tcrop-text" readonly>${esc(py)}</textarea><button class="btn small" data-copy>Copiar texto</button>`,
    buttons: [],
    onMount: (root) => root.querySelector('[data-copy]')?.addEventListener('click', () => {
      void navigator.clipboard?.writeText(py).then(() => gameAlert('Copiado', 'Texto copiado.', '✅'));
    }),
  });
}
