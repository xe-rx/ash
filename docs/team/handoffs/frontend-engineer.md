# Handoff: frontend-engineer
Updated: 2026-11-04 05:32 · Branch: frontend-engineer/sadu-redesign · Status: done

## Task
Sadu redesign, now on baked art (PO decision): landAt core + Landscape/Tent/lattice view, art from branch frontend-engineer/baked-art.

## Done
- core: script.js landAt + MOMENTS (same stops as stopAt), scene.land, palette.night (night factor), table.js laid out on lattice.png (FIELD x718 w292, rows y124 step 68), arc CX 360 RX 290, clock 108 px at ink top 176. Tests: tests/core/land.test.js and updated palette/geometry tests.
- view: Landscape.qml (2 Images), Tent.qml, PrayerTable.qml (live wash + lattice images + live text/madder row), AshScene/AshView; old Ridge/Facet/Person/Family/Dunes/Silhouettes removed; tools/gen-stars.js (stars + grain remain).
- Items: 96 allocated, 81-82 visible (was 420/384).

## Next steps
1. Merge frontend-engineer/baked-art first: the art (assets/land/*.png, tent*.png, lattice*.png) is NOT committed here; without it the view shows no landscape or panel.
2. Check live text alignment against the final baked rows; noon sun is partly hidden by the valance (arc apex y 65).

## Gotchas learned
- Qt 5.11 has no tabular figures: digit cells. Hijri part of scene.js belongs to another builder (I added one line, land:, and an import).
