# Kickoff agenda

The predecided meeting that starts every new application. Run it with `/kickoff <idea>`; the `kickoff` skill drives it, and this file is the reference for what each part must produce. Sources for the techniques are in `docs/research/BEST-PRACTICES.md`.

| # | Part | Who | Produces | Exit criterion |
|---|---|---|---|---|
| 1 | Interview (inception questions + question bank) | tech lead + PO | numbered decisions in `NOTES.md` | the PO confirms the read-back |
| 2 | Role prep | researcher, architect, security-reviewer (+ devops, test advice) | sourced findings, options, threat model | every open decision has role input |
| 3 | Decision meeting | tech lead + PO | decisions table, ADRs | every hard-to-reverse choice has an ADR |
| 4 | Pre-mortem | every prep role + tech lead | `docs/RISKS.md` | each risk has an owner, a mitigation and an early signal |
| 5 | Outputs and approval | tech lead (+ docs-writer if large) | brief, proposal, coding rules, seeded board | the PO approves the proposal |

## 1. The ten inception questions
From Jonathan Rasmusson's agile inception deck. Each answer goes into `docs/product/BRIEF.md`.

1. **Why are we here?** The problem, for whom, and why now.
2. **Elevator pitch.** For [target user] who [need], [product] is a [category] that [key benefit]. Unlike [alternative], it [difference].
3. **Product box.** Three reasons someone would pick it up; the one-line slogan.
4. **The NOT list.** What is in, what is explicitly out, and what is unresolved. Out-of-scope items are as important as in-scope ones.
5. **Meet the neighbours.** Every person, team, data provider and third-party service the project depends on, and what each one expects from us (licences, attribution, rate limits, approvals).
6. **Show the solution.** A rough architecture sketch: components, data flow, where it runs.
7. **What keeps us up at night?** The first pass of risks (the pre-mortem deepens it).
8. **Size it.** The first milestone the PO would show someone, and a rough number of rounds to get there.
9. **What's going to give?** Trade-off sliders: rank scope, time, quality and cost against each other. Also name the non-negotiables (for example privacy, licence, accessibility), which are not on the sliders.
10. **What's it going to take?** The roles needed beyond the default team, the hardware or compute, any budget, and who has final authority on what.

## 2. Role prep
Each agent gets the Phase 1 decisions, one question, an output format, and a stop condition. Defaults:

| Role | Question | Output |
|---|---|---|
| researcher | What already exists, and which data and services can we legally and practically use? | findings table with primary sources; UNVERIFIED marks |
| architect | What are 2-3 viable architectures, and what is the smallest? | options with trade-offs; walking-skeleton file list |
| security-reviewer | What do we protect, from whom, and what must never leave the device or the machine? | assets, trust boundaries, abuse cases, privacy rules |
| devops-engineer (advice) | Where does it run, what does it cost, how does it ship, and how do long jobs survive? | hosting and CI plan, cost ceiling, job runbook |
| test-engineer (advice) | How will we know it works without a human looking? | verification strategy per layer |

## 3. Decision meeting
Per open decision: options, inputs, recommendation, the PO's choice. A decision is hard to reverse (so it needs an ADR) when changing it later means rewriting data, breaking users, changing a licence, or migrating infrastructure.

## 4. Pre-mortem
Gary Klein's technique: assume the project has already failed and explain why. Each role writes its reasons independently first (so no one anchors on the first answer), then the tech lead merges them. Typical categories: wrong problem, data or licence unavailable, third-party limits, scale or cost blow-up, quality bar unreachable, security or privacy incident, team process failure (lost context, unreviewed merges), the PO's time.

## 5. Outputs
- `docs/product/BRIEF.md`, `docs/adr/0001-...`, `docs/RISKS.md`, `GLOSSARY.md`
- `docs/CODING_RULES.md` stack section; `AGENTS.md` commands; checks wired into `scripts/test.sh`, the format hook and CI
- `docs/proposals/0001-<slug>.md` for the PO
- `docs/team/BOARD.md` with round 1 = the walking skeleton
- `docs/team/outbox/` drafts for any external contact

## The walking skeleton (round 1)
Alistair Cockburn's term: the thinnest slice of real functionality that is automatically built, tested and deployed end to end. It links the main components (UI, logic, data, delivery) even if each does almost nothing yet. It is production code, not a prototype. Its acceptance criteria always include:
- one user-visible behaviour works end to end;
- CI runs every check on it;
- it runs the way users will run it (deployed, or the production build served locally), and a browser or client check with screenshots passes;
- the README tells a new engineer how to run it.
