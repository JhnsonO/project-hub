# Shared project update workflow

This is the operating contract for ChatGPT and Claude. Read the personal Drive Home and Rules, current canonical tracker and latest main before editing. Preserve the hub's existing design and public read-only behavior.

## During project work

Trigger an update for a new ongoing project, completed work, a confirmed decision, changed scope/priority, a blocker, next action or an explicit deadline. Ignore ordinary chats and exploratory ideas. Read existing answers first; ask only the missing material detail, one short question at a time. Use `questions` for unanswered gaps. Never invent dates or treat an implementation as customer acceptance.

1. Identify the existing canonical project board, roadmap and handover. For clearly new substantial work create these in its appropriate system and add a safe hub project; ask if it may duplicate existing work. Keep employer work in approved employer systems.
2. Save and read back the canonical changes with dated evidence and the next action. Record a unique update ID plus source revision/readback evidence in the private handover. Mark publication pending. Source failure stops publication and success claims.
3. Read latest main and reconcile a complete replacement of only affected project records. Retain stable IDs and completed history. Evidence must support public claims. Keep credentials, personal contact details, health readings, finances, employer data, sensitive evidence and private conversation text out of the public repository. Human review of the proposed public content remains necessary; schema validation is not a privacy detector.
4. Prepare the snapshot and its receipt using the helper below. Both files belong in the same feature-branch commit/PR. If files are staged through separate connector writes, the intermediate branch is incomplete: wait for checks on the final head. CI rejects a snapshot without its matching receipt. No direct push to main, no force push.
5. Run required checks, inspect the diff, create the PR, wait for green checks on its current head, merge when appropriate and check Pages deployment. Fetch live `data/projects.json` and `data/updates.json`; compare against the expected publication. A merge alone is not live verification.
6. Finish the private handover with source saved / PR / merge / live verification / pending step. Retry pending publication on the next run before creating duplicate work. If tools fail, preserve the handover and report the exact incomplete step. Never overwrite another assistant's newer changes.

## Shared preparation helper

No new service, API key, paid subscription or public write token is required. The active AI uses its authenticated Drive/GitHub tools for source writes and publishing. The helper validates and prepares the public projection; it does not directly edit arbitrary Drive trackers or merge PRs.

```sh
node scripts/hub-update.mjs hash ai
node scripts/hub-update.mjs apply /private/path/update.json
node scripts/validate-projects.mjs
node scripts/validate-updates.mjs
node scripts/test-model.mjs
node scripts/test-road.mjs
node scripts/test-hub-update.mjs
# after the final PR merge and deployment, using the expected published files:
node scripts/hub-update.mjs verify UPDATE_ID
```

The private input file must remain outside the repository and never be uploaded as a public artifact. Input shape:

```json
{
  "version": 1,
  "id": "chatgpt-20261023-unique-task-01",
  "editor": "chatgpt",
  "date": "2026-10-23",
  "public_safe": true,
  "sources": [{"record": "canonical record reference", "revision": "read-back revision or dated evidence", "readback_verified": true}],
  "projects": [{"expected_hash": "hash of the latest existing project", "project": {"id": "ai", "...": "complete public project record"}}]
}
```

New projects use `expected_hash: null`. An update with an already-applied ID and identical content is a no-op. Reusing an ID with changed content, a stale project hash, lost task history, or reopening done work without `reopen_reason` is rejected. This allows unrelated project updates to be preserved when the latest files are read first. The public receipt holds only hashes, editor/date and project IDs; source receipts remain private. A pair of local files cannot be a cross-service transaction: the PR/check boundary enforces the complete publication, while private pending receipts support recovery.

## Daily catch-up in each account

Each account searches only its own recent conversations. Start with a rolling 24-hour window and resume from the last successful checkpoint after a failed or missed run. Record the exact attempted window, search coverage and unverified candidates privately. Conversation search may retrieve a selection and cannot be assumed exhaustive. Check message timestamps; do not promote old mockup data, assistant assertions or proposals into current fact.

Reconcile verified project changes against current canonical sources before applying them. Deduplicate by stable project/task IDs and the private change record. Check pending publication first. No new changes means no cosmetic snapshot commit. Ask one short missing-information question when necessary. Never copy raw conversations to the public site.

If history search is unavailable, record a failed conversation scan and separately reconcile available source records. Do not call that a successful scan or substitute a reminder without saying so. Report saved, merged and live states separately. An enabled scheduled task is not an unattended acceptance test; inspect its completed run.

## Current acceptance status — 23 October 2026

- Existing per-task Drive/GitHub access was verified previously; this session read both personal docs and latest main.
- Interactive ChatGPT history search retrieved relevant discussions but explicitly could not confirm exhaustive 24-hour coverage. Results included older material, so timestamp and current-source checks are required.
- ChatGPT daily catch-up is configured for the evening, around 21:00 Europe/London; an unattended run still needs checking.
- Claude is signed out in the current browser. Its scheduling/preferences update and equivalent history-search test remain pending sign-in. Do not mark this as complete.
- The spare ChatGPT account remains outside the setup.
- This helper is a guarded shared publishing preparation step, not a server that continuously monitors accounts or independently synchronizes all sources.
