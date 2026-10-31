import { useId } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Measurement } from '../types'
import { SERIES } from '../utils/series'

interface BloodPressureChartProps {
  /** Measurements already scoped to the window to chart (e.g. by date range). */
  measurements: Measurement[]
  /** Chart area height in pixels. Defaults to 260 (used on the `/chart` route); the dashboard passes a smaller value. */
  height?: number
  /**
   * Thinner/simpler presentation for small embeds (the dashboard's 7-day
   * mini-chart, per `ai/instructions/ui-mockup-reference.md` §4) — hides
   * the axis tick labels and tooltip, which have little room to be legible
   * at that size, while keeping the same lines/legend/data. The full
   * accessible data table below is unaffected either way.
   */
  compact?: boolean
}

interface ChartPoint {
  timestamp: number
  dateLabel: string
  fullLabel: string
  systolic: number
  diastolic: number
  pulse: number
}

function toChartData(measurements: Measurement[]): ChartPoint[] {
  return [...measurements]
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((measurement) => ({
      timestamp: measurement.timestamp.getTime(),
      dateLabel: measurement.timestamp.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      fullLabel: measurement.timestamp.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      systolic: measurement.systolic,
      diastolic: measurement.diastolic,
      pulse: measurement.pulse,
    }))
}

/** Plain-language trend summary used as the chart's accessible name. */
function summarize(data: ChartPoint[]): string {
  if (data.length === 0) {
    return 'Blood pressure and pulse trend chart: no measurements in this range.'
  }
  if (data.length === 1) {
    const point = data[0]
    return `Blood pressure and pulse trend chart: one measurement, on ${point.fullLabel} — systolic ${point.systolic}, diastolic ${point.diastolic} millimeters of mercury, pulse ${point.pulse} beats per minute.`
  }
  const first = data[0]
  const last = data[data.length - 1]
  return (
    `Blood pressure and pulse trend chart: ${data.length} measurements from ${first.fullLabel} to ${last.fullLabel}. ` +
    `Most recent — systolic ${last.systolic}, diastolic ${last.diastolic} millimeters of mercury, pulse ${last.pulse} beats per minute. ` +
    'A detailed data table is available below the chart.'
  )
}

/**
 * Line chart of systolic/diastolic/pulse over time (spec §2, §6 `/chart`).
 * Renders a visually-hidden data table alongside the SVG chart so the trend
 * is available to screen readers / non-visual users, not just as a bare SVG
 * (`ai/tasks/04-chart-and-stats.md` accessibility requirement).
 */
function BloodPressureChart({
  measurements,
  height = 260,
  compact = false,
}: BloodPressureChartProps) {
  const captionId = useId()
  const data = toChartData(measurements)

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted" role="status">
        No measurements in this range yet.
      </p>
    )
  }

  return (
    <figure className="m-0" aria-label={summarize(data)}>
      <div style={{ height }} className="w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e3ebe8" />
            {!compact && (
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11 }}
                tickMargin={8}
                minTickGap={24}
              />
            )}
            {!compact && <YAxis tick={{ fontSize: 11 }} width={32} />}
            {!compact && (
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullLabel ?? ''
                }
              />
            )}
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={2}
                // Diastolic/pulse are dashed (mockup §1/§2) so the three
                // series are never distinguished by color alone — this
                // also gives the pulse line a non-color cue to offset its
                // line-vs-background contrast being under 3:1 (see
                // `src/utils/series.ts`'s doc comment).
                strokeDasharray={series.key === 'systolic' ? undefined : '6 4'}
                dot={!compact && data.length < 30}
                activeDot={compact ? false : { r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Non-visual equivalent of the chart above: a plain data table. */}
      <table className="sr-only">
        <caption id={captionId}>
          Blood pressure and pulse readings, in chronological order (shown
          above as a line chart)
        </caption>
        <thead>
          <tr>
            <th scope="col">Date &amp; time</th>
            {SERIES.map((series) => (
              <th scope="col" key={series.key}>
                {series.label} ({series.unit})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.timestamp}>
              <th scope="row">{point.fullLabel}</th>
              {SERIES.map((series) => (
                <td key={series.key}>{point[series.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export default BloodPressureChart
