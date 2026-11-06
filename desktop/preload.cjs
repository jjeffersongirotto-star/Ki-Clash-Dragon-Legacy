/**
 * v0.64.0 — ponte do jogo com o app de computador: versão instalada e atualização automática
 * (baixar só os arquivos novos do jogo, sem rodar o instalador).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kiclashDesktop', {
  version: () => ipcRenderer.invoke('kiclash:version'),
  applyUpdate: (m) => ipcRenderer.invoke('kiclash:ota', m),
});
