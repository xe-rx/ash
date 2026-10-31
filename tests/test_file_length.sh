#!/usr/bin/env bash
# Tests for scripts/check-file-length.sh and .claude/hooks/check-file-length.sh.
# Everything runs in a throwaway git repo that holds copies of the scripts.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

setup_repo() {
  mk_tmp_var R
  git -C "$R" init -q
  require_isolated "$R"
  mkdir -p "$R/scripts" "$R/.claude/hooks"
  cp "$REPO_ROOT/scripts/check-file-length.sh" "$R/scripts/"
  cp "$REPO_ROOT/.claude/hooks/check-file-length.sh" "$R/.claude/hooks/"
}
# KNOWN GAPS (documented, intentionally not asserted):
#  - relative path args resolve against the repo root, not the caller cwd.
#  - wc -l counts newlines, so a 301-line file with no trailing newline measures 300 and passes.
# mkfile PATH LINES: create a file with N lines (inside $R)
mkfile() { mkdir -p "$(dirname "$R/$1")"; seq 1 "$2" > "$R/$1"; }
run_check() { run bash -c 'cd "$0" && shift && scripts/check-file-length.sh "$@"' "$R" -- "$@"; }
run_hook() {
  local json; json=$(jq -n --arg f "$1" '{tool_input:{file_path:$f}}')
  run bash -c 'echo "$1" | "$2"' _ "$json" "$R/.claude/hooks/check-file-length.sh"
}

t_at_limit_ok()      { setup_repo; mkfile a.py 300; run_check a.py; assert_rc 0; assert_eq "$OUT" ""; }
t_over_limit_fails() { setup_repo; mkfile a.py 301; run_check a.py; assert_rc 1; assert_contains "$OUT" "a.py: 301 lines (max 300)"; }
t_max_lines_env()    { setup_repo; mkfile a.py 11; MAX_LINES=10 run_check a.py; assert_rc 1; assert_contains "$OUT" "(max 10)"; }
t_non_code_ignored() { setup_repo; mkfile notes.md 500; mkfile data.json 500; mkfile x.txt 500; run_check notes.md data.json x.txt; assert_rc 0; }
t_qml_checked()      { setup_repo; mkfile View.qml 300; mkfile Big.qml 301; run_check View.qml Big.qml; assert_rc 1; assert_contains "$OUT" "Big.qml: 301 lines (max 300)"; assert_not_contains "$OUT" "View.qml"; }
t_many_extensions()  { setup_repo; for e in sh ts go rs css sql; do mkfile "f.$e" 301; done; run_check f.sh f.ts f.go f.rs f.css f.sql; assert_rc 1
  for e in sh ts go rs css sql; do assert_contains "$OUT" "f.$e: 301"; done; }
t_exempt_dirs()      { setup_repo
  for p in .claude/skills/s/x.py .claude/references/r.py vendor/v.js node_modules/n.js dist/d.js build/b.js; do mkfile "$p" 400; done
  run_check .claude/skills/s/x.py .claude/references/r.py vendor/v.js node_modules/n.js dist/d.js build/b.js; assert_rc 0; }
t_exempt_patterns()  { setup_repo; mkfile app.min.js 400; mkfile api.generated.ts 400; mkfile x_pb2.py 400
  run_check app.min.js api.generated.ts x_pb2.py; assert_rc 0; }
t_nested_not_exempt() { setup_repo; mkfile src/dist.py 301; run_check src/dist.py; assert_rc 1; }
t_missing_file()     { setup_repo; run_check nope.py; assert_rc 0; }
t_absolute_path()    { setup_repo; mkfile a.py 301; run_check "$R/a.py"; assert_rc 1; assert_contains "$OUT" "a.py: 301"; assert_not_contains "$OUT" "$R"; }
t_reports_all()      { setup_repo; mkfile a.py 301; mkfile b.py 5; mkfile c.py 302; run_check a.py b.py c.py
  assert_rc 1; assert_contains "$OUT" "a.py: 301"; assert_contains "$OUT" "c.py: 302"; assert_not_contains "$OUT" "b.py"; }
t_no_args_tracked()  { setup_repo; mkfile big.py 301; mkfile ok.py 3; mkfile untracked.py 999
  git -C "$R" add big.py ok.py; run_check; assert_rc 1
  assert_contains "$OUT" "big.py: 301"; assert_not_contains "$OUT" "ok.py"; assert_not_contains "$OUT" "untracked.py"; }
t_no_args_clean()    { setup_repo; mkfile ok.py 3; git -C "$R" add ok.py; run_check; assert_rc 0; }

t "script: file at exactly 300 lines passes" t_at_limit_ok
t "script: 301 lines fails with message" t_over_limit_fails
t "script: MAX_LINES env overrides limit" t_max_lines_env
t "script: non-code extensions ignored" t_non_code_ignored
t "script: 301-line QML file fails, 300 passes" t_qml_checked
t "script: many code extensions checked" t_many_extensions
t "script: exempt directories skipped" t_exempt_dirs
t "script: .min/.generated/_pb2 exempt" t_exempt_patterns
t "script: nested name like src/dist.py not exempt" t_nested_not_exempt
t "script: missing file skipped" t_missing_file
t "script: absolute path accepted, reported relative" t_absolute_path
t "script: reports every offender, not just first" t_reports_all
t "script: no args checks tracked files only" t_no_args_tracked
t "script: no args, all fine, exits 0" t_no_args_clean

# --- PostToolUse hook ---
h_over()   { setup_repo; mkfile a.py 301; run_hook "$R/a.py"; assert_rc 2; assert_contains "$ERR" "a.py: 301 lines"; assert_contains "$ERR" "Split this file"; }
h_ok()     { setup_repo; mkfile a.py 300; run_hook "$R/a.py"; assert_rc 0; assert_eq "$ERR" ""; }
h_noncode() { setup_repo; mkfile a.md 999; run_hook "$R/a.md"; assert_rc 0; }
h_missing() { setup_repo; run_hook "$R/ghost.py"; assert_rc 0; }
h_nofield() { setup_repo; run bash -c 'echo "{}" | "$1"' _ "$R/.claude/hooks/check-file-length.sh"; assert_rc 0; }
h_nongit() { # outside a git repo the hook exits 0 silently. Two independent exits give this (the rev-parse
  # `|| exit 0` and the later -x check on /scripts/...), so removing only the first is not observable;
  # this catches a root fallback to the file's directory, where the check script would then run.
  local nd; mk_tmp_var nd; mkdir -p "$nd/scripts"; seq 1 999 > "$nd/big.py"
  cp "$REPO_ROOT/scripts/check-file-length.sh" "$nd/scripts/"
  ! git -C "$nd" rev-parse --show-toplevel >/dev/null 2>&1 || _fail "tmp dir is inside a git repo"
  run_hook "$nd/big.py"; assert_rc 0; assert_eq "$ERR" ""; }
h_noscript() { setup_repo; rm "$R/scripts/check-file-length.sh"; mkfile a.py 999; run_hook "$R/a.py"; assert_rc 0; }
h_nonexec() { setup_repo; chmod -x "$R/scripts/check-file-length.sh"; mkfile a.py 999; run_hook "$R/a.py"; assert_rc 0; }

t "hook: over limit exits 2 with advice on stderr" h_over
t "hook: at limit exits 0 silently" h_ok
t "hook: non-code file exits 0" h_noncode
t "hook: nonexistent file exits 0" h_missing
t "hook: no file_path exits 0" h_nofield
t "hook: file outside a git repo exits 0" h_nongit
t "hook: repo without check script exits 0" h_noscript
t "hook: non-executable check script exits 0" h_nonexec
summary
