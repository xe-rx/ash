# How we work

Ash is built by a team of Claude Code agents. The user is the **product owner (PO)**. The main session is the **tech lead**; it runs the kickoff meeting once (`/kickoff`), then it plans, dispatches role agents into their own git worktrees, reviews every branch as a PR, and merges. The run never restarts: state lives in git and `docs/team/`, and every agent instance hands off to the next.

```
 user (PO) ──► /kickoff once: interview, role prep, decisions, pre-mortem,
               brief + ADRs + proposal + board (round 1 = walking skeleton)
 user (PO) ──► tech lead (main session, tech-lead skill)
            │ 1 plan round from BOARD.md (≤3 tasks)      ◄── /grill-me, architect, ADRs
            │ 2 scripts/team/worktree.sh new <role> <slug>
            ▼
   ┌─────────────┬─────────────┬─────────────┐   builders, in parallel,
   │ backend     │ frontend    │ devops ...  │   each in .worktrees/<role>-<slug>
   │ commits +   │ checkpoint  │ handoff     │   on branch <role>/<slug>
   └──────┬──────┴──────┬──────┴──────┬──────┘
          ▼             ▼             ▼
   PR review: code-reviewer (+ security-reviewer, /review-pr, /diff-review)
          │ CHANGES → back to the same builder (≤2 loops)
          ▼ APPROVE + green checks
   tech lead merges to main → updates BOARD.md + handoffs/tech-lead.md
```

## The team (`.claude/agents/`)
| Role | Kind | Preloaded skills |
|---|---|---|
| backend-engineer | builder | team-protocol, api-and-interface-design, test-driven-development, verification-before-completion |
| frontend-engineer | builder | team-protocol, test-driven-development, verification-before-completion, webapp-testing (+ `impeccable` for design) |
| devops-engineer | builder | team-protocol, ci-cd-and-automation, observability-and-instrumentation, verification-before-completion |
| test-engineer | builder | team-protocol, test-driven-development, verification-before-completion |
| docs-writer | builder | team-protocol, domain-modeling |
| architect | advisor, read-only | api-and-interface-design, domain-modeling |
| researcher | advisor, read-only, web | primary sources only, UNVERIFIED marks |
| usage-monitor | background watcher (haiku) | runs `scripts/team/usage-watch.py`, reports WRAPUP |
| debugger | advisor, read-only | systematic-debugging |
| code-reviewer, security-reviewer | reviewer, read-only | (security-reviewer uses `.claude/references/insecure-defaults/`) |
| silent-failure-hunter, pr-test-analyzer, type-design-analyzer, comment-analyzer | reviewer | dispatched by `/review-pr` |
| adversarial-modeler | reviewer | dispatched by `/diff-review` for high-risk diffs |

Builders run on sonnet with `maxTurns: 40`; advisors on opus; the researcher on sonnet. Add project-specific roles (for example a data or ML engineer) at kickoff by copying a builder file. Builders cannot spawn agents (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`).

## Git environments
- `scripts/team/worktree.sh new <role> <slug>` → branch `<role>/<slug>` in `.worktrees/<role>-<slug>` (gitignored), branched from `main`.
- Builders work only there and never push, rebase, or merge.
- `scripts/team/worktree.sh merge <role> <slug> "<message>" [--discard-data]` → checks first, then `--no-ff` merge into `main`, then removes the worktree and branch. `remove <role> <slug>` removes without merging. Both REFUSE if the worktree holds untracked or ignored data (except node_modules, .venv, caches, dist): move it to `$PROJECT_DATA` (default `~/<repo>-data`) or pass `--discard-data`.
- No GitHub remote yet, so a "PR" is a reviewed branch plus a record in `docs/team/prs/NNNN-<slug>.md`. Once a remote exists, the same flow maps onto `gh pr create`.

## Handoffs: how the run keeps existing
| Who | Where | When |
|---|---|---|
| Each builder | `docs/team/handoffs/<role>.md`, committed on its branch | After every step, at least every ~10 tool calls, and at the end (format in `team-protocol`) |
| Reviewers | Their verdict, pasted into the PR record by the tech lead | At the end of each review |
| Tech lead | `docs/team/handoffs/tech-lead.md` + `BOARD.md` on `main` | End of every round, and before its own context or usage runs out |

- A builder can be stopped at any moment (turn limit, context, usage limit). Checkpointing means the next instance loses at most one step.
- `SubagentStop` hook (`require-handoff.sh`): a builder that tries to finish without a `## Handoff` section is sent back once to write it.
- `SessionStart` hook: every new or compacted session gets the board, the tech-lead handoff, and the open worktrees, and resumes the run.

## Quality gates
| Gate | Where | Enforces |
|---|---|---|
| `guard-bash.sh` | PreToolUse | Blocks destructive commands, force push, `reset --hard`, `--no-verify` |
| `format.sh` | PostToolUse | Formats edited files with the project's own formatter |
| `check-file-length.sh` | PostToolUse + `.githooks/pre-commit` | **Code files ≤ 300 lines** (`docs/CODING_RULES.md`) |
| PR review | before every merge | Correctness, coding rules, security; BLOCKING findings stop the merge |

The pre-commit hook is wired with `git config core.hooksPath .githooks`; run that once in any fresh clone.

## Skills and commands (`.claude/skills/`, `.claude/commands/`)
Third-party ones are pinned and listed in `.claude/VENDORED.md`. *auto* = loads on its own when relevant.

| Phase | Use | What it does |
|---|---|---|
| Start a project | `/kickoff <idea>` | The predecided kickoff meeting (`docs/kickoff/AGENDA.md`) |
| Run the team | `/tech-lead`; `team-protocol` (builders) | The round loop; the builder rules and handoff format |
| Requirements | `/grill-me`, `/grill-with-docs` | Relentless interview on a plan; `-with-docs` also writes `GLOSSARY.md` and ADRs |
| Planning | `/to-spec`, `/to-tickets` | Conversation → spec → vertical-slice tickets (run `/setup-matt-pocock-skills` once first) |
| Build | `test-driven-development`, `api-and-interface-design`, `webapp-testing` *auto* | Test-first; API contracts; browser checks |
| Debug / done | `systematic-debugging`, `verification-before-completion` *auto* | Root cause first; evidence before claims |
| PR review | `/code-review` (built-in), `/review-pr`, `/security-review` (built-in), `/diff-review` | Bugs; specialist quality review; security |
| DevOps | `ci-cd-and-automation`, `observability-and-instrumentation`, `shipping-and-launch`, `supply-chain-risk-auditor` *auto* | Pipelines; telemetry; launches; dependency risk |
| Git / upkeep | `/commit`, `/commit-push-pr`, `/clean_gone`, `/revise-claude-md` | Human-triggered git; capture learnings in CLAUDE.md |

## Working habits
- **Plan mode** (Shift+Tab) for anything touching more than 5 files, schemas, or dependencies; have the architect review big plans.
- **Effort**: start normal; use `ultrathink` or `/effort high` only when an answer feels shallow (architecture, cross-module bugs).
- **Lessons**: whenever an agent gets something wrong, add a one-line rule to CLAUDE.md "Lessons Learned".
- **Cost**: at most 3 builders in parallel; don't leave runs unattended; `/cost` or `/usage` regularly; headless runs always pass `--max-turns`.
- **MCP**: none configured; `gh` covers GitHub. Add servers to `.mcp.json` only from trusted publishers, tokens via `${VAR}`.
