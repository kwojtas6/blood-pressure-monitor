/**
 * Systolic/diastolic/pulse series definitions shared by `BloodPressureChart`
 * (on-screen, Recharts) and `pdfExport` (the print template's own plain-SVG
 * chart) so both draw the same three series with the same colors.
 */

export interface SeriesDefinition {
  key: 'systolic' | 'diastolic' | 'pulse'
  label: string
  color: string
  unit: string
}

/**
 * Colors are chosen for mutual distinguishability (not just hue —
 * lightness/saturation differ too) since color is also used as the sole
 * visual distinguisher between series on the chart.
 *
 * Task 7: repointed to the brand palette in
 * `ai/instructions/ui-mockup-reference.md` §2 (systolic → `--color-brand`,
 * diastolic → `--color-series-diastolic`, pulse → `--color-series-pulse`).
 * Values are hardcoded hex (not `var(--color-...)`) — same approach as
 * before — since `pdfExport.ts` draws these as raw SVG `stroke`/`fill`
 * attributes on an off-document-flow element, where a CSS custom property
 * wouldn't resolve.
 *
 * Non-text (WCAG 1.4.11, 3:1) contrast against the white chart background:
 *   systolic  #1A3A5C on white: 11.64:1
 *   diastolic #4A90C4 on white: 3.46:1 — passes
 *   pulse     #E57C3A on white: 2.89:1 — below 3:1; see this module's
 *             CHANGELOG note / task 7 report for why this exact hex was
 *             still used and how it's mitigated (legend text labels, a
 *             fully redundant accessible data table, and a dashed stroke
 *             on this line in `BloodPressureChart` so the series is never
 *             distinguished by color alone).
 */
export const SERIES: SeriesDefinition[] = [
  { key: 'systolic', label: 'Systolic', color: '#1A3A5C', unit: 'mmHg' },
  { key: 'diastolic', label: 'Diastolic', color: '#4A90C4', unit: 'mmHg' },
  { key: 'pulse', label: 'Pulse', color: '#E57C3A', unit: 'bpm' },
]
