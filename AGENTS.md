# Ash: instructions for coding agents

<one-sentence pitch, written at kickoff> The product brief is `docs/product/BRIEF.md`; decisions are in `docs/adr/`.

## Dev commands
```bash
scripts/setup.sh                # once per clone: git hooks path, tool checks
scripts/check-file-length.sh    # 300-line limit on tracked code files
scripts/check-pii.sh            # no email addresses in committed files
scripts/test.sh                 # shell test suites (hooks, team tooling)
uv run --with-requirements requirements-test.txt python -m pytest -q tests   # python tests, as CI runs them
scripts/team/worktree.sh list   # team git environments
# <stack commands: added at kickoff (format, lint, typecheck, test, build, run)>
```

## Rules
- **Code files ≤ 300 lines**, enforced by hook, pre-commit, CI and review. Split by responsibility. Full rules: `docs/CODING_RULES.md`.
- Test-first for behaviour changes; a bug gets a failing regression test before the fix. Root cause before fixes.
- No "done" without fresh evidence: the command you ran and its output, or a screenshot for UI.
- UI work is done only when the production build has been rendered in a real browser and the screenshots checked.
- Conventional commits; one branch and worktree per task (`<role>/<slug>`); only the tech lead merges to `main`, after review.
- Hard-to-reverse decisions get an ADR (`docs/templates/ADR.md`).

## Never do
- Don't put secrets in code, logs or fixtures: environment variables only; `.env` is gitignored.
- Don't put personal data (the owner's email, names) in code, User-Agents, headers or any request to an external service. Identify as `ash-<tool>/<version>`.
- Don't push, create a remote, publish, spend money or contact anyone without the PO's approval. Drafts go to `docs/team/outbox/`.
- Don't force-push, `git reset --hard`, bypass hooks (`--no-verify`), or touch another role's worktree.
- Don't keep large or generated data inside the repo or a worktree: it lives in `$PROJECT_DATA` (default `~/ash-data`).
- Don't add a dependency without a justification in the PR record and a supply-chain check.

## Lessons learned
<!-- One line per mistake, so it never repeats. Background: docs/playbook/LESSONS.md -->
- Reviewers never run anything that can write: no `GIT_DIR`/`GIT_WORK_TREE` overrides; reproduce risks only in a `git clone` under `mktemp -d`.
- Before merging, trial-merge all pending branches together in a throwaway worktree: per-branch checks miss cross-branch failures.
- Verify claims about data (coverage, licence) in the dataset's own README and LICENSE; mark anything unchecked UNVERIFIED.
- Long jobs run detached and resumable, with a PID file and a log outside the repo; stop processes by PID, never `pkill -f`.
- Requests to third-party services are paced and back off on HTTP 429 (honour Retry-After).
