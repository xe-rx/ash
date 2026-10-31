---
name: team-protocol
description: Working protocol for builder agents on this team covering their git worktree, commits, checkpoints, and mandatory handoffs. Preloaded by builder roles; use whenever acting as a builder on a team task.
user-invocable: false
---

# Team protocol (builders)

You are one role on a team run by the tech lead (the main session). Your assignment gives you: **role, task with acceptance criteria, worktree path, branch**.

## Your git environment
- Work only inside your worktree. Use absolute paths and `git -C <worktree>`; never touch the main checkout, other worktrees, or `main`.
- Your branch `<role>/<slug>` already exists and is checked out there. Don't switch, rebase, push, or merge: the tech lead merges after PR review.

## Start
1. Read your handoff `<worktree>/docs/team/handoffs/<role>.md` if it exists and continue from it; don't redo finished work.
2. Read `AGENTS.md`, `CLAUDE.md` and `docs/CODING_RULES.md` in the worktree.
3. If the task is ambiguous or contradicts an ADR, stop and reply with your questions instead of guessing.

## While working
- Small conventional commits, each passing checks. **Every code file ≤ 300 lines**: plan splits before you reach ~250; the pre-commit hook rejects oversize files.
- Test-first for behavior changes. Run the real checks and quote real output; never claim success without it.
- **Checkpoint the handoff**: after each completed step, and at least every ~10 tool calls, rewrite your handoff file and commit it (`chore(handoff): <role> checkpoint`). You can be stopped at any moment by a turn, context, or usage limit; anything not in the handoff is lost to the next instance.
- You have a hard turn budget (`maxTurns`). Once you estimate ~80% is used, start no new work: finish the current step and write the final handoff.

## Finish
1. Run `scripts/check-file-length.sh` and the project's checks in the worktree; all green, or say exactly what fails.
2. Write and commit the final handoff. Leave the worktree clean (`git status` empty).
3. Reply with a short summary, the commit list (`git -C <worktree> log --oneline main..HEAD`), and a `## Handoff` section repeating the handoff content.

## Handoff file: `docs/team/handoffs/<role>.md` (overwrite each time, ≤ 60 lines)

Write the `Updated:` value with `date '+%Y-%m-%d %H:%M'`. Date only is a protocol violation; reviewers block on it.

```markdown
# Handoff: <role>
Updated: <YYYY-MM-DD HH:MM> · Branch: <branch> · Status: done | in-progress | blocked

## Task
<one or two lines + acceptance criteria>

## Done
- <what exists now, with commit hashes>

## Next steps
1. <ordered, concrete, startable without re-reading the conversation>

## Open questions / blockers
## Gotchas learned
## Suggested skills
```

Reference specs, ADRs, and commits by path or hash instead of copying them. Never put secrets in a handoff.
