# Best practices behind this template

The research the template is built on, read in October 2026. For each practice: what the source says, and where the template applies it. Primary sources are marked **(primary)**; the rest are secondary pointers.

## Working with Claude Code
Source: [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) **(primary)**.
- **Give the agent a check it can run** (tests, build, screenshot). Without one, "looks done" is the only signal. → *Definition of done*, the `verification-before-completion` skill, the browser check for UI, evidence in every handoff.
- **Explore, then plan, then code**; skip the plan when the diff fits in one sentence. → Plan mode for changes touching more than 5 files; the architect reviews big plans.
- **Keep CLAUDE.md short.** For each line, ask whether removing it would cause mistakes. Move procedures to skills, and "always/never" rules to hooks. → `CLAUDE.md` imports `AGENTS.md` and holds only team mechanics; the playbooks are skills; the guards are hooks.
- **Use hooks for what must happen every time.** → `guard-bash.sh`, `check-file-length.sh`, `format.sh`, `require-handoff.sh`, `session-start.sh`.
- **Let Claude interview you before large features, then start fresh from a written spec.** → The kickoff interview (`grilling` skill) and the brief and proposal.
- **Add an adversarial review in a fresh context; flag only gaps that affect correctness.** → The reviewers' BLOCKING-vs-NITS rule.
- **Writer/reviewer split, and parallel sessions in worktrees.** → One worktree and branch per builder; read-only reviewers.
- **Common failures:** the kitchen-sink session, correcting over and over, an over-specified CLAUDE.md, the trust-then-verify gap, infinite exploration. → Round scoping, at most 3 builders, scoped research questions with stop conditions.

Source: [Subagents](https://code.claude.com/docs/en/sub-agents) **(primary)**.
- **Agent frontmatter:** `description` decides delegation; `tools` is an allowlist; `skills` preloads skills; `maxTurns` gives a resumable partial result. Nesting depth is set with `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (`1` turns nesting off). → Every role file; `.claude/settings.json` sets depth 1.

## Multi-agent orchestration
Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), Anthropic **(primary)**.
- **Give each subagent an objective, an output format, tool guidance and clear boundaries.** Vague delegation duplicates work. → The tech-lead dispatch prompt and the kickoff role-prep table.
- **Scale effort explicitly**, or agents over-invest in simple tasks. → "Effort scales with the idea" in the kickoff; at most 3 builders.
- **Save the plan to external memory; checkpoint so a failed run resumes.** → The board, handoffs and `NOTES.md`, each committed.
- **Watch for agents that keep going after they have enough.** → Researcher stop conditions; the usage monitor.
- **Multi-agent runs cost several times the tokens of a chat**, so they suit high-value, parallelisable work. → Parallelise only independent tasks with no overlapping files.

## Repository instructions for any agent
Sources: [agents.md](https://agents.md) and secondary guides ([Addy Osmani](https://addyosmani.com/agents/15-agents-md/), [Harness](https://www.harness.io/blog/the-agent-native-repo-why-agents-md-is-the-new-standard)).
- AGENTS.md is the cross-tool convention (Codex, Cursor, Gemini CLI, Copilot and others). Lead with commands, keep it short, and record corrected mistakes. → `AGENTS.md` holds commands, rules, never-do and lessons, and `CLAUDE.md` imports it.

## Starting a project
- **Agile inception deck**: ten questions so everyone builds the same thing. Jonathan Rasmusson, *The Agile Samurai* (book); summary in [a University of Colorado lecture](https://home.cs.colorado.edu/~kena/classes/5828/s12/lectures/10-agileprojectinception.pdf). → `docs/kickoff/AGENDA.md` part 1 and `BRIEF.md`.
- **Pre-mortem**: imagine the project has failed and explain why. Gary Klein; prospective hindsight is reported to improve risk identification by about 30% ([summary](https://theuncertaintyproject.org/tools/pre-mortem); the original paper is UNVERIFIED here). → Kickoff phase 4 and `docs/RISKS.md`, with an early signal per risk.
- **Walking skeleton**: the thinnest real slice that is built, tested and deployed end to end. Alistair Cockburn, *Crystal Clear*; ["Hello, production"](https://blog.thepete.net/blog/2019/10/04/hello-production/). → Round 1 is always the walking skeleton.
- **Kickoff meetings** should end in concrete decisions (success metric, cadence), not only alignment ([Plane](https://plane.so/blog/project-kickoff-meeting-agenda-checklist-and-examples)). → Every kickoff part has an exit criterion.

## Decisions
- **MADR**: Markdown ADRs with context, options, decision and consequences, in `NNNN-title.md` files ([MADR](https://adr.github.io/madr/); [primer](https://ozimmer.ch/practices/2022/11/22/MADRTemplatePrimer.html)). → `docs/templates/ADR.md` and ADR 0000.

## Delivery
- **DORA**: small batches, trunk-based development and continuous integration go with higher delivery performance (Forsgren, Humble and Kim, *Accelerate*, 2018; [Google Cloud DORA capabilities](https://cloud.google.com/architecture/devops)). → Small PRs, short-lived branches merged to `main` after review, identical local and CI checks.

## Repository security
- **GitHub baseline**: Dependabot alerts, secret scanning, push protection, code scanning, and a SECURITY.md ([GitHub docs](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories), **primary**).
- **OpenSSF Scorecard**: pinned actions, branch protection, least-privilege tokens ([overview](https://xebia.com/de/blog/improving-your-github-repositories-security-setup-by-adding-the-ossf-scorecard-action/)).
→ `SECURITY.md`, `.github/dependabot.yml`, actions pinned by SHA with `permissions: contents: read`, and `CODEOWNERS.example` for when a remote exists.

## From our own run
`docs/playbook/LESSONS.md`: seventeen failure modes seen in practice, each with the guard now in place.
