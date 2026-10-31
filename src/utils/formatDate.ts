/**
 * Display-only date formatting shared by the dashboard and history screens
 * (layouts v2). Locale comes from the browser (`undefined`), same as the
 * rest of the app.
 */

const relativeDays = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Whole calendar days from `date` to `now` (0 = same day, 1 = yesterday). */
function daysAgo(date: Date, now: Date): number {
  return Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)
}

/** "08:15" (or "8:15 AM", per locale). */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/**
 * "today" / "yesterday" for the last two days, otherwise a short date like
 * "Apr 24" (year added when it isn't the current year).
 */
export function formatRelativeDay(date: Date, now: Date = new Date()): string {
  const days = daysAgo(date, now)
  if (days === 0 || days === 1) return relativeDays.format(-days, 'day')
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  })
}

/** "today, 08:15" — the dashboard's compact timestamp. */
export function formatRelativeDayTime(date: Date, now: Date = new Date()): string {
  return `${formatRelativeDay(date, now)}, ${formatTime(date)}`
}

/** "April 26, 2025" — history day-group heading. */
export function formatDayHeading(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Stable per-calendar-day key for grouping, e.g. "2025-3-26". */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** "Good morning" / "Good afternoon" / "Good evening" for the dashboard header. */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** "Wednesday, April 26, 2025" — dashboard header subtitle. */
export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
