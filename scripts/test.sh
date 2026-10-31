#!/usr/bin/env bash
# Runs every tests/test_*.sh; prints a summary; exits non-zero if any file fails,
# if no test files exist, or if any file reports zero passed tests.
# Usage: scripts/test.sh [-v]   (-v shows passing test names too)
set -uo pipefail
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_PREFIX GIT_OBJECT_DIRECTORY
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
cd "$(dirname "$0")/.." || exit 1
verbose=0; [[ ${1:-} == -v ]] && verbose=1
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

failed=() total=0
for f in tests/test_*.sh; do
  [[ -e "$f" ]] || continue
  total=$((total + 1))
  echo "== $f"
  out=$(bash "$f" 2>&1); rc=$?
  result=$(grep -E '^RESULT passed=[0-9]+ failed=[0-9]+$' <<<"$out" | tail -n 1)
  passed=${result#RESULT passed=}; passed=${passed%% *}
  if [[ -z "$result" ]]; then echo "  no RESULT line (crashed or aborted?)"; rc=1
  elif ((passed == 0)); then echo "  zero tests passed"; rc=1; fi
  if ((verbose || rc != 0)); then echo "$out"; else echo "$out" | tail -n 2 | head -n 1; fi
  ((rc == 0)) || failed+=("$f")
done

echo
if ((total == 0)); then echo "FAILED: no test files found"; exit 1; fi
if ((${#failed[@]})); then
  echo "FAILED: ${#failed[@]} of $total test files: ${failed[*]}"
  exit 1
fi
echo "OK: all $total test files passed"
