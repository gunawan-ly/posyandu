import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // PWA: app shell ter-precache agar aplikasi tetap terbuka saat offline;
    // API Supabase (domain eksternal) sengaja TIDAK di-cache (data sensitif).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png', 'fonts/ibm-plex-sans-latin.woff2'],
      manifest: {
        name: 'Posyandu Wapalo — Sistem Informasi Posyandu Digital',
        short_name: 'Posyandu',
        description:
          'Pencatatan data balita & kunjungan posyandu, pemantauan tumbuh kembang, dan kalkulator status gizi berbasis standar WHO.',
        lang: 'id',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // expose agar dapat diakses via preview URL (Daytona)
    port: 5173,
    strictPort: true,
  },
})
