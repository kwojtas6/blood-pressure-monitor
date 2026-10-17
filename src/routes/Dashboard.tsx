import { useEffect } from 'react'
import { Link } from 'react-router'
import MeasurementList from '../components/MeasurementList'
import MiniTrendChart from '../components/MiniTrendChart'
import { buttonVariants } from '../components/ui/button-variants'
import { useMeasurements } from '../store/useMeasurements'
import { filterByDateRange } from '../utils/dateRange'

/**
 * Dashboard (spec §6 `/`): quick-entry shortcut, last 5 measurements, and a
 * 7-day trend. The trend is a lightweight placeholder — the real chart
 * (`BloodPressureChart`, Task 4) can replace `MiniTrendChart` once it exists.
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

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="dashboard-heading" className="text-2xl font-bold text-ink">
          Dashboard
        </h1>
        <Link to="/add" className={buttonVariants({ size: 'default' })}>
          + Add measurement
        </Link>
      </div>

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

      {!isLoading && hasAnyMeasurements && (
        <>
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
              Last 7 days
            </h2>
            <div className="mt-3">
              <MiniTrendChart measurements={last7Days} />
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
        </>
      )}
    </section>
  )
}

export default Dashboard
