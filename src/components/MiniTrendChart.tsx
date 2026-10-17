import type { Measurement } from '../types'

interface MiniTrendChartProps {
  /** Measurements already scoped to the window to chart (e.g. last 7 days). */
  measurements: Measurement[]
}

/**
 * Minimal inline sparkline placeholder for the dashboard's 7-day trend.
 * Deliberately not Recharts (the real chart is Task 4's `BloodPressureChart`)
 * — this is a trivial, dependency-free stand-in so the dashboard isn't
 * blank. Once Task 4 lands, the dashboard can swap this for the real chart
 * component scoped to a 7-day range via `src/utils/dateRange.ts`.
 */
function MiniTrendChart({ measurements }: MiniTrendChartProps) {
  if (measurements.length < 2) {
    return (
      <p className="text-sm text-muted">
        Not enough readings yet this week for a trend line — log at least two
        to see one here.
      </p>
    )
  }

  const sorted = [...measurements].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )
  const systolicValues = sorted.map((m) => m.systolic)
  const diastolicValues = sorted.map((m) => m.diastolic)
  const allValues = [...systolicValues, ...diastolicValues]
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1

  const width = 100
  const height = 32
  function toPoints(values: number[]): string {
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div>
      <svg
        role="img"
        aria-label={`Systolic and diastolic trend over the last 7 days, ranging from ${min} to ${max} millimeters of mercury`}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-10 w-full"
      >
        <polyline
          points={toPoints(systolicValues)}
          fill="none"
          stroke="#EF4444"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={toPoints(diastolicValues)}
          fill="none"
          stroke="#287B68"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-2 text-xs text-muted">
        {sorted.length} reading{sorted.length === 1 ? '' : 's'} in the last 7
        days · range {min}–{max} mmHg (red: systolic, green: diastolic). Full
        chart coming soon.
      </p>
    </div>
  )
}

export default MiniTrendChart
