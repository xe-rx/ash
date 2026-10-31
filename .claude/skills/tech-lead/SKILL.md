---
name: tech-lead
description: Runs the agent team as tech lead by planning a round from docs/team/BOARD.md, dispatching builder agents into git worktrees, running PR reviews, merging, and keeping handoffs current. Use when the user asks to run the team, start or continue a round, or resume team work.
---

# Tech lead loop

The team run is continuous: state lives in `docs/team/` and git, so every session (and every agent instance) resumes it instead of starting over.

## 0. Resume
- No `docs/product/BRIEF.md` yet → the project has not been kicked off: run the `kickoff` skill with the user first.
- Read `docs/team/BOARD.md`, `docs/team/handoffs/tech-lead.md`, and `scripts/team/worktree.sh list`.
- Unmerged team branches come first: resume the agent with SendMessage if it is still alive, else spawn a new instance on the **same** worktree; its handoff file tells it where to continue.

## 1. Plan the round
- Pick at most **3** independent tasks (no overlapping files). Each needs acceptance criteria.
- Unclear requirements → `/grill-me` with the user. Large or risky design → `architect` agent first. Decisions → ADR in `docs/adr/`.
- Add them to the board under *In progress* with role, branch, and worktree.

## 2. Create git environments
`scripts/team/worktree.sh new <role> <slug>`, one per task. Branch `<role>/<slug>`, worktree `.worktrees/<role>-<slug>`.

## 3. Dispatch builders (in parallel, background)
Prompt each with: role, task + acceptance criteria, worktree path, branch, and the reminder to follow the `team-protocol` skill.
- Session started in this repo: use `subagent_type: <role>`; the role's skills, turn budget, and handoff hook apply automatically.
- Otherwise: `general-purpose` with `model: sonnet`, told to act as `.claude/agents/<role>.md` and follow `.claude/skills/team-protocol/SKILL.md` (read both first).

## 3b. Watch budgets
For rounds with long builder tasks, start the `usage-monitor` agent in the background with the builder ids (`scripts/team/usage-watch.py`). On a WRAPUP line, tell that builder (SendMessage) to finish its step and write its final handoff. Stop the monitor when the round's builders are done; it must never wake a finished agent.

## 4. Collect
For each returned builder, verify on its branch: the handoff was updated (`git -C <wt> log -1 --format=%h -- docs/team/handoffs/<role>.md`), the worktree is clean, and `scripts/check-file-length.sh` passes. A partial result (turn limit) → resume it; never review half-finished work.

## 5. PR review (every branch, no exceptions)
0. Trial-merge all branches pending this round into a throwaway detached worktree (`git worktree add --detach <scratch> main`), run every check there, then remove it. This catches cross-branch failures.
1. Copy `docs/team/prs/TEMPLATE.md` to `docs/team/prs/NNNN-<slug>.md` and fill in the summary and check results.
2. Run `code-reviewer` on `git diff main...<branch>` (files readable at the worktree path).
3. Add `security-reviewer` when the diff touches auth, input handling, secrets, dependencies, or CI; `/review-pr` specialists for large diffs; `/diff-review` for high-risk changes.
4. Paste each verdict into the PR record. Reviewers are read-only: their verdict *is* their handoff. Let them run tests only in a fresh `git clone` under `mktemp -d`, never in a team worktree.
5. After every review, run `git config core.bare`, `git config core.hooksPath`, and `scripts/team/worktree.sh list`; anything unexpected → stop and repair before merging.

## 6. Fix loop
BLOCKING findings go back to the same builder (resume it), then re-review the changes. After 2 loops without convergence, escalate to the user.

## 7. Merge
Only with green checks and no open BLOCKING findings:
`scripts/team/worktree.sh merge <role> <slug> "Merge <branch>: <title> (PR NNNN)"`, then mark the PR record `merged`.

## 8. Close the round
Update `BOARD.md` and rewrite `docs/team/handoffs/tech-lead.md` (same format as builders: done, next steps, open questions). Commit on `main`: `chore(team): close round N`.

## Running jobs and demos
- Long jobs (builds, downloads, data runs) run detached and resumable: `setsid nohup <script> >> <log> 2>&1 < /dev/null &`, PID in a file, logs outside the repo. They die with the session or a sleeping host otherwise. See `docs/playbook/OPERATIONS.md`.
- Stop processes by PID only, never `pkill -f`/`pgrep -f` loops: the pattern matches your own shell.
- Showing the user the app: serve the production build (not the dev server), check it in a headless browser with screenshots, then give the link. Re-check after every fix you tell them about.

## Limits
- Never more than 3 builders at once. Builders cannot spawn agents (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`).
- When your own context or usage is running low, stop dispatching and update the board and your handoff **first**.
