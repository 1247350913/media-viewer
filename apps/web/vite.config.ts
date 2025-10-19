import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // optional: cleaner import aliases matching base tsconfig paths
    }
  },
  server: { port: 5174, strictPort: true },
  build: { outDir: '../dist-web', emptyOutDir: true }
});
