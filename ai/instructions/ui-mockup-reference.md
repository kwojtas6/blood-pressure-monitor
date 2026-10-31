# UI Mockup Reference

Source (Task 7): `/Users/kwojtas-macwro/Downloads/bp_app_ui_mockups.html` — 5 phone-frame mockups (Dashboard, Formularz/Add form, Historia/History, Wykres/Chart, Eksport/Export), Polish-language copy. A second, more detailed set for Dashboard / Add / History (Task 8) is covered in §6, which supersedes the parts of §2–§4 it touches. This doc extracts the visual language into tokens our codebase can use, and calls out where it conflicts with what's already built so those conflicts get a deliberate resolution instead of a silent guess.

The mockup's CSS references a set of generic design-system variables (`--color-background-primary/secondary/tertiary`, `--color-text-primary/secondary/tertiary`, `--color-border-secondary/tertiary`, `--border-radius-lg/md`) that aren't defined in the exported file — they come from whatever tool generated it, not from this project. The concrete hex/px values below marked "proposed" are this doc's translation of those generic roles into our actual token system; they didn't come from the mockup directly.

## 1. Visual language summary

- iOS-style card-based mobile layout: a dark navy header (status bar + title/subtitle) at the top of every screen, light gray page background, white rounded cards with hairline borders, a bottom icon+label tab bar.
- Big, bold numeric displays for the primary metrics (current reading, form values), small uppercase tracking-wide labels above each card section.
- Soft pastel badges for WHO category (tinted background + matching dark text), not solid-color chips.
- Multi-line SVG charts (no axis chrome beyond light gridlines + date labels), colored legend dots beneath.
- Pill-shaped filter buttons (date range / category) in a horizontal row.
- Export screen: list of actions as icon-chip + title + description rows, plus a mini report preview card.

## 2. Color palette

### Brand colors (fixed in the mockup, not a generic token)

| Token (proposed) | Hex | Used for |
|---|---|---|
| `--color-brand` | `#1A3A5C` | Header/status bar background, primary button background, systolic chart line, big "last reading" systolic number, report title text |
| `--color-brand-accent` | `#2E6DA4` | Links ("zmień"/"change"), active nav-item label, diastolic big number, "value" text in form fields, secondary-button text/border |
| `--color-series-diastolic` | `#4A90C4` | Diastolic chart line (dashed) |
| `--color-series-pulse` | `#E57C3A` | Pulse chart line (dashed) |

**This navy (`#1A3A5C`) is not new** — it's the exact `theme_color` already declared in the PWA manifest per `ai/instructions/bp-monitor-spec.md` §8.1. The implemented app never carried that color into the actual component styling (Task 1's implementer picked an unrelated green/teal theme since the spec only specified it for the manifest). Adopting this mockup brings the UI in line with the spec's own original color intent — see Decision 1 below.

### WHO category badges (only 4 of our 6 categories are shown)

| Mockup class | Background | Text | Polish label shown | Likely WHO category |
|---|---|---|---|---|
| `.badge-optimal` | `#EAF3DE` | `#3B6D11` | Optymalne | `OPTIMAL` (and by extension `NORMAL`, not shown separately) |
| `.badge-elevated` | `#FAEEDA` | `#854F0B` | Podwyższone | `ELEVATED` |
| `.badge-h1` | `#FCEBEB` | `#A32D2D` | Nadciśnienie I° | `STAGE_1` |
| `.badge-high` | `#F4C0D1` | `#72243E` | *(defined, not used in the sample data)* | `STAGE_2` and/or `STAGE_3` |

**Gap:** the mockup defines 4 badge tiers; the spec's WHO table (§5.2) has 6 categories (`OPTIMAL`, `NORMAL`, `ELEVATED`, `STAGE_1`, `STAGE_2`, `STAGE_3`). `NORMAL` and one of `STAGE_2`/`STAGE_3` have no mockup swatch. See Decision 2.

### Report preview mini-stats (Export screen) — a *different*, fixed semantic coloring, not per-reading WHO classification

| Role | Background | Text |
|---|---|---|
| Average | `#EBF2F8` | `#185FA5` |
| Minimum | `#EAF3DE` | `#3B6D11` |
| Maximum | `#FCEBEB` | `#A32D2D` |

This is "neutral / good / bad" coding for the three aggregate stat boxes, independent of the WHO category system — min is always colored like "optimal", max always like "stage 1", regardless of what the actual min/max values classify as. Carry this over as-is for the report preview's stat boxes specifically; don't wire it to `CATEGORY_COLORS`.

### Proposed neutral tokens (filling in the mockup's unresolved generic variables)

| Role | Proposed hex | Replaces/extends current token |
|---|---|---|
| Page background | `#F4F7F6` *(keep current `--color-background`)* | unchanged |
| Card/surface background | `#FFFFFF` *(keep current `--color-surface`)* | unchanged |
| Inset/secondary surface (form field backgrounds, stat boxes) | `#F3F6F5` (new) | no current equivalent — needed for the mockup's `fake-input`/`stat-box` look |
| Primary text | keep current `--color-ink` | unchanged |
| Secondary text (card titles, nav subtitle) | keep current `--color-muted` (already WCAG-AA audited) | unchanged — don't introduce a weaker gray than the Task 6 contrast pass settled on |
| Hairline divider border | keep current `--color-border` | unchanged |
| Stronger/interactive border | keep current `--color-border-strong` | unchanged |

