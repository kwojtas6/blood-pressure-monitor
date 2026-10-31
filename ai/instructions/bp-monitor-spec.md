# Blood Pressure Monitor — Product & Architecture Spec

Source: `specyfikacja_bp_pwa.docx` (v1.0, 2026-04-26). This is the stable reference for *what* the app is; `ai/tasks/` breaks it into actionable work. Deviations from the source doc, and why, are called out explicitly below.

## 1. Overview

A tool for individuals to regularly monitor their blood pressure — particularly people with hypertension or other cardiovascular conditions requiring systematic tracking of vital signs.

All data is stored **locally in the browser (IndexedDB)** — no account, no server. The app is a PWA: installable on a phone's home screen and fully usable offline.

**Goals:**
- Fast, convenient logging of systolic, diastolic, and pulse readings.
- Clear visual presentation of historical data.
- PDF export suitable for showing a doctor.
- Sharing results via other channels (Web Share API, clipboard).
- Full offline operation, like a native mobile app.

**Target users:** people with hypertension under regular monitoring, post-heart-attack/cardiovascular patients, caregivers tracking a relative's readings, and people tracking blood pressure preventively.

## 2. Feature scope

| Module | Feature | Detail |
|---|---|---|
| Data entry | Measurement form | Fields: systolic (mmHg), diastolic (mmHg), pulse (bpm), optional note, date/time (auto-filled, editable) |
| Data entry | Validation | Systolic 60–250 mmHg, diastolic 40–150 mmHg, pulse 30–200 bpm. Inline error messages. |
| Data entry | Edit / delete | Edit or delete a saved measurement from the list |
| Data view | Measurement list | Chronological list with date, time, values. Color-coded by WHO category. |
| Data view | Line chart | Recharts chart, separate lines for systolic/diastolic/pulse. Date-range filter: 7 / 30 / 90 days / all. |
| Data view | Stats | Mean, min, max per parameter for the selected period |
| Export | PDF export | Report with measurement table, chart, and stats — print/send ready |
| Export | Sharing | Web Share API (native share sheet on mobile); fallback: copy to clipboard or file download |
| PWA | Installation | Manifest + service worker for "add to home screen" (iOS Safari, Android Chrome) |
| PWA | Offline mode | Full read/write functionality with no network connection |

## 3. Stack

| Layer | Choice | Deviation from source spec |
|---|---|---|
| Framework | React 19 + TypeScript `^7.0.2` | Source doc specified React 18; this repo already has React 19 installed, which is a superset-compatible, actively supported version — kept as-is. **TypeScript is newly adopted** (repo started as plain JSX) per explicit decision to follow the spec's type-safety rationale for medical data. Shipped as `^7.0.2`, newer than originally assumed — fine, same recommendation to stay current. |
| Bundler / dev | Vite | Already in place |
| Styling | Tailwind CSS **v4** | New dependency. v4 uses the `@tailwindcss/vite` plugin and CSS-first config (`@import "tailwindcss"` + `@theme`), not `tailwind.config.js` + PostCSS. It also outputs colors as `oklch()` by default — see the PDF export row below. |
| UI components | shadcn/ui (Radix-based, accessible) | New dependency. Current shadcn/ui is built for Tailwind v4 + React 19 (no `forwardRef`, `data-slot` attributes). |
| Charts | Recharts **`^3.10.1`** | New dependency. Source spec said v2; v3 supports React 16.8–19 without the `react-is` version-override workaround v2 needs. Pin `immer` to ≥11.0.1 (a transitive dep) — 3.6+ hits a known React 19 crash on immer 11.0.0. Shipped as `^3.10.1`, newer than originally assumed — fine, same recommendation to stay current. |
| Local database | Dexie.js (IndexedDB wrapper) | New dependency |
| State management | Zustand | New dependency |
| PDF export | jsPDF + **`html2canvas-pro`** (not `html2canvas`) | New dependency. See "PDF export library" note below. |
| PWA | vite-plugin-pwa (Workbox) `^2.0.0` | New dependency. Originally noted as requiring "≥1.3.0" for official Vite 8 support; shipped as `^2.0.0`, ahead of that floor — fine, same recommendation to stay current. |
| Routing | `react-router` (not `react-router-dom`) `^8.4.0` | New dependency. v7+ recommends the unified package for new projects; `react-router-dom` is kept only for v6-era compatibility. Shipped as `^8.4.0` (not v7-era as originally noted) — fine, same recommendation to stay current. |
| Testing | _Not implemented_ | Originally planned as Vitest + Testing Library, but no test files exist anywhere in `src/` in this implementation — this is a real gap, not a silent omission, and should be picked up by whoever works on this project next. |
| Linting | `oxlint` (already configured) | Kept as-is; add TS-aware lint rules as needed |

### PDF export library — do not use plain `html2canvas`

`html2canvas` has not had a stable release since January 2022 and its own README still calls it experimental / not production-ready. It also cannot parse `oklch()` color values — which is Tailwind v4's **default** color output format — so any Tailwind-styled element passed to it throws `Attempting to parse an unsupported color function "oklch"` at export time. This isn't a corner case, it's the default path.

Use **`html2canvas-pro`** (an actively maintained fork with `oklch`/`lab`/modern-CSS support) instead, and keep the PDF export template's own styles as plain inline hex/rgb (not Tailwind classes) regardless, to minimize rendering-fidelity surprises. If `html2canvas-pro`'s maintenance status has changed by the time Task 5 is implemented, re-check before committing to it — this corner of the ecosystem moves fast; `html-to-image`/`modern-screenshot`/`SnapDOM` are newer alternatives worth a quick comparison if so.

