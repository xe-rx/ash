# Handoff: frontend-engineer
Updated: 2026-10-31 22:25 · Branch: frontend-engineer/art-direction · Status: in-progress

## Task
Art-direction experiment (docs/product/ART-DIRECTION.md). Honest result wanted; revert anything sideways or worse.
Order: 1 colour script, 2 depth silhouettes, 3 one light (big halos, cast shadow, optional crest), 4 sky A (bands) vs B (gradient + grain tile) renders in ~/ash-data/screens-artdir/{A,B}/. Plus: calmer plum panel crossing, warm-hazy day sky, sun clipped at left (arc inward if clearance holds). Budget: <=175 QML items (was 130-146).

## Done
- Step 1 committed (feat(core): colour script): app/ash/core/script.js (moments, momentAt), palette.js uses it (farTwo, farOne, dunes, shade/tint for figures; HAZE day mid #dccbbe). tests/core/script.test.js (depth ordering, layer separation, day far layers cooler). All node core tests green.
- Render step1: ~/ash-data/screens-artdir/step1/ (sheet, strip-sunset). Looks: sunset/dusk land is now a dark plum against the bright horizon (clear improvement), midday sky warmer; baseline = ~/ash-data/screens-atmosphere.

## Next steps
1. Step 2: Dunes.qml/new Silhouettes.qml: 1-2 low long mesa/dune shapes behind the far plain (top y >= 345 so they stay clear of the countdown text at y 300-333), colours pal.farTwo, pal.farOne. Render.
2. Step 3a: sunlook.js two very large faint discs (r*5, r*8 at low sun, fade out by ~25 deg), update Sun.qml repeater to 5 and halo-contrast test (needs bg composite over all halos; keep >= 4.5). 3b: core/shadow.js castShadow(alt, rising) pure + test (length grows as sun lowers, side away from sun, 0 alpha by ~-1 deg, continuous); shadow rect in Family area, colour pal shade. 3c crest optional, probably skip.
3. Panel plum: PLUM #5c3874 -> duller, wider crossing in palette.js (tests: chroma>=0.02, step<0.12, row fill distance>=0.09).
4. Sun clip: geometry ARC_RX 305 -> ~285 (updates literal 60/670 test; check clearance>=16, panel clear, arc test e<0.85).
5. Step 4: Sky.qml with one-line switch (gradientSky), B = Rectangle Gradient from band colours at band centres + tiled grain PNG from tools/gen-grain.js (<50KB, opacity 0.03-0.06); render sheets + strips to ~/ash-data/screens-artdir/A and B; measure banding in B.
6. GLOSSARY, comments, PR record (docs/team/prs/), item count before/after, final checks: REQUIRE_QT=1 scripts/test.sh, check-file-length, check-pii, check-ash-rules, check-qml.

## Open questions / blockers
None.

## Gotchas learned
- npm ci --offline in a new worktree; node --test tests/core/*.test.js.
- Scratch tuning scripts live in the session scratchpad (dist.js, scan.js): scan prints altitudes where layer ordering or separation fails.
- Silhouette order rule: distance from horizon sky colour must increase silhouette-two < one < far plain < mid < near at every altitude; keep silhouettes consistently darker than the horizon at twilight/night or the interpolation crosses over.
