import QtQuick 2.1
import "../core/table.js" as Table

// The prayer table as the right-hand lattice panel (art scene C): a live wash tinted from the current sky shows
// through the openings of the baked lattice (assets/lattice.png, night version faded in), whose dark date strip
// and five dark rows are baked without text. Live on top: the Hijri date, names and times, the next prayer on a
// madder row, passed prayers faded and light. Times sit in fixed digit cells.
Item {
    id: table
    property var pal
    property var scene
    property string face: "sans-serif"
    property var layout: Table.tableLayout(scene)

    Rectangle {
        x: layout.qata.x; y: -16; width: layout.qata.w + 16; height: 632
        gradient: Gradient {
            GradientStop { position: 0.0; color: table.pal.skyStops[0] }
            GradientStop { position: 0.5; color: table.pal.skyStops[5] }
            GradientStop { position: 1.0; color: table.pal.skyStops[8] }
        }
    }
    Image { x: 0; y: 0; width: 1024; height: 600; source: "../assets/lattice.png" }
    Image { x: 0; y: 0; width: 1024; height: 600; source: "../assets/lattice-night.png"; visible: pal.night > 0; opacity: pal.night }

    Text {
        x: layout.header.x; y: layout.header.y; width: layout.header.w; height: layout.header.h
        horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
        text: scene.hijri ? scene.hijri.text : ""
        color: pal.ink; font.family: face; font.pixelSize: 22; font.weight: Font.Normal; font.letterSpacing: 4
        font.capitalization: Font.AllUppercase; fontSizeMode: Text.HorizontalFit; minimumPixelSize: 14
    }

    Repeater {
        model: layout.rows
        Item {
            id: rowItem
            property real rowY: modelData.y
            property bool past: modelData.isPast
            property color ink: modelData.isNext ? pal.rowInk : (modelData.isPast ? pal.inkFaded : pal.ink)
            Rectangle { visible: modelData.isNext; x: Table.FIELD.x; y: modelData.y; width: Table.FIELD.w; height: Table.ROW_H; color: pal.rowFill }
            Text {
                x: Table.NAME_X; y: rowY + 14; text: modelData.name; color: ink; font.family: face
                font.pixelSize: Table.NAME_PX; font.weight: modelData.isNext ? Font.DemiBold : (modelData.isPast ? Font.Light : Font.Normal)
            }
            Repeater {
                model: modelData.glyphs
                Text {
                    x: modelData.x; y: rowItem.rowY + 10
                    text: modelData.ch; color: rowItem.ink; font.family: face
                    font.pixelSize: Table.TIME_PX; font.weight: rowItem.past ? Font.Light : Font.DemiBold
                }
            }
        }
    }
}
