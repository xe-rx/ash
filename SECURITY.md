# Security policy

## Reporting a vulnerability
Please do not open a public issue. Report privately via the repository's private vulnerability reporting (GitHub: Security → Report a vulnerability) or to the repository owner. We aim to acknowledge reports within 7 days.

## Practices in this repository
- Secrets only from environment variables; `.env` is gitignored and unreadable by agents (`.claude/settings.json`).
- Pre-commit and CI reject oversized files and personal data (`scripts/check-pii.sh`).
- CI uses least-privilege tokens and actions pinned by commit SHA.
- Dependencies are justified per PR and checked with the `supply-chain-risk-auditor` skill.
