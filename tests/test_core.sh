#!/usr/bin/env bash
# Core tests: node:test suites in tests/core, plus a parity check in real Qt 5.11 (QML engine).
# The Qt check is skipped (neither passed nor failed) when the toolchain is absent.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$REPO_ROOT" || exit 1

QT_PY=${ASH_QT_PYTHON:-$HOME/ash-data/toolchain/qt511/bin/python}

echo "== node --test tests/core"
if ! command -v node >/dev/null || [[ ! -d node_modules/adhan ]]; then
  echo "  node or node_modules/adhan missing: run npm ci" >&2
  FAILED=$((FAILED + 1))
else
  out=$(node --test tests/core/*.test.js 2>&1); rc=$?
  n_pass=$(grep -E '^ℹ pass [0-9]+$' <<<"$out" | awk '{print $3}')
  n_fail=$(grep -E '^ℹ fail [0-9]+$' <<<"$out" | awk '{print $3}')
  grep -E 'diagnostic|max deviation' <<<"$out" | head -3
  if [[ -z "$n_pass" || -z "$n_fail" ]]; then
    echo "$out" | tail -20 >&2; FAILED=$((FAILED + 1))
  else
    PASSED=$((PASSED + n_pass)); FAILED=$((FAILED + n_fail))
    ((rc == 0)) || { ((n_fail > 0)) || FAILED=$((FAILED + 1)); echo "$out" | grep -A8 'failing tests' >&2; }
  fi
fi

qt_parity() {
  local json
  json=$(QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software "$QT_PY" tests/qt/qt_parity.py \
    "$(cat tests/qt/cases.json)" 2>&1) || { _fail "qt run failed: $json"; return; }
  run node tests/qt/compare.js <<<"$json"
  rm -f app/ash/core/*.jsc tests/qt/*.qmlc
  assert_rc 0 "qt/node parity ($ERR)"
  echo "    $OUT"
}
echo "== Qt 5.11 parity"
if [[ -x "$QT_PY" ]] && "$QT_PY" -c 'import PyQt5.QtQml' 2>/dev/null; then
  t "sceneAt gives the same result in Qt 5.11 QML and Node" qt_parity
else
  echo "  SKIPPED: Qt 5.11 toolchain not found at $QT_PY (counted as neither pass nor fail)"
fi
summary
