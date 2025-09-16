import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectVault: () => ipcRenderer.invoke('select-vault'),
  listMovies: (contentPath: string) => ipcRenderer.invoke("l1-movies", contentPath),
});
