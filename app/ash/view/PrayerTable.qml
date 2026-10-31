import QtQuick 2.1
import "../core/table.js" as Table

// The prayer table: one flat rounded panel, the Hijri date as header, five rows (name left, time
// right in fixed digit cells), the next prayer on one accent fill, and a thin rail on the left whose
// small dot shows where now falls between the rows.
Item {
    id: table
    property var pal
    property var scene
    property string face: "sans-serif"
    property var layout: Table.tableLayout(scene)

    Rectangle {
        x: layout.panel.x; y: layout.panel.y; width: layout.panel.w; height: layout.panel.h
        radius: 22; color: pal.panel; antialiasing: true
    }
    Text {
        x: layout.header.x; y: layout.header.y; width: layout.header.w
        text: scene.hijri ? scene.hijri.text : ""
        color: pal.panelSoft; font.family: face; font.pixelSize: 21; font.weight: Font.Normal
    }
    Rectangle { x: layout.rail.x - 1; y: layout.rail.y1; width: 2; height: layout.rail.y2 - layout.rail.y1; color: pal.railLine }
    Rectangle {
        x: layout.rail.x - 7; y: layout.rail.dotY - 7; width: 14; height: 14; radius: 7
        color: pal.railDot; border.width: 2; border.color: pal.railRing; antialiasing: true
    }

    Repeater {
        model: layout.rows
        Item {
            property real rowY: modelData.y
            property color ink: modelData.isNext ? pal.rowInk : pal.panelInk
            Rectangle {
                visible: modelData.isNext
                x: Table.FILL_X; y: modelData.y + Table.ROW_PAD; width: Table.FILL_W; height: Table.FILL_H
                radius: 12; color: pal.rowFill; antialiasing: true
            }
            Text {
                x: Table.NAME_X; y: rowY + 13; text: modelData.name; color: ink; font.family: face
                font.pixelSize: 24; font.weight: modelData.isNext ? Font.DemiBold : Font.Normal
            }
            Repeater {
                model: modelData.glyphs
                Text {
                    x: modelData.x; y: parent.rowY + 10
                    text: modelData.ch; color: ink; font.family: face
                    font.pixelSize: Table.TIME_PX; font.weight: Font.Medium
                }
            }
        }
    }
}
