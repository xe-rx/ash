# Handoff: devops-engineer
Updated: 2026-10-31 16:14 · Branch: devops-engineer/wslg-display · Status: done

## Task
run-local.sh on WSL2: DISPLAY=:0 had no socket in /tmp/.X11-unix; redirect to /wslg/.X11-unix/XN, friendly exit 1 if no socket.

## Done
- scripts/run-local.sh: DISPLAY rewrite and no-socket message (xcb, :N / :N.M only). Dirs overridable via ASH_X11_DIR, ASH_WSLG_X11_DIR.
- tests/test_run_local.sh: 4 new tests using a fake repo copy and real unix sockets; red without fix verified.

## Next steps
1. Tech lead review and merge.

## Open questions / blockers
None.

## Gotchas learned
- tests/lib.sh mk_tmp_var uses local d, so never pass a variable named d to it.
