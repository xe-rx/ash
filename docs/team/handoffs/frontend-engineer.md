# Handoff: frontend-engineer
Updated: 2026-11-04 05:12 · Branch: frontend-engineer/sadu-redesign · Status: done

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

## Next steps
1. Tech lead review; PO eyes. Weak spots: night faded rows are quiet (4.62:1 minimum), mesas small, lap fold shade slightly off on children, Toon cost of ~260 items unmeasured, font kept as Poppins.

## Gotchas learned
- Qt 5.11 has no tabular figures: digit cells in clock.js/table.js. Hijri part of scene.js belongs to another builder.
