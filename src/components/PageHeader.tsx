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
 * (status bar + title/subtitle) at the top of every screen"). Bleeds to the
 * screen edge on mobile (where `AppLayout`'s `<main>` has side padding this
 * cancels out) and sits as a rounded bar within the content column on
 * desktop, next to the side nav rail.
 *
 * Deliberately just a title + optional subtitle: the per-route content
 * (buttons, filters, counts) stays in the route itself. Contrast of white
 * title text / white-70%-opacity subtitle text against `--color-brand` is
 * checked in `src/index.css`'s token comment (11.64:1 / 6.58:1).
 */
function PageHeader({ title, subtitle, headingId }: PageHeaderProps) {
  return (
    <div className="-mx-4 -mt-6 mb-6 bg-brand px-4 py-5 text-white md:mx-0 md:mt-0 md:rounded-lg md:px-6">
      <h1 id={headingId} className="text-xl font-semibold">
        {title}
      </h1>
      {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
    </div>
  )
}

export default PageHeader
