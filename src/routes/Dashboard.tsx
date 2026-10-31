import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import AverageStats from '../components/AverageStats'
import BloodPressureChart from '../components/BloodPressureChart'
import CategoryBadge from '../components/CategoryBadge'
import MeasurementRow from '../components/MeasurementRow'
import PageHeader from '../components/PageHeader'
import { buttonVariants } from '../components/ui/button-variants'
import { useMeasurements } from '../store/useMeasurements'
import { filterByDateRange } from '../utils/dateRange'
import { formatFullDate, formatRelativeDayTime, greeting } from '../utils/formatDate'

/** Number of rows in the dashboard's "Recent entries" card (spec §6: last 5). */
const RECENT_COUNT = 5

/** White card with the mockups' small uppercase label. */
function DashboardCard({ title, children, flush = false }: { title: string; children: ReactNode; flush?: boolean }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface">
      <h2 className="px-3.5 pt-3.5 text-[11px] font-medium tracking-wide text-muted uppercase">{title}</h2>
      <div className={flush ? 'mt-1' : 'px-3.5 pt-2.5 pb-3.5'}>{children}</div>
    </section>
  )
}

/**
 * Dashboard (spec §6 `/`, layouts v2 `01-dashboard.html`): greeting header,
 * last reading, 7-day trend, 7-day averages, add button, and recent entries.
 */
function Dashboard() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)

  useEffect(() => {
    load()
  }, [load])

  const hasAnyMeasurements = measurements.length > 0
  const recent = [...measurements]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, RECENT_COUNT)
  const last7Days = filterByDateRange(measurements, '7')
  const latest = recent[0]

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-3">
      <PageHeader headingId="dashboard-heading" title={greeting()} subtitle={formatFullDate()} />

      {isLoading && !hasAnyMeasurements && <p className="text-muted">Loading…</p>}

      {!isLoading && !hasAnyMeasurements && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-ink">No measurements recorded yet.</p>
          <p className="mt-1 text-sm text-muted">Log your first blood pressure reading to see it here.</p>
          <Link to="/add" className={buttonVariants({ className: 'mt-4' })}>
            Add your first measurement
          </Link>
        </div>
      )}

      {hasAnyMeasurements && latest && (
        <>
          <DashboardCard title="Last reading">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] leading-none font-medium text-brand">{latest.systolic}</span>
              <span className="text-[22px] leading-none text-muted">/</span>
              <span className="text-[32px] leading-none font-medium text-brand-accent">{latest.diastolic}</span>
              <span className="text-xs text-muted">mmHg</span>
              <CategoryBadge category={latest.category} className="ml-auto self-center" />
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {formatRelativeDayTime(latest.timestamp)} · pulse {latest.pulse} bpm
            </p>
          </DashboardCard>

          <DashboardCard title="Trend — last 7 days">
            <BloodPressureChart
              measurements={last7Days}
              height={130}
              compact
              seriesKeys={['systolic', 'diastolic']}
            />
          </DashboardCard>

          {last7Days.length > 0 && (
            <DashboardCard title="Statistics — 7 days">
              <AverageStats measurements={last7Days} />
            </DashboardCard>
          )}

          <Link to="/add" className={buttonVariants({ size: 'lg' })}>
            + Add measurement
          </Link>

          <DashboardCard title="Recent entries" flush>
            <ol aria-label={`Last ${RECENT_COUNT} measurements`}>
              {recent.map((measurement) => (
                <MeasurementRow
                  key={measurement.id}
                  measurement={measurement}
                  when={formatRelativeDayTime(measurement.timestamp)}
                />
              ))}
            </ol>
            <Link
              to="/history"
              className="block border-t border-border px-3.5 py-2.5 text-center text-[13px] font-medium text-accent hover:bg-surface-inset"
            >
              View all history
            </Link>
          </DashboardCard>
        </>
      )}
    </section>
  )
}

export default Dashboard
