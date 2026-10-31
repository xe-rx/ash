# Coding rules

Rules every role follows. Reviewers check them; the hard limits are enforced by tooling.

## Size (hard limits, enforced)
- **Every code file ≤ 300 lines.** Enforced on every edit (`.claude/hooks/check-file-length.sh`), on every commit (`.githooks/pre-commit`), and by reviewers. Tests count too.
- Split by responsibility, never mechanically: no `utils2.py`, `part1/part2`. If a file nears 250 lines, plan the split before adding more.
- Exempt only: generated files, lockfiles, vendored `.claude/skills/` and `.claude/references/`. The list lives in `scripts/check-file-length.sh`; changing it needs tech lead approval and an ADR.

## Size (soft limits, reviewed)
- Functions ≤ 40 lines, ≤ 4 parameters, nesting ≤ 3 levels. Exceeding one needs a reason in the PR record.

## Structure
- One module, one responsibility. Organize by feature, not by technical layer.
- Pure logic in the core, I/O (network, disk, DB, clock) at the edges so the core is testable without mocks.
- No circular imports. No shared mutable globals.

## Naming and readability
- Names say what something is or does; no abbreviations except universally known ones (`id`, `url`).
- Comments explain *why*, never *what*. No commented-out code. `TODO` needs an owner and a ticket.

## Errors
- Never swallow errors: no empty `catch`/`except`, no bare `except:`.
- Validate input at trust boundaries; fail fast and loudly with actionable messages.
- Log with the project logger, structured; never `print`/`console.log` for diagnostics in committed code.

## Types
- Use the strictest practical type checking. No `any`/untyped escape hatches without a comment saying why.

## Tests
- Behavior changes ship with tests; bugs ship with a regression test that failed first.
- Test behavior through public interfaces, not implementation details. Tests mirror the source layout.

## Dependencies
- Each new dependency is justified in the PR record (why, alternatives) and checked with the `supply-chain-risk-auditor` skill.
- Pin versions; commit the lockfile.

## Security
- Secrets only from environment variables; never in code, logs, or fixtures.
- Parameterized queries only; never build SQL/shell commands from input by string concatenation.

## External services and long jobs
- Identify as `<project>-<tool>/<version>`; never send personal data in requests or headers.
- Pace requests to third parties; retry 429/5xx with capped back-off honouring `Retry-After`; fail fast on other 4xx.
- Jobs that run longer than a few minutes are idempotent and resumable (skip finished steps, write to a temp name then move, `flock`), and log to `$PROJECT_DATA`, not the repo.

## Stack (filled in at kickoff)
| Concern | Tool and command |
|---|---|
| Formatter | <e.g. prettier / ruff format>, wired into `.claude/hooks/format.sh` |
| Linter | <...> |
| Type checker | <strictest practical mode> |
| Test runner | <...>, wired into `scripts/test.sh` and CI |
| Logger | <the one project logger> |

## Git
- Branch per task: `<role>/<slug>` (e.g. `backend-engineer/user-signup`), in its own worktree.
- Conventional commits: `type(scope): imperative summary` (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`).
- Small commits that each pass checks. Only the tech lead merges into `main`, and only after PR review.
- Never force-push or rewrite shared history.
