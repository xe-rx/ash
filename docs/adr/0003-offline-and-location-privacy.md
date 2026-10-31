# 0003. Ash makes no network calls and keeps the home location only on the Toon

Status: accepted 2026-10-31 · Deciders: the PO, tech lead

## Context and problem
Ash needs the home location, and shows the household's religious practice. Either could reveal personal information, and religious practice is special-category data under GDPR Article 9 if it ever leaves home. Ash needs no online data.

## Considered options
1. Rounded coordinates in a config file only on the Toon, and no network use.
2. City coordinates committed to the repo.
3. An online prayer time API.

## Decision
Chosen: option 1 (Q3, Q13), because nothing about the household then leaves the device. Coordinates are rounded to 2 decimals (about 1 km). The repo holds only an example config using a public landmark.

## Consequences
- Good: works without internet, and there is no third party to trust.
- Bad: the PO must set the location at install. Invalid config must show a visible error, never a wrong time.
- Risks and how we will notice: a static test fails on network APIs (`XMLHttpRequest`, `WebSocket`, URLs, `eval`, and so on) in Ash's code; a dynamic test runs Ash offscreen under `unshare -n` or `strace`. A check rejects real-looking coordinates in `app/`, `docs/` and `tests/`. See `docs/RISKS.md` R6.

## More information
`docs/kickoff/NOTES.md` (Q3, Q13, security-reviewer row).
