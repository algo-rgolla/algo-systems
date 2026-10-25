/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    build: {
      // The MUI X Data Grid chunk is ~580 kB (≈170 kB gzip). It is lazy-loaded
      // with the table pages only, so the default 500 kB warning is noise.
      chunkSizeWarningLimit: 650,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      // Pure logic tests (formatting, calculations, demo data); no DOM needed yet.
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
    server: {
      // 5173 is the origin allowed by the API's CORS policy (AllowedOrigins).
      port: 5173,
      strictPort: true,
      // In development, /api is proxied to AlgoSystems.Core.Api so the browser
      // never makes a cross-origin request.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5239',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
