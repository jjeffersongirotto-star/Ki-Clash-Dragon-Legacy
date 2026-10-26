/**
 * v0.11.0 — Batalha deitada (paisagem).
 *
 * Ao entrar na batalha num aparelho de toque, tenta tela cheia + travar a orientação em
 * paisagem (Screen Orientation API). No Chrome Android a trava só funciona em TELA CHEIA e
 * precisa de um toque do jogador (por isso é chamada no toque de "Lutar" ou no botão do aviso).
 * Se não der (iPhone, navegador sem suporte, jogador recusou), nada quebra: o jogo mostra o
 * aviso "Gire o celular" e o layout em pé continua funcionando.
 * Ao sair da batalha, sai da tela cheia e destrava.
 */
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

/**
 * v0.20.0 — no app Android a batalha SEMPRE deita a tela sozinha (trava em paisagem pelo plugin nativo, sem
 * precisar de tela cheia nem de toque) e o aviso "Gire o celular" não aparece. Ao sair, a tela fica livre de novo.
 */
const native = () => Capacitor.isNativePlatform();

type OrientationLike = { lock?: (o: string) => Promise<void>; unlock?: () => void };

const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
let weEnteredFullscreen = false;

export async function requestLandscape(): Promise<boolean> {
  if (typeof document === 'undefined' || !isTouch()) return false;
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      weEnteredFullscreen = !!document.fullscreenElement;
    }
  } catch {
    /* sem tela cheia: segue sem trava */
  }
  try {
    const o = (screen as unknown as { orientation?: OrientationLike }).orientation;
    if (o?.lock) {
      await o.lock('landscape');
      return true;
    }
  } catch {
    /* trava não suportada / negada */
  }
  return false;
}

export function enterBattleMode(): void {
  if (typeof document === 'undefined') return;
  document.body.classList.add('in-battle');
  if (native()) {
    document.body.classList.add('native-landscape');
    void ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => document.body.classList.remove('native-landscape'));
    return;
  }
  void requestLandscape();
}

export function leaveBattleMode(): void {
  if (typeof document === 'undefined' || !document.body.classList.contains('in-battle')) return;
  document.body.classList.remove('in-battle');
  if (native()) {
    document.body.classList.remove('native-landscape');
    void ScreenOrientation.unlock().catch(() => {});
    return;
  }
  try {
    (screen as unknown as { orientation?: OrientationLike }).orientation?.unlock?.();
  } catch {
    /* ok */
  }
  if (weEnteredFullscreen && document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  weEnteredFullscreen = false;
}
