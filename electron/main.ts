import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { readdir, readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexHtml = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
  mainWindow.loadURL(indexHtml);
}

app.whenReady().then(createWindow);

ipcMain.handle('select-and-index-vault', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) return [];

  const basePath = path.join(result.filePaths[0], 'Movies');

  async function collectJsonTitles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const results: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await collectJsonTitles(fullPath));
      } else if (entry.isFile() && fullPath.endsWith('.json')) {
        try {
          const data = await readFile(fullPath, 'utf-8');
          const parsed = JSON.parse(data);
          if (parsed?.title) {
            results.push(parsed.title);
          }
        } catch (e) {
          console.warn('Failed to read/parse', fullPath);
        }
      }
    }

    return results;
  }

  return await collectJsonTitles(basePath);
});
