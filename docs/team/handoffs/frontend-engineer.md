# Handoff: frontend-engineer
Updated: 2026-11-12 09:40 · Branch: frontend-engineer/cel-app · Status: in-progress

## Task
Put the approved cel-shaded infographic (PR 0014 stills, `~/ash-data/screens-cel/v3/`) into the app, replacing the
Sadu tent scene: `script.js` re-authored to the cel palette (14 stops, dawn=rise-7, noon=day, sunset=set0, night),
`tools/art/cel` as the bake source for `assets/land/*.png` (land + family + lantern, alpha, no sky), live tinted
card in QML, clock with hard shadow, sun rings and moon as in the stills, tests, removals, ADR 0004. Spec: the
dispatch message (tech lead, 2026-11-12) and `docs/product/CEL-STYLE-HANDOFF.md`.

## Done
- Read everything; baseline `node --test tests/core/*.test.js` 109/109 on the branch.
- Plan (stage 1 in progress): moment fields `top mid hor | key amb sunlight tint lit shade | glow | ink inkShadow |
  card cardInk accent | kDune kMesa kRug hBand haze | lamp dim`; light direction derived in `tools/art/cel/light.js`
  (`lightAt(alt, rising)`: the sun rises at the picture's left, so rising gives L.x = -1 at the horizon, matching the
  stills' (-1,-0.18) dawn and (1,-0.18) sunset; (-0.3,-1) overhead; moonlight (0.3,-1) below -22 deg).
- Stills' card colours (sRGB mix, to author verbatim): dawn `#fae4d4`, noon `#fcf1dd`, sunset `#fcd8be`,
  night `#1d2856`; card shadows mix(mid, amb, .5): `#624d88 #7292bd #7e3b62 #11183e`.

## Next steps
1. Stage 1: failing tests in `tests/core/script.test.js` (pinned stops, fields), then re-author `script.js`;
   `tools/art/cel/light.js`; refactor `scene.js` to `buildLand(moment, L)`; rewrite `bake.js`; bake; screenshots.
2. Stage 2: card (`table.js`, `PrayerTable.qml` in `AshScene.qml`), `Readouts.qml` shadow, `Sun.qml` rings, moon.
3. Stage 3: tests (geometry, art-moments, palette, cel-art), removals (Sadu modules, Tent.qml, tent/lattice PNGs),
   ADR 0004, AGENTS.md bake line, CEL-STYLE-HANDOFF status.

## Open questions / blockers
- none yet

## Gotchas learned
- `scripts/check-file-length.sh` only checks tracked files: run it after `git add`.
- The sky rect must extend below the horizon (to 616): the baked land is transparent above its silhouette.

## Suggested skills
- impeccable (not installed); accessibility checklist for contrast.
