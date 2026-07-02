import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built site works from any subdirectory on a static host
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
});
