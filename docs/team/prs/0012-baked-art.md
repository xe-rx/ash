# PR 0012: geometric SVG art baked to PNG

Branch: `frontend-engineer/baked-art` · Author: frontend-engineer · Status: merged

## Summary
PO 2026-11-04: QML primitives "will always look flat and simple". `tools/art/` generates geometric SVG (polygons, gradients, masks; one gentle blur on the sun glow in the prototypes) and bakes it with `rsvg-convert`: 14 land layers (one per colour-script stop), tent and lattice frames with moonlit night variants. PO chose scene C (tent setup with the lattice panel). Assets total 1,521,718 bytes.

## Dependencies (build time only, nothing shipped)
`rsvg-convert` 2.62 (librsvg, system package) and system `python3` with PIL for lossless re-encoding and the contact sheet. No npm dependencies. Justification: a vector renderer is the only way to get shading and detail the Toon's QML primitives can't draw; both are mainstream system packages, used offline on the dev machine only.

## Checks
- Bake is deterministic: reviewer re-baked into a scratch dir, 18 PNGs byte-identical
- Trial merge with hijri-maghrib and sadu-redesign: `REQUIRE_QT=1 scripts/test.sh` all 12 passed; check-file-length, check-pii, check-ash-rules, check-qml pass
- Contact sheet `~/ash-data/proto-baked/moments-sheet.png` viewed by the tech lead and sent to the PO

## Reviews
### code-reviewer: CHANGES REQUESTED (medium-high), reviewed together with sadu-redesign
Blocking: no guard that `tools/art/moments.js` (a copy of the colour table) matches `core/script.js`. It can only be tested once both are on one branch, so it moves to sadu-redesign (PR 0013), which must not merge without it. Non-blocking: art build undocumented in AGENTS.md; prototype-only `build.js`/`sheet.py`; table geometry hand-synced with `layout.js`.

### security-reviewer: not required (no shipped dependency, no input handling)

## Resolution
Merged ahead of PR 0013 so the guard can be written against both. Assets are unused on main until 0013 lands. Merge commit 04b94f7.
