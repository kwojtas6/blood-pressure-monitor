# Task 3 — Measurement list & dashboard

Depends on: Task 2. Reference: `ai/instructions/bp-monitor-spec.md` §2, §6.

## Goal

Give the user a real view of their history, and finish the dashboard route.

## Scope

1. **`src/components/MeasurementList.tsx`**
   - Chronological list (newest first) of all measurements: date, time, systolic/diastolic/pulse, note if present.
   - Color-coded by WHO category (background or badge, using the colors from spec §5.2) — don't rely on color alone, pair it with the category label text for accessibility.
   - Edit and delete actions per row, wired to the Task 2 form and store.
   - Sorting and basic filtering (e.g. by category, by date range) on the `/history` route.

2. **`/history` route** — full list with filtering/sorting, replacing the Task 2 placeholder.

3. **`/` dashboard route**
   - Quick-entry shortcut (link/button to `/add`).
   - Last 5 measurements (reuse `MeasurementList` in a constrained/compact mode, or a lightweight variant).
   - Mini 7-day chart — a simple placeholder or minimal inline chart is fine here; the full chart component is Task 4 and the dashboard can import it once it exists, scoped to a 7-day range.

## Acceptance criteria

- `/history` shows all stored measurements, correctly sorted, with working filters.
- Category color-coding matches spec §5.2 exactly for a value in each of the 6 bands.
- Edit/delete from the list works and updates IndexedDB + the visible list without a full page reload.
- `/` shows the 5 most recent measurements and a quick-add entry point.
- Empty state (no measurements yet) is handled explicitly, not a blank list.
- Keyboard and screen-reader accessible: list items and actions are reachable and labeled.
- `npm run lint` and `npm run build` pass; manually verified at mobile viewport width.
