# Handoff: tech-lead
Updated: 2026-11-12 · Branch: main · Status: round 3 closed, cel infographic in the app; waiting on the PO's verdict on the live frames

## Task
Run the team for Ash: kickoff, then rounds from docs/team/BOARD.md.

## Done
- Round 3 (2026-11-12): the PO's cel-shaded infographic replaces the Sadu tent scene. PR 0014 (`1e4128f`): stills
  generator `tools/art/cel/` under one offset-copy shading rule, October family restored, card tinted, mesas kept.
  PR 0015 (`35df723`, ADR 0004): app integration by three frontend-engineer instances on one worktree (stages 1-3 and a
  fix pass after my own look at the frames: sky seam, night land from −6..−12°, warm low-sun rings under the halo guard).
  Both code-reviewed (approve with nits; follow-ups on the board). 125/125 node tests, 12/12 shell suites, QML check
  clean, bake deterministic, assets 720 KB. Live frames and 16-moment sheet in `~/ash-data/screens-cel-app/`; review
  page for the PO: https://claude.ai/artifact/N219rokPKqg5PppVBfCkBR (private; the session that published it can
  republish by file path, another by url).
- Round 2 and earlier: PRs 0001-0013, kickoff, proposal approved 2026-10-31.

## Next steps
1. PO verdict on the live frames (and the three open taste points on the board: moon/stars before −8°, outermost ring
   neutral, clock top 208 px). Tweaks: one builder, fresh worktree, `script.js` / `palette.js` / `skygrad.js`, rebake,
   screenshots, review, merge.
2. PR 0015 review follow-ups (board), small; can ride with the next tweak.
3. PO compares times with their mosque. Device work stays on hold until Toon access; first device check: cost of the
   full-screen alpha PNGs and the per-minute cross-fade (now 720 KB of art).

## Open questions / blockers
- PO verdict on the live frames.
- Optional: a Claude desktop session with computer use over Remote Control to watch the live window.

## Gotchas learned
- Remote: `origin` = `git@github.com:xe-rx/ash.git` (SSH, `gh` logged in as xe-rx), added 2026-11-12 at the PO's request so
  they can pull on their laptop. Pushing still needs the PO's go-ahead each time (AGENTS.md); run check-pii first.
- Builders run out of context, not turns, when told to read the whole repo: brief them to read the handoff and only the
  files they change. Three instances on one worktree worked; the handoff is the contract.
- No watcher agents (PO, 2026-11-12): they cost more than they earn. Builders checkpoint and stop on their own.
- The PO's 5-hour usage limit cuts agents mid-run; their commits survive, resume them with SendMessage.
- Trial merges: copy node_modules into the scratch worktree, never symlink (`git check-ignore` fails beyond a symlink).
- `scripts/screenshot.sh --at` takes one moment per call. Qt interpolates gradients in sRGB; the stills' SVG too.
- A winter noon sun is low AND over the clock: any sun-ring rule must be geometric, not by altitude.
- Builders can Read PNGs: require them to look at their renders and write what they saw.
- The approved family is the rounded pill version at `d230545`. Toolchain `~/ash-data/toolchain/qt511`; offscreen needs
  `QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software`. run-local.sh finds `/wslg/.X11-unix/X0`.

## Suggested skills
- tech-lead, test-driven-development, impeccable (design rounds)
