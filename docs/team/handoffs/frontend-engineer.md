# Handoff: frontend-engineer
Updated: 2026-11-04 05:13 · Branch: frontend-engineer/sadu-redesign · Status: done

## Task
Sadu redesign (PO-chosen): gradient sky only, woven qata table on the right, cream clock + tag countdown, dye colour script, one 8 px grid. PO steer later: richer geometric detail (faceted dunes, richer family/rug, star motifs), item budget ~400.

## Done
- core/script.js + palette.js: dye palette, cream ink all day (sky text zone darkened to 5.6:1), night dim; skyBands renamed skyStops.
- core/table.js (qata layout, UNIT 8), clock.js (120 px clock, tag countdown), geometry.js (BANDS gone, FAMILY x 496), skygrad stops.
- tools/gen-weave.js -> app/ash/assets/weave.png, rug.png; QML Sky/PrayerTable/Readouts rewritten; --sky removed everywhere.
- Sheet render ~/ash-data/screens-sadu/sheet.png looks right.

## Done (later)
- Faceted land (view/Ridge.qml, Facet.qml, Dunes, Silhouettes with strata mesas), rug.png border and robe folds (Family, Person). Counts: 277 items allocated, 255-268 visible per moment (2026-06-21 04:00..22:05, 2026-12-21 16:30: 255-258 visible; midnight 268).
- REQUIRE_QT=1 scripts/test.sh all 12 pass; length, pii, ash-rules, qml checks pass. Renders in ~/ash-data/screens-sadu/ (sheet.png, strip-sunrise.png, strip-sunset.png).

## Done (fix round, before the pause message arrived)
- Item 1: qata moved out of the shifted scene (AshView.qml Loader), constant geometry; test in tests/core/geometry.test.js.
- Items 2-4 were already built and committed, NOT half-done: Ridge/Facet three-tone faceted dunes, strata mesas, geometric Person, baked stars.png (tools/gen-weave.js). Items: 420 allocated, ~384 visible (over the ~400 allocated limit). Tests and checks all green.
- PO is rethinking rendering and the right panel: treat items 2-4 as disposable; do not build on them until the PO decides.

## Next steps
1. Await the PO decision; then revise or revert view/Ridge.qml, Facet.qml, Person.qml, Silhouettes.qml, PrayerTable.qml.

## Gotchas learned
- Qt 5.11 has no tabular figures: digit cells in clock.js/table.js. Hijri part of scene.js belongs to another builder.
