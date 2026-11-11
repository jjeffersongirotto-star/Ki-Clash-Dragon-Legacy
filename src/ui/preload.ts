/**
 * v0.65.1: ao abrir o jogo, baixa e decodifica as artes das cartas (e ícones delas) e
 * guarda os <img> na memória. Assim, ao rolar Heróis / Baralho / Coleção, a imagem já
 * está pronta e não precisa carregar na hora. Arenas e o mapa do hub ficam de fora
 * (arquivos grandes, usados só na batalha / na Base). Não trava o jogo: roda em
 * segundo plano, em lotes pequenos, para manter ~60 FPS.
 */
import { CHAR_ART_URLS, CHAR_THUMB_URLS, FACE_URLS, LEADER_ENEMY_URL, LEADER_PLAYER_URL } from './art';
import { ICON_URLS, SPELL_ART_URLS } from './icons';

export type PreloadProgress = { total: number; done: number };

const CACHE = new Map<string, HTMLImageElement>();
let inflight: Promise<PreloadProgress> | null = null;

/** URLs locais, miniaturas primeiro (são as das listas). Sem repetir. */
export function cardPreloadUrls(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (urls: readonly string[]) => {
    for (const u of urls) {
      if (!u || seen.has(u)) continue;
      seen.add(u);
      out.push(u);
    }
  };
  add(CHAR_THUMB_URLS);
  add(SPELL_ART_URLS);
  add(ICON_URLS);
  add(CHAR_ART_URLS);
  add(FACE_URLS);
  add([LEADER_PLAYER_URL, LEADER_ENEMY_URL]);
  return out;
}

export const cachedCardImages = (): HTMLImageElement[] => [...CACHE.values()];

const CONCURRENCY = 6;

function yieldPaint(): Promise<void> {
  const ric = (globalThis as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (typeof ric === 'function') return new Promise((res) => ric(() => res(), { timeout: 80 }));
  return new Promise((res) => setTimeout(res, 0));
}

function loadOne(src: string): Promise<void> {
  const hit = CACHE.get(src);
  if (hit && hit.complete && hit.naturalWidth > 0) return Promise.resolve();
  if (typeof Image === 'undefined') return Promise.resolve();
  const im = hit ?? new Image();
  if (!hit) CACHE.set(src, im);
  im.src = src;
  const dec = im.decode?.() ?? new Promise<void>((res, rej) => {
    im.onload = () => res();
    im.onerror = () => rej(new Error(src));
    if (im.complete && im.naturalWidth > 0) res();
  });
  return dec.catch(() => {});
}

/** Começa (ou retoma) o pré-carregamento; chama de novo devolve a mesma promessa. */
export function preloadCardImages(onProgress?: (p: PreloadProgress) => void): Promise<PreloadProgress> {
  if (inflight) return inflight;
  const urls = cardPreloadUrls();
  inflight = (async () => {
    let done = 0;
    let i = 0;
    const worker = async () => {
      while (i < urls.length) {
        const src = urls[i++];
        await loadOne(src);
        done += 1;
        onProgress?.({ total: urls.length, done });
        if (done % CONCURRENCY === 0) await yieldPaint();
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    return { total: urls.length, done };
  })();
  return inflight;
}

/** Só para testes: esvazia o cache e permite rodar o pré-carregamento de novo. */
export function resetCardPreloadForTests(): void {
  CACHE.clear();
  inflight = null;
}

