# Design handoff: flat cel-shaded infographic (in progress)

Written 2026-11-12 by the tech lead (Claude Code, main session) for the next design session. Read this first, then
`AGENTS.md`, `CLAUDE.md`, `docs/team/BOARD.md` and `docs/product/BRIEF.md`.

## Where we are in one paragraph
`main` still ships the Sadu "tent" scene (PR 0013: tent frame, mashrabiya lattice, baked dunes). The PO has asked to
**revert to the earlier simple infographic** and give it **cel shading with one shared hue per moment**. A
standalone prototype in `~/ash-data/proto-cel/` renders four still frames (dawn, noon, sunset, night). The PO likes
the direction ("Really really good!", "starting to look better") but two things are open: **the shadows look off**
and **the family must keep its original design**. Nothing from this direction is in the app or in git yet.

## What the PO said, verbatim (most recent last)
1. "Revert to the infographic simplified, rounded texture, but maybe shading is whats missing? correctly blended or
   actually the stylewhere its not blended at all but drawn as a new colour, with some sort of hue that everything
   has, this is what makes those infographic videos look so nice"
2. On the first sheet: "Really really good! Just take some more time to refine the shapes, ensure they are at the
   correct spots and the correct shape. But this is starting to look better"
3. On the refined sheet: "Definetely, shadows are off, also you changed the design again of the people sitting there."
4. Asked to clarify the shadows, the PO chose to hand over to a new session instead. **Which shadows are off is
   still unknown. Ask the PO, showing them single frames, before redesigning shadows again.**

Earlier PO feedback still in force: gradient sky; "I dont mind the family and landscape"; no big circle graph of
prayer positions, a clean table on the right and a clean sun indicator; read up close at the thermostat;
Hijri date changes at Maghrib (already on `main`).

## The style, as understood
- **Flat infographic:** soft rounded dunes, the family seen from behind on a rug, clock on the left, times card on the
  right, gradient sky. The 2026-10-31 atmosphere version is the reference look:
  `~/ash-data/screens-atmosphere/june-6-maghrib.png` (and the rest of that folder).
- **Cel shading:** every shadow and highlight is its own solid colour, never transparency or blur. This is done by
  repainting a shape in a shade or lit colour inside a clip path (see "How the prototype works").
- **One hue per moment:** every local colour is mixed toward the moment's key colour, shadows toward its ambient
  colour, so the whole frame shares one tint. Dawn: peach light, violet shadows. Noon: pale gold, violet shadows.
  Sunset: orange, plum shadows. Night: moonlit blue, with a warm lantern.

## Rules from the PO's corrections
- **Do not redesign the family.** Keep the original capsule-and-circle figures exactly: father in a white thobe and
  ghutra, boy in blue, girl in a coral dress with a bun, mother in a plum abaya. Their shapes are the `FIGS` table in
  `~/ash-data/proto-cel/people.js`, modelled on the pre-PR 0013 app figures seen in the `screens-atmosphere` renders
  (those QML figures are in git history before PR 0013, `view/Person.qml` and `view/Family.qml`). Shading
  and colour grading on them is fine; changing their silhouettes is not. A smoother redesign (`people.v2.js`) was
  rejected.
- **Don't change approved elements without asking:** show a frame first.
- **Exclusively geometric shapes**, now in a rounded, simple style. Primitive QML shapes alone looked flat, which is
  why the art is baked.

## The prototype: `~/ash-data/proto-cel/` (outside git on purpose)
Run `./render.sh`. It writes `out/{dawn,noon,sunset,night}.svg|png`, `out/sheet.png` (2×2) and `out/zoom.png`
(family close-ups). Needs node, rsvg-convert and python3 with PIL. `fonts.conf` points fontconfig at the app's Poppins.

| File | What it is |
|---|---|
| `cel.js` | The scene: moments table, colour grading (`painter`), sky, sun rings, moon and stars, mesas, dunes and slipfaces, ground and rug, cast shadows, lantern, UI mock (clock, next prayer, card) |
| `people.js` | The family: original `FIGS`, `figure()` lighting passes, `castShapes()` ground shadows |
| `cel.v1.js` | The first sheet the PO called "really really good" (self-contained; running it overwrites `out/`) |
| `people.v2.js` | The rejected smooth figures, kept only as a record |

