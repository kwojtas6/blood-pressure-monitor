import type { Measurement } from '../types'
import { computeStats, METRICS } from '../utils/stats'

interface StatsPanelProps {
  /** Measurements already scoped to the window to summarize (e.g. by date range). */
  measurements: Measurement[]
}

/**
 * Mean/min/max for systolic, diastolic, and pulse over the given measurement
 * set (spec §2, §6 `/chart`). Takes already-filtered measurements so it
 * shares the caller's date-range selection rather than deriving its own.
 */
function StatsPanel({ measurements }: StatsPanelProps) {
  if (measurements.length === 0) {
    return (
      <p className="text-sm text-muted" role="status">
        No measurements in this range to summarize.
      </p>
    )
  }

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {METRICS.map((metric) => {
        const stats = computeStats(measurements.map((m) => m[metric.key]))
        if (!stats) return null
        return (
          <div
            key={metric.key}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <dt className="text-sm font-semibold tracking-wide text-muted uppercase">
              {metric.label}
            </dt>
            <dd className="mt-2 space-y-1 text-sm text-ink">
              <div>
                Mean: {stats.mean.toFixed(1)} {metric.unit}
              </div>
              <div>
                Min: {stats.min} {metric.unit}
              </div>
              <div>
                Max: {stats.max} {metric.unit}
              </div>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

export default StatsPanel
