# Handoff: tech-lead
Updated: 2026-10-31 · Branch: main · Status: round 1 running (local build)

## Task
Run the team for Ash: kickoff, then rounds from docs/team/BOARD.md.

## Done
- Kickoff complete and merged: brief, ADRs 0001-0003, risks, glossary, coding rules, proposal (approved by the PO 2026-10-31, no changes), board.

## Next steps
1. Round 1 wave 1: core, toolchain. Review and merge.
2. Wave 2: scene, view, live run. PO approves the look.
3. Device work is on hold until the PO has Toon access (board).

## Open questions / blockers
- None. PO has no Toon access for now.

## Gotchas learned
- "Touchplay" matches no product we could find; the PO confirmed the device is a rooted Toon 2.
- Domoticaforum blocks direct fetches (403), so forum facts are from search snippets and marked as such.
- The researcher's claim that seventh of the night matches Bilal practice was wrong; see the measurement in `docs/kickoff/NOTES.md`.
- `qmlscene` isn't installed. Toolchain: `~/ash-data/toolchain/qt511` (Python 3.8, PyQt5 5.11.3, Qt 5.11.2). Offscreen needs `QT_QPA_PLATFORM=offscreen QT_QUICK_BACKEND=software`, and `grabToImage` (grabWindow returns empty).
- The sandbox hides the display socket, so agents can't open a live window; the PO launches it. A sandbox bypass was denied: don't retry it.

## Suggested skills
- tech-lead, test-driven-development (webapp-testing doesn't apply: Qt, not a browser)
