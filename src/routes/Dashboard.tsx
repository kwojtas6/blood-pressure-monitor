import { useEffect } from 'react'
import { Link } from 'react-router'
import BloodPressureChart from '../components/BloodPressureChart'
import MeasurementList from '../components/MeasurementList'
import PageHeader from '../components/PageHeader'
import { buttonVariants } from '../components/ui/button-variants'
import { useMeasurements } from '../store/useMeasurements'
import { CATEGORY_BADGE_STYLES, CATEGORY_LABELS } from '../utils/bpClassification'
import { filterByDateRange } from '../utils/dateRange'

/** Matches the format used by `MeasurementList`/`Export`'s own local copies — see those files for why this isn't centralized (plain display formatting, not shared business logic). */
function formatDateTime(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

/** Today's date as a greeting line, e.g. "Wednesday, October 18" (mockup's "Dzień dobry" + date header, translated and made live rather than a static/time-of-day greeting — task 7 Decision 4). */
function todayGreeting(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Dashboard (spec §6 `/`): quick-entry shortcut, last 5 measurements, and a
 * 7-day trend chart. No date-range selector here — always scoped to the last
 * 7 days via `filterByDateRange`.
 */
function Dashboard() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)
  const remove = useMeasurements((state) => state.remove)

  useEffect(() => {
    load()
  }, [load])

  const hasAnyMeasurements = measurements.length > 0
  const recent = [...measurements]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)
  const last7Days = filterByDateRange(measurements, '7')
  const latest = recent[0]
  const latestFormatted = latest ? formatDateTime(latest.timestamp) : null

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-6">
      <PageHeader headingId="dashboard-heading" title="Dashboard" subtitle={todayGreeting()} />

      {isLoading && <p className="text-muted">Loading…</p>}

      {!isLoading && !hasAnyMeasurements && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-ink">No measurements recorded yet.</p>
          <p className="mt-1 text-sm text-muted">
            Log your first blood pressure reading to see it here.
          </p>
          <Link
            to="/add"
            className={buttonVariants({ className: 'mt-4' })}
          >
            Add your first measurement
          </Link>
        </div>
      )}

      {!isLoading && hasAnyMeasurements && latest && latestFormatted && (
        <>
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
              Last reading
            </h2>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] leading-none font-medium text-brand">
                  {latest.systolic}
                </span>
                <span className="text-[28px] leading-none font-medium text-muted">/</span>
                <span className="text-[28px] leading-none font-medium text-brand-accent">
                  {latest.diastolic}
                </span>
                <span className="ml-1 text-sm text-muted">mmHg</span>
              </div>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: CATEGORY_BADGE_STYLES[latest.category].bg,
                  color: CATEGORY_BADGE_STYLES[latest.category].text,
                }}
              >
                {CATEGORY_LABELS[latest.category]}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {latestFormatted.date} &middot; {latestFormatted.time} &middot; pulse{' '}
              {latest.pulse} bpm
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
              7-day trend
            </h2>
            <div className="mt-3">
              <BloodPressureChart measurements={last7Days} height={140} compact />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                Recent measurements
              </h2>
              <Link to="/history" className="text-sm text-accent underline">
                View all
              </Link>
            </div>
            <MeasurementList
              measurements={recent}
              onDelete={remove}
              variant="compact"
              ariaLabel="Last 5 measurements"
              className="mt-3"
            />
          </div>

          <Link
            to="/add"
            className={buttonVariants({ className: 'w-full' })}
          >
            + Add measurement
          </Link>
        </>
      )}
    </section>
  )
}

export default Dashboard
