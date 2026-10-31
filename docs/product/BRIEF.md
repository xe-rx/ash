# Product brief: Ash

Status: draft · Owner: the PO · Source: `docs/kickoff/NOTES.md`

## Why are we here?
A Muslim household in the Netherlands wants the day's rhythm of sun and prayer visible at a glance at home, as a calm picture rather than another app or a list of numbers. The PO's rooted Toon 2 is already on the wall and already lit.

## Elevator pitch
For a Muslim household who want prayer times present in their home without looking them up, Ash is an ambient idle screen for the rooted Toon 2 that shows the time, the sun's position and the prayer times in a simple desert infographic. Unlike a phone app or a printed timetable, it is always there, works offline and shares nothing.

## Product box
- Always on the wall · Calm, simple picture · Offline and private
- Slogan: The day's prayers, in the light of the desert.

## NOT list
| In | Out | Unresolved |
|---|---|---|
| Open desert scene with a faceless family on a cloth, in simple shapes and carefully chosen colours | Oasis, detailed or realistic figures | Exact palette and composition (PO approves a screenshot in round 1) |
| 24h time, sun position, five prayer times in Latin names, next prayer highlighted | Dutch or Arabic text | Whether the dim hook works on the PO's firmware |
| Countdown, Umm al-Qura Hijri date with a +1/-1 day offset | Other calendars, moon sighting data | Whether the Toon has usable audio |
| Soft chime except at Fajr, if audio works | Full adhan, notifications, phone app, qibla, weather | Whether brightness can be controlled |
| Sky following the real sun, dark night palette | Animations, settings screens, accounts, analytics | |
| One household, one location set at install | Distribution, ToonStore, other devices, internet use | |

## Neighbours (people, data providers, services)
| Who | What we need from them | What they expect (licence, attribution, limits) |
|---|---|---|
| The PO | Device probe, install, rollback, photos, soak, religious calls | Heating keeps working; location stays home |
| Toon firmware, community tooling (`update-rooted`, Toon Software Collective) | A stable app mechanism | Own directory only; firmware may change without notice |
| `adhan-js` (test only) | Independent reference for times | MIT: keep its notice if vendored; pinned, supply-chain check |
| Umm al-Qura source data | Hijri conversion table, source to be chosen in round 3 | Licence to be verified before use; `@tabby_ai/hijri-converter` (MIT) is the candidate |
| Vereniging Imams Nederland, Bilal timetable | Reference only | No contact or redistribution needed |

## Solution sketch
```
ash.json (on the Toon only) --> core/*.js: sceneAt(nowMs, utcOffsetMinutes, config)
                                   | {clockText, sun, palette, prayers, next}
minute Timer --> QML view (QtQuick shapes) <-- tile hook opens it when the Toon dims; tap closes it
PO: ash-preflight, ash-install + guard, ash-confirm, ash-rollback over SSH
```

## Trade-off sliders
| Force | Rank (1 = holds firmest) |
|---|---|
| Quality | 1 |
| Scope | 2 |
| Time | 3 |
| Cost | Zero budget, fixed outside the ranking |

Scope gives first, in this order: chime, Hijri date, countdown. Non-negotiables (not on the sliders): correct times for the chosen method, a thermostat that keeps working, location stays on the device.

## First milestone and success measures
One stable week on the wall as the idle screen:
- Prayer times within one minute of the chosen method (automated against `adhan-js` over a full year).
- A tap always returns to the thermostat (PO, on the device).
- No crash or lost heating control across the week (PO, on the device).
- Zero network calls by Ash (automated).

About 3 rounds, though device testing could change that.

## What it's going to take (roles, hardware, budget, authority)
Default team, no extra roles. Hardware: the PO's rooted Toon 2 and this machine. Budget: none. Authority: the PO decides everything, including all religious and content questions. The team builds, reviews and merges to `main` locally, and reports a screenshot and short summary each round. Device installs, pushing to a remote, spending money and contacting anyone need the PO.

## Future features (recorded, not planned)
Oasis scene, Arabic names, full adhan, Dutch labels, sharing with other Toon owners via ToonStore, other devices.
