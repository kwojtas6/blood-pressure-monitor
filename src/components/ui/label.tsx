import * as React from 'react'
import { cn } from '../../lib/utils'

/**
 * shadcn/ui-style Label primitive. Deliberately a plain native `<label>`
 * (no Radix/Base-UI Label primitive) — per
 * `ai/instructions/react-pwa-guidelines.md`'s "semantic HTML before ARIA"
 * rule, a native label associated via `htmlFor` already gives full
 * accessibility here with no extra dependency.
 */
function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'text-sm font-medium text-ink select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
