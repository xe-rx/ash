# Handoff: frontend-engineer
Updated: 2026-11-12 17:41 · Branch: frontend-engineer/cel-app · Status: done (fix pass), ready for review

## Task
Fix pass on the cel infographic integration (stages 1-3, commits fd76ca0..aed6872, ADR 0004) from the tech lead's view
of the four frames and the sheet against the approved stills: (1) sky gradient seam at y 355, (2) June 23:10 (-7.5)
reads as dusk not night, (3) the stills' warm low-sun glow missing. Done when: bake clean, core tests and all checks
green, four frames + sheet re-rendered into ~/ash-data/screens-cel-app/ and viewed, pinned stills byte-identical.

## Done
- Fix 1 (e4e6812): skygrad.js STOP_Y [0,50,100,150,200,250,300,344,432], MID_Y 300, HOR_Y 432 (the still's curve,
  tools/art/cel/sky.js); palette.js reads the stop colours off that curve with sRGB mixes (Grad.blend), except stop 7
  (mid->hor 1/3) in OKLab because the sRGB chord greys at +2 rising (#686668, chroma .004). Stops 0..7 held dark for
  the clock ink as before, stop 8 = hor. skygrad.test.js: positions, every undarkened row = the still within 2 units
  (31,775 rows, worst 0.008), no flat band above y 432, moon cut-out within 1 unit.
- Fix 2 (1b78689): script.js set-4 = cool violet shade (key #5a4a98, tint .6, lit .1), lamp .5, dark card; set-10,
  set-20, rise-12, rise-20 land = NIGHT_LIGHT/NIGHT_BANDS (shared with NIGHT), lamp 1 (rise-12: .65, the most the
  0.02-per-0.1-degree smoothness guard allows 5 degrees from the pinned dawn; dim .35 for the night-factor guard).
  Skies untouched (afterglow to -12, night sky by -20). tools/art/cel/light.js: moonlight by -12 (setting: two-degree
  swing from -10 so set-4 and set-10 share one shading and the June 23:10 cross-fade shows one set of bands; rising:
  -7..-12); the light-continuity guard widened .12 -> .5 per half degree (a jump is > 1). Five layers rebaked;
  rise-7/day/set0/night PNGs byte-identical (git diff empty). New script test for the rule.
- Fix 3 (4f95072): an altitude rule (warm < +8, neutral > +15) fails the halo guard at 2.90: 1 Jan 13:24, alt 10.4,
  the winter sun is low at the top of the arc over the clock. So the gate is geometric, per ring: palette.js
  ringWarmth(sunX, haloR) = 1 when the ring is 40 px clear of the widest text (TEXT_HALF_W 160 about CLOCK_CX, checked
  against clock.js), 0 where it touches; ringColour mixes the neutral tint toward pal.sun by it. Near the arc's ends the
  inner three rings go warm; the outermost (r 150) touches the text even there and stays neutral. Sun.qml imports
  palette.js and paints ring k with ringColour at its warmth. halo-contrast.test.js composites the gated colours and
  now asserts 5.5 (worst 5.5012, unchanged).
- Evidence (2026-11-12 17:41): node --test tests/core/*.test.js 125 pass / 0 fail; node tools/art/bake.js clean (675,152 bytes);
  check-qml 11 files 0 errors; check-file-length, check-ash-rules, check-pii ok; scripts/test.sh all 12 files OK.
  Screenshots ~/ash-data/screens-cel-app/ash-2026-06-21-{04-31,13-50,21-40,23-10}.png, sheet.png + 16 frames, viewed:
  no seam in any sky; 04:31 a soft peach glow at the far-left horizon, dawn otherwise as approved; 13:50 as before with
  the sky blending into the dune line; 21:40 gold stepped rings round the setting sun (outermost neutral), clear of the
  countdown; 23:10 night on the ground (indigo-violet dunes, family and rug in cool shade, lantern lit with its pool,
  dark card) under a plum/orange afterglow; the sheet continuous, warm glow at every sunrise/sunset end, neutral rings
  near the clock (dec morning 10:43), night land from Isha on.

## Next steps
1. Tech lead: PR record + review; PO verdict on the four frames and the sheet; then a device install (ADR 0001).

## Open questions / blockers
- At -7.5 (June 23:10) the moon and stars are not up (moon from -8, stars from -9, kept "as now" by instruction); the
  frame shows the night land and lit lantern without them. If the PO wants them: palette.js moon/stars thresholds.
- Fix 3 deviates from the dispatch's letter (altitude 8..15) for its intent: the gate is by the sun's x per ring.
- The -10 land shares set-4's horizon-side shading, not the moon's (so the 23:10 cross-fade has one set of bands).

## Gotchas learned
- Qt and the still's SVG interpolate gradients in sRGB: in-between stops must be sRGB mixes to match the still; but the
  sRGB chord between a blue mid and a gold horizon crosses grey, so the one stop between them is mixed in OKLab.
- A winter noon sun is low AND over the clock: ring rules must be geometric, not by altitude.
- A ring cross-fade between two layers with different light directions doubles the shade bands; keep the swing of
  tools/art/cel/light.js between layers that are not cross-faded at a frame the PO looks at.
- Sharing arrays (NIGHT_LIGHT) between m() stops is safe: m() copies elements. Pinned layers stay byte-identical only if
  the stop's own fields are untouched (the mesa haze reads hor).
- `scripts/screenshot.sh --at` takes one moment per call (no | list). load-core objects live in another vm realm.
