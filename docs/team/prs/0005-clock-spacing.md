# PR 0005: clock spacing, polar message, marker test

Branch: `frontend-engineer/clock-spacing` · Author: frontend-engineer · Status: merged

## Summary
Clock characters are placed by ink from a measured Poppins glyph table, with the colon fixed at the centre, so a 1 no longer leaves wide gaps. A polar day near today now reports the sun error instead of a time zone one. New tests pin markers to the ring and the glyph table to Qt.

## Checks
- `scripts/check-file-length.sh`: pass
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed, in a trial merge with PRs 0006 and 0007 and again on `main`
- check-pii, check-ash-rules and check-qml: pass
- Screenshots: `~/ash-data/screens-clock/`, `~/ash-data/screens-round2/sheet.png`; the tech lead viewed both sheets and 08:48
- handoff updated: 730a1f8

## Reviews
### code-reviewer: APPROVE (medium)
No blocking findings. Non-blocking, all fixed before merge: the 12 px colon bound couldn't fail, an unused variable, a marker test that only proved agreement, and a glyph table checked only against itself.
Left as is: with the fallback font the gaps become uneven. That is cosmetic and only happens if Poppins fails to load.

### security-reviewer: not required

## Resolution
One fix round. Colon now asserted constant over all 1440 minutes, fixed pixel anchors added at sunrise, Dhuhr and sunset, `tests/qt/font_metrics.py` added. Failure shown for the anchors and the glyph table by temporary breaks. The fix commit wasn't re-reviewed by an agent; the tech lead read `font_metrics.py`. Merge commit dda591b.
