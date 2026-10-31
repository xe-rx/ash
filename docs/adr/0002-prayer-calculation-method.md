# 0002. Calculate prayer times with MWL 18/17, an angle-based summer rule and standard Asr

Status: accepted 2026-10-31 · Deciders: the PO, tech lead

## Context and problem
Prayer times are calculated offline on the device (Q3), and must be correct for the chosen method (Q15). At 52.09 N the sun does not reach 18 degrees below the horizon from 20 May to 23 July, or 17 degrees from 25 May to 18 July, so a high-latitude rule is required. The Vereniging Imams Nederland statement of 20 May 2015 says most mosques in the Netherlands and Europe follow the timetable set by the Bilal Islamic Centre in Germany, and gives Fajr 03:20 and Isha 23:49 for 1 June, without naming a city.

## Considered options
Calculated for Utrecht centre, 1 June (low-precision measurement in `docs/kickoff/NOTES.md`):
1. MWL + angle-based: Fajr 03:08, Isha 23:58.
2. MWL + seventh of the night: Fajr 04:19, Isha 22:54.
3. A mosque's published timetable as a yearly data file.
4. A 12 degree method (the 1 June Bilal figures imply about 12 degrees here, on a single data point).

## Decision
Chosen by the PO: MWL (Fajr 18 degrees, Isha 17 degrees) with the angle-based high-latitude rule (night portions of 18/60 and 17/60), and standard Asr (shadow length 1x), because it is the closest calculated option to the Bilal figures among those compared and is a named, reproducible method. This is a religious choice and belongs to the PO.

## Consequences
- Good: offline, no yearly data file, independently testable against `adhan-js` to within a minute.
- Bad: it differs from the Bilal figures by 9-12 minutes on the one date we can compare, and may differ from a specific mosque's timetable. The rule also moves Fajr and Isha outside the 18/17 gap: on 1 August, Fajr is 03:28 rather than the raw 03:02.
- Risks and how we will notice: Isha falls after midnight in late June (00:07 on 21 June), so the core must handle a prayer on the next calendar date; covered by golden tests. See `docs/RISKS.md` R3 and R4.

## More information
`docs/kickoff/NOTES.md` (Q3, D1, D2). https://www.arrahmaan.nl/2015/06/24/verklaring-omtrent-tijdstip-van-isha-fajr-en-imsaak-in-nederland/ · https://github.com/batoulapps/adhan-js/blob/develop/METHODS.md
