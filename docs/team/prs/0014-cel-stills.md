# PR 0014: Cel-shaded infographic stills v3 (tools/art/cel)

Branch: `frontend-engineer/cel-stills` · Author: frontend-engineer (Fable 5.1, xhigh) · Status: open

## Summary
New SVG art generator `tools/art/cel/` (node, no dependencies, 11 files, largest 78 lines) rendering the four cel-shaded
stills (dawn, noon, sunset, night) to `~/ash-data/screens-cel/v3/` for the PO's approval, per the PO decisions of
2026-11-12: one offset-copy shading rule for every shape (`paint.js` `cel()`), the October family restored from
`d230545` (`people.js`, guarded by a test), the times card tinted per moment with a WCAG contrast report (render exits
1 under 4.5:1), mesas kept and shaded by the same rule, the sunset sun on the app's arc end so it clears the card.
Nothing in `app/`, `tests/`, `script.js` or the Sadu `tools/art/*.js` is touched; app integration is the next PR.

## Checks
- `scripts/check-file-length.sh`: pass (tech lead, in the worktree)
- tests / lint: builder reports `node --test tools/art/cel/cel.test.js` 7/7, `node --test tests/core/*.test.js` 109/109,
  `scripts/check-ash-rules.sh` ok, `scripts/check-pii.sh` ok; tech lead to re-run in the trial merge
- handoff updated: `a4f4270`
- stills checked by the tech lead against the four PO decisions (sheet, zoom, compare-october): pass; dune bands at
  dawn/sunset on the subtle side (one number, `k.dune` in `moments.js`)
- PO review page: https://claude.ai/artifact/N219rokPKqg5PppVBfCkBR

## Reviews
### code-reviewer: APPROVE WITH NITS (HIGH on safety to merge, MEDIUM on visuals, which the reviewer did not render)
Verified correct: the `cel()` rule (`paint.js:28-31`, valid nested clipPaths, unique ids), WCAG contrast math
(`colour.js:13-22`), `ensureContrast` fallback and the CLI exit 1 on a LOW ratio (`render.js:51`), the figure geometry
table against the spec (`people.js:10-15, 31-33`), determinism (no Date/random), scope (only `tools/art/cel/*` and the
handoff), file length (max 78 lines), no dependencies. Tests 7/7 in a clone.
Nits, none blocking, folded into the integration task:
1. medium: clock and next-prayer text are drawn on the sky without a contrast check (`ui.js:35-39`); add a check against the worst sky stop behind the clock.
2. medium: the geometry test asserts the tables, not `partShape()`/draw order (`cel.test.js:34-48`); render the father's lap and compare rect attributes.
3. low: no test that the SHADE band lies away from the light for L = (+1, …) (`cel.test.js:21-31`).
4. low (port): `render.js:56` runs `main()` at load and reads argv; guard with `require.main === module`, export `render(outDir)`.
5. low: fontconfig is written to `dataDir/screens-cel` regardless of `outDir` (`render.js:19-26`).
6. trivial: `Math.min(8, …)` figure shade cap is undocumented (`people.js:55`).

### security-reviewer: not required (no input handling, network, secrets or dependencies)

## Resolution
Waiting on the PO's verdict on the stills and the code review.
