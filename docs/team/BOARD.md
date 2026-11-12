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
- [x] PO said "continue" on the v3 stills 2026-11-12 (dune bands and noon mesas unchanged unless the PO says otherwise). Was: **PO verdict on the v3 cel stills** (review page https://claude.ai/artifact/N219rokPKqg5PppVBfCkBR, files `~/ash-data/screens-cel/v3/`): approve per frame or name the spot; dune bands at dawn/sunset bolder or not; noon mesas darker or not.
- [ ] **PO verdict on the live app frames** (review page https://claude.ai/artifact/N219rokPKqg5PppVBfCkBR, files `~/ash-data/screens-cel-app/`).
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

- [x] **Cel-shaded infographic**: stills (PR 0014) and app integration (PR 0015, ADR 0004) merged 2026-11-12. Waiting on the PO's verdict on the live frames.
- [ ] PR 0015 review follow-ups: delete the unread `pal.night` or give it a consumer; record why the light-continuity guard widened to 0.5 per half-degree (the 5° gap between the pinned stills and the new rise-12/set-4 stops); assert `ringWarmth`'s TEXT_HALF_W 160 against the clock and countdown boxes over the year; extend the no-green horizon test below 8° if a rule can be found.
- [ ] Open to the PO: moon and stars before −8°/−9° so June 23:10 shows them; outermost sun ring stays neutral (it always reaches the clock text); clock top at 208 px for disc clearance.

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
- PR 0015 cel-shaded infographic in the app: script re-authored, land rebaked from tools/art/cel, live tinted card, clock shadow, sun/moon, tests, ADR 0004; tent and lattice removed, 2026-11-12
- PR 0014 cel-shaded stills v3 (tools/art/cel: one shading rule, October family, tinted card, mesas), 2026-11-12
- PR 0011 Hijri at Maghrib; PR 0012 baked geometric art; PR 0013 Sadu redesign with scene C (tent + lattice), 2026-11-04
- PR 0005 clock spacing, polar message, marker and glyph tests; PR 0006 toolchain follow-ups; PR 0007 README; PR 0008 WSLg display; PR 0009 atmosphere redesign; PR 0010 art direction experiment
- PR 0001 Qt toolchain and checks; PR 0002 calculation core; PR 0003 scene and local run; PR 0004 scene follow-ups
- Kickoff: all phases; proposal approved by the PO 2026-10-31
