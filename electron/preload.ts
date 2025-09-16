import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectVault: () => ipcRenderer.invoke('vault:select'),
  listMovies: (contentPath: string) => ipcRenderer.invoke("movies:list-level1", contentPath),
  readPoster: (absPath: string) => ipcRenderer.invoke("poster:read", absPath)
});
