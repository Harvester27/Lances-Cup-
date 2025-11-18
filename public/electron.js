const { app, BrowserWindow } = require('electron');
const path = require('path');

// Detekce development vs production módu BEZ electron-is-dev
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: false,
    frame: false,  // Bez rámečku (borderless)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'favicon.ico'),
  });

  // Maximalizovat na celou obrazovku (borderless fullscreen)
  win.maximize();
  
  // Nebo použij setFullScreen pro true fullscreen:
  // win.setFullScreen(true);

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Otevři DevTools v development módu
  if (isDev) {
    win.webContents.openDevTools();
  }

  // F11 pro toggle fullscreen
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      win.setFullScreen(!win.isFullScreen());
    }
    // ESC pro exit z fullscreen
    if (input.key === 'Escape' && input.type === 'keyDown' && win.isFullScreen()) {
      win.setFullScreen(false);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});