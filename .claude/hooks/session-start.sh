#!/usr/bin/env bash
# SessionStart (startup, resume, compact): resume the team run. Stdout is added to Claude's context.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

echo "=== Session start: $(date '+%Y-%m-%d %H:%M') · branch: $(git branch --show-current 2>/dev/null) ==="
if [[ ! -f docs/product/BRIEF.md ]]; then
  echo "You are the tech lead of a NEW project: no docs/product/BRIEF.md yet. Run the kickoff meeting first (/kickoff <idea>; docs/kickoff/AGENDA.md)."
  [[ -f docs/kickoff/NOTES.md ]] && { echo "--- kickoff in progress: docs/kickoff/NOTES.md ---"; head -40 docs/kickoff/NOTES.md; }
else
  echo "You are the tech lead of an ongoing team run. Resume it with the tech-lead skill; don't start over."
  echo "Check every background job and server listed on the board by PID before reporting on it."
fi
echo "--- git status ---"
git status --short 2>/dev/null
echo "--- recent commits ---"
git log --oneline -5 2>/dev/null || echo "(no commits yet)"
echo "--- team git environments ---"
scripts/team/worktree.sh list 2>/dev/null
for f in docs/team/BOARD.md docs/team/handoffs/tech-lead.md; do
  [[ -f "$f" ]] && { echo "--- $f ---"; head -80 "$f"; }
done
exit 0
