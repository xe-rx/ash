# Kickoff notes: Ash

Started: 2026-10-31 06:51 · Phase: 1 interview

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

## Decisions
| # | Decision | Options | Inputs | Recommendation | PO choice | ADR |
|---|---|---|---|---|---|---|

## Open questions for the PO
