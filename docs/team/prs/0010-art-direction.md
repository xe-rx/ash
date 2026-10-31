# PR 0010: art direction experiment

Branch: `frontend-engineer/art-direction` · Author: frontend-engineer · Status: merged

## Summary
From the PO's request to research higher-quality atmosphere (`docs/product/ART-DIRECTION.md`). Adds a keyed colour script for sky, land and figures, four distant dome silhouettes, two large faint halos around a low sun, and a calmer panel crossing. The arc moved in 10 px each side. Also adds an optional gradient sky with 2% tiled grain, chosen by the dev-only `--sky bands|gradient` flag; bands stays the default until the PO chooses.

## Checks
- `scripts/check-file-length.sh`: pass
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed, in the trial merge
- check-pii, check-ash-rules, check-qml: pass (14 QML files, 0 errors)
- Renders: `~/ash-data/screens-artdir/A` (bands), `B2` (gradient at 2% grain); viewed by the tech lead
- Halo contrast sweep (`HALO_DAYS=2 HALO_MIN=6`, 10.8M samples per sky): worst 4.53 bands, 4.51 gradient, bound 4.5. The reviewer's sweep (`HALO_DAYS=1 HALO_MIN=3`, 43.3M samples per sky) also passed on b97f891 with the same worst values: 4.53 and 4.51. The tech lead's own run of it timed out.
- QML items, builder's estimate by counting, not measured: 136-152 bands, 129-145 gradient, limit 175
- handoff updated on the branch

## Reviews
### Tech lead art review: changes requested (resolved)
Pill mesas read as stray clouds (removed), and 4.5% grain read as stipple (lowered to 2%).

### code-reviewer: APPROVE (medium-high)
No blocking findings. Stale comments fixed. Accepted: thin contrast margin; depth test's minimum gap is only 0.004; packaging must include `app/ash/assets/` if the gradient is chosen.

### security-reviewer: not required

## Resolution
The cast shadow was built three ways and dropped: it read as a stray bar. The lit crest wasn't tried. At midday the domes show as thin pale rims. Comment-only commit after the review wasn't re-reviewed. Merge commit 6ed22ca.
