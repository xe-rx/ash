# Handoff: devops-engineer
Updated: 2026-10-31 15:21 · Branch: devops-engineer/toolchain-followups · Status: done

## Task
Toolchain follow-ups 1-5 from PR 0001 review (dyn-code patterns, t_offline under REQUIRE_QT, check-qml relative args, coord-check limits, h_nongit).

## Done
- All five items, each with a regression test proven red-green. app/ash/ uses none of the new patterns.

## Next steps
1. Tech lead review and merge.

## Open questions / blockers
None. Sandbox has user namespaces, so the no-namespace path was verified with a fake unshare on PATH.

## Gotchas learned
- In tests, mk_tmp_var uses a local named d: do not name your own local d.
- Old h_nongit passed even with the git guard removed (no script at /).
- Review fix: h_nongit cannot detect removal of the hook's `|| exit 0` (the later -x check on /scripts/... also exits 0); comment now says so, test catches the dirname-fallback mutation. createComponent strictness documented in check-ash-rules.sh header.
