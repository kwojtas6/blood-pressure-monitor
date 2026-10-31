import * as React from 'react'
import { cn } from '../../lib/utils'

/**
 * shadcn/ui-style Input primitive, restyled to this app's existing design
 * tokens. `aria-invalid` (set by the consuming form) drives the error
 * border/ring color via the built-in Tailwind `aria-invalid:` variant.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-ink shadow-xs transition-colors outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40',
        'aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/30',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
