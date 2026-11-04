# PR 0013: Sadu redesign with baked scene

Branch: `frontend-engineer/sadu-redesign` · Author: frontend-engineer · Status: merged

## Summary
PO decisions 2026-11-04: gradient sky only; the Sadu direction (Impeccable decision page); "more impressive, detailed and modern"; scene C (tent setup with lattice panel). Dye colour script with an authored night; cream clock with a prayer tag; table drawn live over the baked lattice (madder next row, faded passed rows); `landAt` cross-fades two of 14 baked land layers per minute; night factor cross-fades the tent and lattice night variants; live sky wash under the lattice; sun arc lowered under the valance. Removed: bands sky, `--sky`, and every primitive landscape file. Items: 96 allocated (from 420).

## Checks
- Trial merge on main (after PRs 0011, 0012): `REQUIRE_QT=1 scripts/test.sh` all 12 passed; check-file-length, check-pii, check-ash-rules, check-qml (12 files, 0 errors) pass
- Core tests 109 pass (reviewer, fresh clone)
- Renders `~/ash-data/screens-final/` (sheet viewed by the tech lead, sent to the PO); midday sun clear of the valance
- Contrast: clock 5.60:1 worst over sky and halos; faded rows ≥4.5:1 against both the day and night lattice fields (a test caught 4.45:1 at night, fixed)
- Toon cost of the full-screen images: unmeasured (risk)

## Reviews
### code-reviewer (round 1, with PR 0012): CHANGES REQUESTED
Blocking: colour-table drift guard. Non-blocking: stale docs, undocumented art build, night contrast against baked pixels, table geometry tied to the art layout.
### code-reviewer (round 2): APPROVE (high)
All resolved. Non-blocking, to backlog: comment on the relaxed ellipse proxy test; `valanceY` is hand-measured from tent.png with no test tying it to the image; hem margin 4.8 px against 4 px.

### security-reviewer: not required

## Resolution
Two fix rounds plus the sun fix. Merged after the trial merge.
