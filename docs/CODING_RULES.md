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
| Formatter | prettier for JS and JSON (already in `.claude/hooks/format.sh`); QML by review until a matching `qmlformat` is available. Pinned in round 1 |
| Linter | ESLint on `app/ash/core/` with `ecmaVersion: 5`, so newer syntax fails; `qmllint` from the pinned Qt (`scripts/check-qml.sh`); shellcheck on `device/` and `scripts/` |
| Type checker | None available for ES5 QML JS: the validated config boundary and golden tests take this role |
| Test runner | `node --test tests/core/`, wrapped by `tests/test_core.sh` for `scripts/test.sh` and CI |
| Logger | `console.warn` and `console.error` in QML only: app version and errors, never config values |

## Ash rules (ADR 0001, ADR 0003)
- **Core:** ES5 only, no clock, no QML, no I/O: `sceneAt(nowMs, offsetAt, config)`, where `offsetAt(ms)` returns the UTC offset in minutes at that moment, so a DST change between now and a later prayer is handled. Loops are bounded. Results are defined values, never NaN. Invalid config shows a visible error, never a wrong time.
- **View:** QtQuick primitives only, one minute timer stopped when hidden, no animations.
- **Network:** no network APIs in Ash, enforced by a static test and a run under `unshare -n` or `strace`. Failing these blocks the merge.
- **Privacy:** the real config is never committed; `config/ash.example.json` uses a public landmark; a check rejects other precise coordinates in `app/`, `docs/` and `tests/`. Screenshots use the example config.
- **Device scripts:** POSIX `sh` with `set -eu`, quoted variables and fixed absolute paths, refusing empty variables. Back up before changing anything, stage then swap atomically, support `--dry-run`, and be idempotent. Write only to Ash's paths. Never store credentials, and leave SSH, the firewall and services alone. Tested only against a fake root.
- **Third-party code:** nothing vendored ships to the device without a pinned hash, licence and source recorded, and a PO-approved ADR for any distribution route such as ToonStore.

## Git
- Branch per task: `<role>/<slug>` (e.g. `backend-engineer/user-signup`), in its own worktree.
- Conventional commits: `type(scope): imperative summary` (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`).
- Small commits that each pass checks. Only the tech lead merges into `main`, and only after PR review.
- Never force-push or rewrite shared history.
