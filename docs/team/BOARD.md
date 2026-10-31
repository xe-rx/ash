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
- [ ] Open the live window (`scripts/run-local.sh`): does it open, and how does the look land?
- [ ] Should the Hijri date change at Maghrib or at midnight? (currently midnight)

Device access is on hold (PO, 2026-10-31).

## Running jobs and servers
| What | PID file | Log | Restart with | Done when |
|---|---|---|---|---|

## Backlog
PO change 2026-10-31: "can't get into toon yet, for now, focus on running it locally here and perfecting it". Rounds below replace the approved round order; the milestone in the brief is unchanged and can't be met until device access returns.

### Toolchain follow-ups (from PR 0001, non-blocking)
- [ ] Network check: add `Qt.createQmlObject`, `Qt.include`, `createComponent`, `Function(`, `WorkerScript`, `EventSource`, `sendBeacon`. Done when: planted violations fail.
- [ ] `t_offline` must fail, not skip, under `REQUIRE_QT=1` if namespaces are unavailable; `check-qml.sh` resolves relative paths before `cd`; state the coordinate check's limits in its header; fix the vacuous `h_nongit` test in `tests/test_file_length.sh`.

### Round 2: perfecting
- [ ] Clock: fixed-width digit cells leave wide gaps around a 1 (tech lead's review of the sheet). Tighten without the layout jumping between minutes.
- [ ] Scene follow-ups from PR 0004: correct the error message near the polar limit in `scene.js`; add a compact test that each prayer marker sits at the ring's position at that prayer's time.
- [ ] Polish from PO feedback on the live window.
- [ ] README: how to run locally. PO compares a few dates with their mosque.

### On hold until the PO can reach the Toon
- [ ] Round 0 probe (command in the proposal); pin Qt version and resolution from it
- [ ] Tile, dim hook and `qb.*` adapters; device scripts and `docs/INSTALL.md`
- [ ] Soft chime (depends on audio); GUI-failure and rollback rehearsal; one-week soak

## In progress
| Task | Role | Branch | Worktree | Status |
|---|---|---|---|---|
| Clock digit spacing; scene.js polar message; marker test | frontend-engineer | frontend-engineer/clock-spacing | .worktrees/frontend-engineer-clock-spacing | building |
| Toolchain follow-ups from PR 0001 | devops-engineer | devops-engineer/toolchain-followups | .worktrees/devops-engineer-toolchain-followups | building |
| README: run locally | docs-writer | docs-writer/readme | .worktrees/docs-writer-readme | building |

## In review

## Done
- PR 0001 Qt toolchain and checks; PR 0002 calculation core; PR 0003 scene and local run; PR 0004 scene follow-ups
- Kickoff: all phases; proposal approved by the PO 2026-10-31
