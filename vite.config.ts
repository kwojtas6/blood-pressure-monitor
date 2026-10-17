import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // `generateSW` (the default) builds the service worker from this
      // config at build time — no hand-rolled SW to keep in sync with the
      // build output (per react-pwa-guidelines.md's "let Vite's build
      // hashing handle cache-busting" rule).
      strategies: 'generateSW',
      // `public/manifest.webmanifest` is hand-authored (spec §8.1 fields)
      // and already copied verbatim into dist/ by Vite; don't have the
      // plugin generate/overwrite a second one.
      manifest: false,
      // Registration is done explicitly via `virtual:pwa-register/react`
      // (see src/components/UpdatePrompt.tsx) so the app can show a visible
      // "update available" prompt instead of the plugin's default inline
      // registration script silently activating a new SW underneath the
      // user.
      injectRegister: false,
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      workbox: {
        // Precache every build output file — including the Task 5 PDF
        // export chunks (jspdf, html2canvas-pro, their shared sub-chunks),
        // which are only ever reached via dynamic import() and would
        // otherwise not be fetched (and so not cached) until a user first
        // visits /export, which must work offline on the very first visit.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // Default is 2 MiB; raised with headroom since jspdf's chunk alone
        // is ~400 KB raw — comfortably under either limit today, but this
        // avoids a silent precache gap if a future dependency bump grows it.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // App-shell navigations (spec §8: "NetworkFirst for navigation
            // requests") — prefer a fresh shell when online, fall back to
            // the precached one offline or on a slow/failed network.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'navigation',
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Static build assets (spec §8: "CacheFirst for static
            // assets") — these are content-hashed by Vite, so a cached
            // response is never stale: a new deploy ships new filenames.
            urlPattern: ({ request }) =>
              ['script', 'style', 'worker', 'font', 'image'].includes(
                request.destination,
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
