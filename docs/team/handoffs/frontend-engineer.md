# Handoff: frontend-engineer
Updated: 2026-11-04 05:23 · Branch: frontend-engineer/baked-art · Status: done

## Task
Prototype two baked-SVG sunset scenes (A mashrabiya, B tent) at 1024x600, no app integration.

## Done
- Generator in tools/art/ (palette, svg, layout, sky, landscape, family, sadu, text, panelA, panelB, build). Run: node tools/art/build.js [outdir]
- Output in ~/ash-data/proto-baked/: full scenes plus layers sky, landscape, panel, text per scene.

- Scene C (PO pick: A's lattice with B's tent) added: C-tent-lattice.png plus layers sky/landscape/tent/lattice/wash/text; tent.js split out; wash separate layer.

## Next steps
1. Integrate C as stacked Images with live sun/clock/text; parameterise palette for ~8 moments.

## Open questions / blockers
None.

## Gotchas learned
- rsvg needs FONTCONFIG_FILE with <dir> to app/ash/fonts; build.js makes a temp one.
- Masks (lattice) bake to real alpha holes in the panel layer.
## Suggested skills
impeccable
