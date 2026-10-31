import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import AverageStats from '../components/AverageStats'
import DateRangePills from '../components/DateRangePills'
import { SearchIcon, SortIcon } from '../components/icons'
import MeasurementRow from '../components/MeasurementRow'
import PageHeader, { HeaderButton } from '../components/PageHeader'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { useMeasurements } from '../store/useMeasurements'
import type { Category, Measurement } from '../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/bpClassification'
import { filterByDateRange, type DateRangeOption } from '../utils/dateRange'
import { dayKey, formatDayHeading, formatRelativeDay, formatTime } from '../utils/formatDate'

type CategoryFilter = Category | 'all'
type SortOrder = 'newest' | 'oldest'

/** Entries rendered per "Load earlier measurements" step. */
const PAGE_SIZE = 20

/** Case-insensitive match against the note, the reading, and a few date spellings. */
function matchesSearch(measurement: Measurement, query: string): boolean {
  if (query === '') return true
  const date = measurement.timestamp
  const haystack = [
    measurement.note ?? '',
    `${measurement.systolic}/${measurement.diastolic}`,
    formatDayHeading(date),
    date.toLocaleDateString(),
    date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  ]
    .join('\n')
    .toLowerCase()
  return haystack.includes(query)
}

/** Splits an already-sorted list into consecutive calendar-day groups. */
function groupByDay(measurements: Measurement[]): Array<{ key: string; heading: string; items: Measurement[] }> {
  const groups: Array<{ key: string; heading: string; items: Measurement[] }> = []
  for (const measurement of measurements) {
    const key = dayKey(measurement.timestamp)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(measurement)
    else groups.push({ key, heading: formatDayHeading(measurement.timestamp), items: [measurement] })
  }
  return groups
}

/**
 * Full measurement history (spec §2, §6 `/history`, layouts v2
 * `03-historia.html`): header with count + search, date-range pills,
 * averages for the current selection, and entries grouped by day. Tapping
 * an entry opens the edit screen, where it can also be deleted.
 */
function History() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [dateRange, setDateRange] = useState<DateRangeOption>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const filterPanelId = useId()

  useEffect(() => {
    load()
  }, [load])

  const hasAnyMeasurements = measurements.length > 0
  const query = search.trim().toLowerCase()

  const filtered = filterByDateRange(measurements, dateRange)
    .filter((measurement) => categoryFilter === 'all' || measurement.category === categoryFilter)
    .filter((measurement) => matchesSearch(measurement, query))
    .sort((a, b) =>
      sortOrder === 'newest'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime(),
    )
  const shown = filtered.slice(0, visibleCount)
  const groups = groupByDay(shown)

  const latest = measurements.reduce<Measurement | undefined>(
    (newest, m) => (!newest || m.timestamp > newest.timestamp ? m : newest),
    undefined,
  )
  const count = measurements.length
  const subtitle = latest
    ? `${count} measurement${count === 1 ? '' : 's'} · last ${formatRelativeDay(latest.timestamp)}`
    : 'No measurements yet'

  /** Any filter change starts the list from the first page again. */
  function resetPaging() {
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <section aria-labelledby="history-heading" className="space-y-3.5">
      <PageHeader
        headingId="history-heading"
        title="History"
        subtitle={subtitle}
        trailing={
          hasAnyMeasurements && (
            <HeaderButton
              aria-expanded={filtersOpen}
              aria-controls={filterPanelId}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              {filtersOpen ? 'Hide filters' : 'Filter'}
              {categoryFilter !== 'all' && (
                <>
                  <span aria-hidden className="ml-1 h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="sr-only"> (category filter active)</span>
                </>
              )}
            </HeaderButton>
          )
        }
      >
        {hasAnyMeasurements && (
          <div className="flex items-center gap-2.5 rounded-md bg-white/12 px-3.5 py-2 focus-within:ring-2 focus-within:ring-white/70">
            <SearchIcon className="h-4 w-4 shrink-0 text-white/70" />
            <label htmlFor="history-search" className="sr-only">
              Search by date or note
            </label>
            <input
              id="history-search"
              type="search"
              placeholder="Search by date or note…"
              className="w-full min-w-0 bg-transparent text-[13px] text-white outline-none placeholder:text-white/70 [&::-webkit-search-cancel-button]:invert"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                resetPaging()
              }}
            />
          </div>
        )}
      </PageHeader>

      {isLoading && !hasAnyMeasurements && <p className="text-muted">Loading…</p>}

      {!isLoading && !hasAnyMeasurements && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-ink">No measurements recorded yet.</p>
          <Link to="/add" className="mt-2 inline-block text-accent underline">
            Add your first measurement
          </Link>
        </div>
      )}

      {hasAnyMeasurements && (
        <>
          <DateRangePills
            ariaLabel="Date range"
            options={['all', '7', '30', '90']}
            value={dateRange}
            onChange={(value) => {
              setDateRange(value)
              resetPaging()
            }}
          />

          {filtersOpen && (
            <div id={filterPanelId} className="rounded-lg border border-border bg-surface p-3.5">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                id="category-filter"
                className="mt-1"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value as CategoryFilter)
                  resetPaging()
                }}
              >
                <option value="all">All categories</option>
                {CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <AverageStats measurements={filtered} tone="raised" />

          {filtered.length === 0 ? (
            <p className="text-muted" role="status">
              No measurements match the selected filters.
            </p>
          ) : (
            <div className="space-y-2.5" aria-label="Measurements" role="region">
              {groups.map((group, index) => (
                <section key={group.key} aria-label={group.heading}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-[11px] font-medium tracking-wide text-muted uppercase">{group.heading}</h2>
                    {index === 0 && (
                      <button
                        type="button"
                        onClick={() => setSortOrder((order) => (order === 'newest' ? 'oldest' : 'newest'))}
                        className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                      >
                        <SortIcon className="h-3.5 w-3.5" />
                        {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                        <span className="sr-only">, change sort order</span>
                      </button>
                    )}
                  </div>
                  <ol className="overflow-hidden rounded-lg border border-border bg-surface">
                    {group.items.map((measurement) => (
                      <MeasurementRow
                        key={measurement.id}
                        measurement={measurement}
                        when={formatTime(measurement.timestamp)}
                        showNote
                        editable
                      />
                    ))}
                  </ol>
                </section>
              ))}

              <p className="rounded-md border border-[#B5D4F4] bg-accent-soft px-3 py-2 text-[11px] text-[#0C447C]">
                Tap an entry to edit or delete it.
              </p>

              {filtered.length > shown.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="block w-full rounded-md py-2.5 text-center text-[13px] font-medium text-accent hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  {sortOrder === 'newest' ? 'Load earlier measurements' : 'Load later measurements'} ↓
                  <span className="sr-only"> ({filtered.length - shown.length} more)</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default History
