# Detailed visual sweep — 22 October 2026

Compared the public dashboard with all ten supplied screenshots, `mockup-Main.dc.html` and `BUILD_BRIEF.md`. This pass corrected layout and interaction differences, rather than changing project facts to resemble the mockup's fake data. The original 97 records remain intact; a separate completed AI-project task records this audit, bringing the snapshot to 98 items / 68 Done.

## Findings and corrections

| Area | Difference found | Correction |
| --- | --- | --- |
| HUD hero rings | Percentage-based radial masks changed the visible thickness and spacing. The completed arc was almost white. | Use the reference's fixed-width radial masks: 12/9/7px bands, 0/22/41px insets, grey `acc2` completed arc and bright active arc. |
| HUD tick ring | Tick spacing, thickness and radius differed. | Restore 0.7-degree marks on a 4.5-degree cadence, 6px tick band, 12px exterior offset and 0.55 opacity. |
| HUD home hero | Gauge box and spacing did not reproduce the reference geometry. | 220px gauge plus 12px margin; the measured desktop hero is 302px high, including its 28px vertical padding and border. |
| Project hero | Reused the larger home gauge and spacing. | Use the reference's 200px gauge, 26px panel padding, 42px counters and 18px counter gap. |
| Phone hero | Desktop ring proportions and counter spacing were unsuitable at narrow widths. | Scale to a 144px gauge with 8px margin, narrower bands, 32px counters and 12px gaps. Counter labels stay on one line. |
| Charcoal Today | An extra enclosing panel/border made it look like HUD. | Use the reference's top divider, transparent background and edge-aligned list. |
| Charcoal ledger | Bar positions moved with the length of each completion/blocker count. | Use a shared three-column grid, with a fixed count column. All five bars begin at exactly the same x coordinate. |
| Charcoal phone ledger | The desktop row needed deliberate wrapping. | Project name occupies the first row; aligned bar and count share the second. |
| Charcoal group spacing | A 14px heading gap exceeded the 8px reference gap. | Restore 8px between group heading and ledger. |
| Light card geometry | Padding, radius, gaps, icon, badge and type sizes differed from the source. | 18px padding, 14px gaps/radius, 38px monogram, 1.45rem heading, 11px badge/NEXT labels and 12px counter. |
| Light card baseline | Longer next actions produced ragged lower borders and Details buttons. | Stretch collapsed cards within each row and let NEXT absorb spare height. Desktop first-row cards and buttons now align. |
| Light Details | Expanded into a full-width engineering panel instead of the reference's compact card content. | Keep the card in its grid; display status groups with task chips, followed by a small timeline. Only one Light card opens at a time. |
| Light task inspection | Compact chips needed access to the underlying task note and evidence. | Chips open the existing task detail inside the card. Every interactive chip keeps a 44px minimum target. |
| Light timeline | Missing compact reference timeline. | Render confirmed completion diamonds/scheduled bars against the real date range; truncate only the compact row label, with its full name/date available in accessible text and a tooltip. Unknown dates are counted explicitly. |
| Light completed text | Light text on the muted completed-node fill had low contrast. | Use the reference's dark `ink` for completed items and `onacc` for active items. |
| Light Today | Used HUD-style slashes and different type hierarchy. | Restore the softer `Today · N to move on · M blocked overall` wording and source type sizes. |
| Light tablet layout | Sidebar consumed too much of the usable width, leaving one narrow card column. | Move filters to the top between 761 and 980px; 768px now displays two cards per row. |
| Light pickup | Could compress the next-action title alongside its action pill. | Let copy and action wrap when needed. |
| Filtered navigation | Opening OEV from an FFA-filtered Light screen could leave the target card hidden. | Opening a specific project restores All projects and expands the target. |
| Cross-theme navigation | Visiting a dark project automatically left a stale expanded Light card behind. | Keep explicit Light disclosure state separate; switch to the selected project deliberately when entering Light. |
| Project header | Back label could wrap alongside the longest title. | Keep Back unbroken and allow the title itself to wrap. |
| Project spacing | Used home-sized 26px gaps and put the separator below Status. | Use 14px project spacing and the reference's divider/padding above the view toggles. |
| Flow | Required internal sideways scrolling; phone nodes could be clipped. | Wrap dependency layers using the reference's flexible column layout. On phones, use full-width layers and down arrows between them. |
| Flow type | Node titles and metadata used different size/leading. | Restore 15px / 1.2 title metrics, source letter spacing and metadata opacity. |
| Task details | Selecting a Kanban/Flow task could open its note far outside the viewport. | Scroll the selected detail into view after rendering, with a 20px scroll margin. |
| Kanban | Always forced two columns, including when it was the only desktop panel. | Adapt to available width: four columns when space allows, two alongside Flow, one on narrow phones. |
| Kanban type | Titles had larger size/leading and excessive internal gap. | Restore 15px / 1.25 titles and 6px internal gap. |
| Panel gutter | Flow/Kanban used 24px horizontally instead of the source's 28px. | Restore 28px horizontal / 24px vertical gutters. |
| Gantt alignment | Multi-line task names were taller than their tracks. | Stretch the track/grid/today marker to the task row; give labels a 12px right gutter. |
| Gantt week geometry | Long ranges could make headers wider than the coordinate area used by bars. | Give the whole timeline a minimum width derived from its week count, keeping the week cells and plotted coordinates aligned. |
| Today typography | HUD and Charcoal reused generic action/body styling. | Apply each theme's source font, case, weight and letter spacing. |
| Keyboard focus | Replacing the page after a control action discarded focus. | Restore focus to the equivalent control/card/toggle without scrolling. |
| Footer | 9–10px text was difficult to read. | 12px desktop and 11px phone text with 1.5 line height. |

