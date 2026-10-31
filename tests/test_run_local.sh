#!/usr/bin/env bash
# scripts/run-local.sh and scripts/screenshot.sh guards that need no Qt window.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

RUN="$REPO_ROOT/scripts/run-local.sh"
SHOT="$REPO_ROOT/scripts/screenshot.sh"

t_wayland_only_xcb() {
  run env -u DISPLAY -u QT_QPA_PLATFORM WAYLAND_DISPLAY=wayland-0 "$RUN"
  assert_rc 1 "exit"
  assert_contains "$ERR" "no display" "friendly message"
  assert_contains "$ERR" "DISPLAY" "names the variable the xcb platform needs"
}
t_x_only_wayland() {
  run env -u WAYLAND_DISPLAY QT_QPA_PLATFORM=wayland DISPLAY=:0 "$RUN"
  assert_rc 1 "exit"; assert_contains "$ERR" "WAYLAND_DISPLAY"
}
t_none() {
  run env -u DISPLAY -u WAYLAND_DISPLAY -u QT_QPA_PLATFORM "$RUN"
  assert_rc 1 "exit"; assert_contains "$ERR" "no display"
}
t_out_guard() {
  local bad
  for bad in "$REPO_ROOT" "$REPO_ROOT/" "$REPO_ROOT/shots" "$REPO_ROOT/shots/" "$REPO_ROOT/app/../shots" "$REPO_ROOT/./x/"; do
    run "$SHOT" --at "2026-06-21 14:30" --out "$bad"
    assert_rc 2 "refused $bad"
    assert_contains "$ERR" "outside the repo" "message for $bad"
  done
  assert_no_file "$REPO_ROOT/shots"; assert_no_file "$REPO_ROOT/x"
}

# A copy of run-local.sh in a fake repo whose "python" just prints the DISPLAY it was given.
# Layout under $1: repo/ (the copy), venv/, x/ (standard X socket dir), w/ (WSLg one); mksock makes a socket.
fake_repo() {
  mkdir -p "$1/repo/scripts" "$1/repo/dev" "$1/venv/bin" "$1/x" "$1/w"
  cp "$RUN" "$1/repo/scripts/run-local.sh"
  printf '#!/bin/sh\necho %s\n' "$1/venv" > "$1/repo/scripts/setup-qt.sh"
  printf '#!/bin/sh\necho "DISPLAY=$DISPLAY"\necho "ARGS=$*"\n' > "$1/venv/bin/python"
  chmod +x "$1/repo/scripts/setup-qt.sh" "$1/venv/bin/python"
}
mksock() { python3 -c 'import socket,sys; s=socket.socket(socket.AF_UNIX); s.bind(sys.argv[1])' "$1"; }
run_fake() { # $1 = fake dir, rest = env assignments
  local T=$1; shift
  run env -u WAYLAND_DISPLAY -u QT_QPA_PLATFORM ASH_X11_DIR="$T/x" ASH_WSLG_X11_DIR="$T/w" "$@" "$T/repo/scripts/run-local.sh"
}
t_wslg_redirect() {
  local T; mk_tmp_var T; fake_repo "$T"; mksock "$T/w/X0"
  run_fake "$T" DISPLAY=:0
  assert_rc 0 "exit"; assert_contains "$OUT" "DISPLAY=$T/w/X0" "display redirected"
  assert_eq "$ERR" "" "silent"
  run_fake "$T" DISPLAY=:0.0
  assert_contains "$OUT" "DISPLAY=$T/w/X0" ":N.M redirected"
}
t_normal_socket() {
  local T; mk_tmp_var T; fake_repo "$T"; mksock "$T/x/X0"; mksock "$T/w/X0"
  run_fake "$T" DISPLAY=:0
  assert_rc 0 "exit"; assert_contains "$OUT" "DISPLAY=:0" "kept"; assert_eq "$ERR" "" "silent"
}
t_local_no_socket() {
  local T; mk_tmp_var T; fake_repo "$T"
  run_fake "$T" DISPLAY=:0
  assert_rc 0 "rc is the stub python's"; assert_contains "$OUT" "DISPLAY=:0" "DISPLAY unchanged, python ran"
  assert_contains "$ERR" "warning: no X server socket found for DISPLAY=:0, trying anyway." "warning"
  assert_contains "$ERR" "Run this from a desktop terminal (on WSL2: use WSLg, or start an X server and export DISPLAY)." "hint"
  assert_contains "$ERR" "To render without a window use scripts/screenshot.sh instead." "screenshot hint"
}
t_remote_untouched() {
  local T x; mk_tmp_var T; fake_repo "$T"
  for x in host:0 localhost:10.0 /tmp/sock/X0; do
    run_fake "$T" DISPLAY="$x"
    assert_rc 0 "exit $x"; assert_contains "$OUT" "DISPLAY=$x" "kept $x"
  done
}

t_sky_flag() { # dev only: --sky bands|gradient reaches the harness; default is bands (no flag passed); anything else is refused
  local T v; mk_tmp_var T; fake_repo "$T"; mksock "$T/x/X0"
  for v in bands gradient; do
    run env -u WAYLAND_DISPLAY -u QT_QPA_PLATFORM ASH_X11_DIR="$T/x" ASH_WSLG_X11_DIR="$T/w" DISPLAY=:0 "$T/repo/scripts/run-local.sh" --sky "$v"
    assert_rc 0 "exit --sky $v"; assert_contains "$OUT" "--sky $v" "harness got --sky $v"
  done
  run_fake "$T" DISPLAY=:0
  assert_not_contains "$OUT" "--sky" "no flag by default, so the harness uses bands"
  for v in sepia "" Gradient; do
    run env -u WAYLAND_DISPLAY -u QT_QPA_PLATFORM ASH_X11_DIR="$T/x" ASH_WSLG_X11_DIR="$T/w" DISPLAY=:0 "$T/repo/scripts/run-local.sh" --sky "$v"
    assert_rc 2 "refused --sky '$v'"; assert_contains "$ERR" "--sky takes bands or gradient" "message for '$v'"
    assert_not_contains "$OUT" "ARGS" "the harness did not run for '$v'"
  done
  run env -u WAYLAND_DISPLAY -u QT_QPA_PLATFORM ASH_X11_DIR="$T/x" ASH_WSLG_X11_DIR="$T/w" DISPLAY=:0 "$T/repo/scripts/run-local.sh" --sky
  assert_rc 2 "--sky without a value"
}

t "xcb with only WAYLAND_DISPLAY set gives the friendly message" t_wayland_only_xcb
t "wayland platform with only DISPLAY set names WAYLAND_DISPLAY" t_x_only_wayland
t "no display variables at all gives the friendly message" t_none
t "screenshot --out refuses the repo root, trailing slashes and dot paths" t_out_guard
t "WSLg socket replaces :N when the normal socket is missing" t_wslg_redirect
t "a real normal socket keeps DISPLAY and prints nothing" t_normal_socket
t "local :N with no socket anywhere warns and still runs" t_local_no_socket
t "remote and path displays are left to Qt" t_remote_untouched
t "--sky bands|gradient is passed on, bands by default, anything else refused" t_sky_flag
summary
