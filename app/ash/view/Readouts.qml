import QtQuick 2.1
import "../core/clock.js" as Clock

// The 24h time and the next prayer with its countdown, in the open sky under the sun's arc.
// Each clock character sits by its ink (core/clock.js), so gaps are even and the colon is fixed.
Item {
    id: readouts
    width: 1024; height: 600
    property var pal
    property var scene
    property string face: "sans-serif"

    Repeater {
        model: Clock.clockGlyphs(scene.clockText)
        Text {
            x: modelData.x; y: Clock.clockTextY(modelData.colon)
            text: modelData.ch; color: pal.inkSky; font.family: face
            font.pixelSize: Clock.CLOCK_PX; font.weight: Font.Medium
        }
    }

    Text {
        x: 0; y: Clock.COUNTDOWN_Y; width: 2 * Clock.CLOCK_CX; horizontalAlignment: Text.AlignHCenter
        text: scene.next ? scene.next.countdownText : ""
        color: pal.accentSky; font.family: face; font.pixelSize: Clock.COUNTDOWN_PX; font.weight: Font.DemiBold
    }
}
