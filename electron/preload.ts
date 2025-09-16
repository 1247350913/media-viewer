import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectVault: () => ipcRenderer.invoke('vault:select'),
  listLevel1All: (contentPath: string) => ipcRenderer.invoke('content:list-level1-all', contentPath),
  listMovies: (contentPath: string) => ipcRenderer.invoke("movies:list-level1", contentPath),
  readPoster: (absPath: string) => ipcRenderer.invoke("poster:read", absPath)
});
