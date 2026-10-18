import { useEffect, useState } from 'react'
import BloodPressureChart from '../components/BloodPressureChart'
import DateRangePills from '../components/DateRangePills'
import PageHeader from '../components/PageHeader'
import StatsPanel from '../components/StatsPanel'
import { useMeasurements } from '../store/useMeasurements'
import {
  dateRangeLabel,
  filterByDateRange,
  type DateRangeOption,
} from '../utils/dateRange'

/**
 * Line chart with stats panel and date-range selector (spec §6 `/chart`).
 * The selected range is lifted here and passed to both `BloodPressureChart`
 * and `StatsPanel` so they always stay in sync (task 4 requirement).
 */
function Chart() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)

  const [dateRange, setDateRange] = useState<DateRangeOption>('30')

  useEffect(() => {
    load()
  }, [load])

  const hasAnyMeasurements = measurements.length > 0
  const visible = filterByDateRange(measurements, dateRange)

  return (
    <section aria-labelledby="chart-heading" className="space-y-6">
      <PageHeader headingId="chart-heading" title="Chart" subtitle={dateRangeLabel(dateRange)} />

      <DateRangePills ariaLabel="Date range" value={dateRange} onChange={setDateRange} />

      {isLoading && <p className="text-muted">Loading…</p>}

      {!isLoading && !hasAnyMeasurements && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-ink">No measurements recorded yet.</p>
          <p className="mt-1 text-sm text-muted">
            Log a blood pressure reading to see trends and stats here.
          </p>
        </div>
      )}

      {!isLoading && hasAnyMeasurements && (
        <>
          <div className="rounded-lg border border-border bg-surface p-4">
            <BloodPressureChart measurements={visible} />
          </div>
          <StatsPanel measurements={visible} />
        </>
      )}
    </section>
  )
}

export default Chart
