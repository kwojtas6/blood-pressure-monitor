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
        // App-shell navigations: Workbox registers a `NavigationRoute` for
        // `navigateFallback`, and its router matches the *first* route that
        // applies to a given request — so this always wins over any
        // runtime-caching entry for navigations, no matter how that entry
        // is configured. In effect, navigations are served precache-first
        // (falling back to `/index.html` from the precache when a URL
        // isn't itself precached), which is a deliberate choice: it
        // guarantees a reliable offline shell on first load (spec §8's
        // offline requirement) rather than optimizing for "freshest
        // content first". It is NOT a `NetworkFirst`/network-preferred
        // strategy, regardless of what a runtime-caching entry here might
        // claim — do not add a navigation `runtimeCaching` entry expecting
        // it to run; it won't.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
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
      // jsPDF 4.2.1 lists `html2canvas`, `canvg`, and `dompurify` as
      // `optionalDependencies` and dynamically `import()`s them to support
      // `jsPDF.prototype.html()`/`.addSvgAsImage()` — APIs this app never
      // calls (it renders via `html2canvas-pro` and only ever uses
      // `addImage`/`output`, see `src/utils/pdfExport.ts`). Rollup still
      // code-splits those dynamic imports into their own chunks at build
      // time regardless of whether the branch runs, shipping ~290KB+ raw
      // of dead weight (plain `html2canvas` among them, which the project
      // otherwise avoids in favor of `html2canvas-pro` for its oklch()
      // support) to every user who exports/shares a PDF. Aliasing them to
      // a tiny stub keeps jsPDF's code intact while eliminating those
      // chunks; see `src/stubs/unused-jspdf-optional-dep.ts` for the
      // defensive throw-if-ever-called guard.
      html2canvas: path.resolve(
        import.meta.dirname,
        './src/stubs/unused-jspdf-optional-dep.ts',
      ),
      canvg: path.resolve(
        import.meta.dirname,
        './src/stubs/unused-jspdf-optional-dep.ts',
      ),
      dompurify: path.resolve(
        import.meta.dirname,
        './src/stubs/unused-jspdf-optional-dep.ts',
      ),
    },
  },
})
