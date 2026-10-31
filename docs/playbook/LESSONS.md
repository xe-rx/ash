# Lessons for agent-built software

General lessons for any project built by a team of coding agents. Each gives the failure mode, why it happens, and the guard this template puts in place. The one-line versions live in `AGENTS.md` under *Lessons learned*; add new ones there whenever an agent gets something wrong.

## Safety and privacy

**1. Personal data leaks through "politeness".** Agents like to identify themselves to external APIs, and will put the owner's email in a User-Agent or header unless told not to. Once the request is sent, it can't be taken back.
Guard: `scripts/check-pii.sh` (pre-commit and CI) rejects email addresses in committed files; tools identify as `<project>-<tool>/<version>`. If a leak happens, tell the owner at once and say exactly what was sent, and to whom. Rewriting git history needs the owner's approval.

**2. "Read-only" agents can still write.** A reviewer demonstrating a risk can redirect git (`GIT_DIR`, `--git-dir`, `--work-tree`) at the real repository and corrupt it.
Guard: `.claude/hooks/guard-bash.sh` blocks repository redirection and destructive commands; reviewers reproduce only in a `git clone` under `mktemp -d`; after each review the tech lead checks `git config core.bare`, `core.hooksPath` and the worktree list.

**3. Ignored files die with their worktree.** Data, downloads or build outputs kept in a gitignored folder of a worktree are deleted when the worktree is removed.
Guard: `worktree.sh merge/remove` refuses when a worktree holds untracked or ignored data (regenerable caches excepted), unless `--discard-data` is passed. Large data lives in `$PROJECT_DATA`, outside the repo.

**4. Outward-facing actions need a human.** Pushing, publishing, creating remotes, spending money and contacting people are hard to undo.
Guard: agents draft (`docs/team/outbox/`), and the PO sends or approves.

## Verification

**5. Green checks are not a working product.** Typecheck, unit tests and a clean build all pass while the real app is broken: blank screens, wrong config in production mode, assets missing from the bundle.
Guard: run the production build the way users will, and check it end to end. For UI, use a real browser with screenshots. "Done" needs evidence.

**6. Tests only cover the cases you imagined.** Bugs live at boundaries the fixtures never reach: edges of the data, empty and partial states, transitions between modes, the first and last item.
Guard: test and screenshot the boundaries as well as the happy middle. When the PO finds a bug, add a regression test that fails first, and ask what assumption let it through.

**7. Branches that pass alone can fail together.** Two branches can each be green and still conflict in behaviour once merged.
Guard: trial-merge all pending branches into a throwaway worktree and run every check there before merging any.

**8. Secondary sources overstate.** Project pages, papers, blog posts and agents' summaries claim more coverage, permissions or features than the primary source supports.
Guard: verify in the primary source (README, LICENSE, terms, official docs, the code); mark everything else UNVERIFIED.

**9. A reviewer always finds something.** Asked to find problems, a reviewer reports some even when the work is sound, and chasing every finding over-engineers the code.
Guard: reviewers separate BLOCKING (correctness, requirements, security) from NITS; only BLOCKING findings stop a merge.

## Long-running work

**10. Background jobs die silently.** A job started as a child of the session dies when the session ends or the host sleeps, and nobody notices until someone asks for the result.
Guard: long jobs are detached, resumable and idempotent, with a PID file and a log outside the repo. Check the PID before reporting a job as running. See `OPERATIONS.md`.

**11. Third-party services rate-limit bursts.** A tool that fires many requests in a loop gets HTTP 429, and without back-off every restart fails the same way.
Guard: pace requests and retry 429/5xx with capped back-off, honouring `Retry-After`. Retry network errors on long runs.

**12. Pattern-based kills hit the wrong process.** `pkill -f` or a `pgrep -f` loop matches the shell running it, because the pattern is in its own command line.
Guard: stop processes by PID only.

## Team process

**13. Context is the scarce resource.** Long sessions forget earlier instructions, and agents restart from zero after a limit or a compaction.
Guard: the board plus a per-role handoff, checkpointed every few steps with a timestamp (`date '+%Y-%m-%d %H:%M'`). The `SubagentStop` hook sends a builder back once if it ends without a `## Handoff`. The tech lead writes its own handoff before running low.

**14. Monitors must know when to stop.** A budget monitor that alerts on finished agents wakes them for nothing.
Guard: `usage-watch.py` reports quiet agents as `idle` and never alerts on them.

**15. Estimates from first principles are often far off.** Sizes, costs and counts guessed on paper can be wrong by several times.
Guard: measure a small real sample before a decision depends on a number.

**16. Jargon confuses the PO.** Terms like "budget ceiling" or "tier C" can mean something different to the PO.
Guard: state costs in money and hardware, and give a concrete example with every number. Say what a label means the first time.

**17. Big files and big PRs hide bugs.** Agents grow files without limit, and reviewers skim large diffs.
Guard: 300-line limit per code file (hook, pre-commit, CI); one task per branch; at most 3 builders at once.

## What worked and is kept
- **Grilling the PO:** one question at a time, with a recommended answer each time, gives fast, clear decisions.
- **Measuring over debating:** a quick experiment settles most arguments.
- **Small, reviewed PRs:** a written record and a fresh-context reviewer catch real bugs while the fix is still small.
- **Durable state:** keeping state in git (board, handoffs, PR records) lets the run survive session ends and compactions.
- **Early demos:** showing the PO a running build surfaces what matters most, sooner than any document.
