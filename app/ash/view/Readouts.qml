import QtQuick 2.1
import "../core/geometry.js" as Geo

// The 24h time (largest, in fixed digit cells so it never shifts), the next prayer with its
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

    Row {
        id: clock
        anchors.horizontalCenter: parent.horizontalCenter
        y: 176
        Repeater {
            model: Geo.clockCells(scene.clockText)
            Item {
                width: modelData; height: 130
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    y: modelData === Geo.COLON_CELL ? -22 : -14
                    text: scene.clockText.charAt(index); color: pal.inkSky; font.family: face
                    font.pixelSize: Geo.CLOCK_PX; font.weight: Font.Medium
                }
            }
        }
    }

    Text {
        y: 336; width: 1024; horizontalAlignment: Text.AlignHCenter
        text: scene.next ? scene.next.countdownText : ""
        color: pal.accentSky; font.family: face; font.pixelSize: 34; font.weight: Font.DemiBold
    }
}
