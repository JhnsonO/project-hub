# Johnson’s Project Hub

Public dashboard: https://jhnsono.github.io/project-hub/

Johnson approved publishing project status, milestones, next actions and general blockers without login on 22 October 2026. Source trackers remain canonical; their detailed records retain their existing access controls.

Never publish credentials, private contact details, health readings, financial records or employer information here.

## Update process

After verified project work, update the canonical tracker and handover first, then reconcile the project snapshot in `data/projects.json`. Read the latest file before editing, preserve unrelated changes, and update the snapshot date and editing assistant. Milestone counts refer to the phases shown, not the entire project backlog. Browser views are read-only; they do not write back automatically.

## Checks

```sh
node scripts/validate-projects.mjs
node --check app.js
```