## Verification performed

### Responsive home screens

All three themes were measured at explicit viewport widths **375, 768, 1024, 1360 and 1440px** after the final styling changes. All 15 combinations had `documentElement.scrollWidth === documentElement.clientWidth`. Classic scrollbars take 15px in overflowing frames, so a 375px frame's content width is 360px; this was not mistaken for overflow.

No home button measured below 44px in either dimension. Phone outer gutters remain 16px. HUD content stays within the 1120px maximum-width container (including 24px desktop padding); Light keeps its 220px desktop sidebar and 32px main gutters.

At 1360px, the final collapsed Light layout measured three 304px-high cards in the first row and two 284px-high cards in the second. Cards in each row share their top/bottom edges and action baseline. At 768px it uses two/two/one cards. At 375px it stacks one per row. Heights follow the real text rather than truncating the NEXT action.

### Project screens and expanded states

- Opened **every project** at 375px in HUD with Flow, Kanban and Roadmap simultaneously enabled. Each document and flow graph fit its 360px content width. Each roadmap alone scrolled inside a 328px panel over its 760px timeline; it did not widen the document. Project buttons remained at least 44px.
- Opened **every Light card** at 375px. Status chips preserved all 22 Website, 22 Media, 14 Automation, 26 OEV and then-13 AI records. The final audit record subsequently adds one AI chip. The compact timelines used only known dates; the document did not overflow.
- Checked desktop HUD/Charcoal project pages with simultaneous panels. At a 1360px viewport, Flow and Kanban each measured 522px, separated by 28px; Roadmap occupied the full 1072px content row.
- Inspected roadmap rows with long labels. Tracks stretch with label height, including a 59px task row / 55px track after 2px top/bottom padding, rather than ending at the old fixed 30px height.
- Verified selected OEV task details and evidence appear inside the phone viewport after clicking a Flow node or a Light status chip.
- Verified the FFA filter → OEV pickup path opens the correct Light card and restores All projects.
- Verified Today disclosure retains keyboard focus. A Done preview changed 68 → 69 Done and 11 → 10 blocked; Add displayed a temporary inbox item. Reload restored 68 Done / 11 blocked, removed the inbox item, collapsed Today and retained the Charcoal theme.
- No application-script error was observed during preview checks. Browser-extension metadata errors were present and are unrelated to dashboard code.

### Source and regression checks

`node --check app.js`, snapshot validation and the existing model/validator regression suite pass. No mockup sample tasks, fabricated dependency edges, schedule dates or credentials were introduced. Temporary responsive wrappers and inbox test content are excluded from publication.

## Deliberate differences from the example images

This is a faithful implementation of the layout rules, not a claim that screenshots containing different content are pixel-identical. Real titles, blockers and the full completed history naturally produce different line breaks, card heights and longer expanded boards. The screenshots also include Claude's app chrome, pointer overlays and a sharing tooltip; those are not part of the site.

The mockup's sample Gantt has planned start/end ranges throughout. Current source records mainly establish completion dates, so the real hub shows completion diamonds, a separate completed-without-date section and unscheduled work. Dependencies, owners and dates remain unknown where evidence does not establish them. A project without recorded dependencies groups its tasks by lane instead of manufacturing arrows.

Task chips are at least 44px tall for touch use; the noninteractive sample chips were shorter. The gauge says **Work done**, and the footer explains recorded scope, to avoid implying that the recorded-item percentage is exhaustive final-product completion. Browser Done/Block/Add controls remain labelled preview-only; cross-account synchronization is a separate open task.

Release checks and the final published-page verification are recorded in the pull request and shared project handover.
