# Project hub instructions for AI assistants

Read `docs/ai-update-protocol.md`, `DEPLOYMENT.md`, latest `data/projects.json`, `data/updates.json` and `model.mjs` before edits. Read Johnson's personal shared Drive Home/Rules and current canonical project records through available authenticated tools.

Update records after meaningful project work, not ordinary chats. Ask for missing material information one short question at a time; preserve unknown dates. New substantial projects get canonical board/roadmap/handover and a public-safe hub entry; check for duplicates. Keep completed history and stable IDs. Preserve the approved UI.

Canonical changes require readback evidence and a private pending-publication handover. Use `scripts/hub-update.mjs` for a guarded projection plus matching `data/updates.json` receipt. Commit both through a feature branch/PR, validate, wait for checks on the current head, merge when appropriate and verify live JSON. No direct main push or force push. Do not mark a task published just because a PR was created or merged.

Keep all private input/receipts, conversation text, credentials, health/contact/financial data, sensitive evidence and employer data out of the public repo. Never pretend unavailable tools or incomplete chat search succeeded. Daily scans report their actual coverage and resume pending publication rather than duplicating work.

Required checks: `node --check app.js`, `node scripts/validate-projects.mjs`, `node scripts/test-model.mjs`, `node --check road-view.mjs`, `node scripts/test-road.mjs`, `node scripts/validate-updates.mjs`, `node scripts/test-hub-update.mjs`.
