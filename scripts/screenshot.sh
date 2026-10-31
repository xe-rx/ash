#!/usr/bin/env bash
# Renders Ash offscreen (software backend) to PNG with item.grabToImage.
# Usage: scripts/screenshot.sh [--at "YYYY-MM-DD HH:MM"] [--out DIR] [--config FILE]
#        scripts/screenshot.sh --strip sunrise|sunset [--out DIR]   (10 frames around that moment, 21 March,
#                                                     single PNGs plus strip-<name>.png)
#        scripts/screenshot.sh --sheet [--out DIR]   (21 June and 21 December, 8 moments each,
#                                                     single PNGs plus sheet.png)
# Output defaults to $PROJECT_DATA/screens (PROJECT_DATA defaults to ~/ash-data). TZ is Europe/Amsterdam.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd -P)
data=${PROJECT_DATA:-$HOME/ash-data}
out=$data/screens; at=""; sheet=0; strip=""; config=""
while (($#)); do
  case $1 in
    --at) at=${2:?--at needs a value}; shift 2 ;;
    --out) out=${2:?--out needs a dir}; shift 2 ;;
    --config) config=${2:?}; shift 2 ;;
    --sheet) sheet=1; shift ;;
    --strip) strip=${2:?--strip needs sunrise or sunset}; [[ $strip == sunrise || $strip == sunset ]] || { echo "screenshot: --strip takes sunrise or sunset" >&2; exit 2; }; shift 2 ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "screenshot: unknown option $1" >&2; exit 2 ;;
  esac
done
outabs=$(realpath -m -- "$out")
if [[ $outabs == "$root" || $outabs == "$root"/* ]]; then
  echo "screenshot: output must be outside the repo (got $out)" >&2; exit 2
fi
out=$outabs
venv=$("$root/scripts/setup-qt.sh" --check 2>/dev/null) || {
  echo "screenshot: Qt 5.11 toolchain missing; run scripts/setup-qt.sh first" >&2; exit 1; }
[[ -n $config ]] || { config=$root/config/ash.example.json; }   # screenshots use the example config
mkdir -p "$out"
export TZ=Europe/Amsterdam QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software
cleanup() { rm -f "$root"/app/ash/core/*.jsc "$root"/app/ash/*.qmlc "$root"/app/ash/view/*.qmlc "$root"/dev/*.qmlc; }
trap cleanup EXIT
run() { "$venv/bin/python" -I "$root/dev/harness.py" --config "$config" "$@"; }

if [[ -n $strip ]]; then
  shots=$(mktemp); trap 'rm -f "$shots"; cleanup' EXIT
  node "$root/dev/sheet-times.js" "$config" "$out" "$strip" > "$shots"
  run --shots "$shots"
  "$venv/bin/python" -I "$root/dev/sheet.py" "$shots" "$out/strip-$strip.png"
  echo "strip: $out/strip-$strip.png"
elif ((sheet)); then
  shots=$(mktemp); trap 'rm -f "$shots"; cleanup' EXIT
  node "$root/dev/sheet-times.js" "$config" "$out" > "$shots"
  run --shots "$shots"
  "$venv/bin/python" -I "$root/dev/sheet.py" "$shots" "$out/sheet.png"
  echo "sheet: $out/sheet.png"; ls "$out" | head -40
else
  [[ -n $at ]] || at=$(date '+%Y-%m-%d %H:%M')
  name=${at//[: ]/-}; shots=$(mktemp); trap 'rm -f "$shots"; cleanup' EXIT
  ms=$("$venv/bin/python" -I -c "
import time,sys
print(int(time.mktime(time.strptime(sys.argv[1], '%Y-%m-%d %H:%M'))*1000))" "$at")
  printf '[{"ms": %s, "path": "%s/ash-%s.png"}]' "$ms" "$out" "$name" > "$shots"
  run --shots "$shots"
  echo "$out/ash-$name.png"
fi
