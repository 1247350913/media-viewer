import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',              
  build: {
    outDir: 'dist/app',
    assetsDir: 'assets',    
    emptyOutDir: true,
    sourcemap: true, 
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@comps':  path.resolve(__dirname, 'src/components'),
    },
  },
})