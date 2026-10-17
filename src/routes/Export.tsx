import { useEffect, useState } from 'react'
import BloodPressureChart from '../components/BloodPressureChart'
import ExportMenu from '../components/ExportMenu'
import StatsPanel from '../components/StatsPanel'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { useMeasurements } from '../store/useMeasurements'
import type { Measurement } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/bpClassification'
import {
  DATE_RANGE_OPTIONS,
  filterByDateRange,
  type DateRangeOption,
} from '../utils/dateRange'

function formatDateTime(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

function dateRangeLabel(option: DateRangeOption): string {
  return DATE_RANGE_OPTIONS.find((entry) => entry.value === option)?.label ?? 'All time'
}

/**
 * On-screen preview of what the exported report contains. This table is
 * purely for display here on the live page — it uses the app's normal
 * Tailwind styling, not the plain inline-styled template `pdfExport.ts`
 * builds for the PDF itself (see that file's doc comment for why those stay
 * separate).
 */
function ReportTablePreview({ measurements }: { measurements: Measurement[] }) {
  if (measurements.length === 0) {
    return (
      <p className="text-sm text-muted" role="status">
        No measurements in this range yet.
      </p>
    )
  }

  const sorted = [...measurements].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-accent-soft text-left text-ink">
            <th scope="col" className="px-3 py-2 font-semibold">
              Date
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Time
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Systolic
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Diastolic
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Pulse
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Category
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((measurement) => {
            const { date, time } = formatDateTime(measurement.timestamp)
            return (
              <tr key={measurement.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-ink">{date}</td>
                <td className="px-3 py-2 text-ink">{time}</td>
                <td className="px-3 py-2 text-ink">{measurement.systolic} mmHg</td>
                <td className="px-3 py-2 text-ink">{measurement.diastolic} mmHg</td>
                <td className="px-3 py-2 text-ink">{measurement.pulse} bpm</td>
                <td className="px-3 py-2">
                  {/*
                    Category text stays `text-ink` (not the raw WHO category
                    color) — several of those colors (e.g. the yellow
                    ELEVATED/NORMAL shades) fall well under the 4.5:1 text
                    contrast minimum against this white cell background. The
                    swatch dot below carries the color instead: it's
                    `aria-hidden` and redundant with the adjacent text label,
                    so it's decorative rather than the sole means of
                    conveying the category (task 6 accessibility pass).
                  */}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-ink">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[measurement.category] }}
                      aria-hidden="true"
                    />
                    {CATEGORY_LABELS[measurement.category]}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted">{measurement.note ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Export view (spec §2 "Export" row, §6 `/export`): a preview of the report
 * plus PDF export and sharing actions, scoped to a date range the same way
 * `/chart` and `/history` are (`DATE_RANGE_OPTIONS` / `filterByDateRange`).
 */
function Export() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)

  const [dateRange, setDateRange] = useState<DateRangeOption>('30')

  useEffect(() => {
    load()
  }, [load])

  const hasAnyMeasurements = measurements.length > 0
  const visible = filterByDateRange(measurements, dateRange)
  const rangeLabel = dateRangeLabel(dateRange)

  return (
    <section aria-labelledby="export-heading" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="export-heading" className="text-2xl font-bold text-ink">
            Export
          </h1>
          <p className="mt-1 text-muted">
            Export a PDF report to share with your doctor, or send it another
            way. Nothing here ever leaves this device except through the
            action you choose.
          </p>
        </div>
        <div>
          <Label htmlFor="export-date-range">Date range</Label>
          <Select
            id="export-date-range"
            className="mt-1"
            value={dateRange}
            onChange={(event) =>
              setDateRange(event.target.value as DateRangeOption)
            }
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <p className="text-muted">Loading…</p>}

      {!isLoading && !hasAnyMeasurements && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-ink">No measurements recorded yet.</p>
          <p className="mt-1 text-sm text-muted">
            Log a blood pressure reading before exporting a report.
          </p>
        </div>
      )}

      {!isLoading && hasAnyMeasurements && (
        <>
          <ExportMenu measurements={visible} dateRangeLabel={rangeLabel} />

          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-lg font-semibold text-ink">Trend</h2>
            <div className="mt-3">
              <BloodPressureChart measurements={visible} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink">Summary</h2>
            <div className="mt-3">
              <StatsPanel measurements={visible} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink">Measurements</h2>
            <div className="mt-3">
              <ReportTablePreview measurements={visible} />
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Export
