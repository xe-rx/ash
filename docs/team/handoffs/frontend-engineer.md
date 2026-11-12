# Handoff: frontend-engineer
Updated: 2026-11-12 03:20 · Branch: frontend-engineer/cel-app · Status: in-progress (stage 1 done, stages 2-3 open)

## Task
Put the approved cel-shaded infographic (PR 0014 stills, `~/ash-data/screens-cel/v3/`) into the app, replacing the
Sadu tent scene. Spec: the tech lead's dispatch of 2026-11-12 (three stages) and `docs/product/CEL-STYLE-HANDOFF.md`.
Done when: bake clean, core tests green, checks green, four screenshots match the stills, sheet continuous, ADR 0004.

## Done (commit fd76ca0, stage 1)
- `app/ash/core/script.js` re-authored: flat fields `top mid hor | key amb sunlight tint lit shade | glow | ink
  inkShadow | card cardInk accent | kDune kMesa kRug hBand haze | lamp dim` (helper `m(sky, light, glow, clock,
  card, bands, lamp, dim)`), same altitudes/names/`stopAt`/`landAt`. Pinned: rise-7 = dawn, day = noon, set0 =
  sunset, night = night (values verbatim from the stills; card colours are the stills' sRGB mixes `#fae4d4 #fcf1dd
  #fcd8be #1d2856`). Other stops authored as in-betweens; the card is dark (light ink) at night, -20, -12/-10 and
  light from -7/-4 up, so the one ink flip per side sits between -12..-7 rising and -10..-4 setting. `lamp`: 1 at
  night and -20, 0.5 at -12/-10, 0 above. The four sand/rug/robe local colours stay constant in `cel/moments.js`
  LOC (the moment carries the light, not the things); `glow` is the disc, rings and core (core = mix to white .5).
- `tools/art/cel/light.js` `lightAt(alt, rising)`: L.x = -1 rising / +1 setting at the horizon (the sun rises at the
  picture's LEFT, so "side" is -1 for rising; stills (-1,-.18) dawn, (1,-.18) sunset), smoothstep to (-0.3,-1) by
  70 deg (shared `day` layer), and below -8 smoothstep to moonlight (0.3,-1) by -22.
- `tools/art/cel/moments.js` loads script.js via load-core: `STOPS` [name, moment, rising, alt] x14, `artMoment(stop,
  L)` adapter (k from kDune/kMesa/kRug, k.fig .06, k.lamp 5*lamp; h = hBand x {1, .8, .6, .5}; mesa haze {haze,
  .3 haze, 2 haze}; lamp {x 516, y 594, on}), `STILLS`/`MOMENTS` for the four frames. `scene.js`: `buildLand(stop, L)`
  (no sky, alpha) and `buildStill(name)`. `render.js`: `require.main` guard, `render(outDir, stops)`, fontconfig under
  outDir, `node tools/art/cel/render.js [outdir] [stop...]` also writes bare `stop-<name>.png`. `paint.js` scales the
  lantern warmth by `lamp.on`; `ui.js` reads `m.card`; `people.js` documents the 8 px shade cap.
- `tools/art/bake.js` rewritten (cel only; work dir `$PROJECT_DATA/bake`). Baked `app/ash/assets/land/*.png` x14:
  673,021 bytes total (was 1,212,000); per file 44.8-50.8 KB. Still present: tent/lattice/grain/stars 337,918 bytes.
- Removed: `tools/art/{build,landscape,figures,family,rug,sky,text,tent,panelA,panelB,sadu,palette,layout,svg,
  moments}.js`, `tools/art/cel/cel.test.js` (moved to `tests/core/cel-art.test.js` + nits: lap rect as drawn, shade
  side for L=(+1,..) and (-1,..), light continuity, every stop bakes without sky/gradient/opacity, lantern iff lamp).
- Tests rewritten: `script.test.js` (fields, pinned stills, altitudes, smoothness, hue), `art-moments.test.js`
  (STOPS = script, file set), `land.test.js` (`sink` -> `tint`).
- Evidence: `node tools/art/bake.js` clean (sizes above); `node --test tests/core/*.test.js` 100 pass / 19 fail (all
  19 read `paletteAt`, which crashes on the new fields: palette.test.js x14, skygrad.test.js x3, halo-contrast x1,
  plus "the sun disc is never pale" in palette.test.js); check-file-length ok, check-ash-rules ok, check-pii ok.
  Stills via the new pipeline: `~/ash-data/screens-cel/app-stage1/{dawn,noon,sunset,night,stop-rise-7,stop-night}.png`,
  dawn viewed = identical to v3, contrast log identical to PR 0014. No app screenshots yet (palette.js broken).

## Next steps
1. Stage 2 (app cannot render until done): rewrite `palette.js` for the new fields: skyStops = `stopsOf(top, mid,
   hor, ink)` (keep the 5.6:1 darkening; noon sky will be deeper, note + screenshot), `sun = glow`, `sunCore = mix(glow,
   white, .5)`, `glow` ring tint via `tintKeepingLuminance` (halo-contrast test), `inkSky = ink`, `clockShadow =
   inkShadow`, `card`, `cardShadow = mix(mid, amb, .5)`, `cardInk`/`cardInkFaded`/`accentInk` with `ensureContrast`
   (direction by card luminance < .18), `night = dim/.45`, `sandEdge` for the Landscape margins. Drop farTwo/dune*/
   rowFill/tag*. Then `skygrad.js` SKY_H to 632 (sky must reach y 616: the land is transparent above its silhouette;
   keep STOP_Y), `Sky.qml` moon at (560,112) r 26 + cut (571,105) r 23 + rings 70/.10 46/.18 of `#c8d4ff`, `Sun.qml`
   four rings (ratios 3.75/2.6/1.8/1.25 r at the horizon, 3.52/2.44/1.69/1.17 high; alphas .10/.2/.34/.5), `sunlook.js`
   r 40->32 (drop the valance comment), `Readouts.qml` shadow Text at +3,+3 under each glyph and one countdown line
   (suggest CLOCK_PX 112, CLOCK_INK_TOP 204, COUNTDOWN_PX 26 at y 300 to match the still; rerun t_font_metrics),
   `table.js` card constants (CARD 724,28,276,344,r22; date baseline 72 @20px; rows baseline 128+52i, name 24px x760,
   time 26px semibold right at 963 in digit cells; pill 744, y-33, 236x46 r12; Poppins baseline = y + 1.05 em),
   `PrayerTable.qml` rewrite, move it into `AshScene.qml`, drop the second Loader in `AshView.qml`, delete `Tent.qml`,
   `tent*.png`, `lattice*.png`; `Landscape.qml` margin rects (left/right x -16/1024 from y 410, bottom y 600) in
   `pal.sandEdge`. Screenshots: `scripts/screenshot.sh --at "2026-06-21 04:31|13:50|21:40|23:10" --out
   ~/ash-data/screens-cel-app` and `--sheet`; view every one. Note: at 13:50 the app's sun is at (369,128) on the arc,
   not the still's (590,88): keep the arc (geometry test), report the deviation.
2. Stage 3: `geometry.test.js` (drop valance/qata tests; card bounds 724-1000 x 28-372, disc clearance of clock and
   card, PrayerTable inside AshScene), `palette.test.js` (card contrast every 0.5 deg both ways, keep clock-on-sky,
   relax "disc never pale" to "core lighter, same hue"), `art-moments.test.js` card vs table constants, ADR 0004 from
   `docs/templates/ADR.md`, AGENTS.md bake line, CEL-STYLE-HANDOFF status, `scripts/test.sh`, `check-qml.sh`.

## Open questions / blockers
- None for the tech lead; decisions above (constant LOC colours, derived h/haze, rising = light from the left) are
  mine and reversible in `cel/moments.js`/`light.js`.

## Gotchas learned
- load-core objects live in another vm realm: compare arrays via JSON.stringify, not deepStrictEqual.
- `day` appears twice in SETTING (40, 90): use lastIndexOf when mapping a name to its altitude.
- `scripts/check-file-length.sh` only checks tracked files: run it after `git add`.
