#!/usr/bin/env bash
# Creates the Qt 5.11 test toolchain (Python 3.8 + hash-pinned PyQt5 5.11.3) OUTSIDE the repo,
# in $PROJECT_DATA/toolchain/qt511 (PROJECT_DATA defaults to ~/ash-data). Idempotent.
# Prints the venv path on stdout (progress goes to stderr). Needs `uv`; first run needs network.
# Usage: scripts/setup-qt.sh [--check]   (--check: verify only, never install)
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd -P)
data=${PROJECT_DATA:-$HOME/ash-data}
venv=$data/toolchain/qt511
py=$venv/bin/python
reqs=$root/requirements-qt511.txt
check_only=0; [[ ${1:-} == --check ]] && check_only=1

case "$venv" in "$root"|"$root"/*) echo "setup-qt: refusing to create the toolchain inside the repo ($venv)" >&2; exit 1 ;; esac

qt_version() {
  [[ -x "$py" ]] || return 1
  QT_QPA_PLATFORM=offscreen "$py" -I -c 'from PyQt5.QtCore import QT_VERSION_STR as v; print(v)' 2>/dev/null
}
is_ok() { local v; v=$(qt_version) && [[ "$v" == 5.11.* ]]; }

if is_ok; then
  echo "setup-qt: Qt $(qt_version) already present" >&2
elif ((check_only)); then
  echo "setup-qt: Qt 5.11 toolchain missing at $venv; run scripts/setup-qt.sh" >&2
  exit 1
else
  command -v uv >/dev/null || { echo "setup-qt: uv is required (https://docs.astral.sh/uv/)" >&2; exit 1; }
  echo "setup-qt: installing into $venv" >&2
  mkdir -p "$data/toolchain"
  uv python install 3.8 >&2
  uv venv --python 3.8 --allow-existing "$venv" >&2
  # --require-hashes: every wheel must match requirements-qt511.txt; --only-binary: no source builds.
  uv pip install --python "$py" --require-hashes --only-binary :all: -r "$reqs" >&2
  v=$(qt_version) || { echo "setup-qt: PyQt5 import failed in $venv" >&2; exit 1; }
  [[ "$v" == 5.11.* ]] || { echo "setup-qt: expected Qt 5.11.x, got $v" >&2; exit 1; }
  echo "setup-qt: Qt $v ready" >&2
fi
echo "$venv"
