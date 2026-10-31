# Vendored skills, agents, and commands

Third-party Claude Code files copied into this repo, pinned to the commits below and reviewed before import
(2026-10-14: scanned for network calls, secret access, and code execution; instructions read for prompt injection).
To update one: fetch the new commit, diff it against the copy here, review the diff, then re-apply the local changes listed.
Full license texts are in `.claude/licenses/`.

## Sources

| Source | Commit | License |
|---|---|---|
| [mattpocock/skills](https://github.com/mattpocock/skills) | `49dd158d1076134a641b33efb035946536778336` | MIT |
| [obra/superpowers](https://github.com/obra/superpowers) | `bb92a77741419a4ab5f06e711a283343f1ada0c3` | MIT |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | `aeac41d4d005999432bb7312f7ff06383a91d59d` | MIT |
| [trailofbits/skills](https://github.com/trailofbits/skills) | `8e54050ae63c2f62224c35b1616efe71865b4777` | CC-BY-SA-4.0 |
| [anthropics/skills](https://github.com/anthropics/skills) | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` | Apache-2.0 |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | `8d392c8169665866be1d95f2bfeda5aaae7149dd` | Apache-2.0 |

## Inventory

| Local path | Upstream path | Changes |
|---|---|---|
| `skills/grilling/` | mattpocock `skills/productivity/grilling/` | `agents/openai.yaml` dropped (Codex-only) |
| `skills/grill-me/` | mattpocock `skills/productivity/grill-me/` | same |
| `skills/grill-with-docs/` | mattpocock `skills/engineering/grill-with-docs/` | same |
| `skills/domain-modeling/` | mattpocock `skills/engineering/domain-modeling/` | same |
| `skills/to-spec/` | mattpocock `skills/engineering/to-spec/` | same |
| `skills/to-tickets/` | mattpocock `skills/engineering/to-tickets/` | same |
| `skills/setup-matt-pocock-skills/` | mattpocock `skills/engineering/setup-matt-pocock-skills/` | same |
| `skills/test-driven-development/` | superpowers `skills/test-driven-development/` | none |
| `skills/systematic-debugging/` | superpowers `skills/systematic-debugging/` | dropped authoring artifacts: `test-pressure-*.md`, `test-academic.md`, `CREATION-LOG.md` |
| `skills/verification-before-completion/` | superpowers `skills/verification-before-completion/` | none |
| `skills/api-and-interface-design/` | addyosmani `skills/api-and-interface-design/` | none |
| `skills/ci-cd-and-automation/` | addyosmani `skills/ci-cd-and-automation/` | none |
| `skills/observability-and-instrumentation/` | addyosmani `skills/observability-and-instrumentation/` | none |
| `skills/shipping-and-launch/` | addyosmani `skills/shipping-and-launch/` | none |
| `references/*-checklist.md`, `references/definition-of-done.md` | addyosmani `references/` | none (placed so the skills' `../../references/` links resolve) |
| `skills/webapp-testing/` | anthropics/skills `skills/webapp-testing/` | none |
| `skills/differential-review/` | trailofbits `plugins/differential-review/skills/differential-review/` | **modified:** agent referenced as `adversarial-modeler` instead of plugin-namespaced `differential-review:adversarial-modeler`; `agents/openai.yaml` dropped |
| `agents/adversarial-modeler.md` | trailofbits `plugins/differential-review/agents/` | none |
| `commands/diff-review.md` | trailofbits `plugins/differential-review/commands/` | none |
| `skills/supply-chain-risk-auditor/` | trailofbits `plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/` | `agents/openai.yaml` dropped. Note: its scripts query OSV, npm, PyPI, Go proxy, deps.dev, OpenSSF Scorecard, and GitHub (with your `gh` token, sent only to api.github.com) |
| `references/insecure-defaults/*.md` | trailofbits `plugins/insecure-defaults/references/` | none. Used as a reference corpus by our `security-reviewer`; the plugin's audit pipeline itself needs the plugin runtime and was not imported |
| `skills/claude-md-improver/` | claude-plugins-official `plugins/claude-md-management/skills/claude-md-improver/` | none |
| `commands/revise-claude-md.md` | claude-plugins-official `plugins/claude-md-management/commands/` | none |
| `commands/commit.md`, `commit-push-pr.md`, `clean_gone.md` | claude-plugins-official `plugins/commit-commands/commands/` | **modified:** added `disable-model-invocation: true` so only a human can trigger commits, pushes, and branch cleanup |
| `commands/review-pr.md` | claude-plugins-official `plugins/pr-review-toolkit/commands/` | **modified:** `/pr-review-toolkit:review-pr` → `/review-pr`; the `code-simplifier` agent step now uses the built-in `/simplify` skill |
| `agents/silent-failure-hunter.md`, `pr-test-analyzer.md`, `type-design-analyzer.md`, `comment-analyzer.md` | claude-plugins-official `plugins/pr-review-toolkit/agents/` | none. The toolkit's `code-reviewer` (ours is used) and `code-simplifier` (built-in `/simplify` is used) were not imported |

Trail of Bits material is licensed CC-BY-SA-4.0 (© Trail of Bits): modified versions must keep that license.

## Considered and not imported
- **anthropics `security-guidance` plugin**: Python hooks that call the Claude API on every stop/commit; too heavy to vendor. Install it as a plugin later if wanted.
- **anthropics `frontend-design`**: the globally installed `impeccable` skill covers this.
- **Superpowers / Addy Osmani as full packs**: overlapping methodologies give conflicting instructions; only the strongest individual skills were taken.
- **gstack, vercel-labs/agent-skills**: very broad and expensive (gstack); no license (Vercel).