## 4. Target project structure

```
blood-pressure-monitor/
├── public/
│   ├── manifest.webmanifest
│   └── icons/                     # PWA icons, 72–512px
├── src/
│   ├── components/
│   │   ├── MeasurementForm.tsx
│   │   ├── MeasurementList.tsx
│   │   ├── BloodPressureChart.tsx
│   │   ├── StatsPanel.tsx
│   │   └── ExportMenu.tsx
│   ├── db/
│   │   └── dexie.ts                # IndexedDB schema + operations
│   ├── store/
│   │   └── useMeasurements.ts      # Zustand store
│   ├── utils/
│   │   ├── bpClassification.ts     # WHO classification logic
│   │   └── pdfExport.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── package.json
```

## 5. Data model

### Measurement

| Field | Type | Notes |
|---|---|---|
| `id` | `number` | Auto-increment, IndexedDB primary key |
| `systolic` | `number` | mmHg, range 60–250 |
| `diastolic` | `number` | mmHg, range 40–150 |
| `pulse` | `number` | bpm, range 30–200 |
| `timestamp` | `Date` | Auto-filled at entry, editable |
| `note` | `string \| undefined` | Optional, max 500 chars |
| `category` | `string` | Auto-derived WHO category (e.g. `OPTIMAL`, `STAGE_1`) |

### WHO blood pressure classification

Category is derived from whichever of systolic/diastolic falls into the *more severe* band.

| Category | Systolic | Diastolic | UI color |
|---|---|---|---|
| Optimal | < 120 mmHg | < 80 mmHg | Green `#22C55E` |
| Normal | 120–129 mmHg | < 80 mmHg | Yellow-green `#84CC16` |
| Elevated | 130–139 mmHg | 80–89 mmHg | Yellow `#EAB308` |
| Hypertension stage 1 | 140–159 mmHg | 90–99 mmHg | Orange `#F97316` |
| Hypertension stage 2 | 160–179 mmHg | 100–109 mmHg | Red `#EF4444` |
| Hypertension stage 3 | ≥ 180 mmHg | ≥ 110 mmHg | Dark red `#991B1B` |

## 6. Views & routing

Bottom navigation bar on mobile, side menu on desktop.

| Route | View |
|---|---|
| `/` | Dashboard — quick-entry shortcut + last 5 measurements + mini 7-day chart |
| `/add` | Add/edit measurement form |
| `/history` | Full historical list, filterable and sortable |
| `/chart` | Line chart with stats panel and date-range selector |
| `/export` | Export view: PDF, sharing, report preview |

## 7. Non-functional requirements

**Performance**
- First Contentful Paint < 1.5s on 4G
- Bundle size < 300 KB gzipped (route-level code splitting)
- Lighthouse Performance score ≥ 90
- Lighthouse PWA score = 100

**Security & privacy**
- All data stored locally only (IndexedDB) — no transmission to any server
- No analytics, trackers, or external network dependencies
- Content Security Policy (CSP) HTTP headers
- Exported PDFs never leave the user's device

**Known tension — CSP vs. shadcn/ui:** Radix UI (which shadcn/ui is built on) positions popovers/dialogs/tooltips via inline `style` attributes computed at render time, which requires `style-src 'unsafe-inline'` in the CSP (a nonce/hash isn't practical for per-render values). This is a deliberate, low-risk tradeoff to make explicitly in Task 6 — `style-src unsafe-inline` doesn't carry the script-injection risk `script-src unsafe-inline` does — not something to discover during the CSP audit.

**Accessibility**
- WCAG 2.1 AA
- Full keyboard operability
- ARIA labels on all form controls
- Minimum color contrast 4.5:1

**Browser support**
- Chrome/Chromium ≥ 90 (Android + desktop)
- Safari ≥ 14 (iOS + macOS, including PWA "Add to Home Screen")
- Firefox ≥ 90 (desktop)
- Edge ≥ 90

## 8. PWA configuration

**Web App Manifest**
- `name`: "Monitor Ciśnienia Krwi"
- `short_name`: "BP Monitor"
- `display`: `standalone`
- `theme_color`: `#1A3A5C`
- `background_color`: `#F0F4F8`
- Icons: 192×192 and 512×512 PNG (required by browsers/stores), plus a maskable icon

**Service worker (Workbox via vite-plugin-pwa)**
- Cache strategy: `NetworkFirst` for navigation requests, `CacheFirst` for static assets
- Precache all bundle files on SW install
- Offline: full functionality, no network dependency for core flows
- Update flow: notify the user when a new version is available (see `ai/instructions/react-pwa-guidelines.md`)

## 9. Known risks (carry into implementation)

| Risk | Priority | Mitigation |
|---|---|---|
| Data loss if browser storage is cleared | High | PDF export as backup; in-app messaging about the risk |
| No cross-device sync | Medium | In-UI messaging; JSON import/export as a workaround |
| Web Share API unavailable on some platforms | Low | Fallback to clipboard copy or direct file download |
| PWA "Add to Home Screen" limited on iOS Safari | Low | In-app install instructions (Share icon → "Add to Home Screen") |
| html2canvas renders some CSS inaccurately | Medium | Use a dedicated, simplified HTML template for PDF rendering, not a screenshot of the live UI |

## 10. Out of scope for v1 (possible v2 extensions)

Backend sync (Supabase/Firebase), push reminders (Background Sync + Notifications API), JSON import/export for backup, multi-user/profile support, Bluetooth BP device integration (Web Bluetooth API), i18n (en/pl), dark mode, Android lock-screen widget. Do not build toward these speculatively — see `ai/instructions/react-pwa-guidelines.md` on avoiding premature abstraction.
