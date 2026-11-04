# PR 0011: Hijri date rolls over at Maghrib

Branch: `backend-engineer/hijri-maghrib` · Author: backend-engineer · Status: merged

## Summary
PO decision 2026-11-04: the Hijri date changes at Maghrib, not midnight. `scene.js` adds one civil day to the Hijri lookup from today's Maghrib until midnight; offsets +1/-1 apply on top. A missing Maghrib keeps midnight rollover (defensive: polar days already fail the scene).

## Checks
- `node --test tests/core/*.test.js`: 100 pass (builder and reviewer, fresh clone)
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed (builder's worktree)
- check-file-length, check-ash-rules: pass
- Tests failed before the fix (builder report)
- handoff updated: 2cc792c

## Reviews
### code-reviewer: APPROVE (high)
No blocking findings. Non-blocking: blank Hijri line after Maghrib on the table's last day (fallback requested from the builder); prayer looked up by index in the test (fix requested); record the PO decision in product docs (done in PRODUCT.md).

### security-reviewer: not required

## Resolution
Follow-up c484952 (table last-day fallback, test by name) read by the tech lead. Trial merge with baked-art and sadu-redesign: all 12 test files and every check passed. Merge commit fb2fee8.
