import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui/button'

/**
 * Registers the service worker and surfaces a visible "update available"
 * prompt when a new version has installed and is waiting — rather than
 * silently activating it underneath the user (spec §8, task 6 scope item 3,
 * `ai/instructions/react-pwa-guidelines.md`'s "Updates" rule).
 *
 * `registerType: 'prompt'` + `injectRegister: false` in vite.config.ts hand
 * registration entirely to this hook (see its comment there), so this is the
 * only place the service worker gets registered.
 */
function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      // Registration failures shouldn't break the app (it still works
      // fully online, just without offline support) — surfaced for anyone
      // debugging via the console, not swallowed silently.
      console.error('Service worker registration failed:', error)
    },
  })

  if (!needRefresh && !offlineReady) return null

  const dismiss = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-20 z-20 mx-auto flex max-w-md flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-lg md:inset-x-auto md:right-6 md:bottom-6 md:left-auto"
    >
      {needRefresh ? (
        <>
          <p className="text-sm font-medium text-ink">
            A new version of this app is available.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => updateServiceWorker(true)}
            >
              Refresh to update
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={dismiss}>
              Later
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink">
            This app is ready to work offline.
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}

export default UpdatePrompt
