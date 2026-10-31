import { cn } from '../lib/utils'
import type { Category } from '../types'
import { CATEGORY_BADGE_STYLES, CATEGORY_LABELS } from '../utils/bpClassification'

interface CategoryBadgeProps {
  category: Category
  className?: string
}

/** Pastel WHO-category pill (contrast-checked pairs in `CATEGORY_BADGE_STYLES`). */
function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const badge = CATEGORY_BADGE_STYLES[category]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        className,
      )}
      style={{ backgroundColor: badge.bg, color: badge.text }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}

export default CategoryBadge
