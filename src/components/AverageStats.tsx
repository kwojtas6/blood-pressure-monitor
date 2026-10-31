import { cn } from '../lib/utils'
import type { Measurement } from '../types'
import { computeAllStats } from '../utils/stats'

interface AverageStatsProps {
  /** Measurements already scoped to the window to average. */
  measurements: Measurement[]
  /**
   * 'inset': gray boxes, for use inside a white card (dashboard).
   * 'raised': white bordered boxes on the page background (history).
   */
  tone?: 'inset' | 'raised'
  className?: string
}

const SHORT_LABELS = {
  systolic: 'avg systolic',
  diastolic: 'avg diastolic',
  pulse: 'avg pulse',
} as const

/**
 * Three-box average grid (layouts v2: dashboard "Statistics — 7 days" card
 * and the history stats row). Means are rounded to whole numbers, as in the
 * mockups; the full mean/min/max breakdown stays on `/chart` (`StatsPanel`).
 */
function AverageStats({ measurements, tone = 'inset', className }: AverageStatsProps) {
  const stats = computeAllStats(measurements)
  if (stats.length === 0) return null

  return (
    <dl className={cn('grid grid-cols-3 gap-2', className)}>
      {stats.map((metric) => (
        <div
          key={metric.key}
          className={cn(
            'flex flex-col-reverse rounded-md p-2.5 text-center',
            tone === 'inset' ? 'bg-surface-inset' : 'border border-border bg-surface',
          )}
        >
          <dt className="mt-0.5 text-[11px] text-muted">{SHORT_LABELS[metric.key]}</dt>
          <dd className="text-lg font-medium text-brand">
            {Math.round(metric.stats.mean)}
            <span className="sr-only"> {metric.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default AverageStats
