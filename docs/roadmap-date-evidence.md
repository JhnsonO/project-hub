# Roadmap date reconciliation — 22 October 2026

The previous audit retained completion dates but did not adequately reconcile actual implementation windows. Johnson requested a deeper review of conversations, GitHub and AI handovers. This pass adds 33 evidence-supported activity bars across all five projects. A bar means the observed calendar window of implementation/review activity, not uninterrupted effort or a timesheet. A diamond still means a completion date is known but no work period has been established. No current future deadlines were invented.

## Evidence used

- Website master handover: dated 3–6 October chronology, including the homepage draft/native rebuild and booking/shop implementation.
- FFA Media: both pages of PR #28's 116 implementation commits (12–20 October), the original PR dates, and dated sections of `docs/ai-project-state.md`, including its later appended 20–21 October entries. The compact `current-state.md` had missed these later entries and must not override them.
- OEV: dated August implementation/test entries in the FFA Automations historical log; renderer merge `df07a86`, shared-buffer rollout `f27cbb6` and backward bridge merge `c8b0d74`. The historical log establishes activity, while separate M1/customer acceptance remains open.
- OEV conversations: the 18 October conversation records the comparison run underway; Johnson's 20 October handover reports the completed human review and selected baseline. These bound the recorded comparison activity window. The 21 October canonical roadmap confirms the decision and current corrections-first priority.
- AI Hub: PR #1, #10 and #12 code/validation/merge records on 22 October.
- Metadata uploader: implementation commit `a85d003` plus its 15 October test/state entry.

GitHub commit times were interpreted in Europe/London, matching Johnson's working calendar. Thus the uploader commit at 23:01 UTC on 14 October is dated 15 October locally; the backward bridge merge at 23:23 UTC on 16 August is 17 August locally; the simplified share-preview follow-up at 23:02 UTC on 19 October is 20 October locally.

## Reconciled bars

