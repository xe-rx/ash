# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Closest schema value only. Ash is not a web page: it is a QML app (Qt 5.11, QtQuick primitives) on a rooted Toon 2 thermostat, 1024x600. See `docs/adr/0001-scope-and-stack.md`.

## Users
One Muslim household in the Netherlands (the PO's). They read Ash up close, at arm's length at the thermostat on the wall (PO, 2026-11-04), to see the time, where the sun is, and when the next prayer is.

## Product Purpose
An ambient idle screen that makes the day's rhythm of sun and prayer visible at a glance, as a calm picture rather than an app or a list of numbers. It works offline and shares nothing. Success: the household trusts the times and likes having it on the wall.

## Positioning
Always on the wall, already lit, offline and private. The picture is the information: the sun's real position over a desert with a family on a cloth carries the time of day, and the prayer times sit inside that picture.

## Operating Context
Mounted thermostat screen in a living space, seen day and night. The Toon still controls the heating; Ash shares its screen process and must never put that at risk.

## Capabilities and Constraints
- Shows: 24h time, sun position, five prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) in Latin names, next prayer highlighted, a countdown, the Umm al-Qura Hijri date with a +1/-1 day offset. The Hijri date changes at Maghrib (PO, 2026-11-04).
- Out: Dutch or Arabic text, adhan, notifications, settings screens, qibla, weather, animation, network use.
- Stack: QtQuick primitives only (Rectangle, Text, Image, vertical gradients). No Canvas, shaders, C++ or animation; one minute timer; small item budget (about 175 items).
- Fonts: bundled Poppins (OFL) Light, Regular and SemiBold; others need a licence check and bundling.
- Prayer method: MWL 18/17 (ADR 0002).

## Brand Commitments
- Name: Ash. Slogan: "The day's prayers, in the light of the desert."
- PO: "simple shapes, thought in colours", a simplified infographic.
- Keep: the open desert, the faceless family on a cloth, the landscape shapes (PO: "I don't mind the family and landscape").
- Gone and not to return: the circle graph of prayers on the sun path.

## Evidence on Hand
Real prayer calculations for the configured location; no testimonials or usage data exist.

## Product Principles
1. The picture carries the time; text confirms it.
2. Calm over busy: nothing moves or blinks, nothing decorative that doesn't carry light or time.
3. Trust: times are correct and readable, at 4.5:1 contrast or better.
4. Private and offline by construction.

## Accessibility & Inclusion
Text at 4.5:1 contrast or better in every sky state, across the year.
