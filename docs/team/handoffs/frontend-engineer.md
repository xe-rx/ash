# Handoff: frontend-engineer
Updated: 2026-11-04 05:18 · Branch: frontend-engineer/baked-art · Status: done

## Task
Prototype two baked-SVG sunset scenes (A mashrabiya, B tent) at 1024x600, no app integration.

## Done
- Generator in tools/art/ (palette, svg, layout, sky, landscape, family, sadu, text, panelA, panelB, build). Run: node tools/art/build.js [outdir]
- Output in ~/ash-data/proto-baked/: full scenes plus layers sky, landscape, panel, text per scene.

## Next steps
1. PO picks A or B (or neither); then integrate as stacked Images with live sun/clock/text.

## Open questions / blockers
None.

## Gotchas learned
- rsvg needs FONTCONFIG_FILE with <dir> to app/ash/fonts; build.js makes a temp one.
- Masks (lattice) bake to real alpha holes in the panel layer.
## Suggested skills
impeccable
