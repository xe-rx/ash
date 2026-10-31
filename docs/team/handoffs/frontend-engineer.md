# Handoff: frontend-engineer
Updated: 2026-10-31 08:31 · Branch: frontend-engineer/core · Status: in-progress

## Task
Pure calculation core in app/ash/core (sun, prayer, hijri, scene, config), ES5, node:test + tests/test_core.sh, Qt 5.11 parity check. Contract: sceneAt(nowMs, offsetAt, config).

## Done
- civil.js (date math, formatClock, localDay), sun.js, prayer.js with golden test vs adhan-js 4.4.6 (2026 + 2028, 3 places): max dev fajr 900 ms, isha 983 ms, rest 0 (commit 1).
- tests/core/load-core.js (QML-style vm loader), helpers.js (Amsterdam offsets), adhan-ref.js.
- tools/gen-hijri-data.js: generator for Hijri data from @tabby_ai/hijri-converter 1.0.5 (MIT; port of dralshehri/hijridate MIT). Kept as provenance for hijri-data.js.
- Hijri table cross-check: month starts 1410-1500 AH identical to .NET UmAlQuraCalendar table (MIT) ; ICU 78.3 agrees 1420-1449. RJD r = unix day r-40588.

## Next steps
1. hijri-data.js (1446-1500 AH, '1'=30 days strings; first day 19911) + hijri.js + tests (>=5 known dates, UNVERIFIED vs official KACST site).
2. config.js (keys lat, lon, hijriOffsetDays; <=2 decimals) + config/ash.example.json (only JSON in config/).
3. scene.js: prayer day rule B = first day (civil-1..civil+1) whose Isha > now; dayProgress via day windows split at mid-night between sunset and next sunrise; countdown from minute-floored now.
4. tests: scene, DST (29 Mar / 25 Oct 2026), 00:03 21 June, static no-network/eval/Date.now test, tests/test_core.sh (RESULT line), Qt 5.11 parity (PyQt5 QJSEngine, skip if absent).
5. package.json: fix placeholder description/scripts (use node --test "tests/core/*.test.js"; node 25 rejects a directory arg).

## Open questions
- Hijri day changes at civil midnight, not Maghrib (PO call).
- node --test tests/core/ fails on Node 25 (directory arg); use the glob.

## Gotchas learned
- vm contexts: use JSON compare, not deepStrictEqual, on objects from core.
- Only Utrecht/Maastricht/Groningen coordinates in app/, config/, tests/; no other JSON in config/.
