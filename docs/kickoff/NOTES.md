# Kickoff notes: Ash

Started: 2026-10-31 06:51 · Phase: done (approved by the PO 2026-10-31)

## Idea
Ambient background app for muslims, infographic style situated in the desert, with a cloth (or maybe oasis) where a muslim family sits. It shows off the time, and sun position with prayer times thats it. Will be ran on the Toon screen (touchplay version) netherlands.

## Decisions from the interview
| # | Question | PO answer (own words) | Recommendation given |
|---|---|---|---|
| Q1 | Which device? ("touchplay" not found as a product name in search) | Eneco Toon, rooted | Native QML app if it is a rooted Toon |
| Q2 | First audience? | My home only | My home only |
| Q3 | How are prayer times determined? | Calculate on the device; researcher compares methods and the PO picks one | Calculate, tuned to match the PO's mosque |
| Q4 | Scene and family? | Open desert, cloth, faceless. "Note style needs to be simple shapes, thought in colours, like I said simplified infographic style" | Oasis + cloth, faceless |
| Q5 | How does Ash appear on the Toon? | Idle screen, tap to exit (firmware support still to be checked by the architect) | Idle screen, tap to exit |
| Q6 | How do builds reach the Toon? | PO runs the install script; the team never touches the device | PO runs the script |
| Q7 | Language and clock? | Latin names (Fajr, Dhuhr, Asr, Maghrib, Isha), 24h | Latin names, 24h |
| Q8 | Extras beyond time, sun position and prayer times? | Countdown to next prayer, Adhan or a sound, Hijri date | None for the first milestone |
| Q9 | What sound plays, if the Toon has usable audio (unverified)? | Soft chime at each prayer, not Fajr | Soft chime, not Fajr |
| Q10 | Which Hijri calendar? | Umm al-Qura, calculated on the device, with a +1/-1 day config offset | Umm al-Qura + offset |
| Q11 | Which Toon generation? | Toon 2 | (fact from the PO) |
| Q12 | What may the team do without asking? | Build, review and merge to main locally; screenshot and short report each round. Device install, remote push, spending and contacting anyone need the PO | Merge locally, report rounds |
| Q13 | Where is the home location stored? | Coordinates rounded to about 1 km, in a config file only on the Toon; the repo holds a generic example | Rounded, on device only |
| Q14 | Night behaviour? | Dark night palette; time and next prayer stay readable (brightness control unverified) | Dark night palette |
| Q15 | What gives first? | Cut extras, keep quality: chime, then Hijri date, then countdown. No deadline, no budget. Non-negotiables: correct times for the chosen method, thermostat keeps working, location stays on the device | Cut extras, keep quality |
| Q16 | First milestone? | One stable week on the wall as the idle screen: times within a minute of the chosen method, tap always returns to the thermostat | One stable week on the wall |

