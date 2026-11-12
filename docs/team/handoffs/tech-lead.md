# Handoff: tech-lead
Updated: 2026-11-12 · Branch: main · Status: round 3, stills v3 merged as tooling, waiting on the PO's verdict

## Task
Run the team for Ash: kickoff, then rounds from docs/team/BOARD.md.

## Done
- Round 3 (2026-11-12): diagnosed the rejected cel sheet myself (dune crescents, clip-circle figure splits, forward
  casts, noon patches) and found that both cel sheets had changed the family (father's white ghutra, girl's bun) against
  the approved October figures (`d230545` Person/Family.qml). PO confirmed all four shadows wrong, chose: restore the
  family exactly, tint the card per moment, keep the mesas. Dispatched the design builder on Fable 5.1 xhigh (PO's
  standing instruction). PR 0014 merged `1e4128f`: `tools/art/cel/` renders the four stills to `~/ash-data/screens-cel/v3/`
  under one offset-copy shading rule; code-reviewer APPROVE WITH NITS (nits listed in the PR record, carried to
  integration). Review page for the PO: https://claude.ai/artifact/N219rokPKqg5PppVBfCkBR (private artifact).
- Round 2, batch 2 (2026-11-04): PRs 0011-0013 (Hijri at Maghrib, baked art, Sadu scene C). Earlier: PRs 0001-0010.

## Next steps
1. PO verdict on the v3 stills (per frame; dune band strength; noon mesas). Tweaks: new worktree on `tools/art/cel`,
   `k.dune` / `mesa.shade` in `moments.js`, rerender, republish the review page (same file path in that session, or by url).
2. On approval: app integration, one builder (frontend-engineer, Fable 5.1 xhigh); scope on the board under the
   cel-shaded infographic item. Acceptance: offscreen 1024x600 screenshots at the 4 moments match the stills; all tests
   green; tent/lattice gone; card contrast tests; `node tools/art/bake.js` rebakes from `tools/art/cel`.
3. PO compares times with their mosque. Device work on hold until Toon access.

## Open questions / blockers
- PO verdict on the stills (above).
- Optional: a Claude desktop session with computer use over Remote Control to watch the live window.

## Gotchas learned
- Trial merges: don't symlink node_modules into the scratch worktree; `tests/test_ash_rules.sh` runs
  `git check-ignore node_modules/x`, which fails "beyond a symbolic link". Copy or `npm ci` instead.
- Builders can Read PNGs: require them to look at their own renders and write what they saw in the handoff.
- The approved family is the rounded pill version at `d230545`, not the faceted one at `85ebfe7^`.
- Impeccable (v4.5.2) runs its decision page on 127.0.0.1; question logs are gitignored. QML primitives look flat;
  baked SVG via rsvg-convert is the way. `worktree.sh merge` needs `--discard-data` when only .qmlc/.jsc caches remain.
- `/tmp/.X11-unix` is empty here; run-local.sh finds `/wslg/.X11-unix/X0`. Offscreen needs
  `QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software` and `grabToImage`. Toolchain: `~/ash-data/toolchain/qt511`.

## Suggested skills
- tech-lead, test-driven-development, impeccable (design rounds)
