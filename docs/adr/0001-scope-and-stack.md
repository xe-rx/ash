# 0001. Build Ash as a self-contained QML app on the rooted Toon 2, without modifying firmware files

Status: accepted 2026-10-31 · Deciders: the PO, tech lead

## Context and problem
Ash is an ambient idle screen for one household, on a rooted Eneco Toon 2 (Q1, Q2, Q11). The Toon still controls the heating, and keeping it working is non-negotiable (Q15). Toon apps run as QML inside the firmware's `qt-gui` process, so an Ash failure can affect the thermostat's screen. Community sources report a 1024x600 screen and Qt 5.11; none of this is confirmed on the PO's device. The team never touches the device: the PO runs install and rollback (Q6).

## Considered options
1. Tile-opened QML app in its own directory.
2. The same app, plus a tile hook that opens Ash full screen when the Toon dims, as the community app JackV2020/life does.
3. Patching the firmware's dim screen or `.rcc` resource files.
4. A second Qt process over `qt-gui` (rejected in prep: framebuffer and touch contention, unconfirmed runtime).

## Decision
Chosen: option 2, delivered in steps (tile-opened in round 1, dim hook in round 2 after a device test), because it is the smallest option that meets the idle-screen goal (Q5, Q16) and touches only Ash's own files. Firmware files are never modified. If the hook fails on the device, Ash stays tile-opened until the PO decides otherwise; option 3 needs a new PO decision.

Stack:
- View: QML with QtQuick primitives only. No Canvas, no C++ plugin, one minute timer, no animations.
- Core: our own ES5 JavaScript with no clock or QML access, tested in Node. `adhan-js` (MIT) is a test-only reference and never ships to the device.
- Device scripts: POSIX `sh`, tested against a fake root.
- UI evidence: offscreen Qt screenshots at 1024x600 plus a PO photo for device-level checks. This replaces the browser rule in `AGENTS.md`, because Ash does not run in a browser.

## Consequences
- Good: a firmware update can at worst remove Ash and restore the stock screen. No third-party code runs in the thermostat's screen process.
- Bad: one permanent tile on the home screen. Ash shares `qt-gui`, so a hung JS loop freezes the UI. We own the calculation code. `qb.*` is stubbed off-device, so adapters are proven only on the Toon.
- Risks and how we will notice: see `docs/RISKS.md` R1, R2 and R5. The round 0 probe and the PO's rehearsal of GUI death and rollback are the first signals.

## More information
`docs/kickoff/NOTES.md` (Q1, Q5, Q6, Q11, Q15, Q16, D3, D4, D5). https://github.com/JackV2020/life · https://github.com/ToonSoftwareCollective/toonsim · https://github.com/batoulapps/adhan-js
