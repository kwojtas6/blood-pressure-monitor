import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { buttonVariants } from './button-variants'

/**
 * shadcn/ui-style Button primitive, restyled to this app's existing design
 * tokens (see `@theme` in `src/index.css`) rather than shadcn's default
 * color system, so it matches the rest of the UI without introducing a
 * second palette.
 */
export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
