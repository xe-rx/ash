# PR 0004: scene follow-ups from PR 0003

Branch: `frontend-engineer/polish` · Author: frontend-engineer · Status: merged

## Summary
Continuous `pathProgress` for the sun and prayer markers (the night ring no longer holds still and jumps); no error screen before the first tick; display check by platform in `run-local.sh`; stricter `--out` guard in `screenshot.sh`; label colours moved into the core.

## Checks
- Trial merge with main: `REQUIRE_QT=1 scripts/test.sh`, check-file-length, check-pii, check-ash-rules, check-qml (tech lead)
- Builder's continuity test samples about 16 days per place, not every minute of 2026, for run time. The reviewer's separate probe covered all of 2026 at Utrecht in 5-minute steps: largest marker move 13.7 px, no backward steps, each prayer marker exactly at the ring's position at that prayer's time. That probe isn't in the repo.

## Reviews
### code-reviewer: APPROVE (high on pathProgress, medium-high overall)
No blocking findings. Non-blocking, on the board: misleading error message near the polar limit in `scene.js`; add a compact marker-matches-ring regression test.

### security-reviewer: not required

## Resolution
Merged without a fix loop.
