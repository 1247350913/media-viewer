import { contextBridge, ipcRenderer } from "electron";
import type { MediaCard } from "@packages/types";

const api = {
  selectVault: (): Promise<string | null> => ipcRenderer.invoke("vault:select"),
  
  listLevel1All: (contentPath: string): Promise<MediaCard[]> =>
    ipcRenderer.invoke("content:list-level1-all", contentPath),
  
  listFranchise: (card: MediaCard): Promise<MediaCard[]> =>
    ipcRenderer.invoke("content:list-franchise", card),
  
  listSeries: (card: MediaCard): Promise<MediaCard[]> =>
    ipcRenderer.invoke("content:list-series", card),
  
  listSeasonsAndEpisodes: (card: MediaCard): Promise<any> =>
    ipcRenderer.invoke("content:list-seasons-and-episodes", card),
  
  readPoster: (absPath: string): Promise<string | null> =>
    ipcRenderer.invoke("poster:read", absPath),
  
  play: (videoFilePath: string): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke("video:play", videoFilePath),
};

contextBridge.exposeInMainWorld("api", api);

declare global {
  interface Window { api: typeof api; }
}
