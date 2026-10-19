# Task 4 — Chart & stats

Depends on: Task 3. Reference: `ai/instructions/bp-monitor-spec.md` §2, §6.

## Goal

Visualize trends over time and summarize them numerically.

## Scope

1. **Add Recharts v3.7+** as a dependency (not v2 — v3 supports React 19 natively without the `react-is` override v2 needs). If `immer` gets pulled in transitively below 11.0.1, pin/override it — Recharts 3.6+ hits a known React 19 crash on immer 11.0.0.

2. **`src/components/BloodPressureChart.tsx`**
   - Line chart with three separate lines: systolic, diastolic, pulse.
   - Date-range filter: 7 days / 30 days / 90 days / all.
   - Responsive: legible and usable at mobile width, not just desktop.
   - Accessible fallback: don't make the chart the *only* way to get the data — the list/table already covers that; make sure the chart itself has a text alternative (e.g. an `aria-label` summarizing the trend, or a visually-hidden data table) rather than being a pure `<canvas>`/SVG black box.

3. **`src/components/StatsPanel.tsx`**
   - Mean, min, max for systolic, diastolic, and pulse over the currently selected date range.
   - Updates reactively when the chart's date-range filter changes (shared filter state between the two, e.g. lifted into the `/chart` route or a small local context).

4. **`/chart` route** — combine `BloodPressureChart` + `StatsPanel` + the range selector, replacing the Task 1 placeholder.

5. **Dashboard mini-chart** — swap the Task 3 placeholder mini-chart for `BloodPressureChart` scoped to the last 7 days (no range selector needed there).

## Acceptance criteria

- Chart renders correctly with 0, 1, and many data points (no crash on empty/sparse data).
- Switching the date-range filter updates both the chart and the stats panel to the same range.
- Stats values are arithmetically correct for a hand-checked sample dataset.
- Chart is usable at mobile viewport width (no horizontal overflow, legible labels).
- `npm run lint` and `npm run build` pass.
