import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import MeasurementList from '../components/MeasurementList'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { useMeasurements } from '../store/useMeasurements'
import type { Category } from '../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/bpClassification'
import {
  DATE_RANGE_OPTIONS,
  filterByDateRange,
  type DateRangeOption,
} from '../utils/dateRange'

type CategoryFilter = Category | 'all'
type SortOrder = 'newest' | 'oldest'

/**
 * Full, filterable and sortable measurement history (spec §2, §6 `/history`).
 * Replaces the Task 2 temporary inline list with the real `MeasurementList`.
 */
function History() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)
  const remove = useMeasurements((state) => state.remove)

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [dateRange, setDateRange] = useState<DateRangeOption>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  useEffect(() => {
    load()
  }, [load])

  const hasAnyMeasurements = measurements.length > 0

  const visible = filterByDateRange(measurements, dateRange)
    .filter(
      (measurement) =>
        categoryFilter === 'all' || measurement.category === categoryFilter,
    )
    .sort((a, b) =>
      sortOrder === 'newest'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime(),
    )

  const emptyMessage = hasAnyMeasurements
    ? 'No measurements match the selected filters.'
    : 'No measurements recorded yet.'

  return (
    <section aria-labelledby="history-heading">
      <h1 id="history-heading" className="text-2xl font-bold text-ink">
        History
      </h1>

      {isLoading && <p className="mt-4 text-muted">Loading…</p>}

      {!isLoading && !hasAnyMeasurements && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-ink">No measurements recorded yet.</p>
          <Link to="/add" className="mt-2 inline-block text-accent underline">
            Add your first measurement
          </Link>
        </div>
      )}

      {!isLoading && hasAnyMeasurements && (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select
                id="category-filter"
                className="mt-1"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as CategoryFilter)
                }
              >
                <option value="all">All categories</option>
                {CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="date-range-filter">Date range</Label>
              <Select
                id="date-range-filter"
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

            <div>
              <Label htmlFor="sort-order">Sort</Label>
              <Select
                id="sort-order"
                className="mt-1"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as SortOrder)
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </Select>
            </div>
          </div>

          <MeasurementList
            measurements={visible}
            onDelete={remove}
            ariaLabel="All measurements"
            emptyMessage={emptyMessage}
            className="mt-4"
          />
        </>
      )}
    </section>
  )
}

export default History
