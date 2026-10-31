#!/usr/bin/env bash
# Tests for .claude/hooks/require-handoff.sh (SubagentStop). TMPDIR is isolated per test.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"
HOOK="$REPO_ROOT/.claude/hooks/require-handoff.sh"

# feed JSON: pipe a raw payload into the hook with an isolated TMPDIR
feed() {
  # shellcheck disable=SC2016  # $1/$2 are expanded by the inner bash, intentionally
  run env TMPDIR="$TD" ${PROJ:+CLAUDE_PROJECT_DIR="$PROJ"} bash -c 'echo "$1" | "$2"' _ "$1" "$HOOK"
}
# stop ROLE ID MESSAGE [ACTIVE]: feed a SubagentStop payload to the hook
stop() {
  local json
  json=$(jq -n --arg r "$1" --arg i "$2" --arg m "$3" --argjson a "${4:-false}" \
    '{agent_type:$r, agent_id:$i, last_assistant_message:$m, stop_hook_active:$a}')
  feed "$json"
}
setup() { mk_tmp_var TD; }

t_blocks_without_handoff() { setup; stop test-engineer a1 "all done"; assert_rc 2; assert_contains "$ERR" "docs/team/handoffs/test-engineer.md"; assert_file "$TD/team-handoff-a1"; }
t_blocks_once() { setup; stop test-engineer a1 "done"; assert_rc 2; stop test-engineer a1 "done"; assert_rc 0 "second stop allowed"; }
t_per_agent() { setup; stop test-engineer a1 "done"; stop test-engineer a2 "done"; assert_rc 2 "different agent_id blocks again"; }
t_allows_with_handoff() { setup; stop backend-engineer a1 $'summary\n\n## Handoff\nstuff'; assert_rc 0; assert_no_file "$TD/team-handoff-a1"; }
t_handoff_must_be_line_start() { setup; stop backend-engineer a1 "see ## Handoff later"; assert_rc 2; }
t_stop_hook_active() { setup; stop test-engineer a1 "no handoff" true; assert_rc 0; assert_no_file "$TD/team-handoff-a1"; }
t_non_builder() { setup; for r in Explore Plan tech-lead general-purpose code-reviewer architect no-such-role ""; do stop "$r" a1 "no handoff"; assert_rc 0 "role [$r]"; done; assert_no_file "$TD/team-handoff-a1"; }
t_session_fallback() {
  setup; local j='{"agent_type":"docs-writer","session_id":"s9","last_assistant_message":"x"}'
  feed "$j"; assert_rc 2; assert_file "$TD/team-handoff-s9"; }
t_unknown_fallback() {
  setup; feed '{"agent_type":"devops-engineer"}'; assert_rc 2; assert_file "$TD/team-handoff-unknown"; }

# mk_proj: fake project in $PROJ with a builder (b) and a non-builder (r), plus a decoy outside agents/
mk_proj() {
  setup; PROJ="$TD/proj"; mkdir -p "$PROJ/.claude/agents"
  printf -- '---\nname: b\nskills:\n  - team-protocol\n---\nbody\n' >"$PROJ/.claude/agents/b.md"
  printf -- '---\nname: r\nskills:\n  - other\n---\nmentions team-protocol in body\n' >"$PROJ/.claude/agents/r.md"
  cp "$PROJ/.claude/agents/b.md" "$PROJ/.claude/x.md"
}
t_proj_dir_source() { mk_proj; stop b a1 "x"; assert_rc 2 "preloads team-protocol"; stop r a2 "x"; assert_rc 0 "body mention only"; assert_no_file "$TD/team-handoff-a2"; PROJ=; }
t_traversal() {
  mk_proj
  for r in "../x" "../../proj/.claude/x" "/etc/passwd" "b/../b" "b.md" "B" "-b"; do
    stop "$r" a9 "x"; assert_rc 0 "role [$r] allowed safely"; done
  assert_no_file "$TD/team-handoff-a9"; PROJ=; }
