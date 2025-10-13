import { app } from "electron";
import { autoUpdater } from "electron-updater";

// Tune behavior
autoUpdater.autoDownload = true;           //download as soon as update is found
autoUpdater.autoInstallOnAppQuit = true;   //install on quit if not already installed
autoUpdater.allowPrerelease = false;       //no preRelease

// Wire basic logs
function log(...args: any[]) { console.log("[updater]", ...args); }
function warn(...args: any[]) { console.warn("[updater]", ...args); }
function err(...args: any[]) { console.error("[updater]", ...args); }

export function initAutoUpdates() {
  if (!app.isPackaged) { log("dev mode: skipping auto-updates"); return; }

  // Override the feed at runtime uncomment:
  // autoUpdater.setFeedURL({ provider: "generic", url: "https://s3.us-central-1.wasabisys.com/<your-bucket>" });

  // 1) First check shortly after app is ready (give the app a moment to settle)
  setTimeout(() => {
    log("initial checkForUpdatesAndNotify()");
    autoUpdater.checkForUpdatesAndNotify().catch(err);
  }, 3000);
  
}