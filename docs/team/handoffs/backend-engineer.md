# Handoff: backend-engineer
Updated: 2026-11-04 05:01 · Branch: backend-engineer/hijri-maghrib · Status: done

## Task
Hijri date rolls over at Maghrib (PO, 2026-11-04), keeping +1/-1 offset; no-Maghrib keeps midnight.

## Done
- app/ash/core/scene.js: hijriFor(today + 1 if nowMs >= today's maghrib). 
- tests/core/scene-hijri.test.js: before/at Maghrib, 23:59, 00:00, offsets +1/-1, polar case. Red first (2 failing), then green.
- No glossary/README text stated midnight rollover; BOARD.md open question left for the tech lead.

- Follow-ups: fall back to today's date when the +1 lookup is past the table end (test at last table day); Maghrib looked up by name in tests.

## Next steps
1. Tech lead: merge, close the BOARD question on Maghrib vs midnight.

## Open questions / blockers
- Polar: Maghrib null cannot reach the Hijri line, since polar days fail the whole scene first; the midnight guard is defensive and the test asserts the scene error.

## Gotchas learned
- Worktree needs npm ci before scripts/test.sh.
