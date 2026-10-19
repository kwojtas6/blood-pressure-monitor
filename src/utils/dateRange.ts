/**
 * Shared date-range filtering, used by the `/history` filters (Task 3) and
 * intended for reuse by the `/chart` date-range selector and dashboard
 * mini-chart (Task 4) — both need exactly the same 7/30/90/all-time scoping.
 */

export type DateRangeOption = '7' | '30' | '90' | 'all'

export const DATE_RANGE_OPTIONS: Array<{
  value: DateRangeOption
  label: string
}> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

/** Start of the given range, or `null` for 'all' (no lower bound). */
export function getRangeStart(
  option: DateRangeOption,
  now: Date = new Date(),
): Date | null {
  if (option === 'all') return null
  const days = Number(option)
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return start
}

/** Filters items with a `timestamp` to those within the given date range. */
export function filterByDateRange<T extends { timestamp: Date }>(
  items: T[],
  option: DateRangeOption,
  now: Date = new Date(),
): T[] {
  const start = getRangeStart(option, now)
  if (!start) return items
  return items.filter((item) => item.timestamp >= start)
}

/**
 * Human-readable label for a date-range option, e.g. for a page header
 * subtitle or report title. Shared by `/chart` and `/export` (task 7) so
 * the two routes never describe the same selection differently.
 */
export function dateRangeLabel(option: DateRangeOption): string {
  return (
    DATE_RANGE_OPTIONS.find((entry) => entry.value === option)?.label ??
    'All time'
  )
}
