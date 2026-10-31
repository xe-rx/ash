# 0000. Record architecture decisions

Status: accepted · Deciders: the PO, tech lead

## Context and problem
Agents lose context between sessions. Decisions that are expensive to change must survive in the repo, with their reasons, so later agents don't relitigate or silently reverse them.

## Considered options
1. Markdown ADRs in `docs/adr/` (MADR-style). 2. Decisions in the board and handoffs only. 3. An external wiki.

## Decision
Chosen: option 1. One file per decision, `NNNN-short-title.md`, from `docs/templates/ADR.md`. Superseded ADRs stay, marked "superseded by NNNN".

## Consequences
- Good: decisions are versioned with the code and readable by every agent.
- Bad: someone must notice when a change needs one. The tech-lead skill and reviewers check this.

## More information
MADR: https://adr.github.io/madr/
