# Johnson’s Project Hub

Public GitHub Pages dashboard at https://jhnsono.github.io/project-hub/.

## Reference implementation

- Light: sidebar, cards with segmented progress and NEXT actions, expandable details.
- Dark HUD: independent done/doing/blocked rings, project gauges and full-width single-project groups.
- Charcoal: percentage, stacked status bar and grouped ledger rows.
- Dark modes open dedicated project screens. Flow, Kanban and Roadmap toggle independently.
- Today ranks blocked items, active items, then dependency-ready to-do items; at most five.
- Done/Block/Add are **in-memory previews only**. Reload resets them. No credentials or client write token are stored.

## Canonical snapshot

`data/projects.json` currently contains curated phase records, not complete task backlogs. The UI normalises these into phase nodes with stable derived IDs. Dates, dependencies, owners and last-touched metadata are left unset when unverified. Progress is the share of listed phases done, not an estimate of whole-project completion.

For verified task records, a project may add a `tasks` array. Tasks require stable `id`, `name`, `status`, and `depends_on`; optional nullable fields are `owner` (`claude`/`chatgpt`), `note`, `last_touched`, `lane`, `start`, and `end`. If `tasks` exists it is displayed instead of milestones. Do not copy mockup sample data. The flow calculates dependency layers. Roadmap renders dated items as weekly lane-based Gantt bars and lists undated items under Unscheduled.

Both AIs should read current canonical trackers, reconcile only verified changes to the snapshot, update the date/editor, and publish via a feature branch and PR. This is shared file access, not automatic chat-memory synchronisation.

## Checks

```sh
node --check app.js
node scripts/validate-projects.mjs
```

The validator rejects duplicate task IDs, invalid states/dates, dangling dependencies and cycles. No framework or build step is required. `styles.css` is retained for the older OEV access page; the main dashboard uses `dashboard.css`.
