# Glossary: Ash

- **Toon 2**: the Eneco wall thermostat that Ash runs on. Rooted means the owner has shell access.
- **`qt-gui`**: the Toon process that runs the thermostat's screen, and Ash with it.
- **Tile**: a small widget on the Toon home screen. Ash has one, which opens the scene and hosts the dim hook.
- **Dim**: the Toon's idle state when nobody is touching it. Ash is shown in this state.
- **Dim hook**: the tile logic that opens Ash full screen when the Toon dims.
- **Scene**: the desert picture. Its state is a pure function of time and config.
- **Core**: the pure ES5 JavaScript that calculates the sun, prayers, Hijri date and scene state.
- **Prayer times**: Fajr, Dhuhr, Asr, Maghrib, Isha, always spelled this way.
- **Next prayer**: the first prayer after now. It may fall on the next calendar date.
- **Method**: the rules that fix Fajr and Isha angles and Asr. Ash uses MWL 18/17 (ADR 0002).
- **High-latitude rule**: what sets Fajr and Isha when the sun doesn't get low enough. Ash uses angle-based, which `adhan-js` calls `TwilightAngle`.
- **Umm al-Qura**: the calendar Ash uses for the Hijri date, with a +1/-1 day offset in config.
- **Probe**: the read-only device check in round 0.
- **Guard**: the detached script that rolls back an install unless the PO confirms it.
- **Soak**: the one-week run on the wall that makes up the first milestone.
