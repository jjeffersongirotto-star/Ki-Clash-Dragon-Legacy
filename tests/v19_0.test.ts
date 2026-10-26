import { describe, expect, it } from 'vitest';
import { APP_VERSION, RELEASES_PAGE, checkForUpdate, compareVersions } from '../src/ui/update';
import pkg from '../package.json';

const reply = (status: number, body: unknown) => (async () => ({ ok: status >= 200 && status < 300, status, json: async () => body })) as unknown as typeof fetch;

describe('v0.19.0 — botão ⟳ de atualização', () => {
  it('a versão do jogo é a do package.json', () => {
    expect(APP_VERSION).toBe(pkg.version);
  });
  it('compara versões (com ou sem "v")', () => {
    expect(compareVersions('0.19.1', '0.19.0')).toBeGreaterThan(0);
    expect(compareVersions('v0.20.0', '0.19.9')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '0.99.99')).toBeGreaterThan(0);
    expect(compareVersions('0.19.0', 'v0.19.0')).toBe(0);
    expect(compareVersions('0.9.0', '0.10.0')).toBeLessThan(0);
  });
  it('app: versão nova em Releases → oferece o APK', async () => {
    const r = await checkForUpdate({ native: true, current: '0.19.0', fetchFn: reply(200, { tag_name: 'v0.19.2', assets: [{ name: 'notas.txt', browser_download_url: 'x' }, { name: 'Ki-Clash-0.19.2.apk', browser_download_url: 'https://exemplo/Ki-Clash-0.19.2.apk' }] }) });
    expect(r).toEqual({ status: 'available', version: '0.19.2', url: 'https://exemplo/Ki-Clash-0.19.2.apk', native: true });
  });
  it('app: versão nova sem APK anexado → abre a página de Releases', async () => {
    const r = await checkForUpdate({ native: true, current: '0.19.0', fetchFn: reply(200, { tag_name: 'v0.20.0', assets: [] }) });
    expect(r).toMatchObject({ status: 'available', url: RELEASES_PAGE });
  });
  it('app: mesma versão ou mais velha → já está atualizado', async () => {
    expect(await checkForUpdate({ native: true, current: '0.19.0', fetchFn: reply(200, { tag_name: 'v0.19.0' }) })).toEqual({ status: 'latest', version: '0.19.0' });
    expect((await checkForUpdate({ native: true, current: '0.19.0', fetchFn: reply(200, { tag_name: 'v0.18.0' }) })).status).toBe('latest');
  });
  it('app: nenhuma versão publicada (404) e falha de rede', async () => {
    expect(await checkForUpdate({ native: true, fetchFn: reply(404, {}) })).toEqual({ status: 'none' });
    expect(await checkForUpdate({ native: true, fetchFn: reply(500, {}) })).toEqual({ status: 'error' });
    const offline = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    expect(await checkForUpdate({ native: true, fetchFn: offline })).toEqual({ status: 'error' });
  });
  it('site: compara com o version.json publicado', async () => {
    (globalThis as unknown as { location: { href: string } }).location = { href: 'https://site/' };
    expect(await checkForUpdate({ native: false, current: '0.19.0', fetchFn: reply(200, { version: '0.19.0' }) })).toEqual({ status: 'latest', version: '0.19.0' });
    expect(await checkForUpdate({ native: false, current: '0.19.0', fetchFn: reply(200, { version: '0.19.1' }) })).toEqual({ status: 'available', version: '0.19.1', url: 'https://site/', native: false });
  });
});
