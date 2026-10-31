#!/usr/bin/env bash
# Ash privacy and offline rules (ADR 0003). Fails (exit 1) on any violation:
#  (a) network/dynamic-code APIs in app/        (b) tracked real config / extra JSON in config/
#  (c) non-public latitude/longitude values in app/, config/, tests/
# Limits of (c): only numbers with a fractional part next to a NAMED key (lat, lon, latitude,
# longitude, lng and case variants) are seen, as "key: 51.44" or "key = 51.44". Not caught: coordinates
# in arrays or tuples without keys, strings like "51.44,5.47", whole degrees, DMS or geohash forms,
# values built at run time, untracked files, files outside app/ config/ tests/, or the git history.
# Public places are allowed (dev/coord_check.py PUBLIC). It is a tripwire, not proof of no leaks.
# Same for (a): a grep over tracked app/ files; obfuscated or computed calls are not detected.
# createComponent is deliberately strict: it also flags local-QML use (loading a bundled component);
# such a legitimate use must be added to ALLOW below with a reason.
# Usage: scripts/check-ash-rules.sh   (tracked files only; run from anywhere in the repo)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
status=0
fail() { echo "ash-rules: $*"; status=1; }

# ---------- (a) network APIs in app/ ----------
# label|ERE. A hit anywhere in app/ is a violation unless allowlisted below.
PATTERNS=(
  'XMLHttpRequest|XMLHttpRequest'
  'WebSocket|WebSocket'
  'fetch|(^|[^A-Za-z0-9_.])fetch[[:space:]]*\('
  'url|https?://'
  'openUrlExternally|Qt\.openUrlExternally'
  'NetworkAccessManager|NetworkAccessManager'
  'QtWebKit|QtWebKit'
  'QtWebEngine|QtWebEngine'
  'QtNetwork|QtNetwork'
  'eval|(^|[^A-Za-z0-9_.])eval[[:space:]]*\('
  'new-Function|new[[:space:]]+Function'
  'dyn-code|Qt\.createQmlObject|Qt\.include|createComponent|(^|[^A-Za-z0-9_.])Function[[:space:]]*\(|WorkerScript|EventSource|sendBeacon'
  'node-net|(require[[:space:]]*\(|from)[[:space:]]*.(node:)?(http|https|http2|net|dgram|tls|dns|child_process).'
)
# Allowlist, one entry per line: 'path-ERE|label|reason (mandatory)'. Keep it empty if you can.
# Example: 'app/ash/vendor/x\.js|url|licence header link inside a comment only'
ALLOW=(
  'app/ash/fonts/OFL\.txt|url|SIL Open Font License text of the bundled font; prose, not code'
)
allowed() { # $1 file, $2 label
  local e path label
  for e in "${ALLOW[@]}"; do
    path=${e%%|*}; label=${e#*|}; label=${label%%|*}
    [[ "$1" =~ ^($path)$ && "$2" == "$label" ]] && return 0
  done
  return 1
}
mapfile -d '' -t appfiles < <(git ls-files -z -- app)
for f in "${appfiles[@]}"; do
  [[ -f "$f" ]] || continue
  for p in "${PATTERNS[@]}"; do
    label=${p%%|*}; re=${p#*|}
    allowed "$f" "$label" && continue
    while IFS= read -r hit; do
      fail "$f:$hit  [network/dynamic code: $label]"
    done < <(grep -InE -e "$re" -- "$f" || true)
  done
done

# ---------- (b) tracked configs ----------
EXAMPLE=config/ash.example.json
mapfile -d '' -t tracked < <(git ls-files -z)
for f in "${tracked[@]}"; do
  base=${f##*/}
  if [[ "$f" == config/*.json && "$f" != "$EXAMPLE" ]]; then
    fail "$f: only $EXAMPLE may be a tracked JSON file in config/"
  elif [[ "$base" =~ ^ash(\.[A-Za-z0-9_-]+)*\.json$ && "$f" != "$EXAMPLE" ]]; then
    fail "$f: real Ash config must never be tracked (name matches ash*.json)"
  elif [[ "$base" =~ \.local\.json$ || "$base" == ".env" ]]; then
    fail "$f: local config must never be tracked"
  fi
done
for probe in config/ash.json config/ash.local.json ash.json; do
  if ! git check-ignore --no-index -q "$probe" 2>/dev/null; then fail ".gitignore does not ignore $probe"; fi
done
if git check-ignore --no-index -q "$EXAMPLE" 2>/dev/null; then fail ".gitignore must not ignore $EXAMPLE"; fi

# ---------- (c) coordinates ----------
mapfile -d '' -t coordfiles < <(git ls-files -z -- app config tests)
keep=()
for f in "${coordfiles[@]}"; do
  [[ -f "$f" ]] || continue
  # test files that plant violations build them at run time; the checker's own tests are exempt
  [[ "$f" == tests/test_ash_rules.sh || "$f" == tests/test_coord_check* ]] && continue
  keep+=("$f")
done
if ((${#keep[@]})); then
  if ! out=$(python3 -I "$(dirname "$0")/../dev/coord_check.py" "${keep[@]}"); then
    while IFS= read -r l; do fail "$l"; done <<<"$out"
  fi
fi

((status == 0)) && echo "ash-rules: ok"
exit $status
