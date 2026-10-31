#!/usr/bin/env bash
# Tests for .claude/hooks/guard-bash.sh (PreToolUse: exit 2 blocks, exit 0 allows).
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"
HOOK="$REPO_ROOT/.claude/hooks/guard-bash.sh"

guard() { run bash -c 'jq -n --arg c "$1" "{tool_input:{command:\$c}}" | "$2"' _ "$1" "$HOOK"; }

blocked() { guard "$1"; assert_rc 2 "should block: $1"; assert_contains "$ERR" "Blocked by" "$1"; }
allowed() { guard "$1"; assert_rc 0 "should allow: $1"; }

# Each case is its own test so a regression names the exact command.
# shellcheck disable=SC2016  # the literal $HOME is the test input
declare -a BLOCK=(
  'rm -rf /' 'rm -rf /*' 'rm -rf ~' 'rm -rf ~/' 'rm -rf $HOME' 'rm -rf ..' 'rm -rf .' 'rm -rf *'
  'rm -fr /' 'rm -Rf /' 'rm -rf / --no-preserve-root' 'cd x && rm -rf *' 'ls; rm -rf ~'
  'git push --force' 'git push -f origin main' 'git push origin main --force' 'git push origin +x -f'
  'git reset --hard' 'git reset --hard HEAD~3' 'git clean -fd' 'git clean -f' 'git clean -xdf'
  'git commit --no-verify -m x' 'git commit -m x --no-verify' 'git push --no-verify' 'git merge x --no-verify'
  'psql -c "DROP TABLE users"' 'psql -c "drop database app"' 'psql -c "DROP SCHEMA x"' 'psql -c "TRUNCATE TABLE t"'
  'rm -r -f /' 'rm -f -r ~' 'rm -rf -- /' 'rm -rf "$HOME"' 'rm --recursive --force /'
  'git push -fu origin main' 'git push origin +main' 'git clean --force'
  'GIT_DIR=/x git status' 'GIT_WORK_TREE=/x git status' 'export GIT_DIR=/x' 'cd y && GIT_DIR=.git git add -A'
  'git -C d push -f' 'git -c k=v push -f' 'git -C d clean -fd' 'git -C d reset --hard' 'git --no-pager -C d push -f origin main'
  'git -C d push origin +main' 'git -C d commit --no-verify -m x'
  'git --git-dir=/x status' 'git --git-dir /x status' 'git --work-tree=/x add .' 'git --work-tree /x add .' 'git -C d --git-dir=/x log'
  'sudo rm -rf /' 'command rm -rf ~' 'env rm -rf /' 'env -i FOO=1 rm -rf /' '/bin/rm -rf /' '\rm -rf /' 'FOO=1 rm -rf /' 'nohup rm -rf /'
  'time rm -rf /' 'exec rm -rf /' 'echo x | xargs rm -rf /' 'find . | xargs -n1 rm -rf *' 'sudo git -C d push -f'
  'mkfs /dev/sda1' 'mkfs.ext4 /dev/sda1' 'dd if=/dev/zero of=/dev/sda' 'dd if=x bs=1M of=/dev/nvme0n1'
)
declare -a ALLOW=(
  'ls -la' 'rm -rf build/' 'rm -rf ./dist' 'rm -rf .venv' 'rm -rf node_modules' 'rm -rf /tmp/foo'
  'rm file.txt' 'rm -r build' 'git push' 'git push origin feature' 'git push --force-with-lease'
  'git push --force-with-lease origin main' 'git reset --soft HEAD~1' 'git reset HEAD file'
  'git clean -n' 'git commit -m "fix"' 'git status' 'echo "force"' 'dd if=a of=b.img' 'psql -c "select 1"'
  'git push origin fix-force-bug' 'git clean -nfd' 'git clean --dry-run -f' 'git commit -m "docs: drop table notes"'
  'git commit -m '"'"'truncate table docs'"'"'' 'rm -rf build/' 'rm -rf -- ./dist' 'echo GIT_DIR is documented'
  'git commit -m "fix GIT_DIR=x handling"' 'git commit -m "mention --git-dir in docs"' 'git -C d status' 'git -C d push --force-with-lease'
  'git -c k=v log' 'git -C d clean -n' 'git -C d reset --soft HEAD~1' 'env FOO=1 ls' 'sudo ls' '/bin/ls' 'echo x | xargs rm -rf build'
)

for c in "${BLOCK[@]}"; do t "blocks: $c" blocked "$c"; done
for c in "${ALLOW[@]}"; do t "allows: $c" allowed "$c"; done

empty_input() { run bash -c 'echo "{}" | "$1"' _ "$HOOK"; assert_rc 0; }
t "allows input with no command" empty_input

raw() { run bash -c 'printf "%s" "$1" | "$2"' _ "$1" "$HOOK"; }
fails_closed() { raw "$1"; assert_rc 2 "should block raw input [$1]"; assert_contains "$ERR" "Blocked by"; }
t "blocks empty stdin" fails_closed ""
t "blocks garbage JSON" fails_closed "not json{"
t "blocks truncated JSON" fails_closed '{"tool_input":'
no_jq() { run env PATH=/nonexistent /bin/bash "$HOOK" </dev/null; assert_rc 2; assert_contains "$ERR" "jq"; }
t "blocks when jq is missing" no_jq
summary
