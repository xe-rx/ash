# Handoff: frontend-engineer
Updated: 2026-10-31 08:35 · Branch: frontend-engineer/core · Status: done

## Task
Pure calculation core in app/ash/core, ES5, sceneAt(nowMs, offsetAt, config); tests; Qt 5.11 parity.

## Done
- app/ash/core: civil.js, sun.js, prayer.js, hijri.js, hijri-data.js, config.js, scene.js (all < 130 lines).
- Golden vs adhan-js 4.4.6 (MIT), 2026 + 2028 (leap), Utrecht/Maastricht/Groningen, whole scene and dayTimes: max deviation fajr 900 ms, isha 983 ms (adhan keeps sub-second remainders), sunrise/dhuhr/asr/sunset/maghrib 0 ms.
- Hijri: 1446-1500 AH (2024-07-07..2077-11-16) from @tabby_ai/hijri-converter 1.0.5 (MIT) = port of hijridate (MIT). Cross-checked month by month with .NET UmAlQuraCalendar (MIT): identical 1410-1500 AH; ICU 78.3 agrees 1420-1449. UNVERIFIED against the official KACST site (script-rendered, unreadable); the 6 test dates are from the tables, not the official source. Generator: tools/gen-hijri-data.js (kept for provenance).
- tests: tests/core/*.test.js (node:test), static.test.js (no network/eval/clock/ES6), tests/test_core.sh (53 pass), tests/qt/ (Qt 5.11.2 QML engine vs Node, 4 scenes identical; skipped with message when toolchain absent).
- Prayer day rule (scene.js header): first civil day, from yesterday, whose Isha has not passed.

## Next steps
1. View task binds to sceneAt; pass config parsed from ash.json (keys lat, lon, hijriOffsetDays).
2. CI must run npm ci then tests/test_core.sh (needs node_modules/adhan).

## Open questions / blockers
- Hijri date changes at local midnight, not Maghrib (PO call).
- node --test tests/core/ (directory arg) does not work on Node 25; use the glob (npm test).
- hijri is null after 2077-11-16; error text for polar days when the sun never rises.

## Gotchas learned
- Qt writes .jsc caches beside JS; gitignored, removed by test_core.sh.
- Compare vm-context objects via JSON, not deepStrictEqual.
## Suggested skills
test-driven-development, verification-before-completion
