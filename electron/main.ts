import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as path from "path";
import * as fs from "fs";
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

/** level1-all */
ipcMain.handle('content:list-level1-all', async (_evt, contentPath: string) => {
  let subdirs: import("node:fs").Dirent[] = [];
  try { 
    subdirs = (await fsp.readdir(contentPath, { withFileTypes: true })).filter(e => e.isDirectory());
  } catch {
    return [];
  }
  const lists = await Promise.all( subdirs.map(d => listLevel1(path.join(contentPath, d.name))) );
  const flat = lists.flat();
  flat.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return flat;
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

/** Play Handler */
ipcMain.handle("video:play", async (_evt, videoFilePath: string) => {
  try {
    if (!videoFilePath || typeof videoFilePath !== "string") {
      throw new Error("No video path provided.");
    }
    const absPath = path.resolve(videoFilePath);
    await fsp.access(absPath, fs.constants.F_OK);  //ensure the file exists before trying to open it
    const errMsg = await shell.openPath(absPath);  //opens with the system's default app for the file type
    if (errMsg) throw new Error(errMsg);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[video:play] Failed:", msg);
    return { ok: false, error: msg };
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

/** get medaKind */
function inferKindFromDir(dirPath: string): "movies" | "shows" | "docs" | "other" {
  const base = path.basename(dirPath).toLowerCase();
  if (base === "movies") return "movies";
  if (base === "shows")  return "shows";
  if (base === "docs" || base === "documentaries") return "docs";
  return "other";
}

/** list-level1 */
async function listLevel1(mediaKindPath: string) {
  const kind = inferKindFromDir(mediaKindPath);
  const out: Array<{ title: string; kind: string; year?: number; posterPath?: string }> = [];

  const lvl1Entries = fs.readdirSync(mediaKindPath, { withFileTypes: true })

  for (const entry of lvl1Entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(mediaKindPath, entry.name);
    const dirDetails = await getJsonDetails(dirPath);
    if (dirDetails && dirDetails.title) {
      out.push({ title: dirDetails.title, kind, year: dirDetails.year, posterPath: path.join(dirPath, "poster.webp") });
    } else {
      console.warn(`No valid JSON details found in folder: ${entry.name}`);
    }
  }

  out.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return out;
}