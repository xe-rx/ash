#!/usr/bin/env bash
# Regression: the suite must never touch a real repo, even if GIT_DIR points at one.
# A decoy repo (under mktemp) plays the part of the real repo.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

snapshot() { # decoy state: refs, config, worktrees, HEAD
  git --git-dir="$1/.git" for-each-ref; cat "$1/.git/config" "$1/.git/HEAD"
  git --git-dir="$1/.git" worktree list; ls "$1/.git"; ls -A "$1"
}
mk_decoy() {
  mk_tmp_var D
  git -C "$D" init -q -b main
  git -C "$D" -c user.name=t -c user.email=t@t commit -q --allow-empty -m decoy
}

t_decoy_untouched() {
  mk_decoy; local before after
  before=$(snapshot "$D")
  run env GIT_DIR="$D/.git" GIT_WORK_TREE="$D" bash "$REPO_ROOT/tests/test_worktree.sh"
  assert_rc 0 "worktree suite still passes with hostile GIT_DIR"
  after=$(snapshot "$D")
  assert_eq "$after" "$before" "decoy repo changed"
}
t_mktemp_failure_aborts() {
  run env TMPDIR=/nonexistent/nope bash "$REPO_ROOT/tests/test_worktree.sh"
  ((RC != 0)) || _fail "suite must abort when mktemp fails"
  assert_not_contains "$OUT" "ok - " "no test may run"
}
t_require_isolated_rejects() {
  mk_tmp_var X
  run bash -c 'source "$1"; require_isolated /' _ "$REPO_ROOT/tests/lib.sh"
  ((RC != 0)) || _fail "must reject path outside sandbox"
  run bash -c 'source "$1"; require_isolated ""' _ "$REPO_ROOT/tests/lib.sh"
  ((RC != 0)) || _fail "must reject empty path"
}

t "decoy repo untouched when GIT_DIR is exported (worktree suite)" t_decoy_untouched
t "suite aborts if mktemp fails" t_mktemp_failure_aborts
t "require_isolated rejects empty and outside paths" t_require_isolated_rejects
summary
