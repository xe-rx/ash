#!/usr/bin/env bash
# Tests for scripts/check-qml.sh and dev/qml_check.py against scratch QML in temp dirs.
# Needs the Qt 5.11 toolchain (scripts/setup-qt.sh). Without it the Qt-dependent tests are
# skipped locally, but fail when REQUIRE_QT=1 (CI sets it), so CI can never skip silently.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

CHECK="$REPO_ROOT/scripts/check-qml.sh"
have_qt() { "$REPO_ROOT/scripts/setup-qt.sh" --check >/dev/null 2>&1; }
need_qt() {
  have_qt && return 0
  if [[ ${REQUIRE_QT:-} == 1 ]]; then _fail "Qt 5.11 toolchain missing but REQUIRE_QT=1"; else echo "    skip: no Qt toolchain"; fi
  return 1
}
# w NAME CONTENT: write a QML/JS file into $D
w() { printf '%s\n' "$2" > "$D/$1"; }

t_good() { need_qt || return 0; mk_tmp_var D
  w lib.js 'function w() { return 3 }'
  w good.qml $'import QtQuick 2.11\nimport "lib.js" as L\nItem { width: L.w(); Rectangle { color: "red" } }'
  run "$CHECK" "$D/good.qml"; assert_rc 0; assert_contains "$OUT" "0 with errors"; }
t_syntax() { need_qt || return 0; mk_tmp_var D
  w broken.qml $'import QtQuick 2.11\nItem {\n  Rectangle {\n}'
  run "$CHECK" "$D/broken.qml"; assert_rc 1; assert_contains "$OUT" "broken.qml:5:"; }
t_prop() { need_qt || return 0; mk_tmp_var D
  w p.qml $'import QtQuick 2.11\nItem { Rectangle { nosuchprop: 1 } }'
  run "$CHECK" "$D/p.qml"; assert_rc 1; assert_contains "$OUT" "p.qml:2:"; assert_contains "$OUT" "nosuchprop"; }
t_newer_qtquick() { need_qt || return 0; mk_tmp_var D
  w v.qml $'import QtQuick 2.15\nItem {}'
  run "$CHECK" "$D/v.qml"; assert_rc 1; assert_contains "$OUT" "2.15"; }
t_bad_import() { need_qt || return 0; mk_tmp_var D
  w i.qml $'import QtQuick 2.11\nimport QtQuick.Controls 2.4\nItem {}'
  run "$CHECK" "$D/i.qml"; assert_rc 1; assert_contains "$OUT" "i.qml:2:"; assert_contains "$OUT" "import not allowed: QtQuick.Controls"; }
t_commented_import_ok() { need_qt || return 0; mk_tmp_var D
  w c.qml $'import QtQuick 2.11\n// import QtQuick.Controls 2.4\n/* import Foo 1.0 */\nItem {}'
  run "$CHECK" "$D/c.qml"; assert_rc 0; }
t_missing_js() { need_qt || return 0; mk_tmp_var D
  w j.qml $'import QtQuick 2.11\nimport "nope.js" as N\nItem {}'
  run "$CHECK" "$D/j.qml"; assert_rc 1; assert_contains "$OUT" "j.qml:2:"; assert_contains "$OUT" "nope.js"; }
t_missing_qml_ref() { need_qt || return 0; mk_tmp_var D
  w m.qml $'import QtQuick 2.11\nItem { Loader { source: "Gone.qml" } }'
  run "$CHECK" "$D/m.qml"; assert_rc 1; assert_contains "$OUT" "m.qml:2:"; assert_contains "$OUT" "Gone.qml"; }
t_dir_arg_all_reported() { need_qt || return 0; mk_tmp_var D; mkdir "$D/sub"
  w ok.qml $'import QtQuick 2.11\nItem {}'
  printf 'import QtQuick 2.11\nItem { x: }\n' > "$D/sub/bad.qml"
  run "$CHECK" "$D"; assert_rc 1; assert_contains "$OUT" "sub/bad.qml"; assert_contains "$OUT" "2 file(s), 1 with errors"; }
t_relative_arg() { need_qt || return 0; mk_tmp_var D; mkdir "$D/sub"
  printf 'import QtQuick 2.11\nItem { x: }\n' > "$D/sub/bad.qml"
  run bash -c 'cd "$0" && "$1" sub/bad.qml' "$D" "$CHECK"; assert_rc 1; assert_contains "$OUT" "bad.qml:2:"
  run bash -c 'cd "$0/sub" && "$1" ../sub' "$D" "$CHECK"; assert_rc 1; assert_contains "$OUT" "1 with errors"; }
t_no_qml() { mk_tmp_var D; git -C "$D" init -q; require_isolated "$D"; mkdir "$D/scripts" "$D/dev"
  cp "$CHECK" "$REPO_ROOT/scripts/setup-qt.sh" "$D/scripts/"
  run "$D/scripts/check-qml.sh"; assert_rc 0; assert_contains "$OUT" "no .qml files yet"; }
t_no_toolchain() { mk_tmp_var D; w g.qml $'import QtQuick 2.11\nItem {}'
  PROJECT_DATA="$D/none" run "$CHECK" "$D/g.qml"; assert_rc 1; assert_contains "$ERR" "toolchain missing"; }

t "check-qml: valid file passes" t_good
t "check-qml: relative path args resolve against the caller cwd" t_relative_arg
t "check-qml: syntax error reported with file and line" t_syntax
t "check-qml: unknown property reported with line" t_prop
t "check-qml: QtQuick newer than 2.11 rejected" t_newer_qtquick
t "check-qml: import other than QtQuick fails" t_bad_import
t "check-qml: commented-out imports ignored" t_commented_import_ok
t "check-qml: unresolved relative .js import fails" t_missing_js
t "check-qml: unresolved relative .qml path fails" t_missing_qml_ref
t "check-qml: directory arg scans recursively, reports all" t_dir_arg_all_reported
t "check-qml: no QML files exits 0 with message" t_no_qml
t "check-qml: absent toolchain fails clearly" t_no_toolchain
summary
