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

t "xcb with only WAYLAND_DISPLAY set gives the friendly message" t_wayland_only_xcb
t "wayland platform with only DISPLAY set names WAYLAND_DISPLAY" t_x_only_wayland
t "no display variables at all gives the friendly message" t_none
t "screenshot --out refuses the repo root, trailing slashes and dot paths" t_out_guard
summary
