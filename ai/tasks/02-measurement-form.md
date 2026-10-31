# Task 2 — Measurement form

Depends on: Task 1. Reference: `ai/instructions/bp-monitor-spec.md` §2, §5.

## Goal

Let a user record, edit, and delete a blood pressure reading.

## Scope

1. **`src/components/MeasurementForm.tsx`**
   - Fields: systolic (mmHg), diastolic (mmHg), pulse (bpm), optional note (max 500 chars), date/time (auto-filled to now, editable).
   - Validation: systolic 60–250, diastolic 40–150, pulse 30–200. Inline error messages per field, not a single generic error. Block submit while invalid.
   - On submit: compute `category` via `bpClassification`, save via the `useMeasurements` store, navigate to `/` or `/history` (confirm destination makes sense once the dashboard exists — placeholder is fine for now).
   - Support both "add" mode and "edit" mode (pre-filled fields, same validation) — route `/add` handles both, e.g. via an optional `:id` param or query param.
   - Every input has an associated `<label>`; errors linked via `aria-describedby`.

2. **Edit/delete entry points** — even though the full list UI is Task 3, add a minimal temporary list (or reuse the Task 1 placeholder) so edit/delete can be exercised end-to-end; Task 3 will replace this with the real `MeasurementList`.

3. **shadcn/ui** — introduce it now for form primitives (input, label, button) since this is the first real form; pull in only the components actually used.

## Acceptance criteria

- Submitting valid values creates a record visible in IndexedDB with the correct auto-computed `category`.
- Each out-of-range field shows its own inline error and blocks submission; correcting the field clears its error without needing a full form reset.
- Editing an existing measurement loads its current values, allows changes, and updates (not duplicates) the record.
- Deleting a measurement removes it from IndexedDB and from any visible list.
- Full keyboard operability: tab order is logical, submit works via Enter, no keyboard trap.
- `npm run lint` and `npm run build` pass.
- Manually verified at mobile viewport width.
