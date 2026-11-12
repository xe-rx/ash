# Team board: Ash

Round: 2 (perfecting locally; device work on hold) · PO: the user · Tech lead: main session

## Roster
| Role | Kind | Status |
|---|---|---|
| tech lead | main session | active |
| backend-engineer, frontend-engineer, devops-engineer, test-engineer, docs-writer | builders | idle |
| architect, debugger, researcher | advisors (read-only) | idle |
| code-reviewer, security-reviewer (+ /review-pr specialists) | reviewers (read-only) | idle |
| usage-monitor | background watcher | idle |

## Waiting on the PO
- [ ] PO compares a few dates with their mosque (`config/ash.json`).
- [ ] Optional: a Claude desktop session with computer use, reachable over Remote Control, to watch the live window.

PO 2026-11-04: QML primitives "will always look flat and simple"; approved baking geometric SVG art to PNG and prototyping a lattice panel and a tent view.
Decided 2026-11-04: gradient sky; Hijri rolls over at Maghrib; UI redesign in the Sadu (woven tent) direction, chosen on the Impeccable decision page (contract in `.impeccable/surfaces/`).

Device access is on hold (PO, 2026-10-31).

## Running jobs and servers
| What | PID file | Log | Restart with | Done when |
|---|---|---|---|---|

## Backlog
PO change 2026-10-31: "can't get into toon yet, for now, focus on running it locally here and perfecting it". Rounds below replace the approved round order; the milestone in the brief is unchanged and can't be met until device access returns.

### Round 2: perfecting
PO request 2026-10-31: "Can you do some research on higher quality styles and atmosphere creation and see whether you can improve it. If not this just means its a human task!"
PO feedback 2026-10-31, on the live window: "Good first start! Seems to work!, work on the entire atmosphere, colours and a prettier sun, I dont mind the family and landscape. Also, the ugly big circle graph outline with all the prayers at their sun position is unecessary. Clean table on the right, and just show off the sun with a cleaner indicator."

- [ ] **Cel-shaded infographic** (PO 2026-11-11): revert to the simple infographic with flat cel shading and one hue per moment. Prototype stills in `~/ash-data/proto-cel/`; handoff in `docs/product/CEL-STYLE-HANDOFF.md`. Open: PO says "shadows are off" (which ones not yet known); keep the original family design. Next: stills approved, then app integration (replaces tent and lattice).
- [ ] Review follow-ups (PR 0013): comment on the relaxed ellipse test; tie `valanceY` to tent.png by a test; hem margin 4.8 px

### On hold until the PO can reach the Toon
- [ ] Measure the Toon's cost of full-screen alpha PNGs and the per-minute cross-fade (1.5 MB of art)
- [ ] Round 0 probe (command in the proposal); pin Qt version and resolution from it
- [ ] Tile, dim hook and `qb.*` adapters; device scripts and `docs/INSTALL.md`
- [ ] Soft chime (depends on audio); GUI-failure and rollback rehearsal; one-week soak

## In progress
| Task | Role | Branch | Worktree | Status |
|---|---|---|---|---|

## In review

## Done
- PR 0011 Hijri at Maghrib; PR 0012 baked geometric art; PR 0013 Sadu redesign with scene C (tent + lattice), 2026-11-04
- PR 0005 clock spacing, polar message, marker and glyph tests; PR 0006 toolchain follow-ups; PR 0007 README; PR 0008 WSLg display; PR 0009 atmosphere redesign; PR 0010 art direction experiment
- PR 0001 Qt toolchain and checks; PR 0002 calculation core; PR 0003 scene and local run; PR 0004 scene follow-ups
- Kickoff: all phases; proposal approved by the PO 2026-10-31