### How it works
- `painter(m)` returns colour mappers: `B` (base, graded toward `m.key` by `m.tint`), `L` (lit), `S` (shade toward
  `m.amb`), `RIM` (backlit edge), and `WARM`/`WARM2` (lantern).
- **Repaint under a clip** is the core trick. Shadows and light are the same shapes repainted with another mapper inside
  a `clipPath`: figure light circles, ground cast shadows, the lantern pool. So everything stays a solid new colour.
- **Dunes:** `prof(layer, x)` is a baseline lifted by cosine humps (`LAYERS`, `FG`). Each layer is painted lit, then
  shifted down by `rim` px in the base colour, which leaves a thin lit crest. Then come the slipfaces: wherever the slope
  turns away from the light by more than a threshold (lower for a low sun), a crescent hugs the surface and tapers at
  both ends.
- **Mesas:** flat-topped silhouettes slightly darker than the horizon, with a shaded flank clipped to the shape on the
  side away from the sun.
- **Per-moment light (`MOMENTS`):** `side` (+1 means the light comes from the left), `low` (0 for a high sun, 1 for the
  horizon), `lights` (clip circles for figure light), `cast` (ground shadow direction and length), `figBase`.

### Known weak spots (my own read; the PO hasn't confirmed which ones they mean)
- **Figure shading:** a big clip circle makes a curved light/dark split down each back. At sunset most of each back is
  in shade, which may read as muddy. The first sheet (`cel.v1.js`) used a simpler split that the PO liked.
- **Ground shadows:** at dawn and sunset they run toward the viewer and off the bottom edge as dark trapezoids. They may
  read as wrong; the first sheet had simple ellipses to one side.
- **Dune slipfaces:** at noon they look like random pink patches. A high sun should leave almost none. Overall there may
  be too many shadow shapes; the first sheet was calmer.
- **Night:** the lantern's light on the children shows a visible circle edge, and the sand is grey-blue.
- **The times card is still cream,** which the PO earlier called dated. Tinting it into the scene hue is untried.

## Getting it into the app (after the PO approves stills)
- **Art pipeline (on `main`):** `tools/art/*.js` writes SVG, and `node tools/art/bake.js` bakes PNGs into
  `app/ash/assets/` with rsvg-convert. The colour script is `app/ash/core/script.js`: RISING/SETTING stops, with
  `landAt(alt, rising)` returning `{a, b, t}` for cross-fading two baked land layers. `view/Landscape.qml` does the
  cross-fade. There are 14 land moments today.
- **The new style replaces** the tent and lattice: `view/Tent.qml`, `tent*.png`, `lattice*.png`, and `tools/art/` tent,
  panel and sadu modules. Bring back a right-hand card in the new hue, and keep the sun, clock, next-prayer line and
  table live in QML.
- **The family's lighting depends on sun direction,** so the figures should be baked into the land layers or as their
  own per-moment layers. Watch Toon cost: about 1.5 MB of full-screen PNGs today, and the Toon's cost is still
  unmeasured.
- **Tests:**
  - `tests/core/art-moments.test.js` guards the colour table against drift and the baked file set.
  - `tests/core/land.test.js` and the `geometry.test.js` sun-arc clearance test also apply.
  - Contrast must stay at least 4.5:1 for table text, day and night.
- **Process:**
  - Use a worktree per task (`scripts/team/worktree.sh`), a PR record in `docs/team/prs/` (next is 0014), a code-reviewer
    pass, and a trial merge.
  - Only the tech lead merges.
  - Render offscreen at 1024×600 and look at the screenshots before claiming done. The live run is
    `scripts/run-local.sh --at "2026-06-21 21:00" --speed 30`.
- **Constraints:**
  - Qt 5.11 QML: Rectangle, Text, Image and gradients only. No Canvas, shaders or animation.
  - Offline, and code files must stay at 300 lines or fewer.
  - Large or generated data goes in `~/ash-data`, not the repo.
  - Never touch the Toon.
  - No pushing or publishing without the PO.

## Suggested next steps
1. Show the PO `out/dawn.png` … `out/night.png` one at a time, plus `cel.v1.js` output, and ask which shadows are off.
2. Fix the shadows within the prototype, keeping the original family, and iterate on stills until the PO approves.
3. Then plan the app integration as a PR (bake the moments, swap the tent and lattice for the new card, update tests).