| Project | Task | Recorded activity | Evidence interpretation |
| --- | --- | --- | --- |
| FFA Website | Publish the rebuilt native homepage | 2026-10-03 → 2026-10-04 | Dated handover records draft/prototype work on 3 October and native rebuild/publishing on 4 October. |
| FFA Website | Build the Book Football page and Acuity embed | 2026-10-04 → 2026-10-04 | 4 October handover records construction and checks of the native booking page and Acuity embed. The later route migration is a separate task. |
| FFA Website | Publish the shop rebuild | 2026-10-05 → 2026-10-05 | 5 October handover records the approved live store rebuild, option checks and layout QA. |
| FFA Website | Correct shop variants, swatches and cart questions | 2026-10-06 → 2026-10-06 | 6 October handover records product variant, swatch and cart-question implementation and checks. |
| FFA Website | Repair the tablet pricing and card layout | 2026-10-06 → 2026-10-06 | 6 October handover records the tablet overlap repair and reload verification. |
| FFA Media | Implement v2 camera types and session placement | 2026-10-13 → 2026-10-13 | PR #28 commits 752455f, 8e08ab9 and 8d9f004 record implementation on 13 October. |
| FFA Media | Implement paste-a-link intake and retry status | 2026-10-13 → 2026-10-13 | PR #28 commits 8e08ab9 and 8d9f004 record link-intake implementation and UI on 13 October. |
| FFA Media | Implement v2 player, sync and download controls | 2026-10-12 → 2026-10-14 | 12 October v2 watch/sync frontend commits, 13 October Watch/Sync changes and 14 October native-player/download commits establish this observed implementation window. |
| FFA Media | Implement session review and rework hand-offs | 2026-10-12 → 2026-10-14 | 12 October review/API foundation, 13 October one-video review and 14 October pipeline/rework commits establish the observed implementation window. |
| FFA Media | Build the guarded historical backfill dry-run tool | 2026-10-14 → 2026-10-15 | Backfill dry-run implementation commits on 14 October; Copy report and title-matching corrections on 15 October. This does not mean a production backfill was accepted/applied. |
| FFA Media | Implement drag moves on the Progress board | 2026-10-16 → 2026-10-16 | PR #28 commits 522d97a and 58fdc79 record Board drag implementation and merge on 16 October. |
| FFA Media | Show watch progress and authorised bin/restore controls | 2026-10-16 → 2026-10-16 | PR #28 commits 48cca7d and 43568da record bin/restore and watch-progress implementation on 16 October. |
| FFA Media | Repair beta access, contrast and error handling | 2026-10-13 → 2026-10-16 | 13 October sign-in/cookie and responsive fixes, followed by 16 October contrast/error-handling QA batches; recorded activity window, not uninterrupted work. |
| FFA Media | Separate Shorts from the logging queue | 2026-10-19 → 2026-10-19 | PR #34 / commit 03cadac implemented and locally verified Shorts separation on 19 October. |
| FFA Media | Implement clip flags, issue reports and categories | 2026-10-19 → 2026-10-19 | PR #34 and #35 record issue flags, report UI and categories built on 19 October. |
| FFA Media | Implement late-sync angles and download selection | 2026-10-19 → 2026-10-19 | PR #34 records the after-sync angle hook and angle-selection downloads built on 19 October. |
| FFA Media | Add share previews and square app icons | 2026-10-19 → 2026-10-20 | Share-preview/icon commits on 19 October; the simplified preview follow-up at 23:02 UTC is 00:02 on 20 October in Europe/London. |
| FFA Media | Ship league controls and per-session teams | 2026-10-20 → 2026-10-20 | Implementation activity recorded in dated commits and the historical handover on 2026-10-20. |
| FFA Media | Keep logging controls in full-screen playback | 2026-10-20 → 2026-10-20 | Implementation activity recorded in dated commits and the historical handover on 2026-10-20. |
| FFA Media | Add the guarded admin account switcher | 2026-10-20 → 2026-10-20 | Implementation activity recorded in dated commits and the historical handover on 2026-10-20. |
| FFA Media | Repair Watch clip rows and tablet header layout | 2026-10-20 → 2026-10-20 | Implementation activity recorded in dated commits and the historical handover on 2026-10-20. |
| FFA Media | Cut over v2 as the default application | 2026-10-20 → 2026-10-20 | Implementation activity recorded in dated commits and the historical handover on 2026-10-20. |
| FFA Media | Prerender logged clips and switch to native playback | 2026-10-21 → 2026-10-21 | Implementation activity recorded in dated commits and the historical handover on 2026-10-21. |
| FFA Automations | Implement camera-neutral upload titles and descriptions | 2026-10-15 → 2026-10-15 | Implementation commit a85d003 was made at 23:01 UTC on 14 October, i.e. 00:01 on 15 October in Europe/London; the state log records implementation/tests on 15 October. |
| OEV Broadcast | Build the two-camera cylindrical stitch projection | 2026-08-09 → 2026-08-10 | Merged cylindrical renderer commit df07a86 on 9 August; the 10 August log records geometry/framing implementation and locked configuration. Customer acceptance is separate. |
| OEV Broadcast | Fix zero-copy GPU rendering corruption | 2026-08-10 → 2026-08-15 | 10 August GPU corruption investigations, 12 August correction identifying the real zero-copy defect, and 15 August shared-buffer rollout/visual verification at f27cbb6. |
| OEV Broadcast | Complete detector-resolution and throughput investigation | 2026-08-10 → 2026-08-10 | 10 August detector-resolution A/B and GPU throughput runs, ending in the recorded 1920px decision. |
| OEV Broadcast | Implement pitch-region filtering | 2026-08-10 → 2026-08-10 | 10 August ROI stills and ROI-injection implementation/dispatch entries establish observed work on this day, not the later experimental ROI changes. |
| OEV Broadcast | Implement backward ball-state bridging | 2026-08-17 → 2026-08-17 | Backward bridge merged at 23:23 UTC on 16 August = 00:23 on 17 August in Europe/London; 17 August state entry records sample evidence. |
| OEV Broadcast | Complete the human comparison of camera-brain variants | 2026-10-18 → 2026-10-20 | Dated conversation records show ablation/evaluation running on 18 October and Johnson reporting the completed human comparison in the 20 October handover. These are observed activity bounds. |
| AI Workflow & Shared Context | Publish the project hub on GitHub Pages | 2026-10-22 → 2026-10-22 | PR #1 creation and merge both occurred on 22 October; its commit and deployment history establish a same-day implementation period. |
| AI Workflow & Shared Context | Implement the three reference layouts and project views | 2026-10-22 → 2026-10-22 | PR #10 code, validation, merge and deployment were recorded on 22 October. |
| AI Workflow & Shared Context | Audit and refine the hub against the supplied mockups | 2026-10-22 → 2026-10-22 | PR #12 and the visual audit record this work and verification on 22 October. |

## Corrections found during the date review

The Media historical log has later entries at its end, after older material. It records v2 cutover on 20 October and render-on-log/native-playback work on 21 October. Six omitted completed implementation/delivery records have now been added, with distinct scopes: league controls/teams, full-screen logging, guarded account switching, Watch/tablet layout fixes, v2 default-app cutover and logged-clip prerendering. This is recorded implementation/release evidence, not a new live acceptance test. Postgres, deferred configuration and real-device acceptance tasks remain open.

Backfill tool completion now uses 15 October because the initial 14 October implementation was corrected with title matching and report copy on 15 October. Share-preview completion now uses 20 October in London because the final simplified-card follow-up crossed midnight locally.

## Plans and access boundaries

The old OEV August–January M1–M6 dates are explicitly stale in the current roadmap. They were not silently reactivated. The 18 October conversation's proposed comparison targets were also superseded by actual work/decisions; they are not new commitments. The supplied mockup JSON is fake sample content and was excluded from date evidence, even where context search returned it.

A live message to Claude could not be sent from this session because the connected browser lacked its originating context. Available conversations containing Claude/Opus handovers were used alongside canonical GitHub records; no live AI confirmation is claimed.

## Verification and continuation

JavaScript syntax, schema validation and model/validator regression checks pass. The validator rejects unsupported date bases and activity records without date notes/source evidence. Recorded bars retain their source links and notes, visible in task detail. Completion-only and unknown-date records remain separate. Responsive rendering and deployment evidence are recorded in the release PR/shared handover.

On future work, record the activity start/end when known and its basis (`observed` or `planned`) plus source evidence. Planned ranges must be labelled and sourced to an agreed plan; do not derive work duration from issue creation or a final completion timestamp alone.
