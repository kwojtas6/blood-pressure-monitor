import { Link } from 'react-router'
import { cn } from '../lib/utils'
import type { Measurement } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/bpClassification'
import { buttonVariants } from './ui/button-variants'

interface MeasurementListProps {
  /** Measurements to render, in whatever order the caller wants shown. */
  measurements: Measurement[]
  onDelete: (id: number) => void
  /**
   * 'full' (default): date/time, note, and edit/delete actions — used on
   * `/history`. 'compact': a read-only summary row with no actions or note,
   * used for the dashboard's "last 5" list.
   */
  variant?: 'full' | 'compact'
  /** Accessible name for the list, e.g. "All measurements", "Last 5 measurements". */
  ariaLabel: string
  /** Shown instead of the list when `measurements` is empty. */
  emptyMessage?: string
  className?: string
}

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

/**
 * Chronological measurement list (spec §2 "Measurement list"), color-coded
 * by WHO category per spec §5.2. Color is always paired with the category
 * label text (a dot plus a text badge, not a colored background alone) so
 * the coding doesn't rely on color perception.
 */
function MeasurementList({
  measurements,
  onDelete,
  variant = 'full',
  ariaLabel,
  emptyMessage = 'No measurements recorded yet.',
  className,
}: MeasurementListProps) {
  if (measurements.length === 0) {
    return <p className={cn('text-muted', className)}>{emptyMessage}</p>
  }

  return (
    <ol aria-label={ariaLabel} className={cn('space-y-2', className)}>
      {measurements.map((measurement) => {
        const { date, time } = formatDateTime(measurement.timestamp)
        const label = CATEGORY_LABELS[measurement.category]
        const color = CATEGORY_COLORS[measurement.category]
        const summary = `${date} at ${time}: ${measurement.systolic} over ${measurement.diastolic} millimeters of mercury, pulse ${measurement.pulse} beats per minute, ${label}${
          measurement.note ? `, note: ${measurement.note}` : ''
        }`

        return (
          <li
            key={measurement.id}
            aria-label={summary}
            className="flex items-start gap-3 rounded-md border border-border bg-surface p-3"
            style={{ borderLeftColor: color, borderLeftWidth: 4 }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-ink">
                  {measurement.systolic}/{measurement.diastolic}{' '}
                  <span className="font-normal text-muted">mmHg</span>
                </span>
                <span className="text-sm text-muted">
                  pulse {measurement.pulse} bpm
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-ink">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {date} &middot; {time}
              </p>
              {variant === 'full' && measurement.note && (
                <p className="mt-1 text-sm text-ink/80">{measurement.note}</p>
              )}
            </div>

            {variant === 'full' && (
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`/add/${measurement.id}`}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                  aria-label={`Edit measurement from ${date} at ${time}`}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className={buttonVariants({
                    variant: 'destructive',
                    size: 'sm',
                  })}
                  aria-label={`Delete measurement from ${date} at ${time}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Delete this measurement? This cannot be undone.',
                      )
                    ) {
                      onDelete(measurement.id)
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default MeasurementList
