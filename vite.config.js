import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
      followSymlinks: true,
      ignored: ['!**/node_modules/.vite/**']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      clientPort: 24678
    }
  },
  optimizeDeps: {
    force: true
  }
});