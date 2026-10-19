# Task 1 — Foundation setup

Depends on: none. Reference: `ai/instructions/bp-monitor-spec.md` §3–4.

## Goal

Stand up the project skeleton all later tasks build on: TypeScript, routing, styling, state, and local DB wiring — no feature UI yet beyond a placeholder shell.

## Scope

1. **TypeScript migration**
   - Add `typescript`, `@types/react`, `@types/react-dom` as dev dependencies.
   - Add `tsconfig.json` / `tsconfig.node.json` (Vite's react-ts template config is a fine starting point).
   - Rename `src/main.jsx` → `src/main.tsx`, `src/App.jsx` → `src/App.tsx`.
   - Rename `vite.config.js` → `vite.config.ts`.
   - Update `oxlint` config for TS if needed (`oxlint` supports TS out of the box; verify `.oxlintrc.json` still lints `.ts`/`.tsx`).

2. **Dependencies** — add per spec §3: `react-router`, `zustand`, `dexie`, `tailwindcss` + `@tailwindcss/vite` (Tailwind v4 — CSS-first config via `@import "tailwindcss"` + `@theme`, no `tailwind.config.js`/PostCSS setup), `clsx`. (shadcn/ui, Recharts, jsPDF/html2canvas-pro, vite-plugin-pwa, Vitest land in later tasks that actually use them — don't add dependencies before the task that needs them.)

3. **Routing** — wire up `react-router` with the five routes from spec §6 (`/`, `/add`, `/history`, `/chart`, `/export`), each rendering a trivial placeholder component for now. Add the navigation shell: bottom nav bar on mobile, side nav on desktop (CSS/Tailwind breakpoints, no need for final visual design yet).

4. **Styling** — set up Tailwind CSS (config, directives in the base stylesheet), replace or remove the default Vite template CSS.

5. **Types** — create `src/types/index.ts` with the `Measurement` type and the WHO `Category` union type, per spec §5.

6. **Database layer** — create `src/db/dexie.ts`: Dexie instance, schema for the `measurements` table (indexed on `timestamp`), typed CRUD helpers (add, update, delete, getAll, getByDateRange).

7. **State** — create `src/store/useMeasurements.ts`: a Zustand store that wraps the Dexie helpers and exposes reactive measurement state to components (load, add, update, remove).

8. **WHO classification util** — create `src/utils/bpClassification.ts` implementing the table in spec §5.2 (input: systolic/diastolic → output: category + color). Pure function, unit-testable.

## Acceptance criteria

- `npm run dev` serves the app with working client-side routing between all 5 placeholder routes.
- `npm run build` succeeds with no TypeScript errors.
- `npm run lint` passes.
- `bpClassification(systolic, diastolic)` returns the correct category for a boundary value in each band (test manually or add a quick Vitest check if Vitest is already set up by this point — otherwise defer formal tests to task 2+).
- A measurement written via the Dexie helpers persists across a page reload (verify in DevTools → Application → IndexedDB).
- No `console.log`/`debugger` left in.
