# Handoff: frontend-engineer
Updated: 2026-10-31 09:00 · Branch: frontend-engineer/scene · Status: done

## Task
Ash scene view (QML) + palette/geometry cores + dev tooling; acceptance: REQUIRE_QT=1 scripts/test.sh, check-file-length, check-pii, check-ash-rules, check-qml, sheet renders.

## Done
- core/palette.js (OKLab stops with deliberate mid colours, inks derived from the real backgrounds), core/geometry.js (ellipse path, label layout, burn-in shift); tests: palette, geometry (3 places, all 2026), labels-contrast (checked red against the old palette).
- app/ash: AshView.qml (nowMs/config/useClock, closed signal, error screen), MinuteClock.qml, view/*.qml, fonts/Poppins (OFL, notices).
- dev/harness.py, Harness.qml, sheet.py, sheet-times.js, image_stats.py; scripts/screenshot.sh (--sheet), scripts/run-local.sh; tests/test_view.sh.
- All checks green at last run (REQUIRE_QT=1 scripts/test.sh: 11 files OK).

## Next steps
1. PO: run scripts/run-local.sh on a machine with a display (live window UNTESTED by me).
2. Polish: sun ring is drawn under the family (hidden when the sun is right behind it); family balance; element count not measured (est. 175-195).
3. Toon tile / dim hook / qb adapter on hold; wrap AshView later.

## Gotchas learned
- Poppins digits are proportional: the clock uses fixed digit cells. Qt 5.11 cannot enable tnum.
- Item scale gives jagged edges: size by factor instead.
- static.test.js allows the clock only in MinuteClock.qml and getTimezoneOffset only in AshView.qml.
- Screenshots: ~/ash-data/screens/sheet.png and single PNGs.
