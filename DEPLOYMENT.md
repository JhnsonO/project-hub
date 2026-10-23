# Deployment

The site is intentionally public on GitHub Pages, as approved by Johnson on 22 October 2026. No authentication is configured. Keep project progress in `data/projects.json` and keep sensitive evidence in the existing protected trackers.

Use a feature branch and pull request. Run the validator and JavaScript syntax check, merge the reviewed change, then confirm the Pages deployment and the live JSON snapshot.

Password protection is deferred. Do not add a cosmetic JavaScript password prompt: it would not protect publicly served data.

## Updating the snapshot

`data/projects.json` is a static snapshot. Nothing syncs it in the background: the live site shows only what was last merged to the default branch.

After substantial project work:

1. Update the canonical tracker or handover first. It stays the source of truth.
2. Reconcile only verified, public-safe changes into the snapshot. Never include credentials, tokens, or private, employer, health or financial data; keep that evidence in the protected trackers.
3. Publish through a feature branch and pull request, with the validator and checks passing.
4. After merge, open the live Pages site and its `data/projects.json` to confirm the change is visible.
