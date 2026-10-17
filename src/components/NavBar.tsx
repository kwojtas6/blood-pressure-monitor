import clsx from 'clsx'
import { NavLink } from 'react-router'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/add', label: 'Add' },
  { to: '/history', label: 'History' },
  { to: '/chart', label: 'Chart' },
  { to: '/export', label: 'Export' },
]

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors md:flex-row md:justify-start md:gap-3 md:px-3 md:text-sm',
    isActive
      ? 'text-accent bg-accent-soft'
      : 'text-muted hover:text-ink hover:bg-accent-soft/60',
  )

/**
 * App navigation shell: a fixed bottom tab bar on mobile, a fixed side rail
 * on desktop. Both render the same route list from `NAV_ITEMS`.
 */
function NavBar() {
  return (
    <nav aria-label="Primary" className="contents">
      <ul className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface md:hidden">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex flex-1">
            <NavLink to={item.to} end={item.to === '/'} className={linkClasses}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col gap-1 border-r border-border bg-surface p-4 md:flex">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={linkClasses}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar
