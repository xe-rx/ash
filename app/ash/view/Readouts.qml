import QtQuick 2.1

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
        color: pal.softSky; font.family: face; font.pixelSize: 21; font.weight: Font.Normal
    }

    Row {
        id: clock
        anchors.horizontalCenter: parent.horizontalCenter
        y: 176
        Repeater {
            model: scene.clockText.split("")
            Item {
                width: modelData === ":" ? 40 : 82; height: 130
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    y: modelData === ":" ? -22 : -14
                    text: modelData; color: pal.inkSky; font.family: face
                    font.pixelSize: 150; font.weight: Font.Light
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