Net effect: most of the neutral scale **doesn't need to change** — only the brand/accent colors and the WHO badge treatment are new. This keeps the Task 6 accessibility work intact rather than reopening it.

## 3. Typography & spacing (concrete values, inferred from the mockup's pixel sizes)

- Big metric number: 28px / weight 500 (dashboard "last reading"), 22px / weight 500 (form field value)
- Card title / section label: 11–12px, weight 500, uppercase, `letter-spacing: 0.04–0.06em`
- Body/list text: 12–13px
- Meta/caption text (timestamps, units, chart axis labels): 10–11px
- Card border-radius: 16px (proposed `--radius-lg`); input/button/stat-box radius: 10px (proposed `--radius-md`)
- Card padding: 14px; card vertical gap: 12px; page horizontal padding: 16px

## 4. Screen-by-screen structure

**Dashboard (`/`):** navy header with greeting + date → "last reading" card (big systolic/diastolic numbers, unit, WHO badge, timestamp + pulse caption) → "7-day trend" card (2-line mini chart: systolic solid, diastolic dashed, legend dots) → full-width primary "+ Add measurement" button.

**Add form (`/add`):** navy header "New measurement" → card with 3 large-value fields (systolic, diastolic, pulse), each captioned with its min/max range → card with date/time (editable, "change" link) + optional note → inline success banner showing the live-computed WHO category once values are valid → full-width primary "Save measurement" button.

**History (`/history`):** navy header with total count → filter pill row (All / 7d / 30d / 90d) → card containing a divided list: value line + meta line (date, time, pulse) on the left, WHO badge on the right.

**Chart (`/chart`):** navy header with current range label → filter pill row (7d / 30d / 90d / All) → chart card (3-line SVG with light gridlines, date-range x-axis labels, legend dots) → stats card (3-box average grid + max/min metric rows).

**Export (`/export`):** navy header → range-selector pill row → card listing 3 actions as icon-chip + title + description rows: **Download PDF**, **Share**, **Copy data** → report-preview card (title, date range + count, 3 colored stat boxes, divider, "+ full table + chart" footnote).

## 5. Decisions needed (each with a recommended default — override any of these if you want something different)

