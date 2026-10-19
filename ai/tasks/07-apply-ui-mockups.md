# Task 7 — Apply UI mockups

Depends on: Tasks 1–6 (the full app is already implemented and reviewed; this is a visual-design pass over existing, working components — no new features, no change to data/validation/routing logic). Reference: `ai/instructions/ui-mockup-reference.md` (read it first — it has the full color/typography/decision rationale this task just applies) and `ai/instructions/react-pwa-guidelines.md` (accessibility/quality rules still apply — a visual refresh must not regress keyboard nav, labels, or contrast).

## Goal

Bring the implemented app's look in line with `bp_app_ui_mockups.html` (navy/blue branded header bar, card-based layout, pastel WHO badges, pill filters, icon+label nav) without touching the underlying logic, data flow, or routes that are already built and reviewed.

## Scope

1. **Design tokens (`src/index.css`)**
   - Add brand tokens: `--color-brand: #1A3A5C`, `--color-brand-accent: #2E6DA4`, `--color-series-diastolic: #4A90C4`, `--color-series-pulse: #E57C3A`, plus a new inset-surface token (e.g. `--color-surface-inset: #f3f6f5`) and radius tokens `--radius-lg: 16px` / `--radius-md: 10px`.
   - Per Decision 1 in the reference doc: `--color-brand`/`--color-brand-accent` become the new interactive/brand colors. Decide whether to repoint the existing `--color-accent`/`--color-accent-soft` tokens at these new values (simplest — every component already using `accent`/`accent-soft` picks up the new palette automatically) or introduce the brand tokens alongside and migrate call sites. Recommended: repoint `--color-accent` → `--color-brand-accent` and keep `--color-brand` as the distinct, darker "header/primary-button" color — re-run the Task 6 contrast check on anything using the new values (button text on `--color-brand`/`--color-brand-accent`, active nav state) before calling this done.
   - Do not touch `--color-ink`, `--color-muted`, `--color-border`, `--color-border-strong`, `--color-background`, `--color-surface` — these are already WCAG-AA audited (Task 6) and the mockup's neutral scale maps onto them as-is (see reference doc §2).

2. **WHO badge palette (`src/utils/bpClassification.ts` or a new sibling module)**
   - Per Decision 2: keep `CATEGORY_COLORS` (the saturated spec §5.2 hexes) unchanged — they still drive list-item left-borders, chart lines/legend, and anywhere a solid data color is needed.
   - Add a new `CATEGORY_BADGE_STYLES: Record<Category, {bg: string; text: string}>` with all 6 tiers: reuse the mockup's 4 given pairs for `OPTIMAL`/`ELEVATED`/`STAGE_1`/one of `STAGE_2` or `STAGE_3`, and derive the other 2 (`NORMAL`, and whichever stage is left) by interpolating a pastel background + matching dark text in the same visual style (pick values that land at or above 4.5:1 text contrast — check, don't eyeball). Use this new mapping everywhere a badge is rendered (`MeasurementList.tsx`, `Export.tsx`'s report preview) instead of the current implicit styling.

3. **Header bar component (new)**
   - Create `src/components/PageHeader.tsx`: navy (`--color-brand`) background, white title + a lighter white/70%-opacity subtitle line, matching the mockup's per-screen header (e.g. "Dashboard" / "Wednesday, April 26" → use a real current-date greeting on the Dashboard, a static descriptive subtitle on the other 4 routes per the mockup's pattern).
   - Mount it at the top of each route's content (or once in `AppLayout.tsx` if every route's header fits a shared `{title, subtitle}` prop shape) — don't duplicate the markup five times.

4. **Bottom/side nav (`src/components/NavBar.tsx`)**
   - Add a small inline-SVG icon per nav item (home/dashboard, plus/add, list/history, wave/chart, up-arrow/export) alongside the existing label — don't add an icon-font/library dependency.
   - Active-state color switches from the current `text-accent`/`bg-accent-soft` classes to whatever `--color-accent` resolves to after step 1 (no code change needed there if you repointed the token; just verify it visually).

