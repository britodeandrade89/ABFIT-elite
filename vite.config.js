import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // CRÍTICO: Gera arquivos na raiz de 'dist' em vez de subpasta 'assets'
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  },
  // CRÍTICO: Define base como './' para caminhos relativos
  base: './',
  server: {
    port: 3000
  }
});