## Role prep
| Role | Question | Summary of findings | Link |
|---|---|---|---|
| security-reviewer | What do we protect, from whom, what must never leave? | Priority asset is heating control: Ash is additive and never overwrites stock QML. Zero network calls, enforced by a static grep test plus a dynamic test under `unshare -n` or strace. Real config gitignored, example uses a public landmark, check rejects coordinates with more than 2 decimals. Never log config values. Installer: `set -euo pipefail`, fixed paths, backup first, `--dry-run`, idempotent, atomic rename, preflight and post-check, tested only against a fake root. Vendored JS pinned with hash and licence in `.claude/VENDORED.md`; prefer writing the calculation ourselves. ToonStore route needs an ADR. Unverified: Toon SSH setup, idle hook, exposed services, recovery options. | this table |
| researcher | Toon 2 platform, app mechanics, prayer methods, offline code | Community sources only: 1024x600, i.MX6 SoloX, Qt 5.11, `import QtQuick 2.1`; apps in `/HCBv2/qml/apps/<name>/` (`/qmf/qml/apps/` in one README), registered via `registry.registerWidget`; `toonsim` (MIT) simulator exists. **Unverified:** idle-screen hook for third-party apps (no example found; FreeToon replaces the whole GUI), audio, brightness, RAM, Canvas/Shapes availability, effect of firmware updates. Prayer: Vereniging Imams Nederland 2015 statement says most Dutch mosques follow the Bilal Mosque (Germany) timetable, 18 degree Fajr not reached roughly 19 May to 24 July. Recommends MWL 18/17, standard Asr, SeventhOfTheNight, for the PO to confirm. adhan-js MIT v4.4.6 (QML engine compatibility unverified); PrayTimes.js LGPL; @tabby_ai/hijri-converter MIT (match with official table unverified). No sourced within-a-minute reference yet. Device checks listed as read-only SSH commands in the report. **Two claims corrected by the tech lead below.** | this table |
| architect | 2-3 architectures, smallest viable | A: tile-opened QML app (smallest). **B: A + tile `onVisibleChanged` opens the full screen during dim, as JackV2020/life does (smallest that meets Q5 and Q16; recommended, on the PO's firmware unverified).** C: patch firmware `.rcc` (rejected: updates overwrite it, mismatch could stop the GUI). Second Qt process rejected. Ash shares the `qt-gui` process, so a hung JS loop freezes the UI; heating should survive GUI death (rehearse). QML primitives, one minute Timer, no animation, plus or minus 4 px shift for burn-in. ES5 pure core `sceneAt(nowMs, utcOffsetMinutes, config)` tested in Node. Offscreen `qmlscene` screenshots with `qb.*` stubs; no emulator confirmed by the architect, though the researcher found `toonsim`. Install: staged release, symlink swap, detached guard rolls back unless confirmed within 15 min. Found: `qml` missing from `CODE_EXT` in `scripts/check-file-length.sh`. | this table |

### Tech lead measurement: Fajr and Isha at a generic Dutch location (Utrecht centre, 52.09 N, 5.12 E)
Low-precision throwaway calculation, not validated against a library. Isha and Fajr rules applied the way adhan-js describes them (the rule's limit replaces the angle time whenever it is tighter).

| Date | Lowest sun | Sunrise, sunset | MWL + seventh of night (Fajr, Isha) | MWL + angle-based (Fajr, Isha) |
|---|---|---|---|---|
| 21 Mar | -37.6 | 06:39, 18:53 | 04:58, 20:34 | 04:43, 20:42 |
| 1 May | -22.7 | 06:09, 21:04 | 04:51, 22:21 | 03:35, 23:25 |
| 1 Jun | -15.8 | 05:24, 21:49 | 04:19, 22:54 | 03:08, 23:58 |
| 21 Jun | -14.5 | 05:18, 22:03 | 04:16, 23:05 | 03:08, 00:07 |
| 1 Aug | -20.0 | 06:01, 21:30 | 04:48, 22:43 | 03:28, 23:55 |
| 21 Dec | -61.3 | 08:45, 16:29 | 06:39, 18:28 | 06:39, 18:28 |

18 degrees is not reached 20 May to 23 July at this latitude (65 days); 17 degrees 25 May to 18 July.

Corrections to the researcher's report, checked against the statement itself:
- The researcher said seventh of night matches Bilal-style practice most closely. It does not: the statement's Bilal figures for 1 June are Fajr 03:20 and Isha 23:49 (city not named), about an hour from seventh of night (04:19, 22:54) and 9-12 minutes from angle-based (03:08, 23:58). Those figures imply a sun about 12 degrees below the horizon at this location. They are one data point for an unnamed city.
- The researcher attributed the "18 degrees not reached 19 May to 24 July" claim to the statement. The statement only gives a Fajr time of 02:02 at 18 degrees for that period; the dates above are our own calculation.
- The statement (Vereniging Imams Nederland, 20 May 2015) offers three options for summer Isha outside Ramadan: right after Maghrib, the Bilal timetable, or about 90 minutes after Maghrib.

## Decisions
| # | Decision | Options | Inputs | Recommendation | PO choice | ADR |
|---|---|---|---|---|---|---|
| D1 | Fajr and Isha method | MWL + angle-based; MWL + seventh of night; a 12 degree method; a mosque's Bilal timetable as data | Researcher, tech lead measurement | MWL 18/17 + angle-based: closest calculated option to Bilal practice | MWL + angle-based | 0002 |
| D2 | Asr rule | Standard; Hanafi | Researcher | Standard, unless the family follows Hanafi | Standard | 0002 |
| D3 | Architecture | A tile; B tile + dim reopen; C firmware patch | Architect | B, delivered as A in round 1 and the hook in round 2 after a device test | Tile + dim hook, in steps; one permanent tile accepted | 0001 |
| D4 | Calculation code | Own small ES5 core checked against adhan-js in tests; vendored adhan-js | Researcher, architect, security-reviewer | Own core, with adhan-js as a test-only reference | Own core, adhan-js in tests only | 0001 |
| D5 | UI evidence | Offscreen Qt screenshots + PO photo, in place of the browser rule | Architect | Accept: the app does not run in a browser | Qt screenshots + PO photo | 0001 |

## Open questions for the PO
