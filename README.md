# Ash

Ash is an ambient idle screen for a rooted Toon 2. It shows the time, the sun's position and the prayer times in a simple desert picture, always on the wall, offline and sharing nothing. It is for a Muslim household in the Netherlands. Product brief: [`docs/product/BRIEF.md`](docs/product/BRIEF.md).

**Status:** Ash runs on a computer today, in a 1024x600 window. There is no Toon installation yet: device work is on hold until the product owner has access to the Toon.

## Run it locally
```bash
scripts/setup.sh       # once per clone: git hooks, tool checks
scripts/setup-qt.sh    # once: Qt 5.11 toolchain in ~/ash-data (needs uv and network the first time)
scripts/run-local.sh   # live window; Esc closes it
scripts/run-local.sh --at "2026-06-21 04:00" --speed 60   # start at that time, 60 simulated minutes per second
scripts/screenshot.sh --at "2026-06-21 13:00"             # no window: PNG in ~/ash-data/screens
```
- `--at "YYYY-MM-DD HH:MM"` freezes the clock at that local time. With `--speed N` it starts there and runs N simulated minutes per real second. `--speed` needs `--at`.
- `run-local.sh` needs a display (`DISPLAY` or `WAYLAND_DISPLAY`). Without one it says so and exits. On WSL2 use WSLg or an X server.
- The time zone is forced to Europe/Amsterdam.
- Screenshots always use the example config unless you pass `--config FILE`. `scripts/screenshot.sh --sheet` renders 21 June and 21 December.

### Set your own location
```bash
cp config/ash.example.json config/ash.json   # then edit place, lat, lon, hijriOffsetDays
```
`config/ash.json` is gitignored and `run-local.sh` uses it when present. Keep your real location out of git ([ADR 0003](docs/adr/0003-offline-and-location-privacy.md)). The tracked example is Dom Tower, Utrecht.

## Run the tests
```bash
npm ci
REQUIRE_QT=1 scripts/test.sh
```

## How the prayer times are calculated
Ash calculates the times on the device from your latitude, longitude and the date. Method: MWL (Fajr 18 degrees, Isha 17 degrees), standard Asr, and an angle-based rule in summer when the sun does not get low enough ([ADR 0002](docs/adr/0002-prayer-calculation-method.md)). These are calculated times, not a published timetable. Compare them with your household's mosque.

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