t_marker_sanitised() {
  setup; stop test-engineer "../../evil/x y" "x"; assert_rc 2
  assert_no_file "$TD/../evil"; assert_eq "$(find "$TD" -type f | wc -l)" 1 "one marker file"
  assert_eq "$(find "$TD" -maxdepth 1 -name 'team-handoff-*' | wc -l)" 1 "marker directly in TMPDIR"
  stop test-engineer "../../evil/x y" "x"; assert_rc 0 "sanitised marker still dedupes"; }

# fm_case NAME EXPECT_RC CONTENT: agent file with given raw content must classify as EXPECT_RC
fm_case() {
  mk_proj; printf '%b' "$3" >"$PROJ/.claude/agents/c.md"
  stop c fm1 "x"; assert_rc "$2" "$1"
  if [[ $2 == 2 ]]; then assert_file "$TD/team-handoff-fm1"; else assert_no_file "$TD/team-handoff-fm1"; fi
  PROJ=
}
t_fm_crlf() { fm_case crlf 2 '---\r\nname: c\r\nskills:\r\n  - team-protocol\r\n---\r\nbody\r\n'; }
t_fm_inline() { fm_case inline 2 '---\nskills: [a, team-protocol]\n---\n'; }
t_fm_inline_quoted() { fm_case inline-quoted 2 '---\nskills: ["a", '"'team-protocol'"']  # c\n---\n'; }
t_fm_dq() { fm_case dq 2 '---\nskills:\n  - "team-protocol"\n---\n'; }
t_fm_sq() { fm_case sq 2 "---\nskills:\n  - 'team-protocol'\n---\n"; }
t_fm_comment() { fm_case comment 2 '---\nskills:\n  - team-protocol  # x\n---\n'; }
t_fm_col0() { fm_case col0 2 '---\nskills:\n- a\n- team-protocol\n---\n'; }
t_fm_tools() { fm_case tools 0 '---\ntools:\n  - team-protocol\nskills:\n  - other\n---\n'; }
t_fm_tools_inline() { fm_case tools-inline 0 '---\ntools: [team-protocol]\n---\n'; }
t_fm_body_skills() { fm_case body-skills 0 '---\nname: c\n---\nskills:\n  - team-protocol\n'; }
t_fm_unclosed() { fm_case unclosed 0 '---\nskills:\n  - team-protocol\n'; }
t_fm_empty() { fm_case empty 0 ''; }
t "frontmatter: CRLF file classified" t_fm_crlf
t "frontmatter: inline list" t_fm_inline
t "frontmatter: inline quoted + comment" t_fm_inline_quoted
t "frontmatter: double-quoted entry" t_fm_dq
t "frontmatter: single-quoted entry" t_fm_sq
t "frontmatter: trailing comment" t_fm_comment
t "frontmatter: column-0 list items" t_fm_col0
t "frontmatter: team-protocol under tools: is not a builder" t_fm_tools
t "frontmatter: inline tools: is not a builder" t_fm_tools_inline
t "frontmatter: skills: only in body is not a builder" t_fm_body_skills
t "frontmatter: unclosed (fails closed to allow)" t_fm_unclosed
t "frontmatter: empty file (allow)" t_fm_empty
t "role derived from CLAUDE_PROJECT_DIR frontmatter, not body text" t_proj_dir_source
t "path traversal / odd agent_type never reads outside agents dir" t_traversal
t "marker name sanitised" t_marker_sanitised
t "blocks builder without handoff, names its handoff file, writes marker" t_blocks_without_handoff
t "blocks only once per agent_id" t_blocks_once
t "marker is per agent_id" t_per_agent
t "allows when message has '## Handoff' line" t_allows_with_handoff
t "'## Handoff' must start a line" t_handoff_must_be_line_start
t "allows when stop_hook_active is true" t_stop_hook_active
t "non-builder roles always allowed" t_non_builder
t "falls back to session_id for marker" t_session_fallback
t "falls back to 'unknown' marker" t_unknown_fallback
for r in backend-engineer frontend-engineer devops-engineer test-engineer docs-writer; do
  role_blocked() { setup; stop "$r" "id-$r" "nothing"; assert_rc 2; }
  t "builder role blocked: $r" role_blocked
done
summary