1. **Adopt the navy/blue brand palette.** Recommended: yes — it's already the spec's declared `theme_color`, just never applied to components. This replaces the current green/teal `--color-accent` theme.
2. **WHO badge treatment for all 6 categories.** Recommended: keep the spec's §5.2 hex values as the authoritative *data* colors (dots, chart lines, list-item left border — unchanged), but apply the mockup's pastel-background-plus-dark-text *badge* treatment to all 6, deriving the 2 missing tiers (`NORMAL`, and whichever of `STAGE_2`/`STAGE_3` the mockup's single `.badge-high` doesn't cover) in the same visual style rather than reusing one mockup hex for two categories. This needs a fresh WCAG contrast check since it's a new derived palette, same as Task 6 did for the rest of the UI.
3. **Numeric input style.** Recommended: keep real `<input type="number">` elements (preserves the Task 2 accessibility/validation wiring) restyled to match the mockup's large-value visual treatment, rather than building a custom tap-to-edit "fake input" widget.
4. **Language.** Mockup copy is Polish; the app is currently all-English and the spec lists i18n as v2/out-of-scope. Recommended: translate the mockup's copy to the app's existing English strings (see task 7 for the specific mapping) rather than introducing partial Polish. Flag if you actually want the shipped app in Polish — that's a bigger, different decision than a visual refresh.
5. **"Copy data" as a first-class export action.** Recommended: add it as a visible third option next to Export PDF / Share (matches the spec's "fallback: copy to clipboard" capability, surfaced directly rather than hidden behind Web Share availability detection).
6. **Icons.** Mockup uses placeholder Unicode glyphs. Recommended: small inline SVGs with equivalent meaning (no new icon-library dependency, keeps bundle size down per the project's "no new dependency without checking" rule).

## 6. Layouts v2 (Task 8)

Source: `/Users/kwojtas-macwro/Downloads/files/01-dashboard.html`, `02-formularz.html`, `03-historia.html`. These are three standalone 375px phone mockups, Polish copy, plain CSS with concrete hex values (no unresolved design-system variables this time). They refine the Dashboard, Add form and History screens from §4. Chart and Export have no v2 mockup and keep their Task 7 layout; they pick up only the shared token/pill changes below.

### 6.1 What's new per screen

**Dashboard (`/`):** header title is a greeting ("Dzień dobry") with the full date as subtitle → "last reading" card (32px values, systolic `--color-brand`, diastolic `--color-brand-accent`, badge right-aligned, caption "today, 08:15 · pulse 68 bpm") → "Trend — last 7 days" card with **systolic + diastolic only** (no pulse line), dot legend → **new** "Statistics — 7 days" card with three gray average boxes (avg systolic / diastolic / pulse) → full-width "+ Add measurement" button → **new** "Recent entries" card: divided rows with a 3px category-colored accent bar, values, relative time + pulse, badge.

**Add form (`/add`):** header gets a small action row ("‹ Back" left, "Cancel" right) above the title "New measurement" → card with three **stepper** fields (−/value/+, 52px tall, value 26px in `--color-brand-accent`) stacked full width, each with a "min X / max Y" caption row → card with a date row (formatted value + "Change" link) and the note textarea with a placeholder hint → classification banner with a round icon, a title and a sub line ("122/78 mmHg is within the WHO norm") → full-width primary "Save measurement" + full-width outlined accent "Cancel".

**History (`/history`):** header with "Filter" on the right, subtitle "23 measurements · last today", and a translucent **search box** ("Search by date or note…") → pills All / 7 days / 30 days / 90 days → three white average boxes for the current selection → entries **grouped by day** (uppercase date heading; the first heading also carries "Sort ↕") → per entry: accent bar, values (hypertension values in dark red), time · pulse, optional truncated note, badge, chevron → a hint "swipe an entry left to edit or delete" → "Load earlier measurements ↓".

### 6.2 Tokens — this supersedes §2's "keep the neutral scale"

The v2 mockups use a cool gray-blue neutral scale instead of the app's gray-green one, so Task 8 moves the neutrals over. Every pair was contrast-checked, and where the mockup's own value failed AA it was darkened rather than copied:

| Token | Before | After | Note |
|---|---|---|---|
| `--color-background` | `#F4F7F6` | `#F0F4F8` | mockup page background |
| `--color-surface-inset` | `#F3F6F5` | `#F0F4F8` | same as page bg, as in the mockups |
| `--color-ink` | `#1B302B` | `#111827` | 16.05:1 on `#F0F4F8` |
| `--color-muted` | `#5A6B67` | `#5A6370` | 6.08:1 on white, 5.50:1 on `#F0F4F8`. The mockup's `#6B7280` (4.37:1 on `#F0F4F8`) and `#9CA3AF` (2.54:1 on white) **fail AA** and are not used |
| `--color-border` | `#E3EBE8` | `#E5E7EB` | decorative dividers |
| `--color-border-strong` | `#879693` | `#77818F` | 3.95:1 on white, 3.57:1 on `#F0F4F8` (`#879693` would drop to 2.79:1 on the new bg) |
| `--radius-lg` | 16px | 14px | mockup card radius |

Also: header-row action text is white at 80% (≈ `#D1D8DE` on navy, 8.5:1); the search placeholder is white at 70% over the 12% white search box (≈ 5.0:1); the hint box uses `#0C447C` on `#EBF2F8` as in the mockup.

### 6.3 Decisions (resolved; the user can override any of them)

1. **Language:** still English (Decision 4 above stands). Mapping used: "Dzień dobry" → time-of-day greeting ("Good morning/afternoon/evening"), "Ostatni pomiar" → "Last reading", "Trend — ostatnie 7 dni" → "Trend — last 7 days", "Statystyki — 7 dni" → "Statistics — 7 days", "Ostatnie wpisy" → "Recent entries", "Nowy pomiar" → "New measurement", "Wstecz" / "Anuluj" → "Back" / "Cancel", "Zmień" → "Change", "Filtruj" → "Filter", "Sortuj" → "Newest first" / "Oldest first" (the button names the current order), "Szukaj po dacie lub notatce…" → "Search by date or note…", "Załaduj wcześniejsze pomiary" → "Load earlier measurements", "7 dni" → "7 days", "Wszystkie" → "All".
2. **Steppers keep a real `<input type="number">`** in the middle (Decision 3 still applies): typing works, and label / `aria-describedby` / validation wiring is unchanged. The buttons step by 1, clamp to the field's range, and are disabled at the bounds. The first press on an empty field fills in a typical value (120 / 80 / 70) instead of stepping from the range minimum.
3. **The banner adapts to the category.** The mockup only shows the optimal case ("…mieści się w normie WHO"). OPTIMAL/NORMAL get a check icon and "within the WHO normal range", ELEVATED gets an alert icon and "above the WHO normal range", STAGE_1–3 get "in the WHO hypertension range". This avoids telling someone with hypertension that their reading is normal.
4. **No swipe gesture on history rows.** The whole row links to `/add/:id`, which now has a "Delete measurement" button, so edit and delete stay one tap away and keyboard/screen-reader accessible. The swipe hint becomes "Tap an entry to edit or delete it." Real swipe actions would be an optional follow-up.
5. **Dashboard shows 5 recent entries**, not the mockup's 3: spec §6 says "last 5 measurements". A "View all history" link closes the card.
6. **"Filter" opens the category filter.** The mockup doesn't show what "Filtruj" opens; the existing Task 3 category `<Select>` moves into a panel toggled by it (`aria-expanded`), and a dot on the button marks an active category filter.
7. **"Load earlier" pages 20 rows at a time** (client-side; all data is already in memory). Any filter/search/range change resets to the first page.
