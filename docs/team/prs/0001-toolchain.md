# PR 0001: Qt 5.11 toolchain, QML check, privacy and offline checks

Branch: `devops-engineer/toolchain` · Author: devops-engineer · Status: merged

## Summary
Adds a repeatable Qt 5.11.2 development toolchain outside the repo, a QML compile check, `qml` in the file-length gate, privacy and offline checks (ADR 0003), and CI steps.

## Dependencies
PyQt5 5.11.3 and PyQt5-sip 4.19.19, development and CI only, never shipped to the device. Why: the only installable bundle found with the Qt version the community reports for the Toon; alternatives were Qt 5.15 from pacman, which differs from the target. Hashes verified against PyPI by the security reviewer. Known CVEs in this old Qt are accepted because it only handles our own QML. Python 3.8 from `uv python install` is end-of-life and its install isn't hash-pinned. The `supply-chain-risk-auditor` skill was not run on these two packages.

## Checks
- `scripts/check-file-length.sh`: pass (tech lead re-run)
- `scripts/test.sh`: `OK: all 9 test files passed` (tech lead re-run)
- CI workflow: never executed, because nothing is pushed; YAML parsed locally only
- handoff updated: 8c2f6b3

## Reviews
### code-reviewer: APPROVE (high)
No blocking findings. Non-blocking follow-ups are on the board.

### security-reviewer: APPROVE
No blocking findings. Hashes and the action SHA pin verified. The coordinate and network checks are tripwires, not guarantees.

## Resolution
Merged without a fix loop. The trial merge with `frontend-engineer/core` is deferred, since that branch isn't finished; it happens at its own merge.
