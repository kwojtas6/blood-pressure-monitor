import { useState } from 'react'
import { Button } from './ui/button'

const DISMISSED_KEY = 'bp-monitor:ios-install-note-dismissed'

/** iOS Safari has no `beforeinstallprompt` event and no manifest-driven
 * install UI (spec §9 risk "PWA 'Add to Home Screen' limited on iOS
 * Safari") — the only path to installing is the manual Share-sheet flow,
 * which isn't discoverable on its own, hence this in-app nudge. */
function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIos =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ reports as "MacIntel" with touch support in desktop mode.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
  return isIos && isSafari
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return Boolean(nav.standalone) || window.matchMedia('(display-mode: standalone)').matches
}

/**
 * Brief, dismissible "Add to Home Screen" instructions for iOS Safari
 * visitors (task 6 scope item 7). Hidden once already installed, and once
 * dismissed (remembered in localStorage — a per-device convenience, not
 * data that needs to sync or persist reliably).
 */
function shouldShow(): boolean {
  if (isStandalone() || !isIosSafari()) return false
  try {
    return localStorage.getItem(DISMISSED_KEY) !== '1'
  } catch {
    // Private browsing / blocked storage: still show the note — it just
    // won't remember the dismissal this session.
    return true
  }
}

function IosInstallNote() {
  // This is read-once UA/storage state, not something that changes during
  // the component's lifetime, so a lazy initializer (computed once, during
  // this client-only app's first render) is enough — no effect needed.
  const [visible, setVisible] = useState(shouldShow)

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Ignore — worst case the note reappears next visit.
    }
  }

  return (
    <div
      role="note"
      className="mb-4 flex items-start justify-between gap-3 rounded-md border border-border bg-accent-soft p-3 text-sm text-ink"
    >
      <p>
        Install this app on your home screen: tap the Share icon{' '}
        <span aria-hidden="true">⎋</span>, then "Add to Home Screen".
      </p>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={dismiss}
        aria-label="Dismiss install instructions"
        className="shrink-0"
      >
        Dismiss
      </Button>
    </div>
  )
}

export default IosInstallNote
