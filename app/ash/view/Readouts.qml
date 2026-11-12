import QtQuick 2.1
import "../core/clock.js" as Clock

// The 24h time, large, and under it one plain line with the next prayer and its countdown ("Dhuhr in 9 h 00 min"),
// both in the clock ink over a hard shadow (core/clock.js SHADOW). Each clock character sits by its ink
// (core/clock.js), so gaps are even and the colon is fixed (Qt 5.11 has no tabular figures). All shadows are
// drawn before any ink, so a shadow never falls on a neighbouring glyph.
Item {
    id: readouts
    width: 1024; height: 600
    property var pal
    property var scene
    property string face: "sans-serif"
    property var glyphs: Clock.clockGlyphs(scene.clockText)
    property string countdown: scene.next ? scene.next.countdownText : ""

    Repeater {
        model: readouts.glyphs
        Text {
            x: modelData.x + Clock.SHADOW; y: Clock.clockTextY(modelData.colon) + Clock.SHADOW
            text: modelData.ch; color: pal.clockShadow; font.family: face
            font.pixelSize: Clock.CLOCK_PX; font.weight: Font.DemiBold
        }
    }
    Text {
        visible: scene.next !== null
        x: Clock.CLOCK_CX - width / 2 + Clock.SHADOW; y: Clock.COUNTDOWN_Y + Clock.SHADOW
        text: readouts.countdown; color: pal.clockShadow; font.family: face
        font.pixelSize: Clock.COUNTDOWN_PX; font.weight: Font.Normal
    }

    Repeater {
        model: readouts.glyphs
        Text {
            x: modelData.x; y: Clock.clockTextY(modelData.colon)
            text: modelData.ch; color: pal.inkSky; font.family: face
            font.pixelSize: Clock.CLOCK_PX; font.weight: Font.DemiBold
        }
    }
    Text {
        visible: scene.next !== null
        x: Clock.CLOCK_CX - width / 2; y: Clock.COUNTDOWN_Y
        text: readouts.countdown; color: pal.inkSky; font.family: face
        font.pixelSize: Clock.COUNTDOWN_PX; font.weight: Font.Normal
    }
}
