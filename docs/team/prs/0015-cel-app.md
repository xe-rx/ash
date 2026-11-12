# PR 0015: Cel-shaded infographic in the app (replaces the Sadu tent scene)

Branch: `frontend-engineer/cel-app` · Author: frontend-engineer (Fable 5.1, xhigh; three instances on one worktree) · Status: merged

## Summary
The PO-approved cel infographic (PR 0014 stills) drawn by the app at every minute of the year. `script.js` re-authored
to the cel palette (same 14 stops; `rise-7`, `day`, `set0`, `night` pinned byte-identical to the approved stills;
light direction derived from the sun), `tools/art/cel` is the bake source (14 alpha land layers, 675 KB, family and
mesas baked, sky live), `palette.js` rewritten (sky stops on the still's curve with the clock darkening kept, card and
accent inks ≥ 4.5:1 at every half-degree both ways, geometric ring-warmth gate under the halo guard), live tinted card
with shadow and accent pill replaces the tent frame and lattice, clock with hard offset shadow and a plain countdown
line, four-ring sun, moon with rings, night land from −6..−12°. Deleted: `Tent.qml`, tent/lattice PNGs, the Sadu
`tools/art` modules. ADR 0004 records the direction change. Fix pass after the tech lead's own look at the frames: sky
seam at y 355 removed, June 23:10 reads as night on the ground, warm low-sun rings.

## Checks (tech lead, trial merge in a throwaway worktree on main)
- `scripts/check-file-length.sh`: pass · `scripts/check-pii.sh`: pass · `scripts/check-ash-rules.sh`: ok
- `scripts/check-qml.sh`: Qt 5.11.2, 11 files, 0 errors
- `node --test tests/core/*.test.js`: 125 pass / 0 fail · `scripts/test.sh`: all 12 files OK
- bake determinism: `node tools/art/bake.js` on the merged tree changes no tracked asset; assets 720 KB (was 1.0 MB)
- screenshots viewed by the tech lead (`~/ash-data/screens-cel-app/`, 04:31 / 13:50 / 21:40 / 23:10 and the 16-frame
  sheet): match the approved stills; continuous in-betweens; December nights match the night still
- handoff updated: `0c8b1bf`

## Deviations from the stills (accepted by the tech lead, reported to the PO)
- Noon upper sky deeper (clock darkening rule, 5.6:1 kept); noon sun on the real arc above the clock at ≈ (369, 128).
- Clock ink top 208 px (still 196) for 16 px disc clearance; countdown at 304.
- The outermost sun ring stays luminance-neutral everywhere (it always reaches the clock text); the inner three go warm
  where they are 40 px clear of the text (an altitude threshold provably fails the halo guard at a low winter noon).
- June 23:10 is −7.5°: night land and lit lantern, no moon/stars yet (moon from −8°, stars from −9°).

## Reviews
### code-reviewer: APPROVE WITH NITS (HIGH)
Ran in a throwaway clone: 125/125 node tests, file-length, ash-rules, pii. Swept `paletteAt` over −90..90 in 0.25°
steps both ways plus NaN/undefined: every colour a valid hex, every number finite; lowest contrasts clock-on-sky 5.60,
cardInk 4.63, cardInkFaded 4.62, accentInk 5.27; `ensureContrast` capped at 80 steps, bisections fixed at 24. Script
altitudes strictly increasing, every stop through `m()`, `landAt` names = baked files, OKLab/linear mixing intact. No
leftover references to removed palette fields in `app/`; `Sun.qml` consistent with `ringColour`/`ringWarmth`; one
Loader, card inside the shifted scene and inside the clip. ES5 and offline hold; `app/` imports nothing from `tools/`.
Nits (none blocking, carried to the backlog): (1) `pal.night` has no consumer; (2) grain/stars generators are live but
not part of the bake step (committed assets, fine); (3) two relaxed tests judged justified (light-continuity 0.12→0.5
per half-degree, real jumps > 1; no-green hue window now covers 8..90° only) but the reason for the first should be
recorded; (4) `ringWarmth` constants TEXT_HALF_W 160 / WARM_FADE 40 are hand-set, add an assertion against the clock
and countdown boxes; (5) a missing land name would fail silently in `Landscape.qml` (covered by the file-set test).

### security-reviewer: not required (no input handling, network, secrets or dependencies)

## Resolution
No blocking findings; nits 1, 3 (record the reason), 4 carried to the backlog. Merged `35df723`; 125/125 on main after
the merge. PO to judge the live frames on the review page.
