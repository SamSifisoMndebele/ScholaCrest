import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://scholacrest-edge-api.sams-mndebele.workers.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
