import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { autoUpdater } from "electron-updater";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join } from "node:path";

import * as path from "path";
import * as fs from "fs";
import * as fsp from "node:fs/promises";

import * as Shared from "../shared";


type MediaCard = Shared.MediaCard;


// ============================ Setup ============================

let mainWindow: BrowserWindow | null = null;
const execFileP = promisify(execFile);

if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.commandLine.appendSwitch('remote-debugging-port', '9223');
}

async function createWindow() {
  const devUrl =
    process.env.ELECTRON_START_URL ||
    process.env.VITE_DEV_SERVER_URL ||
    "http://localhost:5173";

  const indexHtmlPath = path.join(__dirname, "..", "src", "index.html");
  const isProdLike =
    app.isPackaged || process.env.FORCE_PROD === "1" || existsSync(indexHtmlPath);

  const winOpts: Electron.BrowserWindowConstructorOptions = {
    // keep the normal frame so you have the close/min/max controls
    frame: true,
    autoHideMenuBar: false,              // show menu bar on Windows
    show: false,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    ...(isProdLike ? { width: 1280, height: 800 } : { width: 1280, height: 800 }),
  };

  mainWindow = new BrowserWindow(winOpts);

  if (isProdLike) {
    await mainWindow.loadFile(indexHtmlPath);
    // maximize instead of fullscreen so the title bar stays visible
    mainWindow.maximize();
  } else {
    await mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });


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

/** list franchise */
ipcMain.handle("content:list-franchise", async (_evt, mediaCard: MediaCard) => {
  if (!mediaCard || !mediaCard.isFranchise) {
    console.warn("[content:list-franchise] Invalid mediaCard argument:", mediaCard);
    return [];
  }
  const franchiseCards = await listFranchise(mediaCard);
  return franchiseCards;
});

/** list series */
ipcMain.handle("content:list-series", async (_evt, mediaCard: MediaCard) => {
  if (!mediaCard || !mediaCard.isSeries) {
    console.warn("[content:list-series] Invalid mediaCard argument:", mediaCard);
    return [];
  }
  const seriesCards = await listSeries(mediaCard);
  return seriesCards;
});

