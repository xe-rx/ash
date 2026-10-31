#!/usr/bin/env bash
# PostToolUse(Write|Edit): auto-format the file Claude just touched, using the project's own tooling.
# Formatters only run when the project has installed them, so nothing is downloaded on the fly.
file=$(jq -r '.tool_input.file_path // empty')
[[ -n "$file" && -f "$file" ]] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

case "$file" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.html|*.vue|*.svelte|*.yaml|*.yml)
    [[ -x node_modules/.bin/prettier ]] && node_modules/.bin/prettier --write --log-level warn "$file" ;;
  *.py)
    if [[ -f pyproject.toml ]] && grep -q ruff pyproject.toml; then
      uv run --quiet ruff format "$file" && uv run --quiet ruff check --fix --quiet "$file"
    fi ;;
  *.go)  command -v gofmt >/dev/null && gofmt -w "$file" ;;
  *.rs)  command -v rustfmt >/dev/null && rustfmt --quiet "$file" ;;
esac
exit 0
