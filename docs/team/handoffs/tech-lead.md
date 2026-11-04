# Handoff: tech-lead
Updated: 2026-11-04 · Branch: main · Status: waiting on PO feedback on the new scene

## Task
Run the team for Ash: kickoff, then rounds from docs/team/BOARD.md.

## Done
- Round 2, batch 2 (2026-11-04): PR 0011 Hijri at Maghrib, PR 0012 baked geometric SVG art (tools/art, rsvg-convert), PR 0013 Sadu redesign with scene C (tent frame + mashrabiya lattice, 14 land moments cross-faded, live sun/clock/table). PRODUCT.md and the Impeccable direction contract in .impeccable/surfaces/.
- Earlier: PRs 0001-0010, kickoff, proposal approved 2026-10-31.

## Next steps
1. PO feedback on the live scene; polish from it (board lists candidates and review follow-ups).
2. PO compares times with their mosque.
3. Device work on hold until Toon access; first device check: cost of the full-screen PNGs.

## Open questions / blockers
- PO: reaction to the new scene; mosque comparison.
- Optional: a Claude desktop session with computer use, reachable over Remote Control (this session is linked), to watch the live window.

## Gotchas learned
- Impeccable (v4.5.2 installed, v4.8.0 available) runs its decision page on 127.0.0.1; the PO could open it from Windows. Its question logs are gitignored.
- QML primitives look flat whatever you do; baked SVG art via rsvg-convert is the way to detail. Two builders sharing a role share one handoff file: expect a conflict on merge.
- Builders hit their 40-turn limit on big tasks: resume them with SendMessage. `worktree.sh merge` needs `--discard-data` when only .qmlc/.jsc caches remain.
- `/tmp/.X11-unix` is empty here; run-local.sh finds `/wslg/.X11-unix/X0`. Agents confirm the window in `/wslg/weston.log` but can't see it.
- Toolchain: `~/ash-data/toolchain/qt511`; offscreen needs `QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software` and `grabToImage`.

## Suggested skills
- tech-lead, impeccable (design rounds), test-driven-development
