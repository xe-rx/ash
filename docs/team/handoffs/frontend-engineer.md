# Handoff: frontend-engineer
Updated: 2026-10-31 22:42 · Branch: frontend-engineer/art-direction · Status: done

## Task
Art-direction experiment (docs/product/ART-DIRECTION.md): colour script, depth, one light, sky A vs B; honest result.

## Done
- core/script.js colour script (+ palette.js uses it), silhouettes (view/Silhouettes.qml), five halos (sunlook.js, Sun.qml), luminance-keeping halo tints (palette.js), arc moved inward 10 px (geometry ARC_RX 295), quieter plum crossing, warm HAZE day sky.
- core/skygrad.js + Sky.qml switch (line 14, gradientSky) + tools/gen-grain.js -> app/ash/assets/grain.png (22.7 KB). A active (recommended).
- Cast shadow dropped (three attempts looked like stray bars); lit crest not tried.
- Tests: script, sunlook, skygrad, halo-contrast (flat and gradient), geometry updated (arc ends 70/660). REQUIRE_QT=1 scripts/test.sh: all 12 files pass.
- Renders: ~/ash-data/screens-artdir/{A,B,step1,step2,step3}.

## Next steps
1. Tech lead review, PO eyes on A vs B and on the colour script.
2. Remaining ideas (not started): shadow as figure-shaped silhouette shapes, lit crest, per-moment panel colours in the script, higher silhouettes at midday, an even stronger dusk land/sky split.

## Open questions / blockers
None.

## Gotchas learned
- Halo tints must keep the sky luminance near the ink flip (sky lum ~0.179) or contrast fails by 0.03-0.1.
- Silhouette order test needs every layer consistently darker than the horizon at twilight and night.
