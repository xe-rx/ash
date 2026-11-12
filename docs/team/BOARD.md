# Team board: Ash

Round: 3 (cel-shaded infographic; device work on hold) · PO: the user · Tech lead: main session

## Roster
| Role | Kind | Status |
|---|---|---|
| tech lead | main session | active |
| backend-engineer, frontend-engineer, devops-engineer, test-engineer, docs-writer | builders | idle |
| architect, debugger, researcher | advisors (read-only) | idle |
| code-reviewer, security-reviewer (+ /review-pr specialists) | reviewers (read-only) | idle |
| usage-monitor | background watcher | idle |

## Waiting on the PO
- [ ] **PO verdict on the v3 cel stills** (review page https://claude.ai/artifact/N219rokPKqg5PppVBfCkBR, files `~/ash-data/screens-cel/v3/`): approve per frame or name the spot; dune bands at dawn/sunset bolder or not; noon mesas darker or not.
- [ ] PO compares a few dates with their mosque (`config/ash.json`).
- [ ] Optional: a Claude desktop session with computer use, reachable over Remote Control, to watch the live window.

PO 2026-11-04: QML primitives "will always look flat and simple"; approved baking geometric SVG art to PNG and prototyping a lattice panel and a tent view.
Decided 2026-11-04: gradient sky; Hijri rolls over at Maghrib; UI redesign in the Sadu (woven tent) direction, chosen on the Impeccable decision page (contract in `.impeccable/surfaces/`).

PO 2026-11-12 (cel sheet): all four shadow kinds are off (dune crescents, figure split, forward casts, noon patches); restore the October family exactly (d230545 Person/Family.qml); tint the times card into each moment; keep the mesas, shaded like everything else.

Device access is on hold (PO, 2026-10-31).

## Running jobs and servers
| What | PID file | Log | Restart with | Done when |
|---|---|---|---|---|

## Backlog
PO change 2026-10-31: "can't get into toon yet, for now, focus on running it locally here and perfecting it". Rounds below replace the approved round order; the milestone in the brief is unchanged and can't be met until device access returns.

### Round 2: perfecting
PO request 2026-10-31: "Can you do some research on higher quality styles and atmosphere creation and see whether you can improve it. If not this just means its a human task!"
PO feedback 2026-10-31, on the live window: "Good first start! Seems to work!, work on the entire atmosphere, colours and a prettier sun, I dont mind the family and landscape. Also, the ugly big circle graph outline with all the prayers at their sun position is unecessary. Clean table on the right, and just show off the sun with a cleaner indicator."

- [ ] **Cel-shaded infographic** (PO 2026-11-11): stills v3 done and merged as tooling (PR 0014, `tools/art/cel/`, `node tools/art/cel/render.js`); waiting on the PO's verdict. Then **app integration** (one builder, Fable 5.1 xhigh): re-author the 14 `script.js` stops to the cel palette (key/amb per stop), rebake `assets/land/*` from `tools/art/cel` with the family and mesas in the layers (alpha, sky stays live), replace `Tent.qml` + lattice `PrayerTable.qml` with a live tinted card (`palette.js` card/ink per moment, ≥ 4.5:1), delete tent/lattice PNGs and the Sadu `tools/art` modules, rewrite `bake.js`, swap the valance/lattice tests (`geometry.test.js`, `art-moments.test.js`, `palette.test.js`) for card-contrast and arc-clearance tests, move `cel.test.js` under `tests/`, and fold in PR 0014's review nits (clock-on-sky contrast check, geometry test on output, lit-side test, `require.main` guard, fontconfig path, documented shade cap). Offscreen screenshots at 1024x600 before done.
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
- PR 0014 cel-shaded stills v3 (tools/art/cel: one shading rule, October family, tinted card, mesas), 2026-11-12
- PR 0011 Hijri at Maghrib; PR 0012 baked geometric art; PR 0013 Sadu redesign with scene C (tent + lattice), 2026-11-04
- PR 0005 clock spacing, polar message, marker and glyph tests; PR 0006 toolchain follow-ups; PR 0007 README; PR 0008 WSLg display; PR 0009 atmosphere redesign; PR 0010 art direction experiment
- PR 0001 Qt toolchain and checks; PR 0002 calculation core; PR 0003 scene and local run; PR 0004 scene follow-ups
- Kickoff: all phases; proposal approved by the PO 2026-10-31
