#!/usr/bin/env bash
# SubagentStop: builder agents must leave a handoff before finishing (team-protocol skill).
# Blocks at most once per agent so a stuck agent can still stop.
input=$(cat)
role=$(jq -r '.agent_type // empty' <<<"$input")
# Builder = an agent whose .claude/agents/<role>.md frontmatter preloads the team-protocol skill.
# Role must be a plain slug so it can never escape the agents dir.
[[ "$role" =~ ^[a-z0-9][a-z0-9-]*$ ]] || exit 0
agents_dir="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)}/.claude/agents"
[[ -f "$agents_dir/$role.md" ]] || exit 0
# Frontmatter parse (awk): only entries under the top-level `skills:` key count; handles CRLF,
# block/inline lists, quotes, trailing comments. A file with no opening or no closing `---`, or
# an empty file, is not classified as a builder (the hook allows the stop).
is_builder() {
  awk '
    { sub(/\r$/, "") }
    NR == 1 { if ($0 != "---") exit 1; next }
    $0 == "---" { done = 1; exit f ? 0 : 1 }
    /^[^ \t#-]/ { insk = 0 }
    /^skills:/ {
      insk = 1; rest = $0; sub(/^skills:[ \t]*/, "", rest); sub(/[ \t]*#.*$/, "", rest)
      if (rest ~ /^\[/) { gsub(/[][,"\047 \t]+/, " ", rest); n = split(rest, a, " "); for (i = 1; i <= n; i++) if (a[i] == "team-protocol") f = 1 }
      next
    }
    insk && /^[ \t]*-[ \t]*["\047]?team-protocol["\047]?[ \t]*(#.*)?$/ { f = 1 }
    END { if (!done) exit 1 }
  ' "$1"
}
is_builder "$agents_dir/$role.md" || exit 0
[[ $(jq -r '.stop_hook_active // false' <<<"$input") == true ]] && exit 0
jq -r '.last_assistant_message // empty' <<<"$input" | grep -q '^## Handoff' && exit 0

id=$(jq -r '.agent_id // .session_id // "unknown"' <<<"$input")
id=$(printf '%s' "${id:0:64}" | tr -c 'A-Za-z0-9_-' '_')
marker="${TMPDIR:-/tmp}/team-handoff-$id"
[[ -e "$marker" ]] && exit 0
touch "$marker"
echo "Before stopping: update docs/team/handoffs/$role.md in your worktree, commit it, and end your reply with a '## Handoff' section (see the team-protocol skill)." >&2
exit 2
