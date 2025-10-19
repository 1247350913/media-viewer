import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, constants as fsConsts } from "node:fs";
import * as path from "node:path";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";

import { initAutoUpdates } from "../updater";
import type { MediaCard, MediaKind } from "@packages/types";


let mainWindow: BrowserWindow | null = null;
const execFileP = promisify(execFile);


export function heightToQuality(h?: number): number | "Unknown" {
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

// Helpful flags in dev
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
  app.commandLine.appendSwitch("remote-debugging-port", "9223");
}

function getDevUrl() {
  return (
    process.env.ELECTRON_START_URL ||
    process.env.VITE_DEV_SERVER_URL ||
    "http://localhost:5173"
  );
}

function getRendererIndexHtml() {
  // after `pnpm -w build`, Vite outputs to apps/desktop/renderer/dist
  // We load that file in packaged mode.
  return path.join(__dirname, "../../renderer-dist/index.html");
}

function getPreloadPath() {
  // preload compiled to dist at: electron/dist/preload/index.js
  return path.join(__dirname, "../preload/index.js");
}

async function createWindow() {
  const devUrl = getDevUrl();
  const prodIndexHtml = getRendererIndexHtml();

  const isProdLike =
    app.isPackaged ||
    process.env.FORCE_PROD === "1" ||
    existsSync(prodIndexHtml);

  const winOpts: Electron.BrowserWindowConstructorOptions = {
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    frame: true,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  };

  mainWindow = new BrowserWindow(winOpts);

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  if (isProdLike) {
    await mainWindow.loadFile(prodIndexHtml);
    mainWindow.maximize();
  } else {
    await mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(async () => {
  await createWindow();
  if (app.isPackaged) initAutoUpdates();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});

/* --------------------------- IPC HANDLERS --------------------------- */

ipcMain.handle("vault:select", async () => {
  while (true) {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled || result.filePaths.length === 0) return null;

    const selectedPath = result.filePaths[0];
    const folderName = path.basename(selectedPath);
    if (folderName === "Content") return selectedPath;

    await dialog.showMessageBox({
      type: "warning",
      message: "Wrong folder. Please select the Vault 'Content' folder, or Cancel.",
    });
  }
});

ipcMain.handle("content:list-level1-all", async (_evt, contentPath: string) => {
  let subdirs: import("node:fs").Dirent[] = [];
  try {
    subdirs = (await fsp.readdir(contentPath, { withFileTypes: true })).filter(d => d.isDirectory());
  } catch {
    return [];
  }
  const lists = await Promise.all(subdirs.map(d => listLevel1(path.join(contentPath, d.name))));
  const flat = lists.flat();
  flat.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return flat;
});

ipcMain.handle("content:list-franchise", async (_evt, mediaCard: MediaCard) => {
  if (!mediaCard?.isFranchise) return [];
  return listFranchise(mediaCard);
});

ipcMain.handle("content:list-series", async (_evt, mediaCard: MediaCard) => {
  if (!mediaCard?.isSeries) return [];
  return listSeries(mediaCard);
});

ipcMain.handle("content:list-seasons-and-episodes", async (_evt, mediaCard: MediaCard) => {
  if (mediaCard?.kind !== "show" || !mediaCard.dirPath) return [];
  return listSeasonsAndEpisodes(mediaCard);
});

const posterCache = new Map<string, string>();
ipcMain.handle("poster:read", async (_evt, filePath: string) => {
  if (posterCache.has(filePath)) return posterCache.get(filePath);
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

ipcMain.handle("video:play", async (_evt, videoFilePath: string) => {
  try {
    if (!videoFilePath) throw new Error("No video path provided.");
    const absPath = path.resolve(videoFilePath);
    await fsp.access(absPath, fsConsts.F_OK);
    const errMsg = await shell.openPath(absPath);
    if (errMsg) throw new Error(errMsg);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[video:play] Failed:", msg);
    return { ok: false, error: msg };
  }
});

/* ------------------------ FILESYSTEM HELPERS ------------------------ */
function inferKindFromDir(dirPath: string): MediaKind {
  const base = path.basename(dirPath).toLowerCase();
  if (base === "movies") return "movie";
  if (base === "shows")  return "show";
  return "all";
}
const dedupe = <T,>(arr: T[]) => Array.from(new Set(arr));

function langFromTags(tags: any): string | undefined {
  if (!tags) return;
  const lang = tags.language || tags.LANGUAGE || tags.lang;
  if (typeof lang === "string" && lang.trim()) return lang.trim().toLowerCase();
}

async function probeVideo(videoFilePath: string) {
  const args = ["-v","error","-print_format","json","-show_format","-show_streams","-show_chapters", videoFilePath];
  let json: any | null = null;
  try {
    const { stdout } = await execFileP("ffprobe", args);
    json = JSON.parse(stdout);
  } catch {
    try {
      const { stdout } = await execFileP("ffprobe.exe", args);
      json = JSON.parse(stdout);
    } catch {
      console.warn("[probeVideo] ffprobe not available; returning minimal info.");
      return { videoFilePath };
    }
  }
  const streams: any[] = json?.streams ?? [];
  const format: any = json?.format ?? {};
  const v = streams.find(s => s.codec_type === "video");
  const height: number | undefined = v?.height;
  const videoCodec: string | undefined = v?.codec_name;
  const durStr: string | undefined = format?.duration || v?.duration;
  const runtimeSeconds = durStr ? Number.parseFloat(durStr) : undefined;
  const audios = dedupe(streams.filter(s => s.codec_type === "audio").map(s => langFromTags(s?.tags)).filter(Boolean) as string[]);
  const subs   = dedupe(streams.filter(s => s.codec_type === "subtitle").map(s => langFromTags(s?.tags)).filter(Boolean) as string[]);
  const quality = heightToQuality(height);
  return { videoFilePath, quality, videoCodec, runtimeSeconds, audios, subs };
}

async function getJsonDetails(dirPath: string) {
  const files = await fsp.readdir(dirPath);
  const jsonFile = files.find(f => f.toLowerCase().endsWith(".json") && !f.startsWith("."));
  if (!jsonFile) return null;
  try {
    return JSON.parse(await fsp.readFile(path.join(dirPath, jsonFile), "utf-8"));
  } catch (e) {
    console.error(`[getJsonDetails] parse error: ${jsonFile}`, e);
    return null;
  }
}

async function getVideoDetailsByDir(dirPath: string, exts: string[] = [".mkv", ".mp4"]) {
  const stat = await fsp.stat(dirPath).catch(() => null);
  if (!stat?.isDirectory()) return null;
  const files = (await fsp.readdir(dirPath)).filter(f => !f.startsWith("."));
  const candidates = files.filter(f => exts.includes(path.extname(f).toLowerCase()));
  if (candidates.length !== 1) return null;
  return probeVideo(path.join(dirPath, candidates[0]));
}

/* ----------------------- CONTENT ENUMERATORS ----------------------- */
async function listLevel1(mediaKindPath: string) {
  const mediaKind = inferKindFromDir(mediaKindPath);
  const out: MediaCard[] = [];
  const entries = await fsp.readdir(mediaKindPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(mediaKindPath, entry.name);
    const details = await getJsonDetails(dirPath);
    if (!details?.title) { console.warn(`No valid JSON in: ${entry.name}`); continue; }

    const video = await getVideoDetailsByDir(dirPath);
    if (video) {
      out.push({ kind: mediaKind, ...details, ...video, posterPath: path.join(dirPath, "poster.webp") });
    } else {
      const base: MediaCard = { kind: mediaKind, ...details, posterPath: path.join(dirPath, "poster.webp"), dirPath };
      out.push(mediaKind === "movie" ? { ...base, isSeries: true } : base);
    }
  }

  out.sort((a,b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return out;
}

async function listSeries(mediaCard: MediaCard) {
  const dir = mediaCard.dirPath; if (!dir) return [];
  const out: MediaCard[] = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const d = path.join(dir, entry.name);
    const details = await getJsonDetails(d);
    if (!details?.title) { console.warn(`No valid JSON in: ${entry.name}`); continue; }
    const video = await getVideoDetailsByDir(d);
    if (video) out.push({ kind: mediaCard.kind, ...details, ...video, posterPath: path.join(d, "poster.webp") });
  }

  out.sort((a,b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  return out;
}

async function listSeasonsAndEpisodes(mediaCard: MediaCard) {
  const showDir = mediaCard.dirPath; if (!showDir) return [];
  const seasons: Array<[number, [MediaCard, MediaCard[]]]> = [];
  let count = 0;
  const seasonEntries = await fsp.readdir(showDir, { withFileTypes: true });

  for (const sEntry of seasonEntries) {
    if (!sEntry.isDirectory()) continue;
    const seasonDir = path.join(showDir, sEntry.name);
    const [seasonNumberStr, title] = sEntry.name.split("_");
    const seasonNumber = Number(seasonNumberStr);

    const seasonJson = await getJsonDetails(seasonDir);
    const seasonCard: MediaCard = { title, kind: "show", seasonNumber, ...seasonJson };

    const files = await fsp.readdir(seasonDir, { withFileTypes: true });
    const episodeCards: MediaCard[] = [];

    for (const e of files) {
      const ext = path.extname(e.name).toLowerCase();
      if (ext !== ".mkv" && ext !== ".mp4") continue;

      const [episodeOverallNumberStr, epTitle] = e.name.split("_");
      const episodeOverallNumber = Number(episodeOverallNumberStr);
      const videoFilePath = path.join(seasonDir, e.name);
      episodeCards.push({ title: epTitle, kind: "show", videoFilePath, episodeOverallNumber });
      count++;
    }
    episodeCards.sort((a,b) => (a.episodeOverallNumber ?? 0) - (b.episodeOverallNumber ?? 0));
    episodeCards.forEach((ep, i) => (ep.episodeNumber = i + 1));
    seasons.push([seasonNumber, [seasonCard, episodeCards]]);
  }

  seasons.sort((a,b) => a[0] - b[0]);
  return { numberOfEpisodesObtained: count, seasons };
}

async function listFranchise(mediaCard: MediaCard) {
  const dir = mediaCard.dirPath; if (!dir) return [];
  const out: MediaCard[] = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const d = path.join(dir, entry.name);
    const details = await getJsonDetails(d);
    if (!details) continue;
    const franchiseNumber = Number(entry.name.split("_")[0]);
    out.push({ ...details, kind: mediaCard.kind, posterPath: path.join(d, "poster.webp"), dirPath: d, franchiseNumber });
  }

  out.sort((a,b) => (a.franchiseNumber! - b.franchiseNumber!));
  return out;
}
