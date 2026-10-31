import QtQuick 2.1
import "../core/geometry.js" as Geo
import "../core/palette.js" as Palette

// Each prayer sits where it falls on the sun path: a marker on the path, name and time beside it.
Item {
    id: labels
    property var pal
    property var layout
    property var prayers
    property string face: "sans-serif"

    Repeater {
        model: labels.prayers
        Item {
            property var box: labels.layout.labels[index]
            property var colors: Palette.labelColors(labels.pal, Geo.onLand(box), modelData.isNext)
            property color ink: colors.ink
            property color soft: colors.soft
            Rectangle {
                width: modelData.isNext ? 20 : 14; height: width; radius: width / 2; color: ink
                x: box.ax - width / 2; y: box.ay - height / 2
            }
            Text {
                x: box.x; y: box.y - 1; width: box.w; horizontalAlignment: Text.AlignHCenter
                text: modelData.name; color: soft; font.family: labels.face
                font.pixelSize: 20; font.weight: modelData.isNext ? Font.DemiBold : Font.Normal
            }
            Text {
                x: box.x; y: box.y + 21; width: box.w; horizontalAlignment: Text.AlignHCenter
                text: modelData.timeText; color: ink; font.family: labels.face
                font.pixelSize: 27; font.weight: modelData.isNext ? Font.Bold : Font.DemiBold
            }
        }
    }
}
