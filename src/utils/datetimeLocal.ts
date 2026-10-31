/**
 * Conversion helpers between a `Date` and the string format the
 * `<input type="datetime-local">` element uses ("YYYY-MM-DDTHH:mm", in the
 * browser's local time zone — no timezone offset included).
 */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Formats a `Date` for a `datetime-local` input, in local time. */
export function toDatetimeLocalValue(date: Date): string {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/** Parses a `datetime-local` input value back into a `Date` (local time). */
export function fromDatetimeLocalValue(value: string): Date {
  return new Date(value)
}
