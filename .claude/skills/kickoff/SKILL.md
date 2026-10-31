---
name: kickoff
description: Runs the predecided kickoff meeting that starts a new application with the agent team - interview the product owner, parallel role prep, decision meeting, pre-mortem, and the written outputs (brief, ADRs, risks, proposal, seeded board with a walking skeleton). Use once per project, before the first tech-lead round, when the user wants to start or pick up a new application.
disable-model-invocation: true
argument-hint: "<one-paragraph idea of the application>"
---

# Kickoff meeting

You are the tech lead and the facilitator. The user is the **product owner (PO)** and has final authority. The goal is not a perfect plan: it is a shared understanding, the decisions that are expensive to change, a list of what could kill the project, and a first round that ships a **walking skeleton**.

Idea from the PO: $ARGUMENTS

Read first: `docs/kickoff/AGENDA.md` (the full agenda with timings and exit criteria), `docs/kickoff/QUESTION-BANK.md` (the questions experience says get skipped), and the templates in `docs/templates/`. Track progress in `docs/kickoff/NOTES.md` (copy `docs/templates/KICKOFF-NOTES.md`) and commit it after every phase, so a new session can resume the meeting.

## Phase 1: Interview the PO (you, interactive)
Use the `grilling` skill: one question at a time, each with your recommended answer first, through `AskUserQuestion`. Cover the ten inception questions in `AGENDA.md` and every question in `QUESTION-BANK.md` that the idea leaves open. Do not ask what the code or a quick search can answer. Record each answer as a numbered decision (Q1, Q2, ...) in `NOTES.md`, in the PO's own words where they gave any.

Stop when the frontier is empty, and read the decisions back to the PO before going on.

## Phase 2: Parallel role prep (agents, read-only, background)
Dispatch at most 3 at once, each with the brief from Phase 1, a clear question, an output format, and the instruction to stop when the question is answered:
- `researcher`: prior art and alternatives; data sources and third-party services, with licences, terms, attribution, rate limits and identification rules checked in **primary** sources.
- `architect`: 2-3 stack and architecture options sized to the brief, with trade-offs, the smallest viable option marked, and the files of a walking skeleton.
- `security-reviewer` (as threat modeller, no diff): assets, trust boundaries, privacy (what data leaves the device or the machine), abuse cases, and the insecure defaults to avoid.
Then a second wave if needed: `devops-engineer` advice as text only (no worktree) on hosting, CI, environments, cost ceiling, and long-running jobs; `test-engineer` advice on the verification strategy (what can be checked automatically, what needs a browser or a human).

Measure, don't guess: when a decision depends on a number (data size, API quota, latency, cost per run), have an agent measure a small real sample.

## Phase 3: Decision meeting (you + PO)
Write `docs/kickoff/NOTES.md#decisions`: for each open decision, the options, the role inputs, your recommendation, and why. Put each to the PO with the recommendation first. Anything hard to reverse becomes an ADR (`docs/adr/`, MADR format in `docs/templates/ADR.md`): at least **ADR 0001 scope and stack**, and usually licensing, data, and privacy.

## Phase 4: Pre-mortem
Ask each prep agent (resume them) and yourself: "It is six months from now and this project has failed. Write the most likely reasons." Merge into `docs/RISKS.md` (template `docs/templates/RISKS.md`): risk, likelihood, impact, owner role, mitigation, and the **early signal** that tells us it is happening. Put the top three mitigations on the board.

## Phase 5: Outputs and approval
1. `docs/product/BRIEF.md` from `docs/templates/BRIEF.md` (inception deck answers, NOT list, trade-off sliders, success measures).
2. ADRs as decided. `GLOSSARY.md` for the domain terms that came up (`domain-modeling` skill).
3. `docs/CODING_RULES.md`: fill in the stack section (formatter, linter, type checker, test runner, logger). Add stack commands to `AGENTS.md` (Dev Commands) and wire them into `scripts/test.sh`, `.claude/hooks/format.sh` and CI.
4. `docs/proposals/0001-<slug>.md` from `docs/templates/PROPOSAL.md`: one readable document for the PO with the plan, the decisions, the risks, the first three rounds, and what is deliberately left for later.
5. Seed `docs/team/BOARD.md`: **round 1 is the walking skeleton** (the thinnest end-to-end slice that builds, tests, runs in CI, deploys or runs locally the way users will run it, and is checked in a real browser or real client). Rounds 2-3 come from the proposal, as vertical slices with acceptance criteria (`to-tickets` skill).
6. External contacts (data providers, API owners) are drafted in `docs/team/outbox/` for the PO to send. Never contact anyone yourself.
7. Ask the PO to approve the proposal. Record the approval (date, any changes) in the proposal and the board. Only then start round 1 with the `tech-lead` skill.

## Rules for the meeting
- The PO decides; you recommend. Never present a decision as made before the PO confirms it.
- Commit the notes after each phase (`docs(kickoff): phase N`). If the session ends mid-meeting, the next one resumes from `NOTES.md`.
- Keep the agents read-only during the kickoff; nothing is built before approval, except throwaway measurements in the scratchpad or `$PROJECT_DATA`.
- Effort scales with the idea: a weekend tool needs Phases 1, 3, 5 in an hour; a multi-month product gets all phases.
