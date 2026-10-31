# Handoff: tech-lead
Updated: 2026-10-31 · Branch: main · Status: waiting on PO feedback (live window)

## Task
Run the team for Ash: kickoff, then rounds from docs/team/BOARD.md.

## Done
- Round 2, first batch merged (PRs 0005-0007): clock spacing, toolchain follow-ups, README. Round 1 merged locally (PRs 0001-0004). Kickoff complete and merged: brief, ADRs 0001-0003, risks, glossary, coding rules, proposal (approved by the PO 2026-10-31, no changes), board.

## Next steps
1. Get the PO's reaction to `scripts/run-local.sh`; check whether the live window opened at all (never tested by an agent).
2. Finish round 2 from the board: polish from PO feedback.
3. Apply the PO's answer on the Hijri date change (Maghrib recommended, midnight today).
4. Device work is on hold until the PO has Toon access (board). Toolchain follow-ups from PR 0001 are on the board.

## Open questions / blockers
- PO: live window result and feedback on the look; Hijri date change time.

## Gotchas learned
- "Touchplay" matches no product we could find; the PO confirmed the device is a rooted Toon 2.
- Builders hit their 40-turn limit on big tasks: resume them with SendMessage. `worktree.sh merge` needs `--discard-data` when only caches and node_modules remain; Qt's `.qmlc`/`.jsc` bytecode files also trigger the refusal, so look, then discard.
- Domoticaforum blocks direct fetches (403), so forum facts are from search snippets and marked as such.
- The researcher's claim that seventh of the night matches Bilal practice was wrong; see the measurement in `docs/kickoff/NOTES.md`.
- `qmlscene` isn't installed. Toolchain: `~/ash-data/toolchain/qt511` (Python 3.8, PyQt5 5.11.3, Qt 5.11.2). Offscreen needs `QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software`, and `grabToImage` (grabWindow returns empty).
- The sandbox hides the display socket, so agents can't open a live window; the PO launches it. A sandbox bypass was denied: don't retry it.

## Suggested skills
- tech-lead, test-driven-development (webapp-testing doesn't apply: Qt, not a browser)