/** list seasons and episodes */
ipcMain.handle("content:list-seasons-and-episodes", async (_evt, mediaCard: MediaCard) => {
  if (!mediaCard || mediaCard.kind !== "show" || !mediaCard.dirPath) {
    console.warn("[content:list-seasons-and-episodes] Invalid mediaCard argument:", mediaCard);
    return [];
  }
  const rval = await listSeasonsAndEpisodes(mediaCard);
  return rval;
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


// ============================ Server Helpers ============================

// Infer the card kind by the directory
function inferKindFromDir(dirPath: string):Shared.MediaKind {
  const base = path.basename(dirPath).toLowerCase();
  if (base === "movies") return "movie";
  if (base === "shows")  return "show";
  return "all";
}

// Dedeplicate an array
function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// Get the language from tags
function langFromTags(tags: any): string | undefined {
  if (!tags) return undefined;
  const lang = tags.language || tags.LANGUAGE || tags.lang;
  if (typeof lang === "string" && lang.trim()) return lang.trim().toLowerCase();
  return undefined;
}

// Probe a video file for metadata
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

  const quality = Shared.heightToQuality(height);

  return {
    videoFilePath,
    quality,
    videoCodec,
    runtimeSeconds,
    audios,
    subs
  };
}

// Return the JSON details from a movie folder */
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

// Return the mkv details from a "supposed" movie folder */
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

// ============================ Get and Return Data Functions ============================

/** list level1 */
async function listLevel1(mediaKindPath: string) {
  const mediaKind = inferKindFromDir(mediaKindPath);
  const output: Array<MediaCard> = [];

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
          dirPath
        }
        if (mediaKind==="movie") {
          cardDetails = { ...cardDetails, isSeries: true };
        } else {
          console.warn(`Video file not found in folder: ${entry.name}`);
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

/** list series */
async function listSeries(mediaCard: MediaCard) {
  const seriesDirPath = mediaCard.dirPath;
  if (!seriesDirPath) {
    console.warn("[listSeries] mediaCard missing dirPath:", mediaCard);
    return [];
  }
  const output: Array<MediaCard> = [];
  const entries = fs.readdirSync(seriesDirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(seriesDirPath, entry.name);
    const dirDetails = await getJsonDetails(dirPath);
    let cardDetails = <MediaCard>{}
    if (dirDetails && dirDetails.title) {
      const videoDetails = await getvideoDetails(dirPath);
      if (videoDetails) {
        cardDetails = { 
          kind: mediaCard.kind, 
          ...dirDetails, 
          ...videoDetails, 
          posterPath: path.join(dirPath, "poster.webp") 
        };
      } else {
        console.warn(`Video file not found in movie folder: ${entry.name}`);
      }
      output.push(cardDetails);
    } else {
      console.warn(`No valid JSON details found in movie folder: ${entry.name}`);
    }
  }
  output.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return output;
}

/** list seasons and episodes */
async function listSeasonsAndEpisodes(mediaCard: MediaCard) {
  const showDirPath = mediaCard.dirPath;
  if (!showDirPath) {
    console.warn("[listSeasonsAndEpisodes] mediaCard missing dirPath:", mediaCard);
    return [];
  }
  const output: Array<[number,[MediaCard, MediaCard[]]]> = [];
  const seasonEntries = fs.readdirSync(showDirPath, { withFileTypes: true })
  let numberOfEpisodesObtained = 0;

  for (const sEntry of seasonEntries) {
    if (!sEntry.isDirectory()) continue;
    const seasonDirPath = path.join(showDirPath, sEntry.name);
    const [seasonNumberStr, title] = sEntry.name.split("_");
    const seasonNumber = Number(seasonNumberStr);
    let seasonJsonDetails = await getJsonDetails(seasonDirPath);
    let seasonCard = {
      title,
      kind: 'show',
      seasonNumber,
      ...seasonJsonDetails
    }
 
    const episodeEntries = fs.readdirSync(seasonDirPath, { withFileTypes: true })
    const episodeCards: MediaCard[] = [];

    for (const eEntry of episodeEntries) {
      const ext = path.extname(eEntry.name).toLowerCase();
      if (ext !== ".mkv" && ext !== ".mp4") { continue; }

      const [episodeOverallNumberStr, title] = eEntry.name.split("_");
      const episodeOverallNumber = Number(episodeOverallNumberStr);
      let videoFilePath = path.join(seasonDirPath, eEntry.name);
      let episodeCard: MediaCard = {
        title,
        kind: 'show',
        videoFilePath,
        episodeOverallNumber,
      }
      episodeCards.push(episodeCard);
      numberOfEpisodesObtained++;
    }
    episodeCards.sort((a, b) => (a.episodeOverallNumber ?? 0) - (b.episodeOverallNumber ?? 0));
    for (const [idx, epCard] of episodeCards.entries()) {
      epCard.episodeNumber = idx + 1;
    }
    output.push([seasonNumber, [seasonCard, episodeCards]]);
  }
  output.sort((a, b) => a[0] - b[0]);
  return { numberOfEpisodesObtained, seasons: output};
}

/** list franchise */
async function listFranchise(mediaCard: MediaCard) {
  const franchiseDirPath = mediaCard.dirPath;
  if (!franchiseDirPath) {
    console.warn("[listFranchise] mediaCard missing dirPath:", mediaCard);
    return [];
  }
  const output: Array<MediaCard> = [];
  const entries = fs.readdirSync(franchiseDirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(franchiseDirPath, entry.name);
    const dirDetails = await getJsonDetails(dirPath);
    if (!dirDetails) {
      console.warn(`No valid JSON details found in movie folder: ${entry.name}`);
      continue;
    }
    const franchiseNumber = Number(entry.name.split("_")[0]);
    let cardDetails = <MediaCard>{
      ...dirDetails,
      kind: mediaCard.kind,
      posterPath: path.join(dirPath, "poster.webp"), 
      dirPath,
      franchiseNumber
    };
    output.push(cardDetails);
  }
  output.sort((a, b) => { return a.franchiseNumber! - b.franchiseNumber!;})
  return output;
}