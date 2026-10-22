# Johnson’s Project Hub

Public GitHub Pages dashboard at https://jhnsono.github.io/project-hub/.

## Reference implementation

- Light: sidebar, cards with segmented progress and NEXT actions, compact expandable status chips and a mini timeline.
- Dark HUD: independent done/doing/blocked rings, project gauges and full-width single-project groups.
- Charcoal: percentage, stacked status bar and grouped ledger rows.
- Dark modes open dedicated project screens. Flow, Kanban and Roadmap toggle independently.
- Today ranks blocked items, active items, then dependency-ready to-do items; at most five.
- Done/Block/Add are **in-memory previews only**. Reload resets them. No credentials or client write token are stored.

## Canonical snapshot

`data/projects.json` contains completed deliverables and outstanding items reconciled from canonical handovers, logs, issues and recent completion reports. The legacy milestone summaries are retained as a fallback. Each task includes an evidence link. Dates, dependencies, owners and last-touched metadata are left unset when unverified. Progress is the share of recorded work items done, not an estimate of an exhaustive final product scope. A completed local implementation does not close a separate live acceptance check.

For verified task records, a project may add a `tasks` array. Tasks require stable `id`, `name`, `status`, and `depends_on`; optional nullable fields are `owner` (`claude`/`chatgpt`), `note`, `last_touched`, `lane`, `start`, `end`, `completed_on`, and `evidence` (labelled Google/GitHub source links). If `tasks` exists it is displayed instead of milestones. Do not copy mockup sample data. The flow calculates dependency layers. Roadmap renders dated items as weekly lane-based Gantt bars and lists open undated items under Unscheduled. Completed items without a known date have their own Completed section. Known completion dates appear as diamond milestones; no start dates or durations are invented for historical work.

Both AIs should read current canonical trackers, reconcile only verified changes to the snapshot, update the date/editor, and publish via a feature branch and PR. This is shared file access, not automatic chat-memory synchronisation.

## Checks

```sh
node --check app.js
node scripts/validate-projects.mjs
```

The validator rejects duplicate task IDs, invalid states/dates, dangling dependencies and cycles. No framework or build step is required. `styles.css` is retained for the older OEV access page; the main dashboard uses `dashboard.css`.

Detailed reference and responsive audit: [22 October visual audit](docs/visual-audit-2026-10-22.md).

Timeline ranges can also record `date_basis` (`observed` activity or `planned`) and `date_note`; a supplied basis requires both dates, an explanatory note and source evidence. Bars are recorded work windows, not continuous effort. See [date reconciliation](docs/roadmap-date-evidence.md).
