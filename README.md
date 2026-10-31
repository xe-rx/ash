# Ash

<one-paragraph pitch from docs/product/BRIEF.md>

## Run it
```bash
scripts/setup.sh      # once per clone
# <stack commands, filled in at kickoff>
```

## How this repo is built
A team of Claude Code agents run by a tech lead (the main session), with the user as product owner. Start Claude Code in the repo root; a new project begins with `/kickoff <idea>`, after that `/tech-lead` resumes the run. Guide: [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

## Where things live
| Path | What |
|---|---|
| [`docs/product/BRIEF.md`](docs/product/BRIEF.md) | What we build and why |
| [`docs/adr/`](docs/adr/) | Decisions |
| [`docs/proposals/`](docs/proposals/) | Plans approved by the PO |
| [`docs/team/`](docs/team/) | Board, handoffs, PR records, outbox |
| [`docs/CODING_RULES.md`](docs/CODING_RULES.md) | Rules for all code |
| [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md) | Instructions for coding agents |
