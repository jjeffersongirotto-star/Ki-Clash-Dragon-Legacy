/**
 * v0.61.0 — Ki-Clash para computador (Electron). Abre o mesmo jogo do site (pasta app/, gerada por `npm run build`)
 * numa janela própria, sem barra de menu. O progresso fica salvo no computador (armazenamento do app).
 * Links para fora (GitHub, download de versão nova) abrem no navegador padrão.
 */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

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
    webPreferences: { contextIsolation: true, sandbox: true },
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
  void win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

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
