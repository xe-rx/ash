# Handoff: frontend-engineer
Updated: 2026-11-12 04:24 · Branch: frontend-engineer/cel-app · Status: done (stages 1-3), ready for review

## Task
Put the approved cel-shaded infographic (PR 0014 stills, `~/ash-data/screens-cel/v3/`) into the app, replacing the
Sadu tent scene. Spec: the tech lead's dispatch of 2026-11-12 (three stages) and `docs/product/CEL-STYLE-HANDOFF.md`.
Done when: bake clean, core tests green, checks green, four screenshots match the stills, sheet continuous, ADR 0004.

## Done
- Stage 1 (fd76ca0): `core/script.js` flat fields, `tools/art/cel/*` pipeline, 14 cel land layers.
- Stage 2 (93b288a, 57fa2d4): `palette.js` reads the new fields (skyStops held dark behind the clock by bisection
  `heldDark`, monotonic; `sun`=glow, `sunCore`=mix white .5; `glow`/`halo` ring tints keep the sky's luminance; `card
  cardShadow cardInk cardInkFaded accent accentInk` via `inkOn`, pulled toward whichever pole reads better, so the ink
  flips once per side on the mid-tone card; `night`; `sandEdge` [far, near] = LOC.sand[0]/[3] graded). `skygrad.js`
  SKY_H 632, MOON + `moonCutAt` (gradient cut-out including the rings). `sunlook.js` 4 rings, r 40->32, core .72 r.
  `clock.js` 112 px, ink top 208 (stills 196; 204 left 12.9 px to the disc, 208 gives 16.5), SHADOW 3, countdown 26 px
  at y 304. `table.js` card constants, baseline placement (BASELINE_EM 1.05). QML: `Sky` (moon from -8 with the stars,
  rings, cut-out), `Sun` (ring 0 in `pal.sun`, outer three neutral tints), `Readouts` (shadow under every glyph and the
  countdown), `PrayerTable` (card), `Landscape` (side margins far->near sand gradient from y 406, bottom near sand),
  `AshScene` holds the card, `AshView` one Loader. Deleted `Tent.qml`, `tent*.png`, `lattice*.png`.
- Stage 3 (this commit): tests rewritten: `geometry` (card 724-1000 x 28-372, rows 128+52i, pill/text inside, card
  drawn by AshScene, one Loader, disc >= 16 px and ring 0 >= 4 px from the clock boxes, disc clear of the card),
  `palette` (card inks every .5 deg both ways, one ink flip per side, night dark, no-green 105..185, core lighter same
  hue, faded quieter, warm accent), `sunlook` (4 rings, ratios, alphas, fades), `halo-contrast` (ring k in its own
  colour), `art-moments` (table CARD = ui.js CARD, rows, palette SAND = LOC.sand). `script.js` rise18/set18 `hor` ->
  `#d8e6ea` (hazy near-white: the gold->cyan chord passed through pastel green; both sky rules now hold with margin),
  rebaked `rise18.png`/`set18.png` only. `docs/adr/0004-cel-shaded-infographic.md` (accepted), AGENTS.md bake line,
  CEL-STYLE-HANDOFF status. Assets now 698,666 bytes (land 673,052; was 1,010,939).
- Evidence (all fresh, 04:24): `node --test tests/core/*.test.js` 120 pass / 0 fail (sun-to-clock 16.5 px, inner ring
  11.0 px, halo contrast 5.50 over 2.16 M samples, card inks >= 4.62); `scripts/test.sh` all 12 files OK; check-qml 11
  files 0 errors; check-file-length, check-pii, check-ash-rules ok; `tests/qt/font_metrics.py` ok at 112/26/24/20;
  `node tools/art/bake.js` clean. Screenshots `~/ash-data/screens-cel-app/ash-2026-06-21-{04-31,13-50,21-40,23-10}.png`,
  `sheet.png` + 16 frames, all viewed: family, dunes, mesas, card, pill, clock with shadow, countdown as the stills; the
  sheet continuous, no missing layer, no gap at the edges (bottom strip within 1 unit of the land by day; at night a
  cool 4 px strip can sit under the lantern's warm pool, x 230-800; side strips differ from the dune shade bands by
  up to 62 units in 4 px; never sky or black).
- Deviations from the stills (all reported, reversible): noon sky deeper behind the clock and the noon sun on the arc
  at (369,128) (both accepted); the outer three rings are luminance-neutral by decision, so the dawn still's peach
  glow at the left horizon is nearly absent and the outer rings read as dusty tints (ring 0 is bright, as the still);
  clock ink top 208 not 196; 04:31 is alt -5.9 and 23:10 alt -7.5 in June (stills: the rise-7 and NIGHT stops), so the
  June 23:10 frame is the dusk in-between and the still's deep night shows from about -20 down (dec frames).

## Next steps
1. Tech lead: PR record + review; PO verdict on the four frames and the sheet; then a device install (ADR 0001).
2. If the PO misses the pre-dawn glow: a geometry-gated rule that lets the outer rings lighten only where no text can
   be (design change); if the PO wants 23:10 in June to look like the night still: move the night look up to about -8
   in `script.js` (set-10/rise-12 stops) and rebake.

## Open questions / blockers
- None blocking. `pal.night` is kept per the brief but nothing reads it now.

## Gotchas learned
- load-core objects live in another vm realm: compare arrays via JSON.stringify, not deepStrictEqual.
- `scripts/check-file-length.sh` only checks tracked files: run it after `git add`.
- The still's SVG text y is a baseline; a Poppins Text item's baseline is 1.05 em below its top.
- 0.01-L darkening steps leave adjacent bands non-monotonic; bisect to the contrast ceiling instead.
- The land bake reads `hor` (mesa haze): any `hor` change needs `node tools/art/bake.js`.
- Two sky rules bracket in-between horizons: no hue 105..185 at chroma >= .015 and never chroma < .005; scan the
  OKLab chord of a candidate (tests/core/palette.test.js) before authoring a stop.
