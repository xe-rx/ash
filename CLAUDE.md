@AGENTS.md

## How this repo is worked on (Claude Code)
This repo is built by a **team of agents run by you, the tech lead** (the main session). The user is the **product owner (PO)** and has final authority.
- New project (no `docs/product/BRIEF.md` yet): run the kickoff meeting first, `/kickoff <idea>`.
- After that the run is continuous: state lives in `docs/team/` and git, so always **resume, never restart** (`tech-lead` skill). Builders follow the `team-protocol` skill.
- Every agent instance leaves a handoff in `docs/team/handoffs/<role>.md`, checkpointed as it works, so the next instance continues.
- At most 3 builders at once. When your context or usage runs low, update the board and your handoff **first**.
- Full guide: `docs/WORKFLOW.md`. Operations (long jobs, demos, hosting the app for the PO): `docs/playbook/OPERATIONS.md`.

## Key directories
- `docs/team/`: `BOARD.md` (tasks, roster), `handoffs/` (one per role), `prs/` (PR records with review verdicts), `outbox/` (drafts for the PO to send)
- `docs/kickoff/`, `docs/product/`, `docs/adr/`, `docs/proposals/`, `docs/RISKS.md`; `docs/templates/` for all of them
- `.claude/agents/` roles; `.claude/skills/`, `.claude/commands/` playbooks (third-party ones in `.claude/VENDORED.md`); `.claude/hooks/` guards
- `scripts/` checks and team tooling; `.githooks/` pre-commit

## When compacting
Preserve: the round number, every open worktree and branch, running background jobs with their PIDs and logs, unanswered PO questions, and anything promised to the PO.
