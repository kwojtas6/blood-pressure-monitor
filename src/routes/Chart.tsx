import { useEffect, useState } from 'react'
import BloodPressureChart from '../components/BloodPressureChart'
import StatsPanel from '../components/StatsPanel'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { useMeasurements } from '../store/useMeasurements'
import {
  DATE_RANGE_OPTIONS,
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 id="chart-heading" className="text-2xl font-bold text-ink">
          Chart
        </h1>
        <div>
          <Label htmlFor="chart-date-range">Date range</Label>
          <Select
            id="chart-date-range"
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
