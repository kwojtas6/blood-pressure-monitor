# BP Monitor Implementation — Overview

Full scope and architecture reference: `ai/instructions/bp-monitor-spec.md`. Coding rules: `ai/instructions/react-pwa-guidelines.md`. Read both before starting any task below.

Work through these tasks in order — each depends on the ones before it. One task = one unit of work for an AI agent to pick up; don't start task *N* until task *N-1*'s acceptance criteria are met.

| # | Task | Depends on |
|---|---|---|
| 1 | [Foundation setup](01-foundation-setup.md) | — |
| 2 | [Measurement form](02-measurement-form.md) | 1 |
| 3 | [Measurement list](03-measurement-list.md) | 2 |
| 4 | [Chart & stats](04-chart-and-stats.md) | 3 |
| 5 | [Export & sharing](05-export-and-sharing.md) | 4 |
| 6 | [PWA & polish](06-pwa-and-polish.md) | 5 |
| 7 | [Apply UI mockups](07-apply-ui-mockups.md) | 6 |
| 8 | [Apply layouts v2](08-apply-layouts-v2.md) | 7 |

Estimated total: 14–20 working days for one developer (per source spec); treat as relative sizing, not a deadline. Task 7 was added after Tasks 1–6 were implemented and reviewed — it's a presentation-layer pass against `ai/instructions/ui-mockup-reference.md`, not part of the original estimate. Task 8 is a follow-up pass against three more detailed mockups (reference doc §6). It adds small UI features (steppers, search, day grouping, paging) on top of the restyle.

## Ground rules for every task

- Keep this a client-only app: no backend calls, no analytics, no trackers. See the spec's Security & Privacy section.
- TypeScript throughout (`.tsx`/`.ts`), per the project decision recorded in `ai/instructions/bp-monitor-spec.md` §3.
- Every task includes its own acceptance criteria — don't mark a task done until all of them pass, including `npm run lint` and `npm run build`.
- If a task reveals that an earlier decision in the spec doesn't hold up (e.g. a package is unmaintained, an approach doesn't perform), stop and flag it rather than silently deviating — update the spec doc with the change and why.
