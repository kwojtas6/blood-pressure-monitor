# React + PWA Ruleset

Standing rules for any AI agent writing or modifying code in this repo. Stack: React 19, Vite, plain JSX (no TypeScript), `oxlint`. The app is not yet a PWA (no manifest, no service worker) — apply the PWA section when adding that layer.

## Component & code structure

- Function components with hooks only. Never class components.
- One component per file; filename matches the component name (`ReadingList.jsx`).
- Keep components small and focused; extract a sub-component or custom hook once a component mixes more than one concern (data fetching, derived state, presentation).
- Put shared logic in custom hooks (`src/hooks/useX.js`), not in duplicated `useEffect` blocks.
- Co-locate a component's styles/tests next to it; keep cross-cutting utilities in `src/lib/` or `src/utils/`.
- Follow `react/rules-of-hooks` (already enforced by `oxlint`): never call hooks conditionally, in loops, or after an early return.
- Derive values during render instead of mirroring them into `useState` + `useEffect`. Only use `useEffect` for synchronizing with something outside React (DOM, storage, network, subscriptions).
- Don't reach for `useMemo`/`useCallback`/`React.memo` unless a real, measured perf problem calls for it — premature memoization adds complexity for no benefit in most of this app's UI.
- Prefer composition (children, render props) over prop-drilling flags that branch behavior deep in the tree.
- No inline object/array/function literals passed as props in hot render paths if they're also listed as another hook's dependency — it causes needless re-renders/effect reruns.

## State & data

- Keep state as local as possible; lift it only when two components actually need to share it.
- This is a health-tracking app: blood pressure readings are the core data. Treat them as the source of truth in one place (a context or a small store), not duplicated across components.
- Persist readings locally (IndexedDB, not `localStorage`, once storage needs grow past trivial key/value data) so the app keeps working fully offline — this is central to the PWA requirement, not optional polish.
- Never store health data in third-party analytics, logs, or remote services without the user explicitly opting in. No `console.log` of reading values left in committed code.
- Validate and sanitize any user-entered numeric input (systolic/diastolic/pulse) before storing or charting it; guard against negative numbers, non-numeric input, and implausible ranges with a visible error state, not a silent failure.

## Accessibility & UX

- Every interactive element must be reachable and operable by keyboard; use semantic HTML (`button`, `form`, `label`) before reaching for ARIA.
- Form inputs always have an associated `<label>`. Error messages are linked via `aria-describedby`.
- Respect `prefers-color-scheme` and `prefers-reduced-motion`.
- Design mobile-first and test at narrow viewports — PWAs are primarily installed and used on phones.
- Show clear loading, empty, and error states for every async/data-dependent view; never leave a blank screen.

## PWA requirements

- **Manifest**: maintain a `manifest.webmanifest` with `name`, `short_name`, `icons` (at least 192×192 and 512×512, plus a maskable icon), `start_url`, `display: "standalone"`, and `theme_color`/`background_color` matching the app's actual theme.
- **Service worker**: use `vite-plugin-pwa` (Workbox under the hood) rather than hand-rolling a service worker, unless there's a specific reason not to.
- **Caching strategy**: cache-first (precache) for the app shell/static assets; the app must load and show previously-recorded readings with no network at all. Never cache-first anything that could serve stale/incorrect health data as if it were current.
- **Offline-first**: all core flows (log a reading, view history/trends) must work fully offline. Network is only needed for optional features (sync/export/backup), and those must fail gracefully and visibly when offline, not hang or throw.
- **Installability**: verify the app passes the installable checklist (served over HTTPS, valid manifest linked from `index.html`, registered service worker, icons present) before calling PWA work "done".
- **Updates**: surface a "new version available, refresh to update" prompt when the service worker has an update waiting, rather than silently swapping content under the user or forcing an update with no notice.
- **Versioning assets**: let Vite's build hashing handle cache-busting; don't hand-write cache names or TTLs that fight the build output.

## Quality gates before considering work done

- `npm run lint` passes (`oxlint`).
- `npm run build` succeeds.
- Manually verify the change in a mobile-width browser view; for PWA-affecting changes, verify offline behavior (DevTools → Network → Offline, then reload).
- No new `console.log`/`debugger` statements left in.
- No new dependency added without checking it's actively maintained and has no lighter built-in alternative (this app should stay small and installable quickly).