5. **Dashboard (`src/routes/Dashboard.tsx`)**
   - Restyle the "last reading" card to the mockup's big-number treatment (28px systolic in `--color-brand`, 28px diastolic in `--color-brand-accent`, unit + badge alongside, timestamp+pulse caption below) using the real latest measurement from the store — no change to what data is shown, only presentation.
   - Keep the existing `BloodPressureChart` for the 7-day mini-chart; style tweaks only if needed to match the mockup's thinner/simpler look (e.g. hide axis labels at this small size) — don't fork a second chart implementation.

6. **Add form (`src/components/MeasurementForm.tsx`)**
   - Visually restyle the 3 numeric fields to the mockup's large-value card treatment (bigger font-size on the `<input>`, unit suffix, min/max caption beneath) while keeping them as real `<input type="number">` elements with their existing `<label>`/`aria-describedby`/validation wiring untouched (Decision 3 — do not replace with a custom tap-to-edit widget).
   - Add the live WHO-classification success banner (pastel background from the new badge palette, checkmark, "Blood pressure: {category} ({systolic}/{diastolic})") shown once the form's current values validate — compute it with the existing `bpClassification` util, don't duplicate the classification logic.

7. **History (`src/routes/History.tsx`, `src/components/MeasurementList.tsx`)**
   - Add a pill-style filter row (All / 7d / 30d / 90d) visually matching the mockup, wired to the existing `dateRange.ts` filter state already built in Task 3 — restyle the existing `<Select>`-based filter or replace its visual treatment with pills bound to the same state, don't duplicate the filtering logic.
   - Restyle list rows and badges per the new `CATEGORY_BADGE_STYLES`.

8. **Chart (`src/routes/Chart.tsx`, `src/components/BloodPressureChart.tsx`, `src/components/StatsPanel.tsx`)**
   - Same pill-row treatment for the date-range selector as History.
   - Apply `--color-brand` (systolic), `--color-series-diastolic`, `--color-series-pulse` to the three chart lines (currently `src/utils/series.ts` defines per-metric colors — update them there, the single source, not in the chart component).
   - Restyle `StatsPanel`'s layout toward the mockup's 3-box average grid + metric rows, keeping its existing props/computation.

9. **Export (`src/routes/Export.tsx`, `src/components/ExportMenu.tsx`)**
   - Per Decision 5: add "Copy data" as a visible third action (icon-chip + title + description, matching PDF/Share) that copies a plain-text table of the currently-selected measurements to the clipboard — reuse whatever summary-building logic `ExportMenu.tsx` already has for its Web-Share-unavailable clipboard fallback rather than writing a second implementation.
   - Restyle the report-preview card to the mockup's 3-stat-box layout using the fixed average/minimum/maximum color roles from the reference doc §2 (not `CATEGORY_COLORS` — these are a different, fixed semantic coding).
   - Leave `src/utils/pdfExport.ts`'s actual PDF template as-is unless you want the generated PDF to visually match too (optional, not required by this task — flag it as a follow-up if desired, don't silently reskin the PDF as a side effect of restyling the live preview).

10. **Copy/translation.** Per Decision 4: translate the mockup's Polish strings to English equivalents consistent with the app's existing copy style (e.g. "Dzień dobry" → a time-of-day greeting or just "Dashboard", "Zapisz pomiar" → "Save measurement", "Wszystkie" → "All", "Kopiuj dane" → "Copy data"). Don't introduce mixed-language strings.

## Constraints

- No changes to routing, store shape, validation ranges, WHO classification math, PDF generation logic, or service worker config — this is strictly a presentation-layer pass over already-reviewed code.
- Re-verify contrast (WCAG AA, 4.5:1 text / 3:1 UI boundaries) for every new color combination introduced here (brand buttons, new badge palette, active nav state) the same way Task 6 did — don't assume "looks fine" is "is fine."
- `npm run lint` and `npm run build` must pass; check the gzip bundle size hasn't meaningfully regressed (new SVG icons/CSS should be negligible).
- Manually verify in a real browser once done — this is exactly the kind of change (visual, interactive) that code review alone can't confirm.

## Acceptance criteria

- All 5 routes visually match the mockup's structure and color language (header bar, cards, badges, pills, nav icons) while keeping every existing behavior (validation, filtering, export, offline operation) working exactly as before.
- All 6 WHO categories have a distinct, contrast-checked badge style — not just the 4 the mockup showed.
- Keyboard navigation, screen-reader labels, and focus states are unchanged or improved, never regressed, from the pre-restyle implementation.
- No new runtime dependency was added for icons or styling.
