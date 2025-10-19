import react from '@vitejs/plugin-react';
import path from 'node:path'
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';


const root = fileURLToPath(new URL('.', import.meta.url))

// Electron renderer build
export default defineConfig({
  root,
  plugins: [react()],
  base: './',
  build: {
     outDir: path.resolve(__dirname, '../dist/renderer'),
    emptyOutDir: true
  }
});
