# PR 0008: run-local finds the WSLg X socket

Branch: `devops-engineer/wslg-display` · Author: devops-engineer · Status: merged

## Summary
The PO's first live run failed: `DISPLAY=:0`, with `/tmp/.X11-unix` empty and the real socket in `/wslg/.X11-unix`. `run-local.sh` now points DISPLAY at the WSLg socket in that case. With no socket file anywhere it warns and lets Qt try.

## Checks
- `scripts/check-file-length.sh`: pass
- `REQUIRE_QT=1 scripts/test.sh`: all 12 test files passed, in the trial merge and on `main`
- check-pii, check-ash-rules and check-qml: pass
- Live, on `main`: `DISPLAY=:0 timeout 6 scripts/run-local.sh ...` stayed up until the timeout (rc 124) and WSLg logged appId `harness.py`. Not seen on screen.
- handoff updated: 58f9b4a

## Reviews
### code-reviewer: CHANGES REQUESTED (resolved)
Blocking: the no-socket `exit 1` refused working X servers that listen only on an abstract socket. Changed to a warning.
Non-blocking, accepted: the test-only directory variables, and the redirect dropping the screen number, which is harmless on WSLg.

### security-reviewer: not required

## Resolution
One fix round. The fix commit wasn't re-reviewed by an agent; the tech lead read its diff. Why `/tmp/.X11-unix` is empty here is unknown. Merge commit 0670245.
