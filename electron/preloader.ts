import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectAndIndexVault: async (): Promise<string[]> => {
    return await ipcRenderer.invoke('select-and-index-vault');
  },
});
