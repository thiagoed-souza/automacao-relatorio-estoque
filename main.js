const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    title: "Zeh Motoca-JP - Gestão de Estoque",
    icon: path.join(__dirname, 'icon.png'), // Opcional: ícone do app
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false); // Esconde o menu padrão
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
