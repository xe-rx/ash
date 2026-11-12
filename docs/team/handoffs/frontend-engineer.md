# Handoff: frontend-engineer
Updated: 2026-11-12 05:10 · Branch: frontend-engineer/cel-app · Status: in-progress (fix pass: 1 of 3 done)

## Task
Fix pass on the cel infographic integration (stages 1-3 done, see git log), from the tech lead's view of the four
frames and the sheet against the approved stills: (1) sky gradient seam at y 355, (2) night comes too late (June
23:10 = -7.5 deg reads as dusk), (3) low-sun warm glow missing. Spec: the tech lead's dispatch of 2026-11-12 (fix
pass). Done when: bake clean, core tests green, all checks green, four frames + sheet re-rendered into
`~/ash-data/screens-cel-app/` and viewed (no seam, June 23:10 night on the ground with afterglow sky, warm glow at
dawn/sunset, dawn/noon/sunset otherwise unchanged, sheet continuous), pinned stills byte-identical.

## Done
- Fix 1 (e4e6812): `skygrad.js` STOP_Y [0,50,100,150,200,250,300,344,432], MID_Y 300, HOR_Y 432 (the still's
  curve, tools/art/cel/sky.js); `palette.js` imports skygrad.js and reads the stop colours off that curve with
  sRGB mixes (Grad.blend), except stop 7 (mid->hor 1/3) which is an OKLab mix: the sRGB chord greys at +2 rising
  (#686668, chroma .004, the 'colourful' test). Stops 0..7 held dark as before, stop 8 = hor. `skygrad.test.js`
  rewritten: positions, fidelity to the still on every undarkened row (31,775 rows, <= 0.008 units), no flat band
  above y 432, moon cut-out within 1 unit. Evidence: `node --test tests/core/*.test.js` 123 pass / 0 fail; the
  13:50 frame viewed: smooth blend into the dune line, no edge.
- Stages 1-3 (fd76ca0, 93b288a, 57fa2d4, aed6872): see those commits and ADR 0004; previous handoff text is in
  git history (aed6872) if needed.

## Next steps
1. Fix 2: re-author `script.js` set-4 (cool-shade land, lamp .5, dark card), set-10/set-20 and rise-12/rise-20
   (land = NIGHT light and bands, lamp 1); keep skies (afterglow to -12, night by -20) and the pinned stops
   (rise-7, day, set0, night) untouched; adjust script tests only where the authoring legitimately moves them;
   `node tools/art/bake.js`; check `git status` shows only the changed layers (pinned PNGs byte-identical).
2. Fix 3: low-sun warm rings: below +8 deg ring colours = the still's mixes toward glow (tools/art/cel/sky.js
   `sun`: mix(skyAt(y), glow, t) for t .10/.2/.34/.5), above +15 the current luminance-neutral tints, smooth
   blend 8..15. Guard: halo-contrast >= 5.5 (reduce outer two rings' alpha near the horizon if it fails only at
   the arc ends; if unsatisfiable keep neutral rings and say so).
3. Verification: bake clean, tests, check-qml/file-length/ash-rules/pii, scripts/test.sh; re-render the four frames
   and the sheet into ~/ash-data/screens-cel-app/ and view them; final handoff.

## Open questions / blockers
- At -7.5 (June 23:10) the moon and stars are not up yet (moon from -8, stars from -9, by instruction "as now"); the
  frame will show the night land and the lit lantern without stars. Flag to the tech lead.

## Gotchas learned
- load-core objects live in another vm realm: compare arrays via JSON.stringify, not deepStrictEqual.
- `scripts/check-file-length.sh` only checks tracked files: run it after `git add`.
- The land bake reads `hor` (mesa haze): any `hor` change needs `node tools/art/bake.js`.
- Two sky rules bracket in-between horizons: no hue 105..185 at chroma >= .015 and never chroma < .005; the sRGB
  chord between a blue mid and a gold horizon crosses grey, so the one stop between them is mixed in OKLab.
- Qt and the still's SVG both interpolate gradients in sRGB: in-between stops must be sRGB mixes to match the still.
- The still's SVG text y is a baseline; a Poppins Text item's baseline is 1.05 em below its top.
