# Team board: Ash

Round: 0 (kickoff, awaiting approval) · PO: the user · Tech lead: main session

## Roster
| Role | Kind | Status |
|---|---|---|
| tech lead | main session | active |
| backend-engineer, frontend-engineer, devops-engineer, test-engineer, docs-writer | builders | idle |
| architect, debugger, researcher | advisors (read-only) | idle |
| code-reviewer, security-reviewer (+ /review-pr specialists) | reviewers (read-only) | idle |
| usage-monitor | background watcher | idle |

## Waiting on the PO
- [ ] Approve `docs/proposals/0001-ash-ambient-prayer-screen.md`
- [ ] Round 0: run the read-only device probe in the proposal and send the output

## Running jobs and servers
| What | PID file | Log | Restart with | Done when |
|---|---|---|---|---|

## Backlog
Nothing starts until the PO approves the proposal.

### Top risk mitigations (from `docs/RISKS.md`)
- [ ] R1: test the dim hook on the device early in round 2, with the fallback already agreed
- [ ] R2: guard with auto-rollback, plus the PO's GUI-death and rollback rehearsal before the soak
- [ ] R3: full-year golden tests against `adhan-js`, plus the PO's check against their mosque

### Round 1: walking skeleton
Depends on the probe output for the Qt version and resolution.
- [ ] **Toolchain (devops-engineer).** Pinned Qt matching the probe runs offscreen here and in CI, or the gap is reported; `qml` added to `CODE_EXT` in `scripts/check-file-length.sh` with a test; stack job in CI; stack commands in `AGENTS.md`. Done when: CI config and `scripts/test.sh` run the stack checks, and a test QML file over 300 lines fails.
- [ ] **Core (frontend-engineer).** `sun.js`, `prayer.js`, `scene.js`, `config.js` in ES5. Done when: Dhuhr and sun position match `adhan-js` within a minute across a year at the example location, DST days pass, and invalid config returns an error state.
- [ ] **View and tile (frontend-engineer).** A tile opens a full-screen view with time, sun, Dhuhr and a first flat scene; tap closes it. Done when: harness screenshots at the probed resolution are checked, and the PO approves the look.
- [ ] **Packaging and device scripts (devops-engineer).** Preflight, install, guard, confirm, rollback, `package.sh`. Done when: fake-root tests prove only Ash's paths change, and that a missed confirm rolls back; a package with a real config is refused.
- [ ] **Offline and privacy checks (test-engineer).** Static network test, run under `unshare -n` or `strace`, coordinate check. Done when: planted violations fail each check.
- [ ] **README and `docs/INSTALL.md` (docs-writer).** Done when: a new engineer can run the tests and harness, and the PO can follow install and rollback.
- [ ] **Device check (PO).** Install, open from the tile, tap back, thermostat works, roll back, reinstall, send a photo.

### Round 2: the real thing
- [ ] All five prayers with next highlighted. Done when: Fajr, Asr, Maghrib and Isha match `adhan-js` (MWL, TwilightAngle, standard Asr) within a minute across a year, including Isha after midnight.
- [ ] Full scene: faceless family on a cloth, sun on its path, sky colours, night palette, burn-in shift. Done when: screenshots at dawn, noon, sunset and night are checked and the PO approves.
- [ ] Dim hook. Done when: on the PO's Toon, Ash opens on dim and a tap always returns to the thermostat, or the failure is reported for a PO decision.
- [ ] PO rehearsal: GUI failure and rollback, heating continues.

### Round 3: extras and the soak (cut order if needed: chime, Hijri date, countdown)
- [ ] Countdown to next prayer, correct across midnight.
- [ ] Hijri date: Umm al-Qura with a +1/-1 config offset, checked against a licence-verified source table.
- [ ] Soft chime except at Fajr, only if the probe shows usable audio.
- [ ] PO compares a few dates with their mosque.
- [ ] One-week soak with the PO's report. Done when: the first milestone in `docs/product/BRIEF.md` is met.

## In progress
| Task | Role | Branch | Worktree | Status |
|---|---|---|---|---|

## In review

## Done
- Kickoff phases 1-4; outputs drafted on branch `tech-lead/kickoff`
