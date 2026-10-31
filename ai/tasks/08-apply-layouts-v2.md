# Task 8 — Apply layouts v2 (Dashboard, Add form, History)

Depends on: Task 7. Reference: `ai/instructions/ui-mockup-reference.md` **§6** (screen structure, token table with contrast numbers, and the resolved decisions this task applies). `ai/instructions/react-pwa-guidelines.md` still applies.

## Goal

Bring `/`, `/add` and `/history` in line with the three v2 mockups (`Downloads/files/01-dashboard.html`, `02-formularz.html`, `03-historia.html`). Unlike Task 7 this adds a few small features the mockups show (stepper buttons, search, day grouping, paging, averages), but it doesn't change routing, store shape, validation ranges, WHO classification or PDF generation.

## Scope

1. **Tokens (`src/index.css`):** move the neutral scale to the values in reference §6.2 (background, inset surface, ink, muted, borders, `--radius-lg: 14px`). Use the darkened `--color-muted` / `--color-border-strong`, not the mockup's failing grays.
2. **Shared pieces:**
   - `PageHeader`: optional `leading` / `trailing` action slots (a row above the title when `leading` is set, otherwise `trailing` sits level with the title) and `children` under the subtitle. Add an exported `HeaderButton` for the small white text actions.
   - `CategoryBadge`: one component for the pastel WHO pill.
   - `MeasurementRow`: the divided-list row (accent bar in the badge's text color, values, caption, optional note, badge, optional chevron + link to `/add/:id`). It replaces `MeasurementList`, which gets removed.
   - `AverageStats`: three rounded-mean boxes, `inset` (gray, inside a card) or `raised` (white, on the page) tone. Built on `computeAllStats`; `StatsPanel` stays as it is for `/chart` and `/export`.
   - `utils/formatDate.ts`: relative day ("today" / "yesterday" via `Intl.RelativeTimeFormat`), time, day heading, day key, greeting, full date.
   - `BloodPressureChart`: optional `seriesKeys` prop (the dashboard draws systolic + diastolic only); circle legend icons.
   - Button variants: `outline` (accent border + text) and size `lg` (full-width 48px).
   - `DateRangePills`: visible labels "7 days" / "30 days" / "90 days" / "All".
3. **Dashboard:** greeting header, last-reading card, 7-day trend, 7-day averages card (only when there's data in the last 7 days), "+ Add measurement", recent-entries card (5 rows, read-only) with a "View all history" link.
4. **Add/edit form:** header Back (`navigate(-1)`, or `/` on a direct load) and Cancel (`/history`); stepper fields per §6.3 (2); date row with "Change" (`showPicker()` with a focus fallback); note placeholder; category-aware banner per §6.3 (3) inside a polite live region; full-width Save / outlined Cancel; in edit mode a "Delete measurement" button.
5. **History:** header count + "last <relative day>" subtitle, "Filter" toggle for the category panel, search box (matches note, `systolic/diastolic`, and several date spellings, case-insensitive), range pills, `AverageStats` over the filtered set, day groups with the sort toggle on the first heading, rows that link to edit, a tap hint, and "Load earlier/later measurements" paging (20 rows per page).

## Constraints

- Don't add new runtime dependencies. Icons stay inline SVG in `icons.tsx` (add minus, chevrons, search, alert, sort).
- Check contrast for every new pair; don't copy mockup hexes that fail AA.
- Interactive elements need visible focus styles. Steppers need `aria-label`s ("Decrease systolic pressure"). Hint/range text is linked via `aria-describedby`. Rows have descriptive link names.
- No horizontal scroll at 375px. The chart's screen-reader table must sit inside an `sr-only` wrapper, because `sr-only` on a `<table>` itself doesn't constrain its width.

## Acceptance criteria

- The three screens match the v2 mockups' structure at 375px, with the deviations in reference §6.3 and nothing else.
- Add, edit (including delete), search, filter, sort, range and paging all work in a real browser against seeded IndexedDB data, with no console errors.
- `npm run build` (includes `tsc`) and `npm run lint` pass.
