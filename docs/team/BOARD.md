# Team board: Ash

Round: 1 (local build; device work on hold) · PO: the user · Tech lead: main session

## Roster
| Role | Kind | Status |
|---|---|---|
| tech lead | main session | active |
| backend-engineer, frontend-engineer, devops-engineer, test-engineer, docs-writer | builders | idle |
| architect, debugger, researcher | advisors (read-only) | idle |
| code-reviewer, security-reviewer (+ /review-pr specialists) | reviewers (read-only) | idle |
| usage-monitor | background watcher | idle |

## Waiting on the PO
Nothing right now. Device access is on hold (PO, 2026-10-31).

## Running jobs and servers
| What | PID file | Log | Restart with | Done when |
|---|---|---|---|---|

## Backlog
PO change 2026-10-31: "can't get into toon yet, for now, focus on running it locally here and perfecting it". Rounds below replace the approved round order; the milestone in the brief is unchanged and can't be met until device access returns.

### Round 1, wave 2 (after wave 1 merges)
- [ ] **Scene, view, live run (frontend-engineer).** Full desert scene, all readouts, palette through the day and night, burn-in shift, tap handling. `scripts/run-local.sh` opens a live 1024x600 window, with options for a chosen time and a fast-forward. Done when: screenshots at dawn, noon, sunset and night are checked, and the PO approves the look.

### Round 2: perfecting
- [ ] Polish from PO feedback on the live window.
- [ ] README: how to run locally. PO compares a few dates with their mosque.

### On hold until the PO can reach the Toon
- [ ] Round 0 probe (command in the proposal); pin Qt version and resolution from it
- [ ] Tile, dim hook and `qb.*` adapters; device scripts and `docs/INSTALL.md`
- [ ] Soft chime (depends on audio); GUI-failure and rollback rehearsal; one-week soak

## In progress
| Task | Role | Branch | Worktree | Status |
|---|---|---|---|---|

## In review

## Done
- Kickoff: all phases; proposal approved by the PO 2026-10-31
