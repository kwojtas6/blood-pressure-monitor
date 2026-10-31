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
        // Task 7: primary-button background is `--color-brand` (the navy
        // header color), distinct from `--color-accent`/`-soft` used for
        // links/active-nav/focus — see `src/index.css`'s token comment.
        // White-on-brand text contrast: 11.64:1.
        default: 'bg-brand text-white hover:bg-brand/90',
        secondary:
          'border border-border-strong bg-surface text-ink hover:bg-accent-soft',
        // Layouts v2 secondary action ("Cancel" on the form): accent text +
        // accent border. #2E6DA4 on white 5.47:1, on #F0F4F8 4.95:1.
        outline: 'border border-accent bg-transparent text-accent hover:bg-accent-soft',
        ghost: 'text-ink hover:bg-accent-soft',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        // Full-width mockup buttons ("Save measurement", "+ Add measurement").
        lg: 'h-12 w-full rounded-xl px-4 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
