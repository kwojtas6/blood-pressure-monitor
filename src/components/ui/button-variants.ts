import { cva } from 'class-variance-authority'

/**
 * Split out from `button.tsx` so that file can export only the `Button`
 * component (keeps React Fast Refresh happy — oxlint's
 * `react(only-export-components)` flags a component file that also exports
 * a plain value). Also reused directly by callers that need button styling
 * on a non-`<button>` element, e.g. a `<Link>` rendered as a button.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent/90',
        secondary:
          'border border-border bg-surface text-ink hover:bg-accent-soft',
        ghost: 'text-ink hover:bg-accent-soft',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
