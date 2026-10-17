import * as React from 'react'
import { cn } from '../../lib/utils'

/**
 * shadcn/ui-style Select primitive. A plain native `<select>` (no Radix
 * Select) — per `ai/instructions/react-pwa-guidelines.md`'s "semantic HTML
 * before ARIA" rule, a native select is already fully keyboard/
 * screen-reader accessible with no extra dependency, and this app has no
 * other use case (custom option rendering, search) that would need more.
 */
function Select({
  className,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-ink shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40',
        className,
      )}
      {...props}
    />
  )
}

export { Select }
