import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectAndIndexVault: () => ipcRenderer.invoke('select-and-index-vault'),
});
