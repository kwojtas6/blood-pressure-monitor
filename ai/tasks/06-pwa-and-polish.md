# Task 6 — PWA & polish

Depends on: Task 5. Reference: `ai/instructions/bp-monitor-spec.md` §7–8, `ai/instructions/react-pwa-guidelines.md`.

## Goal

Turn the finished app into an installable, offline-capable PWA, and close out the non-functional requirements (performance, a11y, security headers).

## Scope

1. **Add `vite-plugin-pwa`** (≥1.3.0 — the first version with official Vite 8 support; this repo is already on Vite 8.3.4) and configure it in `vite.config.ts`.

2. **Manifest** (`public/manifest.webmanifest`)
   - `name`: "Monitor Ciśnienia Krwi", `short_name`: "BP Monitor"
   - `display: "standalone"`, `theme_color: "#1A3A5C"`, `background_color: "#F0F4F8"`
   - Icons: 192×192 and 512×512 PNG, plus a maskable icon, under `public/icons/`.

3. **Service worker (Workbox config via vite-plugin-pwa)**
   - `NetworkFirst` for navigation requests, `CacheFirst` for static assets.
   - Precache the full app bundle on install.
   - Verify the app's core flows (log a reading, view history/chart, export) work with zero network connectivity.
   - Update flow: when a new SW version is waiting, show a visible "update available" prompt that lets the user refresh — don't silently activate underneath them (see `react-pwa-guidelines.md`).

4. **Security headers** — add a Content-Security-Policy appropriate for a fully client-side app with no external network calls (confirm how this repo's host/deploy target applies headers — e.g. a `_headers` file, hosting config, or meta tag CSP if headers aren't otherwise configurable). Expect to need `style-src 'unsafe-inline'` for Radix/shadcn-ui's runtime-computed positioning styles (see spec doc §7.2) — this is a deliberate, documented exception, not an oversight to "fix" by removing it.

5. **Accessibility audit** — run an automated audit (Lighthouse/axe) across all 5 routes and fix findings against WCAG 2.1 AA: keyboard traps, missing labels, contrast ratios below 4.5:1.

6. **Performance pass**
   - Route-level code splitting (React Router lazy routes) to help hit the < 300 KB gzipped bundle target.
   - Check Lighthouse Performance and PWA scores; address anything blocking Performance ≥ 90 / PWA = 100.

7. **Install instructions in-app** — per the known iOS Safari limitation (spec §9 risks), add a brief in-app note on how to "Add to Home Screen" via the Share icon, shown to iOS Safari users.

## Acceptance criteria

- Lighthouse PWA score = 100; installable checklist passes (manifest linked, SW registered, HTTPS/localhost, icons present).
- Lighthouse Performance score ≥ 90 on at least the `/` and `/history` routes.
- Production bundle is < 300 KB gzipped (check with `npm run build` output / a bundle analyzer).
- With DevTools → Network → Offline: app loads, and logging/viewing/exporting a measurement all work.
- Visiting after a new deploy shows the update prompt rather than silently serving stale or mixed content.
- No `console.log`/`debugger` left in anywhere in the codebase.
- `npm run lint` and `npm run build` pass.
