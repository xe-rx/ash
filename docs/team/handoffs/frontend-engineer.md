# Handoff: frontend-engineer
Updated: 2026-10-31 21:11 · Branch: frontend-engineer/atmosphere · Status: done

## Task
PO redesign: no sun path/labels; prayer table panel (Hijri header, rail dot); altitude-driven sun with halos and twilight glow; dusty 7-band palette; clock/countdown under the arc with a real sun clearance test.

## Done
- core: colour.js, palette.js, sunlook.js, geometry.js (arc, sunView, family), clock.js, table.js, scene.js railRow. view: Sky, Sun, PrayerTable, Readouts, AshScene. Old path/ring/labels removed.
- tests: rail, geometry (arc anchors, clearance min 32.9 px, panel clear), clock, palette (7 bands, contrast vs real backgrounds), qt font_metrics at 108 and 27 px, strip test in test_view.sh. screenshot.sh --strip sunrise|sunset.
- Screens: ~/ash-data/screens-atmosphere/ (sheet.png, strip-sunrise.png, strip-sunset.png). Items 130-146 total (was 192-213).

## Next steps
1. Tech lead review/merge. PO to judge on the wall; live window untested by me.
2. Possible polish: panel colour flips quickly at dusk (single step, mauve -> navy); glow after sunset is subtle behind the panel.

## Gotchas learned
- node --test tests/core/*.test.js (dir form fails); npm ci --offline in a new worktree.
- Ink toning only on bands 3..5 (behind clock/countdown); geometry BANDS and clock layout are tied.

## Art review fixes (done)
- 9 sky bands (steps halved: mean 0.044 -> 0.023, max 0.141 -> 0.064), whole-sky lightness shift for ink instead of per-band toning, monotonic top to horizon; day tops violet-blue, mids pinkish, no green (test: OKLab hue 100..200, chroma >= 0.015, alt 8..90).
- Panel: tinted warm paper to plum to indigo (chroma >= 0.02 tested), row fill from panel luminance, rail dot with ring; sun core only a 14% lift, halos tighter by day; family dusk shadow warm; mother lighter; table insets 20 px equal.
