import { cn } from '../lib/utils'
import { DATE_RANGE_OPTIONS, type DateRangeOption } from '../utils/dateRange'

interface DateRangePillsProps {
  value: DateRangeOption
  onChange: (value: DateRangeOption) => void
  /** Display/selection order. Defaults to `DATE_RANGE_OPTIONS`'s own order (7d/30d/90d/All). */
  options?: DateRangeOption[]
  /** Accessible name for the group, e.g. "Date range". */
  ariaLabel: string
  className?: string
}

/** Short visible label for the pill itself; the full `DATE_RANGE_OPTIONS` label (e.g. "Last 7 days") stays the button's accessible name via `aria-label`. */
const SHORT_LABELS: Record<DateRangeOption, string> = {
  '7': '7d',
  '30': '30d',
  '90': '90d',
  all: 'All',
}

/**
 * Pill-style date-range filter (`ai/instructions/ui-mockup-reference.md`
 * §1/§4 — "pill-shaped filter buttons... in a horizontal row"), a visual
 * restyle of the `<Select>`-based date-range filter shared by `/history`,
 * `/chart`, and `/export`. Wired to each route's existing `dateRange`
 * state/`filterByDateRange` — this component owns no filtering logic of its
 * own, only the pill UI (task 7 scope items 7/8/9).
 */
function DateRangePills({
  value,
  onChange,
  options = DATE_RANGE_OPTIONS.map((option) => option.value),
  ariaLabel,
  className,
}: DateRangePillsProps) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((optionValue) => {
        const option = DATE_RANGE_OPTIONS.find((entry) => entry.value === optionValue)
        const isActive = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={isActive}
            aria-label={option?.label ?? optionValue}
            onClick={() => onChange(optionValue)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none',
              isActive
                ? 'border-brand bg-brand text-white'
                : 'border-border-strong bg-surface text-ink hover:bg-accent-soft',
            )}
          >
            {SHORT_LABELS[optionValue]}
          </button>
        )
      })}
    </div>
  )
}

export default DateRangePills
