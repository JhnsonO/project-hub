# Johnson's Project Hub

This repository contains the public GitHub Pages entry point for Johnson's project workspaces. It lists approved project names and sign-in links only. Project task status, boards, roadmaps, evidence and code remain in their existing protected systems.

## Local checks

```sh
node scripts/validate-projects.mjs
```

The validation workflow runs on changes to `data/projects.json`, the validator, or the workflow itself. Keep public directory data limited to project IDs, names, group, monogram, and approved HTTPS workspace links.
