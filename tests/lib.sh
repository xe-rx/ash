#!/usr/bin/env bash
# shellcheck disable=SC2034  # REPO_ROOT, OUT, ERR are consumed by the sourcing test files
# Minimal dependency-free test harness. Source from a test file, then call
# `t "name" fn` ... and finish with `summary`. Assertions record failures and return non-zero.
# Isolation: never let an inherited git environment point tests at a real repo.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_PREFIX GIT_OBJECT_DIRECTORY
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
PASSED=0 FAILED=0 CURRENT_FAIL=0

# One per-run base dir; every temp dir lives under it and the EXIT trap removes it all.
BASE=$(mktemp -d) && [[ -n "$BASE" && -d "$BASE" ]] || { echo "lib.sh: mktemp failed" >&2; exit 1; }
BASE=$(cd "$BASE" && pwd -P)
trap 'rm -rf "$BASE"' EXIT

# mk_tmp_var VAR: create a fresh dir under $BASE and store its path in VAR (no subshell,
# so a failure aborts the run). Prefer this over $(mk_tmp).
mk_tmp_var() {
  local d
  d=$(mktemp -d "$BASE/d.XXXXXX") && [[ -n "$d" && -d "$d" ]] || { echo "mk_tmp: mktemp failed" >&2; exit 1; }
  printf -v "$1" '%s' "$(cd "$d" && pwd -P)"
}
# mk_tmp: print a fresh temp dir path (aborts the run's subshell if it fails; callers must check)
mk_tmp() { local d; mk_tmp_var d && printf '%s' "$d"; }

# require_isolated DIR: abort unless DIR is a git repo wholly inside $BASE
require_isolated() {
  local gd
  [[ -n "${1:-}" && "$1" == "$BASE"/* ]] || { echo "ABORT: [$1] is not under test base $BASE" >&2; exit 1; }
  gd=$(git -C "$1" rev-parse --absolute-git-dir 2>/dev/null) || gd=
  [[ "$gd" == "$1"/* ]] || { echo "ABORT: git dir [$gd] of $1 escapes the sandbox" >&2; exit 1; }
}

_fail() { CURRENT_FAIL=1; echo "    FAIL: $*" >&2; }

assert_eq() { [[ "$1" == "$2" ]] || _fail "${3:-values differ}: expected [$2], got [$1]"; }
assert_contains() { [[ "$1" == *"$2"* ]] || _fail "${3:-missing text}: [$2] not in [$1]"; }
assert_not_contains() { [[ "$1" != *"$2"* ]] || _fail "${3:-unexpected text}: [$2] in [$1]"; }
assert_file() { [[ -e "$1" ]] || _fail "expected file to exist: $1"; }
assert_no_file() { [[ ! -e "$1" ]] || _fail "expected file to be absent: $1"; }

# run CMD...: capture exit status, stdout, stderr into RC, OUT, ERR
run() {
  local o e; o=$(mktemp) e=$(mktemp)
  "$@" >"$o" 2>"$e"; RC=$?
  OUT=$(<"$o"); ERR=$(<"$e"); rm -f "$o" "$e"
}
assert_rc() { [[ "$RC" == "$1" ]] || _fail "${2:-exit code}: expected $1, got $RC (stderr: $ERR)"; }

# t NAME FUNCTION [ARGS...]: run one test function, tally the result
t() {
  local name=$1; shift
  CURRENT_FAIL=0
  "$@"; (($? == 127)) && _fail "test function not found: $1"
  if ((CURRENT_FAIL)); then FAILED=$((FAILED + 1)); echo "  not ok - $name"
  else PASSED=$((PASSED + 1)); echo "  ok - $name"; fi
}

# summary: print totals; exit non-zero if any test failed
summary() { echo "  $PASSED passed, $FAILED failed"; echo "RESULT passed=$PASSED failed=$FAILED"; ((FAILED == 0)); }
