import { Link } from 'react-router'
import { cn } from '../lib/utils'
import type { Category, Measurement } from '../types'
import { CATEGORY_BADGE_STYLES, CATEGORY_LABELS } from '../utils/bpClassification'
import CategoryBadge from './CategoryBadge'
import { ChevronRightIcon } from './icons'

/** Hypertension categories render their values in the badge's dark red/plum, as in the mockups. */
const DANGER_CATEGORIES: ReadonlySet<Category> = new Set(['STAGE_1', 'STAGE_2', 'STAGE_3'])

interface MeasurementRowProps {
  measurement: Measurement
  /** Caption under the values, before the pulse — e.g. "08:15" or "today, 08:15". */
  when: string
  /** Show the note line (history only). */
  showNote?: boolean
  /** When set, the whole row links to the edit screen and shows a chevron. */
  editable?: boolean
}

/**
 * One measurement as a divided list row (layouts v2): category-colored accent
 * bar, values, time/pulse caption, optional note, WHO badge. Color is never
 * the only cue — the badge always carries the category name in text.
 * Render inside a `<ul>`/`<ol>`; the row is the `<li>`.
 */
function MeasurementRow({ measurement, when, showNote = false, editable = false }: MeasurementRowProps) {
  const badge = CATEGORY_BADGE_STYLES[measurement.category]
  const valueColor = DANGER_CATEGORIES.has(measurement.category) ? badge.text : undefined

  const content = (
    <>
      <span aria-hidden className="w-[3px] shrink-0 self-stretch rounded-full" style={{ backgroundColor: badge.text }} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1">
          <span className="text-base font-medium text-ink" style={{ color: valueColor }}>
            {measurement.systolic}
          </span>
          <span className="text-sm text-muted">/</span>
          <span className="text-base font-medium text-ink" style={{ color: valueColor }}>
            {measurement.diastolic}
          </span>
          <span className="ml-1 text-[11px] text-muted">mmHg</span>
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {when} <span aria-hidden>·</span> {measurement.pulse} bpm
        </span>
        {showNote && measurement.note && (
          <span className="mt-0.5 block truncate text-[11px] text-muted">{measurement.note}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <CategoryBadge category={measurement.category} />
        {editable && <ChevronRightIcon className="h-4 w-4 text-border-strong" />}
      </span>
    </>
  )

  const rowClasses = 'flex items-center gap-3 px-3.5 py-3'

  return (
    <li className="border-b border-border last:border-b-0">
      {editable ? (
        <Link
          to={`/add/${measurement.id}`}
          aria-label={`Edit measurement: ${measurement.systolic} over ${measurement.diastolic} mmHg, ${when}, pulse ${measurement.pulse} bpm, ${CATEGORY_LABELS[measurement.category]}${measurement.note ? `, note: ${measurement.note}` : ''}`}
          className={cn(
            rowClasses,
            'transition-colors hover:bg-surface-inset focus-visible:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none focus-visible:ring-inset',
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={rowClasses}>{content}</div>
      )}
    </li>
  )
}

export default MeasurementRow
