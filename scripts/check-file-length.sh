#!/usr/bin/env bash
# Fails if any code file exceeds MAX_LINES (default 300); see docs/CODING_RULES.md.
# Usage: check-file-length.sh [file...]   (no args: all tracked files)
set -euo pipefail
MAX_LINES=${MAX_LINES:-300}
CODE_EXT='\.(py|js|jsx|ts|tsx|mjs|cjs|go|rs|java|kt|kts|rb|php|cs|swift|c|h|cc|cpp|hpp|sh|bash|sql|vue|svelte|css|scss|lua|ex|exs|dart|scala)$'
EXEMPT='^(\.claude/skills/|\.claude/references/|vendor/|node_modules/|dist/|build/)|\.min\.|\.generated\.|_pb2\.py$'

cd "$(git rev-parse --show-toplevel)"
if (($#)); then files=("$@"); else mapfile -t files < <(git ls-files); fi

status=0
for f in "${files[@]}"; do
  rel=${f#"$PWD"/}
  [[ -f "$rel" && "$rel" =~ $CODE_EXT && ! "$rel" =~ $EXEMPT ]] || continue
  n=$(wc -l < "$rel")
  if ((n > MAX_LINES)); then
    echo "$rel: $n lines (max $MAX_LINES)"
    status=1
  fi
done
exit $status
