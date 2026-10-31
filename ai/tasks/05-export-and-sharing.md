# Task 5 — Export & sharing

Depends on: Task 4. Reference: `ai/instructions/bp-monitor-spec.md` §2, §6, §9 (risks).

## Goal

Let the user get their data out to show a doctor, without any of it leaving the device via a network call.

## Scope

1. **Add `jspdf` and `html2canvas-pro`** as dependencies — **not plain `html2canvas`**: it's gone without a stable release since Jan 2022, its README calls it non-production-ready, and it can't parse the `oklch()` colors Tailwind v4 outputs by default, which will break on first real use. Re-verify `html2canvas-pro`'s maintenance status before installing; if it's stalled too, compare `html-to-image`/`modern-screenshot`/`SnapDOM` instead (see spec doc's "PDF export library" note).

2. **`src/utils/pdfExport.ts`**
   - Per the spec's risk note (§9): build a **dedicated, simplified HTML template** for the PDF content rather than screenshotting the live app UI — style this template with plain inline hex/rgb values, not Tailwind utility classes, to sidestep both the oklch-parsing issue and general CSS-fidelity gaps (flex gaps, shadows, custom fonts).
   - Report contents: measurement table (date, time, systolic/diastolic/pulse, category, note), the chart (for the currently selected range), and the stats panel values.
   - Output a downloadable PDF, generated entirely client-side.

3. **`src/components/ExportMenu.tsx`**
   - "Export PDF" action using `pdfExport.ts`.
   - "Share" action using the Web Share API where available (`navigator.share`), passing the generated PDF as a file where supported.
   - Fallback when Web Share API is unavailable: copy a summary to the clipboard, or fall back to a direct file download. Detect support at runtime; don't just try/catch and hope.

4. **`/export` route** — report preview + the export/share actions, replacing the Task 1 placeholder.

## Acceptance criteria

- Generated PDF opens correctly in at least one PDF viewer and contains the table, chart, and stats for the currently selected range.
- No network request is made anywhere in the export/share flow (verify in DevTools → Network while exporting/sharing).
- On a browser without Web Share API support, the fallback (clipboard or download) works and is clearly communicated to the user — no silent no-op.
- Export works fully offline (DevTools → Network → Offline).
- `npm run lint` and `npm run build` pass.
