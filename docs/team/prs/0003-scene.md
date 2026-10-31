# PR 0003: scene, view and local run

Branch: `frontend-engineer/scene` · Author: frontend-engineer · Status: merged

## Summary
Adds the flat desert scene in QtQuick primitives, the labelled sun path, a time-of-day palette, readouts, burn-in shift, and `scripts/run-local.sh` and `scripts/screenshot.sh`.

## Dependencies
Poppins (SIL OFL 1.1), bundled so that rendering doesn't depend on device fonts; sums in `THIRD_PARTY_NOTICES`. Why this face: geometric, static weights, which Qt 5.11 handles better than variable fonts.

## Checks
- Trial merge with main: `REQUIRE_QT=1 scripts/test.sh` passes (tech lead), including the offline run in `tests/test_view.sh`
- check-file-length, check-pii, check-ash-rules, check-qml: pass (builder and reviewer)
- Screens reviewed by the tech lead across two art-direction rounds
- Unverified: the live window (agents can't reach the display), tap on a real display, the look on the Toon panel, element count (estimate about 175-195)

## Reviews
### code-reviewer: APPROVE (medium-high)
No blocking findings. Non-blocking: the night sun ring holds still and then jumps 366 px in winter; first frame may show the error screen; the display check doesn't match the platform; screenshot `--out` guard edge cases; contrast test repeats the land-colour logic. Those are handled in the follow-up task on the board.

### security-reviewer: not required
No auth, secrets or network. Font licence and sums checked by the code reviewer.

## Resolution
Merged after one art-direction loop and two small fixes.
