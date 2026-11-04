# Handoff: frontend-engineer
Updated: 2026-11-04 05:42 · Branch: frontend-engineer/sadu-redesign · Status: done

## Task
Sadu redesign, now on baked art (PO decision): landAt core + Landscape/Tent/lattice view, art from branch frontend-engineer/baked-art.

## Done
- core: script.js landAt + MOMENTS (same stops as stopAt), scene.land, palette.night (night factor), table.js laid out on lattice.png (FIELD x718 w292, rows y124 step 68), arc CX 360 RX 290, clock 108 px at ink top 176. Tests: tests/core/land.test.js and updated palette/geometry tests.
- view: Landscape.qml (2 Images), Tent.qml, PrayerTable.qml (live wash + lattice images + live text/madder row), AshScene/AshView; old Ridge/Facet/Person/Family/Dunes/Silhouettes removed; tools/gen-stars.js (stars + grain remain).
- Items: 96 allocated, 81-82 visible (was 420/384).

- Valance fix: geometry.js valanceY(x) (hem measured on tent.png), ARC_RY 252 with ARC_FLAT 0.7 (noon apex y 128), sun disc r reaches 30 at 12 degrees (sunlook.js), clock 100 px at ink top 200. Year-sampled test in tests/core/geometry.test.js: disc >= 4 px under the hem, >= 16 px from the clock, clear of the panel (worst 4.8 / 17.8 px). Renders ~/ash-data/screens-baked/.
- Review fixes: tools/art/moments.js loads core/script.js (no copy); tests/core/art-moments.test.js (file set, layout tie to tools/art/layout.js, night field 24,26,51 contrast); NIGHT_FIELD in palette.js; DATE_H 58; stale docs fixed; AGENTS.md lists the bake. Rebake is byte-identical.

## Next steps
1. The art lives on main (assets/land, tent*, lattice*); it is not committed on this branch.
2. Check live text alignment against the final baked rows; noon sun is partly hidden by the valance (arc apex y 65).

## Gotchas learned
- Qt 5.11 has no tabular figures: digit cells. Hijri part of scene.js belongs to another builder (I added one line, land:, and an import).
- Baked art (frontend-engineer/baked-art) is merged on main: tools/art/ bakes the PNGs; see docs there.
