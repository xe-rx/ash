import QtQuick 2.1
import "../core/clock.js" as Clock

// The 24h time, large and cream, and under it the next prayer as a woven cream tag with its countdown.
// Each clock character sits by its ink (core/clock.js), so gaps are even and the colon is fixed
// (Qt 5.11 has no tabular figures).
Item {
    id: readouts
    width: 1024; height: 600
    property var pal
    property var scene
    property string face: "sans-serif"
    property string rest: scene.next ? scene.next.countdownText.substring(scene.next.name.length + 1) : ""

    Repeater {
        model: Clock.clockGlyphs(scene.clockText)
        Text {
            x: modelData.x; y: Clock.clockTextY(modelData.colon)
            text: modelData.ch; color: pal.inkSky; font.family: face
            font.pixelSize: Clock.CLOCK_PX; font.weight: Font.DemiBold
        }
    }

    Row {
        visible: scene.next !== null
        x: Clock.CLOCK_CX - width / 2; y: Clock.COUNTDOWN_Y; spacing: 16
        Rectangle {
            width: tagName.width + 2 * Clock.TAG_PAD; height: Clock.COUNTDOWN_H; color: pal.tagFill
            Text {
                id: tagName
                anchors.centerIn: parent
                text: scene.next ? scene.next.name : ""; color: pal.tagInk; font.family: face
                font.pixelSize: Clock.COUNTDOWN_PX; font.weight: Font.DemiBold
            }
        }
        Text {
            height: Clock.COUNTDOWN_H; verticalAlignment: Text.AlignVCenter
            text: readouts.rest; color: pal.inkSky; font.family: face
            font.pixelSize: Clock.COUNTDOWN_PX; font.weight: Font.Normal
        }
    }
}
