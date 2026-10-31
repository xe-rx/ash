# Handoff: devops-engineer
Updated: 2026-10-31 08:30 · Branch: devops-engineer/toolchain · Status: done

## Task
Qt 5.11 toolchain, QML parse check, ADR 0003 rule checks, CI stack job, docs/gitignore. Acceptance: scripts/test.sh green, shellcheck, check-qml proven on good+broken scratch QML.

## Done
- scripts/setup-qt.sh + requirements-qt511.txt: venv at $PROJECT_DATA/toolchain/qt511 (py3.8), `uv pip install --require-hashes --only-binary` with sha256 for PyQt5 5.11.3 and PyQt5-sip 4.19.19 (hashes from PyPI JSON API, all platforms of those wheels). Refuses to build inside the repo; `--check` verifies only. Fresh install into a scratch PROJECT_DATA tested (11 s); wrong-hash install tested and rejected.
- scripts/check-qml.sh + dev/qml_check.py: static scan (imports must be QtQuick only; relative .js/.qml refs and "dir" imports must exist; comments ignored) then QQmlComponent compile on Qt 5.11.2 with file:line:col errors. Also catches unknown properties and QtQuick > 2.11. Does NOT instantiate components. Single place for qb.* stubs: ALLOWED_IMPORTS / STUB_IMPORT_PATHS at top of dev/qml_check.py.
- check-file-length.sh: qml added; test in tests/test_file_length.sh.
- scripts/check-ash-rules.sh (+ dev/coord_check.py), tests/test_ash_rules.sh (36 tests incl. planted violations for every pattern); scripts/run-offline.sh (unshare -rn; works here, exit 125 if unavailable).
- scripts/test.sh fails when package.json exists without node/node_modules (tests/test_runner_guards.sh).
- CI: test job gets Node (guarded by hashFiles('package.json')), npm ci --ignore-scripts, setup-uv, setup-qt, REQUIRE_QT=1; new job ash-rules (check-ash-rules, setup-qt, check-qml). setup-node pinned v6 SHA 249970729cb0ef3589644e2896645e5dc5ba9c38 (resolved via GitHub API). Permissions read-only.
- AGENTS.md dev commands, scripts/setup.sh note, .gitignore (real config, node_modules already, screenshots/, /out/).

## Next steps
1. Core builder: add config/ash.example.json (only JSON allowed in config/), package.json (+ package-lock.json for npm cache); then check-ash-rules scans their code.
2. View builder: when .qml exists, run scripts/check-qml.sh; add the dynamic offline test using scripts/run-offline.sh around the offscreen run (item.grabToImage).
3. CI is unrun: validate on first push (see gotchas).

## Open questions / blockers
- None blocking.

## Gotchas learned
- CI has NOT run: no push is allowed. YAML parsed with pyyaml, all actions SHA-pinned; actionlint not installed so not run. Unverified: hashFiles guards, cache expression, uv installing py3.8 on the runner.
- Qt tests in tests/test_check_qml.sh skip locally without the toolchain but fail when REQUIRE_QT=1 (CI).
- Coordinate check: named keys only, decimals only (whole degrees ignored), scans app/ config/ tests/ (not docs/, as tasked; ADR 0003 mentions docs/). tests/test_ash_rules.sh is exempt from it.
- Network check scans only tracked files under app/: URLs in comments fire; use ALLOW in check-ash-rules.sh with a reason.
- .gitignore rule /config/*.json: new config JSON beyond the example needs force-add and fails the rules check by design.
- Pre-existing bug, not mine: tests/test_file_length.sh h_nongit does `local d; mk_tmp_var d` so mk_tmp_var's own local shadows it and writes /big.py (permission denied noise, test vacuous). Fix: drop the `local d`.
- shellcheck-py 0.10 flags SC2015 (info) in tests/lib.sh (pre-existing); everything I added is clean.
- qmllint/qmlscene do not exist in the wheel; only QQmlComponent compile checks run.

## Suggested skills
ci-cd-and-automation, shipping-and-launch
