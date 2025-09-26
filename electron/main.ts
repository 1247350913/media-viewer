import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as path from "path";
import * as fs from "fs";
import * as fsp from "node:fs/promises";
import type * as Shared from "../shared";

type MediaKind = Shared.MediaKind;
type MediaCard = Shared.MediaCard;

const execFileP = promisify(execFile);
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

function inferKindFromDir(dirPath: string):MediaKind {
  const base = path.basename(dirPath).toLowerCase();
  if (base === "movies") return "movie";
  if (base === "shows")  return "show";
  return "all";
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function heightToQuality(h?: number){
  if (!h) return "Unknown";
  if (h >= 7680) return 4320;  //8K
  if (h >= 3840) return 3840;  //4K
  if (h >= 2160) return 2160;
  if (h >= 1440) return 1440;
  if (h >= 1080) return 1080; 
  if (h >= 720) return 720;  
  if (h >= 480) return 480;
  return "Unknown";
}

function langFromTags(tags: any): string | undefined {
  if (!tags) return undefined;
  const lang = tags.language || tags.LANGUAGE || tags.lang;
  if (typeof lang === "string" && lang.trim()) return lang.trim().toLowerCase();
  return undefined;
}

async function probeVideo(videoFilePath: string) {
  const ffprobeArgs = [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    "-show_chapters",
    videoFilePath,
  ];
  let json: any | null = null;
  try {
    const { stdout } = await execFileP("ffprobe", ffprobeArgs);
    json = JSON.parse(stdout);
  } catch (e) {
    try {
      const { stdout } = await execFileP("ffprobe.exe", ffprobeArgs);
      json = JSON.parse(stdout);
    } catch (e2) {
      console.warn("[probeVideo] ffprobe not available; returning minimal info.");
      return {
        videoFilePath
      };
    }
  }

  const streams: any[] = json?.streams ?? [];
  const format: any = json?.format ?? {};
  
  const v = streams.find((s) => s.codec_type === "video");
  const height: number | undefined = v?.height;
  const videoCodec: string | undefined = v?.codec_name;
  
  const durStr: string | undefined = format?.duration || v?.duration;
  const runtimeSeconds = durStr ? Number.parseFloat(durStr) : undefined;

  const audioStreams = streams.filter((s) => s.codec_type === "audio");
  const audios = dedupe(
    audioStreams
    .map((s) => langFromTags(s?.tags))
    .filter(Boolean) as string[]
  );
  
  const subStreams = streams.filter((s) => s.codec_type === "subtitle");
  const subs = dedupe(
    subStreams
      .map((s) => langFromTags(s?.tags))
      .filter(Boolean) as string[]
  );

  const quality = heightToQuality(height);

  return {
    videoFilePath,
    quality,
    videoCodec,
    runtimeSeconds,
    audios,
    subs
  };
}

/** Return the JSON details from a movie folder */
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

/** Return the mkv details from a "supposed" movie folder */
async function getvideoDetails(dirPath: string,  exts: string[] = [".mkv", ".mp4"]) {
  try {
    const stat = await fsp.stat(dirPath).catch(() => null);
    if (!stat || !stat.isDirectory()) return null;
    
    const files = await fsp.readdir(dirPath);
    const candidates = files
      .filter((f) => !f.startsWith("."))
      .filter((f) => exts.includes(path.extname(f).toLowerCase()));
    if (candidates.length != 1) { return null; }
    const filePath = path.join(dirPath, candidates[0]);
    return probeVideo(filePath);
    } catch (e) {
      console.error("[getVideoDetailsByDir] error:", e);
      return null;
    }
}

/** list-level1 */
async function listLevel1(mediaKindPath: string) {
  const mediaKind = inferKindFromDir(mediaKindPath);
  const output: Array<{ title: string; kind: string; year?: number; posterPath?: string }> = [];

  const lvl1Entries = fs.readdirSync(mediaKindPath, { withFileTypes: true })

  for (const entry of lvl1Entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(mediaKindPath, entry.name);
    const dirDetails = await getJsonDetails(dirPath);
    let cardDetails = <MediaCard>{}
    if (dirDetails && dirDetails.title) {
      const videoDetails = await getvideoDetails(dirPath);
      if (videoDetails) {
        cardDetails = { 
          kind: mediaKind, 
          ...dirDetails, 
          ...videoDetails, 
          posterPath: path.join(dirPath, "poster.webp") 
        };
      } else {
        cardDetails = { 
          kind: mediaKind, 
          ...dirDetails, 
          posterPath: path.join(dirPath, "poster.webp"), 
          ...(mediaKind==="movie" ? { isSeries: true } : {})
        }
      }
      output.push(cardDetails);
    } else {
      console.warn(`No valid JSON details found in folder: ${entry.name}`);
    }
  }
  output.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return output;
}