#!/usr/bin/env bash
# View tests: render AshView offscreen on the pinned Qt 5.11 (software backend), then check the log
# for QML warnings or errors, that the picture is not blank, the error screen on a bad config, and
# that rendering works with no network at all (scripts/run-offline.sh).
# Without the toolchain: skipped locally, failed when REQUIRE_QT=1.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

SHOT="$REPO_ROOT/scripts/screenshot.sh"
VENV=$("$REPO_ROOT/scripts/setup-qt.sh" --check 2>/dev/null) || VENV=
need_qt() {
  [[ -n $VENV ]] && return 0
  if [[ ${REQUIRE_QT:-} == 1 ]]; then _fail "Qt 5.11 toolchain missing but REQUIRE_QT=1"; else echo "    skip: no Qt toolchain"; fi
  return 1
}
stats() { QT_QPA_PLATFORM=offscreen "$VENV/bin/python" -I "$REPO_ROOT/dev/image_stats.py" "$1"; }
clean() { rm -f "$REPO_ROOT"/app/ash/core/*.jsc "$REPO_ROOT"/app/ash/*.qmlc "$REPO_ROOT"/app/ash/view/*.qmlc "$REPO_ROOT"/dev/*.qmlc; }
BAD_PATTERN='QML|qml:|Warning|warning|TypeError|ReferenceError|Error|is not a type|not installed|Cannot'

t_render() { need_qt || return 0; mk_tmp_var D
  run "$SHOT" --at "2026-06-21 14:30" --out "$D"; clean
  assert_rc 0 "screenshot exit"
  assert_not_contains "$ERR" "TypeError"; 
  if grep -Eq "$BAD_PATTERN" <<<"$ERR"; then _fail "QML warnings in log: $ERR"; fi
  local s; s=$(stats "$D/ash-2026-06-21-14-30.png")
  assert_contains "$s" "1024x600" "image size"
  local n; n=$(awk '{print $2}' <<<"$s"); ((n > 30)) || _fail "image looks blank: $s"
}
t_night() { need_qt || return 0; mk_tmp_var D
  run "$SHOT" --at "2026-12-21 02:00" --out "$D"; clean
  assert_rc 0 "screenshot exit"
  if grep -Eq "$BAD_PATTERN" <<<"$ERR"; then _fail "QML warnings in log: $ERR"; fi
  local s; s=$(stats "$D/ash-2026-12-21-02-00.png"); local n; n=$(awk '{print $2}' <<<"$s")
  ((n > 30)) || _fail "night image looks blank: $s"
}
t_error_screen() { need_qt || return 0; mk_tmp_var D
  printf '{"lat": 999, "lon": 5.12}' > "$D/bad.json"
  run "$SHOT" --at "2026-06-21 14:30" --out "$D" --config "$D/bad.json"; clean
  assert_rc 0 "screenshot exit"
  if grep -Eq "$BAD_PATTERN" <<<"$ERR"; then _fail "QML warnings in log: $ERR"; fi
  local s; s=$(stats "$D/ash-2026-06-21-14-30.png")
  assert_contains "$s" "#120d16" "error screen background"
}
t_sheet() { need_qt || return 0; mk_tmp_var D
  run "$SHOT" --sheet --out "$D"; clean
  assert_rc 0 "sheet exit"
  assert_file "$D/sheet.png"; assert_file "$D/june-4-dhuhr.png"; assert_file "$D/dec-8-midnight.png"
  if grep -Eq "$BAD_PATTERN" <<<"$ERR"; then _fail "QML warnings in log: $ERR"; fi
}
t_offline() { need_qt || return 0; mk_tmp_var D
  run "$REPO_ROOT/scripts/run-offline.sh" "$SHOT" --at "2026-06-21 14:30" --out "$D"; clean
  if [[ $RC == 125 ]]; then
    if [[ ${REQUIRE_QT:-} == 1 ]]; then _fail "no network namespaces but REQUIRE_QT=1"; else echo "    skip: no user namespaces"; fi
    return 0
  fi
  assert_rc 0 "offline render"
  assert_file "$D/ash-2026-06-21-14-30.png"
}

t "renders at midday with a clean log and a real picture" t_render
t "renders at night with a clean log" t_night
t "a bad config shows the error screen, not a time" t_error_screen
t "the 8+8 contact sheet renders" t_sheet
t "renders with no network (unshare -rn)" t_offline
summary
