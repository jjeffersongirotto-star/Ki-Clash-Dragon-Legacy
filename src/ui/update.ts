/**
 * v0.19.0 — botão ⟳ "Procurar atualização".
 * - App Android: consulta a última versão publicada na página de Releases do GitHub e, se for mais nova,
 *   oferece o APK (abre no navegador do celular para baixar e instalar por cima, mantendo o progresso).
 * - v0.61.0: app de computador (Electron): igual ao Android, mas oferece o instalador .exe.
 * - Site: compara com o version.json publicado junto do site e, se houver versão nova, recarrega a página.
 */
import { Capacitor } from '@capacitor/core';

export const APP_VERSION = __APP_VERSION__;
export const RELEASES_API = 'https://api.github.com/repos/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy/releases/latest';
export const RELEASES_PAGE = 'https://github.com/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy/releases/latest';
/** v0.20.0: botão Baixar do site — o APK da última versão, publicado também com nome fixo pela CI */
export const APK_DOWNLOAD_URL = 'https://github.com/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy/releases/latest/download/Ki-Clash.apk';
/** v0.61.0: instalador para computador (Windows), publicado pela CI com nome fixo junto do APK */
export const PC_DOWNLOAD_URL = 'https://github.com/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy/releases/latest/download/Ki-Clash-Setup.exe';

/** > 0 se `a` for mais nova que `b` ("0.19.1" > "0.19.0"; aceita "v" na frente). */
export function compareVersions(a: string, b: string): number {
  const parts = (v: string) => v.replace(/^v/i, '').split('.').map((x) => parseInt(x, 10) || 0);
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

export type UpdateCheck =
  | { status: 'latest'; version: string }
  | { status: 'available'; version: string; url: string; native: boolean }
  | { status: 'none' }
  | { status: 'error' };

export const isNativeApp = () => Capacitor.isNativePlatform();
/** v0.61.0: rodando no app de computador (Electron)? */
export const isDesktopApp = () => typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
/** Instalado (celular ou computador): atualiza baixando a versão nova; no site, só recarrega. */
export const isInstalledApp = () => isNativeApp() || isDesktopApp();
/** Site aberto num celular/tablet (Android, iPhone…)? Senão é computador. */
export const isMobileBrowser = () => typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
/** Botão Baixar do site: APK no celular, instalador no computador. */
export const downloadLink = () => (isMobileBrowser() ? { url: APK_DOWNLOAD_URL, label: 'Baixar o app Android (APK)' } : { url: PC_DOWNLOAD_URL, label: 'Baixar o jogo para computador (Windows)' });

export async function checkForUpdate(opts: { native?: boolean; desktop?: boolean; fetchFn?: typeof fetch; current?: string } = {}): Promise<UpdateCheck> {
  const desktop = opts.desktop ?? isDesktopApp();
  const native = opts.native ?? (isNativeApp() || desktop);
  const get = opts.fetchFn ?? fetch;
  const current = opts.current ?? APP_VERSION;
  try {
    if (native) {
      const res = await get(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
      if (res.status === 404) return { status: 'none' };
      if (!res.ok) return { status: 'error' };
      const rel = (await res.json()) as { tag_name?: string; assets?: { name: string; browser_download_url: string }[] };
      const version = (rel.tag_name ?? '').replace(/^v/i, '');
      if (!version) return { status: 'none' };
      if (compareVersions(version, current) <= 0) return { status: 'latest', version: current };
      // v0.61.0: no computador baixa o instalador (.exe); no celular, o APK
      const ext = desktop ? '.exe' : '.apk';
      const file = rel.assets?.find((a) => a.name.toLowerCase().endsWith(ext));
      return { status: 'available', version, url: file?.browser_download_url ?? RELEASES_PAGE, native: true };
    }
    const res = await get(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return { status: 'error' };
    const { version } = (await res.json()) as { version: string };
    if (compareVersions(version, current) <= 0) return { status: 'latest', version: current };
    return { status: 'available', version, url: location.href, native: false };
  } catch {
    return { status: 'error' };
  }
}
