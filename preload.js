// preload.js - Bezpečné API mezi Electron main a renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Exponovat bezpečné API do window objektu
contextBridge.exposeInMainWorld('electronAPI', {
  // Uložení souboru
  saveFile: async (filename, data) => {
    return await ipcRenderer.invoke('save-file', filename, data);
  },
  
  // Načtení souboru
  loadFile: async (filename) => {
    return await ipcRenderer.invoke('load-file', filename);
  },
  
  // Kontrola existence souboru
  fileExists: async (filename) => {
    return await ipcRenderer.invoke('file-exists', filename);
  },
  
  // Zavření aplikace
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
  
  // Info o platformě
  platform: process.platform,
  isElectron: true
});
