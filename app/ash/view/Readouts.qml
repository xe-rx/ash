import QtQuick 2.1
import "../core/geometry.js" as Geo

// The 24h time (largest, placed by ink so gaps are even and the colon never moves), the next prayer with its
// countdown, and the quiet Hijri date. All on the sky, inside the sun's arc.
Item {
    id: readouts
    width: 1024; height: 600
    property var pal
    property var scene
    property string face: "sans-serif"

    Text {
        y: 14; width: 1024; horizontalAlignment: Text.AlignHCenter
        text: scene.hijri ? scene.hijri.text : ""
        color: pal.softSky; font.family: face; font.pixelSize: 24; font.weight: Font.Normal
    }

    // Each character sits by its ink (core/geometry.js), so the gaps are even and the colon is fixed.
    Repeater {
        model: Geo.clockGlyphs(scene.clockText)
        Text {
            x: modelData.x; y: 176 + (modelData.colon ? -22 : -14)
            text: modelData.ch; color: pal.inkSky; font.family: face
            font.pixelSize: Geo.CLOCK_PX; font.weight: Font.Medium
        }
    }

    Text {
        y: 336; width: 1024; horizontalAlignment: Text.AlignHCenter
        text: scene.next ? scene.next.countdownText : ""
        color: pal.accentSky; font.family: face; font.pixelSize: 34; font.weight: Font.DemiBold
    }
}
