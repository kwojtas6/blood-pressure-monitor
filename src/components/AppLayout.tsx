import { Outlet } from 'react-router'
import IosInstallNote from './IosInstallNote'
import NavBar from './NavBar'
import UpdatePrompt from './UpdatePrompt'

/**
 * Root layout rendered around every route: nav shell (bottom bar on mobile,
 * side rail on desktop) plus the routed page content.
 */
function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6 md:pb-6 md:pl-60 md:pr-6">
        <IosInstallNote />
        <Outlet />
      </main>
      <UpdatePrompt />
    </div>
  )
}

export default AppLayout
