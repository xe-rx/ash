# Handoff: frontend-engineer
Updated: 2026-10-31 15:17 · Branch: frontend-engineer/clock-spacing · Status: done

## Task
Clock spacing (even gaps around 1, colon stable <=12 px), polar message fix, marker-vs-ring test.

## Done
- Polar: sceneAt maps a "polar" throw from any neighbouring day to a sun error (scene.js NO_SUN); test in scene.test.js (failed first: "time zone" message at lat 66).
- Markers: tests/core/markers.test.js (5 dates, utrecht); fails when the prayer mapping is offset by 0.02.
- Clock: geometry.clockGlyphs places each char by ink (metrics measured in Qt 5.11, 140 px SemiBold), colon fixed at CX (shift 0), gap 15 px; Readouts.qml uses it; tests/core/clock.test.js (1440 minutes: colon shift, equal gaps, fits in OBSTACLES[1]). Old clockCells/DIGIT_CELL removed.
- Screens: ~/ash-data/screens-clock/ (sheet.png, 5 singles).

## Next steps
1. Tech lead: review and merge. PO: check on device (live window untested).

## Gotchas learned
- node --test tests/core/ (directory form) fails here; use tests/core/*.test.js. npm ci --offline needed in a new worktree.
- Glyph metrics are hardcoded; if the font file changes, re-measure (QFontMetricsF).
