# Handoff: frontend-engineer
Updated: 2026-10-31 08:56 · Branch: frontend-engineer/scene · Status: in-progress

## Task
Ash scene view (QML) + palette/geometry cores + dev tooling. See coordinator brief; acceptance: REQUIRE_QT=1 scripts/test.sh, check-file-length, check-pii, check-ash-rules, check-qml, sheet renders.

## Done
- core/palette.js (OKLab stops, contrast-derived inks), core/geometry.js (path, label layout, burn-in shift) with tests.
- app/ash: AshView.qml, MinuteClock.qml, view/*.qml, fonts/Poppins (OFL, THIRD_PARTY_NOTICES).
- dev/harness.py, Harness.qml, sheet.py, sheet-times.js; scripts/screenshot.sh (--sheet works).

## Next steps
1. Label-vs-real-background contrast test (MUST), sun marker under horizon, palette saturation (no grey midpoints), path continuation, family/cloth/clock-weight tweaks (coordinator review notes).
2. static.test.js whitelist (MinuteClock.qml clock, AshView.qml getTimezoneOffset); tests/test_view.sh; scripts/run-local.sh; check-qml on new files.
3. Re-render sheet, view it, final report (live window UNTESTED).

## Gotchas learned
- Poppins digits are proportional: time drawn in fixed digit cells.
- Do not use item scale (jagged); size by factor.
