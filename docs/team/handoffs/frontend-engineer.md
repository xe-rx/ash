# Handoff: frontend-engineer
Updated: 2026-11-04 05:28 · Branch: frontend-engineer/baked-art · Status: done

## Task
Prototype two baked-SVG sunset scenes (A mashrabiya, B tent) at 1024x600, no app integration.

## Done
- Generator in tools/art/ (palette, svg, layout, sky, landscape, family, sadu, text, panelA, panelB, build). Run: node tools/art/build.js [outdir]
- Output in ~/ash-data/proto-baked/: full scenes plus layers sky, landscape, panel, text per scene.

- Scene C (PO pick: A's lattice with B's tent) added: C-tent-lattice.png plus layers sky/landscape/tent/lattice/wash/text; tent.js split out; wash separate layer.

- Moments pass: tools/art/moments.js (copy of script.js table), bake.js writes app/ash/assets/land/*.png (14), tent.png, lattice.png (1.37 MB total, deterministic, lossless via quantize.py/PIL); figures.js/rug.js split; sheet.py contact sheet.

- tent-night.png / lattice-night.png baked via P.moonlit (colour remap of the same SVG, identical alpha). Assets total 1,521,718 B.
- Build needs system python3 + PIL and rsvg-convert (build-time only, not shipped).

## Next steps
1. Integrate C as stacked Images with live sun/clock/text; parameterise palette for ~8 moments.

## Open questions / blockers
None.

## Gotchas learned
- Palette quantising bands the dune gradients; lossless RGBA fits 1.5 MB. Run: node tools/art/bake.js
- rsvg needs FONTCONFIG_FILE with <dir> to app/ash/fonts; build.js makes a temp one.
- Masks (lattice) bake to real alpha holes in the panel layer.
## Suggested skills
impeccable
