import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow | null = null;

/** Setup */
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.commandLine.appendSwitch('remote-debugging-port', '9223');
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const devUrl = process.env.ELECTRON_START_URL; // e.g. http://localhost:5173
  if (devUrl) {
    await win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    await win.loadFile(path.join(__dirname, '../index.html'));
  }
}


/** App lifecycle */
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });


/** Select valid vault folder and return its path */
ipcMain.handle('select-vault', async () => {
  while (true) {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) return null;

    const selectedPath = result.filePaths[0];
    const folderName = path.basename(selectedPath);

    if (folderName === 'Content') return selectedPath;

    await dialog.showMessageBox({
      type: 'warning',
      message: "Wrong folder. Please select the Vault 'Content' folder, or Cancel.",
    });
  }
});

/** Return level 1 array of movies in Content/Movies */
ipcMain.handle('l1-movies', async (_evt, contentPath: string) => {
  const moviesDir = path.join(contentPath, 'Movies');
  const out: Array<{ title: string; year?: number; posterPath?: string }> = [];

  // Level 1: folders in Movies
  const lvl1Entries = fs.readdirSync(moviesDir, { withFileTypes: true })
  // Iterate over level 1
  for (const entry of lvl1Entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(moviesDir, entry.name);
    const dirDetails = await getJsonDetails(dirPath);
    if (dirDetails && dirDetails.title) {
      out.push({ title: dirDetails.title, year: dirDetails.year, posterPath: path.join(dirPath, "poster.webp") });
    }
  }
  // Sort case-insensitive by title
  out.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return out;
});

/** Helpers */

/** Reurn the JSON details from a movie folder */
async function getJsonDetails(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  const jsonFile = files.find(file => file.toLowerCase().endsWith(".json") && !file.startsWith("."));
  if (!jsonFile) { return null; }
  const filePath = path.join(dirPath, jsonFile);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error parsing JSON from file: ${jsonFile}`, error);
    return null;
  }
}
