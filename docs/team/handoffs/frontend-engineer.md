# Handoff: frontend-engineer
Updated: 2026-10-31 20:58 · Branch: frontend-engineer/atmosphere · Status: in-progress

## Task
PO redesign: remove sun path/ring/labels; prayer table panel right (Hijri header, rail dot); prettier altitude-driven sun (3 halos + disc + core, glow under horizon); dusty 7-band palette; clock under the arc with real sun-vs-clock clearance test. Baseline QML items before: 192-213 total (179-200 visible).

## Done
- core: colour.js (maths + mixLch), palette.js (7 bands, panel colours), sunlook.js, geometry.js (arc, sunPlace/sunView, shift, family), clock.js, table.js; scene.js railRow (pathProgress removed).
- view: Sky(7 bands), Sun, PrayerTable, Readouts, AshScene; old SunPath/SunRing/PrayerLabels/SunDisc removed.
- tests: rail, geometry (arc anchors, clearance min 35 px, panel), clock, palette updated; qt font_metrics checks sizes 108 and 27.

## Next steps
1. Sheet + sunrise/sunset strips (>=8 frames) to ~/ash-data/screens-atmosphere/, look critically, tune colours/family x.
2. Element count after; contrast minima; docs/GLOSSARY update (sun path mentions); dev/sheet-times unchanged.
3. Full checks: REQUIRE_QT=1 scripts/test.sh, check-file-length, check-pii, check-ash-rules, check-qml.

## Gotchas learned
- node --test tests/core/*.test.js (dir form fails); npm ci --offline in a new worktree.
- Ink tone only on bands 3..5 (those behind clock/countdown); palette test derives bands from geometry.
