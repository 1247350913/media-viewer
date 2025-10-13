import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',              
  build: {
    outDir: 'dist/src',
    assetsDir: 'assets',    
    emptyOutDir: true,      
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
})