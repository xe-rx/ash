# PR 0009: atmosphere redesign

Branch: `frontend-engineer/atmosphere` · Author: frontend-engineer · Status: merged

## Summary
From PO feedback on the live window. Removes the sun path and on-path labels. Adds a prayer table on the right with a time rail, a sun with flat halos and a twilight glow, a nine-band dusty desert palette, and a smaller clock centred under the invisible arc. The family moved from x 590 to x 520 (builder's composition call); family and dune shapes are unchanged. Prayer calculations are untouched.

## Checks
- `scripts/check-file-length.sh`: pass
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed, in the trial merge
- check-pii, check-ash-rules, check-qml: pass (13 QML files, 0 errors)
- Screenshots: `~/ash-data/screens-atmosphere/` (sheet, sunrise and sunset strips); viewed by the tech lead
- QML items, builder's count: 192-213 before, 130-146 after. Toon cost not measured.
- Halo contrast over text: worst 4.53 against the 4.5 bound, thin margin
- handoff updated: 5f1973e

## Reviews
### Tech lead art review: changes requested (resolved)
Green sky bands, strong stripes, grey panel at dawn and dusk, fried-egg sun, grey family at dusk, uneven table padding.

### code-reviewer: APPROVE (medium-high)
No blocking findings. Non-blocking, fixed before merge at the tech lead's request: one-frame sky pop at the ink flip, moon cut-out across two bands, stale text, untested halo contrast.

### security-reviewer: not required

## Resolution
Two fix rounds. The second round's commit wasn't re-reviewed by an agent; the tech lead checked renders and the trial merge but didn't read that diff line by line. Known weak spots: the plum panel crossing is vivid and quick, the mother is dim at night, the sunrise sun is clipped at the left edge, the midday sky is a slightly cool lilac. Left for the PO to judge. Merge commit adbbe74.
