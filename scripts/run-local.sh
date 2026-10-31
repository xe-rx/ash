#!/usr/bin/env bash
# Opens Ash in a live 1024x600 window on this machine (bundled Qt 5.11, software backend).
# Usage: scripts/run-local.sh [--at "YYYY-MM-DD HH:MM"] [--speed N]
#   --at     freeze at, or start from, this local time (default: real time)
#   --speed  simulated minutes per real second, to watch a whole day pass (needs --at)
# Config: config/ash.json if present (gitignored), else config/ash.example.json. TZ is forced to
# Europe/Amsterdam. Platform is xcb unless QT_QPA_PLATFORM is already set. Esc closes the window;
# a tap prints "closed". Needs a reachable display (DISPLAY or WAYLAND_DISPLAY).
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd -P)
args=()
while (($#)); do
  case $1 in
    --at) args+=(--at "${2:?--at needs a value}"); shift 2 ;;
    --speed) args+=(--speed "${2:?--speed needs a number}"); shift 2 ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "run-local: unknown option $1" >&2; exit 2 ;;
  esac
done
export QT_QPA_PLATFORM=${QT_QPA_PLATFORM:-xcb} QT_QUICK_BACKEND=software TZ=Europe/Amsterdam
need=""
case $QT_QPA_PLATFORM in
  xcb) [[ -n ${DISPLAY:-} ]] || need=DISPLAY ;;
  wayland*) [[ -n ${WAYLAND_DISPLAY:-} ]] || need=WAYLAND_DISPLAY ;;
esac
if [[ -n $need ]]; then
  echo "run-local: no display found for the $QT_QPA_PLATFORM platform ($need is empty)." >&2
  echo "  Run this from a desktop terminal (on WSL2: use WSLg, or start an X server and export DISPLAY)." >&2
  echo "  To render without a window use scripts/screenshot.sh instead." >&2
  exit 1
fi
venv=$("$root/scripts/setup-qt.sh" --check 2>/dev/null) || {
  echo "run-local: the Qt 5.11 toolchain is missing. Run scripts/setup-qt.sh once, then try again." >&2; exit 1; }
config=$root/config/ash.json; [[ -f $config ]] || config=$root/config/ash.example.json
trap 'rm -f "$root"/app/ash/core/*.jsc "$root"/app/ash/*.qmlc "$root"/app/ash/view/*.qmlc "$root"/dev/*.qmlc' EXIT
"$venv/bin/python" -I "$root/dev/harness.py" --config "$config" ${args[@]+"${args[@]}"}
