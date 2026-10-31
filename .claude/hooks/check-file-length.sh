#!/usr/bin/env bash
# PostToolUse(Write|Edit): tell Claude immediately when a code file exceeds the line limit.
# Exit 2 feeds stderr back to Claude; the pre-commit hook is the hard stop.
file=$(jq -r '.tool_input.file_path // empty')
[[ -n "$file" && -f "$file" ]] || exit 0
root=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null) || exit 0
[[ -x "$root/scripts/check-file-length.sh" ]] || exit 0
out=$(cd "$root" && scripts/check-file-length.sh "$file") && exit 0
echo "$out. Split this file by responsibility now (docs/CODING_RULES.md); commits over the limit are rejected." >&2
exit 2
