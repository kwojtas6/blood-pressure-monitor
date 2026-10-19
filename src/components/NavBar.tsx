import clsx from 'clsx'
import { NavLink } from 'react-router'
import {
  ChartWaveIcon,
  ExportIcon,
  HomeIcon,
  ListIcon,
  PlusIcon,
} from './icons'
import type { ComponentType, SVGProps } from 'react'

interface NavItem {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', Icon: HomeIcon },
  { to: '/add', label: 'Add', Icon: PlusIcon },
  { to: '/history', label: 'History', Icon: ListIcon },
  { to: '/chart', label: 'Chart', Icon: ChartWaveIcon },
  { to: '/export', label: 'Export', Icon: ExportIcon },
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
              <item.Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col gap-1 border-r border-border bg-surface p-4 md:flex">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={linkClasses}>
              <item.Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar
