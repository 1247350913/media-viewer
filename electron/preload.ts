import { contextBridge, ipcRenderer } from 'electron';
import { type MediaCard } from "../shared/types";

contextBridge.exposeInMainWorld('api', {
  selectVault: () => ipcRenderer.invoke('vault:select'),
  listLevel1All: (contentPath: string) => ipcRenderer.invoke('content:list-level1-all', contentPath),
  listSeries: (mediaCard: MediaCard) => ipcRenderer.invoke('content:list-series', mediaCard),
  listSeasonsAndEpisodes: (mediaCard: MediaCard) => ipcRenderer.invoke('content:list-seasons-and-episodes', mediaCard),
  readPoster: (absPath: string) => ipcRenderer.invoke("poster:read", absPath),
  play: (videoFilePath: string) => ipcRenderer.invoke("video:play", videoFilePath)
});
