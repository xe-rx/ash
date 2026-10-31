# Proposal 0001: Ash, an ambient prayer screen for the Toon 2

Status: approved by the PO 2026-10-31, no changes · Author: tech lead

## Summary (5 lines the PO can read alone)
Ash shows a simple desert scene with a faceless family on a cloth, the time, the sun's position and the prayer times on your rooted Toon 2.
It runs offline, keeps your location on the Toon, and never changes Toon's firmware files.
It starts by opening from a tile. The automatic idle-screen part comes in round 2, after a test on your device, and isn't proven yet.
You run every install and rollback yourself; the team tests everything it can off-device first.
The first milestone is one stable week on the wall, in about 3 rounds, at no cost.

## What we will build first
**Round 0, you:** run the read-only probe below and send the output. The team then pins the Qt version and screen size, and sees whether custom apps already load.

**Round 1, walking skeleton:** a tile opens a full-screen view with the 24h time, the sun's position and one real prayer time (Dhuhr), in a first flat version of the scene. Includes the tested core, screenshots at 1024x600, CI checks, and install, guard, confirm and rollback scripts. You install it, check it, roll it back once, and send a photo. You also approve the look at this point.

**Round 2, the real thing:** all five prayers with the next highlighted, the full scene with the sky following the sun and the night palette, and the dim hook tested on your device. You rehearse a GUI failure to confirm heating continues.

**Round 3, extras and the soak:** countdown, Hijri date, and the chime if audio works, then the one-week run on the wall.

## Decisions taken (and the ADRs)
| # | Decision | Why | ADR |
|---|---|---|---|
| D3 | Self-contained QML app; tile, then dim hook; no firmware edits | Smallest option that reaches the idle screen; an update can at worst remove Ash | 0001 |
| D4 | Our own ES5 calculation core; `adhan-js` only in tests | No third-party code in the thermostat's screen process | 0001 |
| D5 | Qt screenshots + your photo as UI evidence | Ash doesn't run in a browser | 0001 |
| D1 | MWL 18/17 with the angle-based summer rule | Closest calculated option to the Bilal figures we could compare | 0002 |
| D2 | Standard Asr | Your choice | 0002 |
| Q13 | No network; rounded location on the Toon only | Nothing about your home leaves it | 0003 |

## Decisions we need from you
1. Approve this proposal.
2. Run the probe when convenient (read-only, and it doesn't print your location or serial number). Replace `<toon-ip>`, and look over the output before pasting it:

```sh
ssh root@<toon-ip> 'uname -a; cat /etc/os-release; grep -E "Hardware|model name" /proc/cpuinfo | sort -u; grep MemTotal /proc/meminfo; df -h /; ls -ld /qmf /HCBv2; ls /qmf/qml/apps /HCBv2/qml/apps; ls /usr/lib | grep -i Qt5 | head -40; ls /usr/lib/qt5/qml /usr/lib/qt5/qml/QtQuick*; ls /dev/snd; cat /proc/asound/cards; which aplay mpg123; ls /sys/class/backlight; date; ps | grep -iE "ntp|happ_|qt-gui"; grep -n qt /etc/inittab'
```

Some of these paths may not exist on your Toon, and "No such file" lines are useful answers.

## Risks we are watching
Full register: `docs/RISKS.md`.
- **The dim hook fails on your firmware (R1).** Tested early in round 2. If it fails, Ash stays tile-opened, the idle-screen goal isn't met, and I come back to you for a decision.
- **An install or a hang affects the thermostat's screen (R2).** Ash stays in its own directory, an install rolls itself back unless you confirm it, and you rehearse failure before the soak.
- **Times disagree with your mosque (R3).** Automated checks cover the method, but only you can compare with your mosque. On the one date we could compare, the method was 9-12 minutes from the Bilal figures, so I'll ask you to check a few dates before the soak.

## Deliberately left for later
Oasis scene, Arabic names, full adhan, Dutch labels, sharing via ToonStore, other devices. Automatic firmware patching stays out unless you decide otherwise.

## Cost and time
No hosting, API or compute costs. About 3 rounds; nothing runs unattended except the install guard on your Toon. Each round needs a device step from you (install, check, photo), which I'll batch together. The Qt toolchain isn't installed on this machine yet, so round 1 starts with getting a matching Qt running here. Whether Qt 5.11 can be installed easily is unverified.
