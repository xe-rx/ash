# PR 0006: toolchain follow-ups from PR 0001

Branch: `devops-engineer/toolchain-followups` · Author: devops-engineer · Status: merged

## Summary
The ash-rules check now flags dynamic-code APIs, `t_offline` fails under `REQUIRE_QT=1` when namespaces are missing, `check-qml.sh` resolves relative paths before its `cd`, and the coordinate check states its limits.

## Checks
- `scripts/check-file-length.sh`: pass
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed, in a trial merge with PRs 0005 and 0007 and again on `main`
- check-pii: pass
- handoff updated: 1a8c7b7, then edbc1a1

## Reviews
### code-reviewer: CHANGES REQUESTED (resolved)
Blocking: a `wip` commit subject (reworded), and `h_nongit` still passed with the hook's guard removed.
Non-blocking, accepted: `window.Function(...)` and similar forms pass, because the check is a tripwire and its header says so. `createComponent` also flags local QML, now documented. `REQUIRE_QT` doubles as the strict switch for a non-Qt test.

### security-reviewer: not required

## Resolution
`h_nongit` can't detect removal of `|| exit 0` alone, because the hook's later `-x` check also exits 0 for a file outside git. Tech lead accepted this: the test now guards a root fallback to the file's directory, shown failing by a temporary break, and its comment states the limit. The t_offline failure path was tested only with a fake `unshare`. Merge commit 89b19ac.
