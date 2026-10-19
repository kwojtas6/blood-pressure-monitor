import type { Measurement } from '../types'
import { computeStats, METRICS, type MetricDefinition, type MetricStats } from '../utils/stats'

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

  const statsByMetric = METRICS.map((metric) => ({
    metric,
    stats: computeStats(measurements.map((m) => m[metric.key])),
  })).filter(
    (entry): entry is { metric: MetricDefinition; stats: MetricStats } =>
      entry.stats !== null,
  )

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {/* 3-box average grid (mockup §4 "stats card"). */}
      <dl className="grid grid-cols-3 gap-3">
        {statsByMetric.map(({ metric, stats }) => (
          <div key={metric.key} className="rounded-md bg-surface-inset p-3 text-center">
            <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              {metric.label}
            </dt>
            <dd className="mt-1 text-xl font-medium text-brand">
              {stats.mean.toFixed(1)}
            </dd>
            <p className="text-[11px] text-muted">{metric.unit} avg</p>
          </div>
        ))}
      </dl>

      {/* Min/max metric rows. */}
      <dl className="mt-4 divide-y divide-border">
        {statsByMetric.map(({ metric, stats }) => (
          <div key={metric.key} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-muted">{metric.label} range</dt>
            <dd className="font-medium text-ink">
              {stats.min}–{stats.max} {metric.unit}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default StatsPanel
