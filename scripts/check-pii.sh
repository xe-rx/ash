#!/usr/bin/env bash
# Blocks email addresses in committed text files (CLAUDE.md: never put personal data in
# code, User-Agents, or requests; a real incident: the owner's email was sent to third-party APIs in a User-Agent).
# Usage: check-pii.sh [file...]   (no args: all tracked files; pre-commit passes staged files)
#
# ALLOWLIST (the one place; edit here only with tech-lead approval):
#   noreply@anthropic.com                 commit attribution
#   *@example.com|org|net, *@*.example    reserved example domains
#   git@github.com                        SSH remote URLs
#   t@t and other dotless domains         test fixtures (the pattern needs a dotted domain)
# EXEMPT PATHS:
#   docs/team/outbox/*                    addressees of outgoing mail, not our data
#   .claude/skills/*, lockfiles           vendored / generated
set -euo pipefail
EMAIL='[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}'
ALLOWED='^(noreply@anthropic\.com|git@github\.com|[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)*example(\.(com|org|net))?)$'
EXEMPT='^(\.claude/skills/|docs/team/outbox/)|(^|/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|uv\.lock|poetry\.lock|Cargo\.lock|Gemfile\.lock|composer\.lock)$|\.lock$'

cd "$(git rev-parse --show-toplevel)"
if (($#)); then files=("$@"); else mapfile -t files < <(git ls-files); fi

found=0
for f in "${files[@]}"; do
  rel=${f#"$PWD"/}
  [[ -f "$rel" && ! "$rel" =~ $EXEMPT ]] || continue
  while IFS=: read -r line addr; do
    [[ "$addr" =~ $ALLOWED ]] && continue
    echo "PII: $rel:$line contains email address $addr" >&2
    found=1
  done < <(grep -InoE "$EMAIL" -- "$rel" || true)
done

if ((found)); then
  cat >&2 <<'MSG'

Commit/CI rejected: email addresses found in committed files (listed above, file:line).
Fix: remove the address. Never put personal data (the user's email, names) in code, User-Agents,
or requests to external services (CLAUDE.md); identify as `<project>-<tool>/<version>` only.
If the address is a genuine public contact in data, rephrase without the address; the allowlist
in scripts/check-pii.sh changes only with tech-lead approval.
MSG
  exit 1
fi
