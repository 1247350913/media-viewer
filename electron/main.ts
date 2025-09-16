import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as fsp from "node:fs/promises";

let win: BrowserWindow | null = null;

// ============================ Setup ============================

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


// ============================ Handlers ============================

/** Select valid vault folder and return its path */
ipcMain.handle('vault:select', async () => {
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
ipcMain.handle('movies:list-level1', async (_evt, contentPath: string) => {
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
    } else {
      console.warn(`No valid JSON details found in folder: ${entry.name}`);
    }
  }
  // Sort case-insensitive by title
  out.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return out;
});

/** Poster Handler */
const posterCache = new Map<string, string>();

ipcMain.handle("poster:read", async (_evt, filePath: string) => {
  if (posterCache.has(filePath)) {
    return posterCache.get(filePath);
  }
  try {
    const buf = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === ".webp" ? "image/webp" :
      ext === ".png"  ? "image/png"  :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      "application/octet-stream";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    posterCache.set(filePath, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
});


// ============================ Helpers ============================

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
