import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../lib/utils'

interface PageHeaderProps {
  /** Route heading text, e.g. "Dashboard". Rendered as the page's `<h1>`. */
  title: string
  /** Optional second line (lighter/70%-opacity white), e.g. a date, a range label, or a count. */
  subtitle?: string
  /** `id` for the `<h1>`, so the route's `aria-labelledby` wiring is unaffected by this wrapper. */
  headingId?: string
  /** Small text actions above the title, left side (e.g. "‹ Back"). */
  leading?: ReactNode
  /** Small text actions on the right: above the title when `leading` is set, otherwise level with it (e.g. "Filter"). */
  trailing?: ReactNode
  /** Extra header content under the subtitle (e.g. the history search box). */
  children?: ReactNode
}

/**
 * Small white-on-navy text button for the header's action row (layouts v2:
 * "‹ Back", "Cancel", "Filter"). White at 80% over `--color-brand`
 * composites to ≈ #D1D8DE: 8.5:1.
 */
export function HeaderButton({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-sm py-1 text-[13px] text-white/80 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Navy header bar mounted at the top of each route's content
 * (`ai/instructions/ui-mockup-reference.md` §3/§4 — "dark navy header
 * (status bar + title/subtitle) at the top of every screen"), as a rounded
 * card within the normal content column at every breakpoint.
 *
 * Deliberately *not* bled edge-to-edge on mobile with negative margins:
 * `AppLayout` renders `<IosInstallNote />` before `<Outlet />`, so this
 * component can't assume it's the first element in `<main>` — a negative
 * top margin here would overlap that banner whenever it's showing. A
 * contained rounded bar avoids that fragility entirely while still reading
 * as the mockup's navy header.
 *
 * Contrast of white title text / white-70%-opacity subtitle text against
 * `--color-brand` is checked in `src/index.css`'s token comment
 * (11.64:1 / 6.58:1).
 *
 * No margin of its own — every call site already spaces its children
 * itself (a `space-y-*` wrapper, or an explicit `mt-*` on the next
 * sibling).
 */
function PageHeader({ title, subtitle, headingId, leading, trailing, children }: PageHeaderProps) {
  const actionRow = leading !== undefined
  return (
    <div className="rounded-lg bg-brand px-5 pt-4 pb-5 text-white">
      {actionRow && (
        <div className="mb-1 flex items-center justify-between">
          <div>{leading}</div>
          <div>{trailing}</div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <h1 id={headingId} className="text-[22px] font-medium">
          {title}
        </h1>
        {!actionRow && trailing}
      </div>
      {subtitle && <p className="mt-0.5 text-xs text-white/70">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default PageHeader
