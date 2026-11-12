# Handoff: frontend-engineer
Updated: 2026-11-12 02:51 · Branch: frontend-engineer/cel-stills · Status: done

## Task
Cel-shaded infographic stills v3 (dawn, noon, sunset, night) as repo code in `tools/art/cel/`, PNGs outside the
repo in `~/ash-data/screens-cel/v3/`, per the PO decisions of 2026-11-12 (one shading rule, October family
restored, card tinted per moment, mesas kept). Spec: the dispatch message and `docs/product/CEL-STYLE-HANDOFF.md`.
Done when the PO approves the stills; app integration is the next task.

## Done
- `tools/art/cel/` (commit: see `git log main..HEAD`): `render.js` CLI, `scene.js` composition, `paint.js` (doc +
  clips, `cel()` rule, `edgeBand()` for the lantern, `painter()`), `colour.js` (mix, WCAG contrast,
  `ensureContrast`), `moments.js` (table: sky, key/amb, L, k, h, sun/moon, card), `sky.js`, `land.js` (dunes +
  mesas), `ground.js` (sand, rug, lantern pool, contact ellipses, lantern), `people.js` (October figures),
  `ui.js` (clock, card with contrast report), `cel.test.js` (7 tests: contrast, rule structure, family geometry,
  no opacity/blur/extra gradients, no slipface polygons, sunset disc clear of the card, card contrast ≥ 4.5).
- Rendered and viewed every PNG + zoom.png: no dune crescents, no circle splits on figures, no trapezoids;
  father cream robe + skin head + cream cap, girl hooded like the mother; sunset disc at (645,365) sets behind
  the mesa, clear of the card; noon reads flat (thin lit crests only); night indigo sand, cool crest bands,
  warm lantern band on the figures' lower-inner edges and a two-step pool on the rug.
- Contrast log (all ≥ 4.5): dawn 5.02/12.01/4.51/5.48, noon 5.18/12.94/4.67/8.04, sunset 5.22/12.11/4.67/5.27,
  night 6.64/11.99/5.07/8.04 (date line / row / past row / next-prayer row). Next-prayer rows use near-black
  `#1a1a1a` on the accent (white never reaches 4.5 on orange).
- `~/ash-data/screens-cel/v3/compare-october.png`: June Maghrib reference crop over the new sunset crop, same
  512x260 window; positions and proportions line up, only shading, grading and the rug differ.
- Checks: cel tests 7/7, core tests 109/109, check-file-length ok (largest file 78 lines), check-ash-rules ok,
  check-pii ok. Stills stay outside the repo.

## How to render
`node tools/art/cel/render.js [outdir]` (default `$PROJECT_DATA/screens-cel/v3`, PROJECT_DATA `~/ash-data`).
Writes dawn/noon/sunset/night `.svg`+`.png`, `sheet.png` (2x2), `zoom.png` (family crops), prints the contrast
ratios, exits 1 if any is under 4.5. Fontconfig is written to `~/ash-data/screens-cel/fonts.conf`.
Tests: `node --test tools/art/cel/cel.test.js`.

## Next steps
1. Tech lead shows the PO `~/ash-data/screens-cel/v3/{dawn,noon,sunset,night}.png` and `zoom.png`, one at a time.
2. On approval: app integration (bake per-moment layers with the family, swap tent/lattice for the tinted card),
   and move `cel.test.js` under `tests/` (it sits next to the source because `tests/` was off limits this task).

## Open questions / blockers
- Dune bands at dawn/sunset are subtle by construction (band thickness ≈ k × slope; dunes are gentle). If the
  PO wants them bolder, raise `k.dune` (26 → ~40) in `moments.js`; nothing else changes.
- Noon mesas read as pale blocks hazed into the sky; if they still look "floating", lower `mesa.shade` at noon.

## Gotchas learned
- `scripts/check-file-length.sh` only checks tracked files: run it after `git add`.
- Clip paths need shapes with their own `transform`; a `<g>` inside `<clipPath>` is invalid, so `shift()` adds
  the transform to the element. Dune paths run 60 px past the frame so shifted copies still cover the edges.
- `ensureContrast` toward white can never fix white-on-orange: pick the better of white/ink/near-black first.

## Suggested skills
- impeccable (not installed here); used the accessibility checklist for the contrast rule.
