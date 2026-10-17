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
