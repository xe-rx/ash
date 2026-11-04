# Handoff: frontend-engineer
Updated: 2026-11-04 05:04 · Branch: frontend-engineer/sadu-redesign · Status: in-progress

## Task
Sadu redesign (PO-chosen): gradient sky only, woven qata table on the right, cream clock + tag countdown, dye colour script, one 8 px grid. PO steer later: richer geometric detail (faceted dunes, richer family/rug, star motifs), item budget ~400.

## Done
- core/script.js + palette.js: dye palette, cream ink all day (sky text zone darkened to 5.6:1), night dim; skyBands renamed skyStops.
- core/table.js (qata layout, UNIT 8), clock.js (120 px clock, tag countdown), geometry.js (BANDS gone, FAMILY x 496), skygrad stops.
- tools/gen-weave.js -> app/ash/assets/weave.png, rug.png; QML Sky/PrayerTable/Readouts rewritten; --sky removed everywhere.
- Sheet render ~/ash-data/screens-sadu/sheet.png looks right.

## Next steps
1. Richer geometry: faceted dunes (Dunes.qml, Silhouettes.qml mesas), Family/Person facets, rug.png on Family cloth, night stars.
2. Count items per moment; run REQUIRE_QT=1 scripts/test.sh, checks; strips sunrise/sunset into ~/ash-data/screens-sadu/.
3. Final report: counts, worst contrast (clock ink 5.60 on sky; faded ink 4.62), font decision (kept Poppins: the chosen sketch uses it).

## Gotchas learned
- Qt 5.11 has no tabular figures: digit cells in clock.js/table.js. Hijri part of scene.js belongs to another builder.
