#!/usr/bin/env bash
# One-time setup for a fresh clone. Idempotent; safe to re-run.
# Usage: scripts/setup.sh
set -euo pipefail

missing=0

hint() {
  # $1 = tool name
  case "$1" in
    git) echo "    install: apt install git | brew install git" ;;
    jq) echo "    install: apt install jq | brew install jq" ;;
    bash) echo "    install: brew install bash (macOS ships bash 3.2); apt install bash" ;;
  esac
}

check_tool() {
  if command -v "$1" > /dev/null 2>&1; then
    echo "ok       $1"
  else
    echo "MISSING  $1"
    hint "$1"
    missing=1
  fi
}

check_tool git
check_tool jq

if ((BASH_VERSINFO[0] >= 4)); then
  echo "ok       bash ${BASH_VERSION}"
else
  echo "MISSING  bash >= 4 (running ${BASH_VERSION})"
  hint bash
  missing=1
fi

if ((missing)); then
  echo "Install the missing tools above, then re-run scripts/setup.sh." >&2
  exit 1
fi

if ! root=$(git rev-parse --show-toplevel 2> /dev/null); then
  echo "ERROR: not inside a git clone; run scripts/setup.sh from within the repository." >&2
  exit 1
fi
cd "$root"

current=$(git config --get core.hooksPath || true)
if [[ -n "$current" && "$current" != ".githooks" ]]; then
  echo "WARN     core.hooksPath was '$current'; replacing it with '.githooks'"
fi
git config core.hooksPath .githooks
echo "ok       git hooks path: $(git config --get core.hooksPath)"
echo "NOTICE   this enables repo-controlled hooks in .githooks/ that run on every commit; review them after pulls."

for hook in .githooks/*; do
  [[ -f "$hook" ]] || continue
  chmod +x "$hook"
  echo "ok       executable: $hook"
done

if "$(dirname "$0")/setup-qt.sh" --check > /dev/null 2>&1; then
  echo "ok       Qt 5.11 toolchain"
else
  echo "NOTE     Qt 5.11 toolchain not installed (needed for check-qml and the QML tests): run scripts/setup-qt.sh"
fi

echo "Setup complete."
