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
 */
export const SERIES: SeriesDefinition[] = [
  { key: 'systolic', label: 'Systolic', color: '#DC2626', unit: 'mmHg' },
  { key: 'diastolic', label: 'Diastolic', color: '#287B68', unit: 'mmHg' },
  { key: 'pulse', label: 'Pulse', color: '#6366F1', unit: 'bpm' },
]
