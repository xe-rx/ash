# 0004. Draw the idle screen as a flat cel-shaded infographic

Status: accepted 2026-11-12 · Deciders: the PO, tech lead

## Context and problem
The Sadu "tent" scene of 2026-11-04 (PR 0013: tent frame, mashrabiya lattice, baked dunes and family) read as busy on the
Toon's 1024x600 panel and its woven table took the whole right edge. On 2026-11-11 the PO asked to go back to the earlier
simple infographic and give it cel shading with one shared hue per moment; the four stills of PR 0014 (dawn, noon,
sunset, night; `~/ash-data/screens-cel/v3/`, brief `docs/product/CEL-STYLE-HANDOFF.md`) were approved on 2026-11-12.
The device renders with Qt 5.11's software raster: no shaders, no Canvas, no animation, so whatever is shaded is either
baked or built from rectangles, text and gradients, and the clock and the times card must keep 4.5:1 at every minute of
the year (`.claude/references/accessibility-checklist.md`).

## Considered options
1. Keep the Sadu scene and only recolour it to the stills' hues.
2. Bake the cel picture as whole frames per moment (sky, land, sun) and draw only the text live.
3. Bake only the land per moment (alpha, no sky) and draw the sky, sun, moon, clock and card live, all from one
   colour script.

## Decision
Chosen: 3. One colour script (`app/ash/core/script.js`, flat fields per moment: sky top/mid/horizon, key and ambient
light with their amounts, glow, clock ink and shadow, card, card ink and accent, band offsets, lamp, dim) feeds both the
bake (`tools/art/cel/*`, `node tools/art/bake.js` -> the 14 layers `app/ash/assets/land/*.png`) and the live palette
(`app/ash/core/palette.js`), so baked and live parts always share the moment's hue and in-betweens stay continuous
(OKLab mixing by altitude, rising and setting apart). Whole-frame bakes (2) would multiply the assets by every sun
position and still leave the text to fit; recolouring the tent (1) keeps what the PO asked to drop. This supersedes the
Sadu direction of 2026-11-04 (PR 0013); `.impeccable/surfaces/` stays as history of that exploration.

## Consequences
- Good: the picture is the approved stills at the four pinned stops (rise-7, day, set0, night) and authored
  in-betweens elsewhere; assets shrank from 1,010,939 to 698,666 bytes; the card and clock are live text, so dates and
  times never need a bake; contrast is proven by tests at every half degree, rising and setting, including the sun's
  rings over the clock; the card's ink flips exactly once per side between its dark night face and its light day face.
- Bad: the light's direction and the shade bands are baked, so a change of the land art or of a band offset needs
  `node tools/art/bake.js` (rsvg-convert and PIL) and a check of the file set (`tests/core/art-moments.test.js`); the sky
  behind the clock is held darker than the stills (5.6:1 for the ink), most visibly at noon; the sun's outer rings
  cannot lighten the sky without taking the clock's contrast, so the stills' pre-dawn glow is faint in the app; the noon
  sun rides the arc at about (369,128), not the still's (590,88); the clock's ink top is 208, not the still's 196, so the
  disc keeps 16 px from the digits.
- Risks and how we will notice: the Toon's panel may show the sky's 8-bit steps or dull rings differently from the
  offscreen render (a PO photo after the install, ADR 0001); a future script edit can break the single ink flip or the
  no-green horizon rule (palette tests); the moon and stars appear together from -8 degrees, so in June nights (the sun
  never goes under -16) the picture stays twilight-like (sheet `~/ash-data/screens-cel-app/june-*.png`), which the PO
  has not yet seen on the device.

## More information
PR 0014 (the stills) and the cel-app PR record in `docs/team/prs/`; `docs/product/CEL-STYLE-HANDOFF.md`; the PO
decisions of 2026-11-11 and 2026-11-12 in `docs/team/BOARD.md`; tests `tests/core/{script,palette,geometry,sunlook,
halo-contrast,skygrad,art-moments,cel-art,land}.test.js`; evidence screenshots `~/ash-data/screens-cel-app/`.
