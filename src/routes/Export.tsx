import { useEffect, useState } from 'react'
import BloodPressureChart from '../components/BloodPressureChart'
import DateRangePills from '../components/DateRangePills'
import ExportMenu from '../components/ExportMenu'
import PageHeader from '../components/PageHeader'
import StatsPanel from '../components/StatsPanel'
import { useMeasurements } from '../store/useMeasurements'
import type { Measurement } from '../types'
import { CATEGORY_BADGE_STYLES, CATEGORY_LABELS } from '../utils/bpClassification'
import {
  dateRangeLabel,
  filterByDateRange,
  type DateRangeOption,
} from '../utils/dateRange'
import { computeAllStats } from '../utils/stats'

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
                    Task 7: the pastel `CATEGORY_BADGE_STYLES` pairing
                    (bg + matching dark text) is itself contrast-checked to
                    ≥4.5:1 — see `src/utils/bpClassification.ts` — so the
                    category text can carry its own color directly instead
                    of staying neutral `text-ink` with a separate swatch
                    dot (the Task 6 workaround this replaces).
                  */}
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: CATEGORY_BADGE_STYLES[measurement.category].bg,
                      color: CATEGORY_BADGE_STYLES[measurement.category].text,
                    }}
                  >
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
 * Fixed Average/Minimum/Maximum semantic color roles for the report-preview
 * stat boxes (`ai/instructions/ui-mockup-reference.md` §2's "Report preview
 * mini-stats" table) — deliberately *not* `CATEGORY_COLORS`/
 * `CATEGORY_BADGE_STYLES`: minimum is always the "good" green role and
 * maximum always the "attention" red role, regardless of what those actual
 * readings classify as under the WHO table. Contrast-checked (task 7):
 *   Average #185FA5 on #EBF2F8: 5.77:1
 *   Minimum #3B6D11 on #EAF3DE: 5.43:1
 *   Maximum #A32D2D on #FCEBEB: 6.13:1
 */
const REPORT_STAT_ROLES = [
  { key: 'average', label: 'Average', bg: '#EBF2F8', text: '#185FA5' },
  { key: 'minimum', label: 'Minimum', bg: '#EAF3DE', text: '#3B6D11' },
  { key: 'maximum', label: 'Maximum', bg: '#FCEBEB', text: '#A32D2D' },
] as const

/**
 * Compact "at a glance" summary card (mockup §4 Export screen: "title, date
 * range + count, 3 colored stat boxes, divider, footnote"). Distinct from
 * `ReportTablePreview`/`StatsPanel`/the chart below, which already give the
 * full detail on this (web) page rather than a phone-sized teaser — so the
 * footnote here says what's included below instead of hiding it.
 * Average/min/max are by systolic reading (the primary metric), reusing
 * `computeAllStats` rather than re-deriving mean/min/max.
 */
function ReportPreviewCard({
  measurements,
  rangeLabel,
}: {
  measurements: Measurement[]
  rangeLabel: string
}) {
  if (measurements.length === 0) return null

  const stats = computeAllStats(measurements)
  const systolicStats = stats.find((entry) => entry.key === 'systolic')
  const diastolicStats = stats.find((entry) => entry.key === 'diastolic')
  const bySystolic = [...measurements].sort((a, b) => a.systolic - b.systolic)
  const minReading = bySystolic[0]
  const maxReading = bySystolic[bySystolic.length - 1]

  const values: Record<(typeof REPORT_STAT_ROLES)[number]['key'], string> = {
    average:
      systolicStats && diastolicStats
        ? `${systolicStats.stats.mean.toFixed(0)}/${diastolicStats.stats.mean.toFixed(0)}`
        : '—',
    minimum: `${minReading.systolic}/${minReading.diastolic}`,
    maximum: `${maxReading.systolic}/${maxReading.diastolic}`,
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold text-ink">Blood Pressure Report</h2>
      <p className="mt-1 text-sm text-muted">
        {rangeLabel} &middot; {measurements.length} measurement
        {measurements.length === 1 ? '' : 's'}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {REPORT_STAT_ROLES.map((role) => (
          <div
            key={role.key}
            className="rounded-md p-3 text-center"
            style={{ backgroundColor: role.bg }}
          >
            <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: role.text }}>
              {role.label}
            </p>
            <p className="mt-1 text-lg font-medium" style={{ color: role.text }}>
              {values[role.key]}
            </p>
            <p className="text-[11px] text-muted">mmHg</p>
          </div>
        ))}
      </div>

      <hr className="mt-4 border-border" />
      <p className="mt-3 text-xs text-muted">
        The full measurement table and trend chart for this range are included below.
      </p>
    </div>
  )
}

/**
 * Export view (spec §2 "Export" row, §6 `/export`): a preview of the report
 * plus PDF export and sharing actions, scoped to a date range the same way
 * `/chart` and `/history` are (`DateRangePills` / `filterByDateRange`).
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
      <PageHeader
        headingId="export-heading"
        title="Export"
        subtitle={`${rangeLabel} · ${visible.length} measurement${visible.length === 1 ? '' : 's'}`}
      />

      <p className="text-muted">
        Export a PDF report to share with your doctor, or send it another
        way. Nothing here ever leaves this device except through the action
        you choose.
      </p>

      <DateRangePills ariaLabel="Date range" value={dateRange} onChange={setDateRange} />

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

          <ReportPreviewCard measurements={visible} rangeLabel={rangeLabel} />

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
