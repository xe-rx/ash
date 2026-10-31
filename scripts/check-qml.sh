#!/usr/bin/env bash
# Parse-checks QML on Qt 5.11 via dev/qml_check.py (venv from scripts/setup-qt.sh).
# Usage: scripts/check-qml.sh [file-or-dir...]   (no args: every tracked .qml file)
# Exit 0 with a message when there is no QML yet; non-zero if the toolchain is absent.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd -P)
cd "$root"

if (($#)); then targets=("$@"); else mapfile -t targets < <(git ls-files '*.qml'); fi
if ((${#targets[@]} == 0)); then echo "check-qml: no .qml files yet, nothing to check"; exit 0; fi

venv=$("$root/scripts/setup-qt.sh" --check 2>/dev/null) || {
  echo "check-qml: Qt 5.11 toolchain missing; run scripts/setup-qt.sh first" >&2; exit 1; }
export QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software
exec "$venv/bin/python" -I "$root/dev/qml_check.py" "${targets[@]}"
