#!/usr/bin/env bash
# Tests for scripts/check-pii.sh, run in throwaway git repos (never the real repo).
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"
PII="$REPO_ROOT/scripts/check-pii.sh"
AT=@  # fixtures build addresses from this so the repo scan does not flag this file

setup() {
  mk_tmp_var R
  git -C "$R" init -q -b main
  require_isolated "$R"
}
# put FILE CONTENT: write a tracked file in the sandbox
put() { mkdir -p "$(dirname "$R/$1")"; printf '%s\n' "${2//'{AT}'/@}" > "$R/$1"; git -C "$R" add "$1"; }
chk() { run bash -c 'cd "$1" && shift && "$@"' _ "$R" "$PII" "$@"; }

t_ua_in_pipeline_fails() {
  setup; put pipeline/fetch.py 'UA = "myproj-fetch/0.1 (someone{AT}gmail.com)"'
  chk; assert_rc 1
  assert_contains "$ERR" "pipeline/fetch.py:1"; assert_contains "$ERR" "someone${AT}gmail.com"
  assert_contains "$ERR" "Never put personal data"; }
t_clean_passes() { setup; put a.py 'UA = "myproj-fetch/0.1"'; chk; assert_rc 0; }
t_explicit_files_only() {
  setup; put bad.txt 'a{AT}gmail.com'; put ok.txt 'fine'
  chk ok.txt; assert_rc 0; chk bad.txt; assert_rc 1; }
t_allowlist() {
  setup
  put a.md 'Co-Authored-By: Claude <noreply{AT}anthropic.com>
x{AT}example.com y{AT}example.org z{AT}example.net w{AT}foo.example
git clone git{AT}github.com:o/r.git
t@t
actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4'
  chk; assert_rc 0 "allowlisted"; }
t_outbox_exempt() { setup; put docs/team/outbox/x.md 'contact: bob{AT}corp.fr'; chk; assert_rc 0; }
t_exclusions() {
  setup; put .claude/skills/s/a.md 'a{AT}gmail.com'; put app/package-lock.json 'a{AT}gmail.com'; put uv.lock 'a{AT}gmail.com'
  chk; assert_rc 0; }
t_binary_ignored() { setup; printf 'a%sgmail.com\0' "$AT" > "$R/b.bin"; git -C "$R" add b.bin; chk; assert_rc 0; }
t_other_domains_fail() { setup; put x.md 'mail me: a.b{AT}sub.example.co.uk? no: c{AT}notexample.com'; chk; assert_rc 1
  assert_contains "$ERR" "c${AT}notexample.com"; }
t_real_repo_clean() { (cd "$REPO_ROOT" && "$PII" >/dev/null 2>&1); assert_eq "$?" "0" "tracked files of this repo are clean"; }

t "pii: User-Agent with @ in pipeline/ fails with location and fix" t_ua_in_pipeline_fails
t "pii: clean file passes" t_clean_passes
t "pii: explicit file args limit the scan" t_explicit_files_only
t "pii: allowlisted addresses pass" t_allowlist
t "pii: docs/team/outbox is exempt" t_outbox_exempt
t "pii: vendored skills and lockfiles excluded" t_exclusions
t "pii: binary files ignored" t_binary_ignored
t "pii: non-allowlisted domains fail" t_other_domains_fail
t "pii: this repo passes" t_real_repo_clean
summary
