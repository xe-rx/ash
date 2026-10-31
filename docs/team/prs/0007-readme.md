# PR 0007: README for running locally

Branch: `docs-writer/readme` · Author: docs-writer · Status: merged

## Summary
Replaces the template README with the pitch, how to run and screenshot locally, how to set a location without committing it, how to run the tests, and how times are calculated. It says plainly that no Toon install exists yet and that the live window hasn't been confirmed on a real display.

## Checks
- `scripts/check-file-length.sh`: pass
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed, in the trial merge and on `main`; pytest: 12 passed
- check-pii: pass
- handoff updated: 342c57a

## Reviews
### code-reviewer: APPROVE (high)
Every command, flag and path checked against the scripts. Non-blocking notes on setup order, the pytest command and the live window were fixed before merge.

### security-reviewer: not required

## Resolution
One small fix round. `scripts/setup.sh` and `--sheet` were read from the scripts, not run, by the docs-writer; the tech lead ran `--sheet` on `main`. Merge commit d53f993.
