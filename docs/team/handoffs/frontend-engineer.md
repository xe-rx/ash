# Handoff: frontend-engineer
Updated: 2026-11-12 04:08 · Branch: frontend-engineer/cel-app · Status: in-progress (stages 1-2 done, stage 3 open)

## Task
Put the approved cel-shaded infographic (PR 0014 stills, `~/ash-data/screens-cel/v3/`) into the app, replacing the
Sadu tent scene. Spec: the tech lead's dispatch of 2026-11-12 (three stages) and `docs/product/CEL-STYLE-HANDOFF.md`.
Done when: bake clean, core tests green, checks green, four screenshots match the stills, sheet continuous, ADR 0004.

## Done
- Stage 1 (fd76ca0): `core/script.js` flat fields, `tools/art/cel/*` pipeline, 14 cel land layers (673,021 bytes).
- Stage 2 (93b288a + the moon/ring commit after it): `palette.js` reads the new fields (skyStops held dark behind the
  clock by bisection `heldDark`, monotonic; `sun`=glow, `sunCore`=mix white .5; `glow`/`halo` ring tints keep the sky's
  luminance; `card cardShadow cardInk cardInkFaded accent accentInk` via `inkOn` (candidate, then pulled toward
  whichever pole reads better: the ink flips on a mid-tone card); `night`; `sandEdge` [far, near] = LOC.sand[0]/[3]
  graded `mix(c, key, tint)`, matches the baked edges within 2 units by day). `skygrad.js` SKY_H 632 + MOON constants +
  `moonCutAt` (gradient cut-out that includes the rings). `sunlook.js` 4 rings, r 40->32, core .72 r. `clock.js` 112 px,
  ink top 208 (stills 196, brief 204: 204 left 12.9 px to the disc, 208 gives 16.5), SHADOW 3, countdown 26 px at y 304.
  `table.js` card constants + baseline placement (BASELINE_EM 1.05). QML: `Sky` (moon + rings + cut-out), `Sun` (ring
  0 in `pal.sun`, outer three neutral tints), `Readouts` (shadows under every glyph and the countdown line), `PrayerTable`
  (card), `Landscape` (margins: sides a far->near sand gradient from y 406, bottom near sand), `AshScene` holds the card,
  `AshView` one Loader. Deleted `Tent.qml`, `tent*.png`, `lattice*.png`: assets now 698,635 bytes (was 1,010,939).
  Moon from -8 deg (full at -14, with the stars): the dawn still has none.
- Evidence: check-qml 11 files 0 errors; check-file-length, check-ash-rules, check-pii ok; font_metrics.py ok at
  112/26/24/20; node 107 pass / 12 fail, all 12 are stage 3 rewrites: geometry 31/33/35/36 (qata, valance, lattice,
  unshifted table), palette 49 (night < .02: the approved night sky is moonlit indigo), 55 (no-green rule: the approved
  noon horizon #bfe4e4 is hue 196 itself; in-betweens reach hue 100 chroma .036 at 12 deg rising / 25 setting), 57/58
  (weave, madder), 59 (disc never pale), sunlook 117-119 (five halos). Card contrast >= 4.62 every .5 deg both ways,
  halo contrast 5.53 (2.16 M samples), sun-to-clock clearance 16.5 px.
- Screenshots `~/ash-data/screens-cel-app/ash-2026-06-21-{04-31,13-50,21-40,23-10}.png`, `sheet.png` (+ the 16 frames):
  family, dunes, mesas, card, pill, clock with shadow, countdown as the stills. Deviations: noon sky deeper behind the
  clock (accepted), noon sun on the arc at (369,128) (accepted); outer rings cannot lighten the sky (luminance-neutral by
  decision), so the dawn still's peach glow at the left horizon is nearly absent and the noon/sunset outer rings read as
  dusty tints; 04:31 is really alt -5.9 and 23:10 alt -7.5 in June (the stills were rendered at the rise-7 and NIGHT
  stops), so the June 23:10 frame is the dusk in-between, the still's deep night shows from -20 down (dec frames).
  Edges: no sky or black anywhere; bottom strip within 1 unit of the land by day, at night a cool strip can sit under
  the lantern's warm pool (x 230-800); side strips differ from dune shade bands by up to 62 units in 4 px.

## Next steps
1. Stage 3: `geometry.test.js` (drop valance/qata; card 724-1000 x 28-372 inside AshScene; disc >= 15 px and ring 0
   >= 4 px from the clock boxes; disc clear of the card; row step 52), `palette.test.js` (drop ground/weave/madder/land
   tests; night: skyStops lum < .05; no-green: hue 105..185; "core lighter, same hue"), `sunlook.test.js` (4 rings,
   ratios, alphas, fade by -12), `halo-contrast.test.js` loop k 3..0, `art-moments.test.js` CARD/ROWS vs table.js and
   LOC.sand vs palette SAND, ADR 0004 from `docs/templates/ADR.md`, AGENTS.md bake line (no tent/lattice), CEL-STYLE-
   HANDOFF status, `npm ci && scripts/test.sh`, full node suite green.

## Open questions / blockers
- Ring tints: the brief fixes luminance-neutral tints; the stills' lightening rings are impossible with them. Ring 0
  now carries the sun colour (never reaches text). If the PO wants the dawn glow back, the outer rings need a rule
  that lightens only where no text can be (geometry-gated), a design change for the tech lead.
- June 23:10 shows dusk, not the night still (sun at -7.5): accept, or move the night look up to about -8 in script.js.

## Gotchas learned
- load-core objects live in another vm realm: compare arrays via JSON.stringify, not deepStrictEqual.
- `scripts/check-file-length.sh` only checks tracked files: run it after `git add`.
- The still's SVG text y is a baseline; a Poppins Text item's baseline is 1.05 em below its top.
- 0.01-L darkening steps leave adjacent bands non-monotonic; bisect to the contrast ceiling instead.
