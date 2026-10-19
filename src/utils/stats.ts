import type { Measurement } from '../types'

/**
 * Mean/min/max derivation shared by `StatsPanel` (on-screen) and
 * `pdfExport` (the print template), so the two never drift apart on the
 * definition of "stats for a date range" (spec §2, §6 `/chart`).
 */

export interface MetricDefinition {
  key: 'systolic' | 'diastolic' | 'pulse'
  label: string
  unit: string
}

export const METRICS: MetricDefinition[] = [
  { key: 'systolic', label: 'Systolic', unit: 'mmHg' },
  { key: 'diastolic', label: 'Diastolic', unit: 'mmHg' },
  { key: 'pulse', label: 'Pulse', unit: 'bpm' },
]

export interface MetricStats {
  mean: number
  min: number
  max: number
}

export function computeStats(values: number[]): MetricStats | null {
  if (values.length === 0) return null
  const sum = values.reduce((total, value) => total + value, 0)
  return {
    mean: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

/** Convenience: stats for every metric over a measurement set, skipping metrics with no data. */
export function computeAllStats(
  measurements: Measurement[],
): Array<MetricDefinition & { stats: MetricStats }> {
  return METRICS.map((metric) => {
    const stats = computeStats(measurements.map((m) => m[metric.key]))
    return stats ? { ...metric, stats } : null
  }).filter((entry): entry is MetricDefinition & { stats: MetricStats } => entry !== null)
}
