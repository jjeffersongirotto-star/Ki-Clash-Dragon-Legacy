/**
 * Tela deitada (paisagem) em todo o jogo.
 *
 * v0.11.0: começou só na batalha. v0.46.0/v0.46.1: o jogo inteiro é deitado e não há aviso para girar.
 * - App Android: trava em paisagem desde a abertura (AndroidManifest + plugin) e não destrava.
 * - Site: o navegador só deixa travar depois de um toque; o primeiro toque (e o "Lutar") tenta tela cheia + paisagem.
 *   Se não der (iPhone, navegador sem suporte), nada quebra: o layout continua funcionando.
 * v0.50.1: sair da batalha não destrava nem sai da tela cheia (antes voltava a ficar em pé no site).
 */
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

const native = () => Capacitor.isNativePlatform();

type OrientationLike = { lock?: (o: string) => Promise<void>; unlock?: () => void };

const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export async function requestLandscape(): Promise<boolean> {
  if (typeof document === 'undefined' || !isTouch()) return false;
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
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
  // v0.46.0/v0.50.1: o jogo inteiro é deitado (app e site) — sair da batalha não destrava nem sai da tela cheia
}

/** v0.46.1: o jogo inteiro é deitado, sem aviso para girar o celular. No app trava em paisagem desde a abertura
 * (AndroidManifest + plugin). No site o navegador só deixa travar com um toque: o primeiro toque do jogador tenta
 * tela cheia + paisagem, sem janela nenhuma; se não der, o layout segue funcionando. */
export function installLandscape(): void {
  if (typeof document === 'undefined') return;
  if (native()) {
    document.body.classList.add('native-landscape');
    void ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => document.body.classList.remove('native-landscape'));
    return;
  }
  const first = () => {
    document.removeEventListener('pointerup', first, true);
    void requestLandscape();
  };
  document.addEventListener('pointerup', first, true);
}
