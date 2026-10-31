interface PageHeaderProps {
  /** Route heading text, e.g. "Dashboard". Rendered as the page's `<h1>`. */
  title: string
  /** Optional second line (lighter/70%-opacity white), e.g. a date, a range label, or a count. */
  subtitle?: string
  /** `id` for the `<h1>`, so the route's `aria-labelledby` wiring is unaffected by this wrapper. */
  headingId?: string
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
 * Deliberately just a title + optional subtitle: the per-route content
 * (buttons, filters, counts) stays in the route itself. Contrast of white
 * title text / white-70%-opacity subtitle text against `--color-brand` is
 * checked in `src/index.css`'s token comment (11.64:1 / 6.58:1).
 *
 * No margin of its own — every call site already spaces its children
 * itself (a `space-y-*` wrapper, or an explicit `mt-*` on the next
 * sibling), the same convention the plain `<h1>`s this replaces followed.
 */
function PageHeader({ title, subtitle, headingId }: PageHeaderProps) {
  return (
    <div className="rounded-lg bg-brand px-4 py-5 text-white md:px-6">
      <h1 id={headingId} className="text-xl font-semibold">
        {title}
      </h1>
      {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
    </div>
  )
}

export default PageHeader
