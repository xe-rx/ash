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
- [ ] How does the redesign (PR 0009) look live? Known weak spots are in the PR record.
- [ ] Should the Hijri date change at Maghrib or at midnight? (currently midnight)

Device access is on hold (PO, 2026-10-31).

## Running jobs and servers
| What | PID file | Log | Restart with | Done when |
|---|---|---|---|---|

## Backlog
PO change 2026-10-31: "can't get into toon yet, for now, focus on running it locally here and perfecting it". Rounds below replace the approved round order; the milestone in the brief is unchanged and can't be met until device access returns.

### Round 2: perfecting
PO feedback 2026-10-31, on the live window: "Good first start! Seems to work!, work on the entire atmosphere, colours and a prettier sun, I dont mind the family and landscape. Also, the ugly big circle graph outline with all the prayers at their sun position is unecessary. Clean table on the right, and just show off the sun with a cleaner indicator."
- [ ] Apply the PO's Hijri decision.
- [ ] PO compares a few dates with their mosque.

### On hold until the PO can reach the Toon
- [ ] Round 0 probe (command in the proposal); pin Qt version and resolution from it
- [ ] Tile, dim hook and `qb.*` adapters; device scripts and `docs/INSTALL.md`
- [ ] Soft chime (depends on audio); GUI-failure and rollback rehearsal; one-week soak

## In progress
| Task | Role | Branch | Worktree | Status |
|---|---|---|---|---|

## In review

## Done
- PR 0005 clock spacing, polar message, marker and glyph tests; PR 0006 toolchain follow-ups; PR 0007 README; PR 0008 WSLg display; PR 0009 atmosphere redesign
- PR 0001 Qt toolchain and checks; PR 0002 calculation core; PR 0003 scene and local run; PR 0004 scene follow-ups
- Kickoff: all phases; proposal approved by the PO 2026-10-31
