#!/usr/bin/env bash
# Tests for scripts/team/worktree.sh, run in throwaway git repos (never the real repo).
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"
WT="$REPO_ROOT/scripts/team/worktree.sh"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t

setup() {
  mk_tmp_var R
  [[ -n "$R" && "$R" == "$BASE"/* ]] || { echo "ABORT: bad sandbox [$R]" >&2; exit 1; }
  git -C "$R" init -q -b main
  require_isolated "$R"
  git -C "$R" config core.hooksPath /dev/null
  echo hi > "$R/f.txt"; git -C "$R" add f.txt; git -C "$R" commit -q -m init
}
wt() { local d=$1; shift; run bash -c 'cd "$1" && shift && "$@"' _ "$d" "$WT" "$@"; }

t_new() {
  setup; wt "$R" new test-engineer foo; assert_rc 0
  assert_contains "$OUT" "worktree: $R/.worktrees/test-engineer-foo"; assert_contains "$OUT" "branch:   test-engineer/foo"
  assert_file "$R/.worktrees/test-engineer-foo/f.txt"
  assert_eq "$(git -C "$R/.worktrees/test-engineer-foo" branch --show-current)" "test-engineer/foo"; }
t_new_from_worktree() {
  setup; wt "$R" new a b; wt "$R/.worktrees/a-b" new c d; assert_rc 0
  assert_file "$R/.worktrees/c-d/f.txt"; assert_no_file "$R/.worktrees/a-b/.worktrees"; }
t_new_missing_args() { setup; wt "$R" new onlyrole; assert_rc 1; assert_contains "$ERR" "usage"; }
t_new_duplicate() { setup; wt "$R" new a b; wt "$R" new a b; ((RC != 0)) || _fail "duplicate should fail"; assert_contains "$ERR" "already exists"; }
t_list() {
  setup; wt "$R" new a b; echo x > "$R/.worktrees/a-b/x"; git -C "$R/.worktrees/a-b" add x; git -C "$R/.worktrees/a-b" commit -q -m x
  wt "$R" list; assert_rc 0; assert_contains "$OUT" ".worktrees/a-b"; assert_contains "$OUT" "--- unmerged branches ---"
  assert_contains "${OUT#*--- unmerged branches ---}" "a/b" "unmerged section lists a/b"
  # negative: once merged, the branch is no longer listed as unmerged
  wt "$R" merge a b "m"; wt "$R" list; assert_rc 0
  assert_not_contains "${OUT#*--- unmerged branches ---}" "a/b" "merged branch must not be unmerged"; }
t_list_default() { setup; wt "$R" ; assert_rc 0; assert_contains "$OUT" "unmerged"; }
t_merge() {
  setup; wt "$R" new a b; local w="$R/.worktrees/a-b"
  echo x > "$w/x"; git -C "$w" add x; git -C "$w" commit -q -m "feat: x"
  wt "$R" merge a b "merge a/b"; assert_rc 0
  assert_file "$R/x"; assert_no_file "$w"
  assert_eq "$(git -C "$R" log -1 --format=%s)" "merge a/b"
  assert_eq "$(git -C "$R" rev-list --parents -n1 HEAD | wc -w)" "3" "no-ff merge commit"
  assert_eq "$(git -C "$R" branch --list a/b)" "" "branch deleted"; }
t_merge_dirty() {
  setup; wt "$R" new a b; echo y > "$R/.worktrees/a-b/y"; git -C "$R/.worktrees/a-b" add y
  echo u > "$R/.worktrees/a-b/untracked"
  wt "$R" merge a b "m"; assert_rc 1; assert_contains "$ERR" "uncommitted"
  assert_file "$R/.worktrees/a-b"; assert_no_file "$R/y"; }
t_merge_not_on_main() {
  setup; wt "$R" new a b; git -C "$R" checkout -q -b other
  wt "$R" merge a b "m"; assert_rc 1; assert_contains "$ERR" "not on main"; assert_file "$R/.worktrees/a-b"; }
t_merge_needs_message() { setup; wt "$R" new a b; wt "$R" merge a b; assert_rc 1; assert_contains "$ERR" "message required"; }
t_merge_missing_args() { setup; wt "$R" merge; assert_rc 1; assert_contains "$ERR" "usage"; }
t_unknown_cmd() { setup; wt "$R" bogus a b; assert_rc 1; assert_contains "$ERR" "unknown command: bogus"; }
t_main_isolated() { setup; wt "$R" new a b; assert_eq "$(git -C "$R" branch --show-current)" "main"; assert_eq "$(git -C "$R" status --porcelain | grep -v .worktrees)" ""; }

# --- data guard: never delete untracked/ignored data with a worktree (PR 0017) ---
mkwt() { # create worktree a-b with a commit, ignore rules for data/ and node_modules/
  setup; wt "$R" new a b; W="$R/.worktrees/a-b"
  printf 'data/\nnode_modules/\n' > "$W/.gitignore"; git -C "$W" add .gitignore; git -C "$W" commit -q -m ign
}
t_merge_ignored_data_refused() {
  mkwt; mkdir "$W/data"; head -c 2048 /dev/zero > "$W/data/big.bin"
  wt "$R" merge a b "m"; assert_rc 1
  assert_contains "$ERR" "data/"; assert_contains "$ERR" "-data"; assert_contains "$ERR" "--discard-data"
  assert_file "$W/data/big.bin"; assert_eq "$(git -C "$R" branch --list a/b | wc -l)" "1" "branch kept"
  assert_eq "$(git -C "$R" log -1 --format=%s)" "init" "nothing merged on refusal"; }
t_merge_untracked_unignored_refused() {
  mkwt; mkdir "$W/out"; echo d > "$W/out/f.csv"
  wt "$R" merge a b "m"; assert_rc 1; assert_file "$W/out/f.csv"; }
t_merge_node_modules_only_ok() {
  mkwt; mkdir -p "$W/node_modules/p" "$W/pipe/__pycache__" "$W/.venv"; echo x > "$W/node_modules/p/i.js"
  echo x > "$W/pipe/__pycache__/a.pyc"; echo x > "$W/.venv/v"
  wt "$R" merge a b "m"; assert_rc 0; assert_no_file "$W"; }
t_merge_discard_data() {
  mkwt; mkdir "$W/data"; echo d > "$W/data/big.bin"
  wt "$R" merge a b "m" --discard-data; assert_rc 0; assert_no_file "$W"
  assert_eq "$(git -C "$R" log -1 --format=%s)" "m"; }
t_remove_ignored_data_refused() {
  mkwt; mkdir "$W/data"; echo d > "$W/data/big.bin"
  wt "$R" remove a b; assert_rc 1; assert_contains "$ERR" "-data"; assert_file "$W/data/big.bin"; }
t_remove_discard_data() {
  mkwt; mkdir "$W/data"; echo d > "$W/data/big.bin"
  wt "$R" remove a b --discard-data; assert_rc 0; assert_no_file "$W"; }
t_remove_clean() { mkwt; wt "$R" remove a b; assert_rc 0; assert_no_file "$W"; }

t "new: creates worktree and branch from main" t_new
t "new: works when invoked from inside a worktree" t_new_from_worktree
t "new: missing slug prints usage, exit 1" t_new_missing_args
t "new: duplicate fails" t_new_duplicate
t "new: leaves main checkout on main" t_main_isolated
t "list: shows worktrees and unmerged branches" t_list
t "list: is the default command" t_list_default
t "merge: no-ff merges, removes worktree and branch" t_merge
t "merge: refuses dirty worktree" t_merge_dirty
t "merge: refuses when main checkout not on main" t_merge_not_on_main
t "merge: requires commit message" t_merge_needs_message
t "merge: missing args prints usage" t_merge_missing_args
t "merge: refuses ignored data, lists it, merges nothing" t_merge_ignored_data_refused
t "merge: refuses untracked non-ignored data" t_merge_untracked_unignored_refused
t "merge: allows worktree with only node_modules/.venv/__pycache__" t_merge_node_modules_only_ok
t "merge: --discard-data allows removing data" t_merge_discard_data
t "remove: refuses ignored data" t_remove_ignored_data_refused
t "remove: --discard-data allows" t_remove_discard_data
t "remove: clean worktree is removed" t_remove_clean
t "unknown command exits 1" t_unknown_cmd
summary
