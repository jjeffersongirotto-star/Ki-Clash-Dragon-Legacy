/**
 * v0.61.0 — Ki-Clash para computador (Electron). Abre o mesmo jogo do site (pasta app/, gerada por `npm run build`)
 * numa janela própria, sem barra de menu. O progresso fica salvo no computador (armazenamento do app).
 * Links para fora (GitHub, download de versão nova) abrem no navegador padrão.
 *
 * v0.64.0 — atualização automática: o jogo pede (preload.cjs) para baixar só os arquivos que mudaram, listados no
 * ota-manifest.json do site. Eles vão para a pasta do usuário (web/<versão>) e o app passa a abrir essa versão.
 * Um instalador mais novo que a versão baixada volta a usar os arquivos que vieram nele.
 */
const { app, BrowserWindow, shell, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');
const nodeCrypto = require('crypto');

const SITE = 'https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/';
const BUNDLED = path.join(__dirname, 'app');
const webRoot = () => path.join(app.getPath('userData'), 'web');
const sha256 = (buf) => nodeCrypto.createHash('sha256').update(buf).digest('hex');
const cmp = (a, b) => {
  const pa = String(a).split('.').map((x) => parseInt(x, 10) || 0);
  const pb = String(b).split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
};

/** Pasta do jogo que abre: a versão baixada, se for mais nova que a do instalador; senão a do instalador. */
function activeDir() {
  try {
    const cur = JSON.parse(fs.readFileSync(path.join(webRoot(), 'current.json'), 'utf8'));
    const dir = path.join(webRoot(), String(cur.version));
    if (cmp(cur.version, app.getVersion()) > 0 && fs.existsSync(path.join(dir, 'index.html'))) return dir;
  } catch {
    /* sem atualização baixada */
  }
  return BUNDLED;
}

/** Apaga versões baixadas que não estão em uso. */
function cleanOld(keep) {
  try {
    for (const d of fs.readdirSync(webRoot())) {
      const p = path.join(webRoot(), d);
      if (d !== 'current.json' && p !== keep) fs.rmSync(p, { recursive: true, force: true });
    }
  } catch {
    /* nada para limpar */
  }
}

async function applyUpdate(win, m) {
  if (!m || m.base !== SITE || !/^\d+\.\d+\.\d+$/.test(String(m.version)) || !Array.isArray(m.files) || !m.files.length) return false;
  const dest = path.join(webRoot(), m.version);
  const tmp = `${dest}.tmp`;
  fs.rmSync(tmp, { recursive: true, force: true });
  const sources = [activeDir(), BUNDLED];
  for (const f of m.files) {
    const name = String(f.file_name || '');
    const hash = String(f.file_hash || '').toLowerCase();
    if (!name || name.includes('..') || name.includes('\\') || path.isAbsolute(name) || !/^[0-9a-f]{64}$/.test(hash)) return false;
    let data = null;
    for (const s of sources) {
      const p = path.join(s, name);
      if (fs.existsSync(p)) {
        const b = fs.readFileSync(p);
        if (sha256(b) === hash) {
          data = b;
          break;
        }
      }
    }
    if (!data) {
      const url = `${SITE}${name.split('/').map(encodeURIComponent).join('/')}?v=${m.version}`;
      const r = await net.fetch(url);
      if (!r.ok) return false;
      data = Buffer.from(await r.arrayBuffer());
      if (sha256(data) !== hash) return false;
    }
    const out = path.join(tmp, name);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, data);
  }
  if (!fs.existsSync(path.join(tmp, 'index.html'))) return false;
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(tmp, dest);
  fs.writeFileSync(path.join(webRoot(), 'current.json'), JSON.stringify({ version: m.version }));
  setTimeout(() => void win.loadFile(path.join(dest, 'index.html')), 50);
  return true;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 800,
    minHeight: 480,
    backgroundColor: '#0b0d1a',
    autoHideMenuBar: true,
    title: 'Ki-Clash Dragon Legacy',
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.cjs') },
  });
  win.removeMenu();
  win.maximize();
  const external = (url) => /^https?:/i.test(url);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (external(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (external(url)) {
      e.preventDefault();
      void shell.openExternal(url);
    }
  });
  // F11 = tela cheia
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    }
  });
  const dir = activeDir();
  cleanOld(dir);
  void win.loadFile(path.join(dir, 'index.html'));
  return win;
}

ipcMain.handle('kiclash:version', () => app.getVersion());
ipcMain.handle('kiclash:ota', async (e, m) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win) return false;
  try {
    return await applyUpdate(win, m);
  } catch {
    return false;
  }
});

// uma janela só: abrir o atalho de novo traz a janela para a frente
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) {
      if (w.isMinimized()) w.restore();
      w.focus();
    }
  });
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
