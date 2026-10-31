import QtQuick 2.1

// Each prayer sits where it falls on the sun path: a marker on the path, name and time beside it.
Item {
    id: labels
    property var pal
    property var layout
    property var prayers
    property string face: "sans-serif"
    property int landTop: 420

    Repeater {
        model: labels.prayers
        Item {
            property var box: labels.layout.labels[index]
            property bool onLand: box.y >= labels.landTop
            property color ink: modelData.isNext ? (onLand ? labels.pal.accentLand : labels.pal.accentSky)
                                                 : (onLand ? labels.pal.inkLand : labels.pal.inkSky)
            property color soft: modelData.isNext ? ink : (onLand ? labels.pal.softLand : labels.pal.softSky)
            Rectangle {
                width: modelData.isNext ? 20 : 14; height: width; radius: width / 2; color: ink
                x: box.ax - width / 2; y: box.ay - height / 2
            }
            Text {
                x: box.x; y: box.y - 1; width: box.w; horizontalAlignment: Text.AlignHCenter
                text: modelData.name; color: soft; font.family: labels.face
                font.pixelSize: 17; font.weight: modelData.isNext ? Font.DemiBold : Font.Normal
            }
            Text {
                x: box.x; y: box.y + 18; width: box.w; horizontalAlignment: Text.AlignHCenter
                text: modelData.timeText; color: ink; font.family: labels.face
                font.pixelSize: 25; font.weight: modelData.isNext ? Font.Bold : Font.DemiBold
            }
        }
    }
}
