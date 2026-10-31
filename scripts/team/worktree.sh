#!/usr/bin/env bash
# Git environments for the team: one worktree + branch per builder task.
#   worktree.sh new <role> <slug>                 create .worktrees/<role>-<slug> on branch <role>/<slug> from main
#   worktree.sh merge <role> <slug> <message>     no-ff merge into main (main checkout), then remove worktree + branch
#   worktree.sh remove <role> <slug>              remove worktree (+ branch if merged) without merging
#   worktree.sh list                              show worktrees and unmerged team branches
# merge/remove REFUSE if the worktree holds untracked or ignored files (other than regenerable
# caches); move data to the data dir outside the repo ($PROJECT_DATA, default ~/<repo>-data) first, or pass --discard-data if it is truly disposable.
set -euo pipefail
discard=0 args=()
for a in "$@"; do if [[ $a == --discard-data ]]; then discard=1; else args+=("$a"); fi; done
set -- "${args[@]}"
root=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
cmd=${1:-list} role=${2:-} slug=${3:-}
branch="$role/$slug" wt="$root/.worktrees/$role-$slug"

# Regenerable paths that never block removal.
REGEN='(^|/)(node_modules|\.venv|__pycache__|\.pytest_cache|\.hypothesis|\.ruff_cache|\.mypy_cache|dist)(/|$)'

# guard_data WT: exit 1 listing paths+sizes of untracked/ignored data unless --discard-data.
guard_data() {
  local wt=$1 line p lines=()
  ((discard)) && return 0
  while IFS= read -r line; do
    [[ $line == '?? '* || $line == '!! '* ]] || continue
    p=${line:3}; [[ $p =~ $REGEN ]] || lines+=("$(du -sh -- "$wt/$p" 2>/dev/null | cut -f1)	$p")
  done < <(git -C "$wt" status --porcelain --ignored --untracked-files=all)
  ((${#lines[@]})) || return 0
  {
    echo "REFUSING to remove $wt: it contains untracked/ignored data that would be deleted:"
    printf '  %s\n' "${lines[@]}"
    echo "Move it to ${PROJECT_DATA:-$HOME/$(basename "$(git rev-parse --show-toplevel)")-data} first (large data never lives in a worktree; AGENTS.md), or"
    echo "re-run with --discard-data if it is truly disposable."
  } >&2
  exit 1
}

need_args() { [[ -n "$role" && -n "$slug" ]] || { echo "usage: $0 $cmd <role> <slug>" >&2; exit 1; }; }

case "$cmd" in
  new)
    need_args
    git -C "$root" worktree add -q -b "$branch" "$wt" main
    echo "worktree: $wt"
    echo "branch:   $branch"
    ;;
  merge)
    need_args
    msg=${4:?commit message required}
    [[ $(git -C "$root" branch --show-current) == main ]] || { echo "main checkout is not on main" >&2; exit 1; }
    [[ -z $(git -C "$wt" status --porcelain --untracked-files=no) ]] || { echo "$wt has uncommitted changes" >&2; exit 1; }
    guard_data "$wt"  # all checks before the merge: never leave a merged-but-not-removed state
    git -C "$root" merge --no-ff -q "$branch" -m "$msg"
    git -C "$root" worktree remove --force "$wt"
    git -C "$root" branch -d "$branch"
    ;;
  remove)
    need_args
    [[ -d "$wt" ]] || { echo "no worktree at $wt" >&2; exit 1; }
    ((discard)) || [[ -z $(git -C "$wt" status --porcelain --untracked-files=no) ]] || { echo "$wt has uncommitted changes" >&2; exit 1; }
    guard_data "$wt"
    git -C "$root" worktree remove --force "$wt"
    git -C "$root" branch -d "$branch" 2>/dev/null || echo "branch $branch kept (not merged into main)"
    ;;
  list)
    git -C "$root" worktree list
    echo "--- unmerged branches ---"
    git -C "$root" branch --no-merged main --format='%(refname:short)'
    ;;
  *) echo "unknown command: $cmd" >&2; exit 1 ;;
esac
