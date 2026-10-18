import type { Category } from '../types'

/**
 * WHO blood pressure classification (spec §5.2).
 * Category is derived from whichever of systolic/diastolic falls into the
 * more severe band, by ranking each reading on the same 0–5 severity scale
 * and taking the higher one.
 */

export interface BpClassification {
  category: Category
  /** UI color for the category, per spec §5.2. */
  color: string
}

/** Severity-ordered categories, index = severity level (0 = least severe). */
export const CATEGORY_ORDER: Category[] = [
  'OPTIMAL',
  'NORMAL',
  'ELEVATED',
  'STAGE_1',
  'STAGE_2',
  'STAGE_3',
]

export const CATEGORY_COLORS: Record<Category, string> = {
  OPTIMAL: '#22C55E',
  NORMAL: '#84CC16',
  ELEVATED: '#EAB308',
  STAGE_1: '#F97316',
  STAGE_2: '#EF4444',
  STAGE_3: '#991B1B',
}

/**
 * Soft pastel badge treatment (tinted background + matching dark text) per
 * `ai/instructions/ui-mockup-reference.md` §2/Decision 2 — a distinct,
 * *badge-only* color mapping from `CATEGORY_COLORS` above, which stays the
 * authoritative saturated *data* color (list-item left border, chart lines,
 * swatch dots). Four of the six pairs are the mockup's own hex values
 * (`.badge-optimal`/`.badge-elevated`/`.badge-h1`/`.badge-high`); `NORMAL`
 * and `STAGE_3` have no mockup swatch and are derived (see ruling below).
 * Every pair is WCAG AA text-contrast-checked (≥4.5:1), not eyeballed:
 *
 *   OPTIMAL  bg #EAF3DE / text #3B6D11 — 5.43:1 (mockup `.badge-optimal`)
 *   NORMAL   bg #F2F0DC / text #605E0E — 5.89:1 (derived: midpoint of the
 *            OPTIMAL and ELEVATED pairs below, in both channels — NORMAL
 *            sits between them on the severity scale and visually reads as
 *            the yellow-green step CATEGORY_COLORS already implies)
 *   ELEVATED bg #FAEEDA / text #854F0B — 5.87:1 (mockup `.badge-elevated`)
 *   STAGE_1  bg #FCEBEB / text #A32D2D — 6.13:1 (mockup `.badge-h1`)
 *   STAGE_2  bg #F4C0D1 / text #72243E — 6.53:1 (mockup `.badge-high` — the
 *            reference doc leaves it ambiguous whether this single swatch
 *            is STAGE_2 or STAGE_3; assigned to STAGE_2 here because it's
 *            the less-saturated of the two pink tiers, see STAGE_3 below)
 *   STAGE_3  bg #EC95B7 / text #411B4F — 6.39:1 (derived: STAGE_1→STAGE_2's
 *            own per-channel delta applied one more step, i.e. extrapolating
 *            the mockup's existing severity progression rather than
 *            re-using STAGE_2's swatch for both tiers — STAGE_3 is the most
 *            severe category so its badge is the most visually intense)
 */
export const CATEGORY_BADGE_STYLES: Record<Category, { bg: string; text: string }> = {
  OPTIMAL: { bg: '#EAF3DE', text: '#3B6D11' },
  NORMAL: { bg: '#F2F0DC', text: '#605E0E' },
  ELEVATED: { bg: '#FAEEDA', text: '#854F0B' },
  STAGE_1: { bg: '#FCEBEB', text: '#A32D2D' },
  STAGE_2: { bg: '#F4C0D1', text: '#72243E' },
  STAGE_3: { bg: '#EC95B7', text: '#411B4F' },
}

export const CATEGORY_LABELS: Record<Category, string> = {
  OPTIMAL: 'Optimal',
  NORMAL: 'Normal',
  ELEVATED: 'Elevated',
  STAGE_1: 'Hypertension stage 1',
  STAGE_2: 'Hypertension stage 2',
  STAGE_3: 'Hypertension stage 3',
}

function systolicLevel(systolic: number): number {
  if (systolic < 120) return 0 // Optimal
  if (systolic <= 129) return 1 // Normal
  if (systolic <= 139) return 2 // Elevated
  if (systolic <= 159) return 3 // Stage 1
  if (systolic <= 179) return 4 // Stage 2
  return 5 // Stage 3 (>= 180)
}

function diastolicLevel(diastolic: number): number {
  // Diastolic has no distinct "Normal" band of its own (Optimal and Normal
  // both require diastolic < 80), so level 1 is intentionally unused here;
  // the systolic band resolves that case when diastolic isn't the max.
  if (diastolic < 80) return 0 // Optimal-or-Normal
  if (diastolic <= 89) return 2 // Elevated
  if (diastolic <= 99) return 3 // Stage 1
  if (diastolic <= 109) return 4 // Stage 2
  return 5 // Stage 3 (>= 110)
}

/**
 * Classifies a blood pressure reading per the WHO table in spec §5.2.
 * Pure function — no side effects, safe to unit test directly.
 */
export function bpClassification(
  systolic: number,
  diastolic: number,
): BpClassification {
  const level = Math.max(systolicLevel(systolic), diastolicLevel(diastolic))
  const category = CATEGORY_ORDER[level]
  return { category, color: CATEGORY_COLORS[category] }
}
