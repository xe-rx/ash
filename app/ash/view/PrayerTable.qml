import QtQuick 2.1
import "../core/table.js" as Table

// The times card (core/table.js): a rounded card over a hard shadow, the Hijri date in the faded ink, five rows
// of name and time, the next prayer on an accent pill in the accent ink, passed prayers faded. Times sit in
// fixed digit cells. Every colour comes from the palette, so the card follows the light of the moment.
Item {
    id: table
    property var pal
    property var scene
    property string face: "sans-serif"
    property var layout: Table.tableLayout(scene)

    Rectangle { x: layout.shadow.x; y: layout.shadow.y; width: layout.shadow.w; height: layout.shadow.h; radius: layout.card.r; color: pal.cardShadow }
    Rectangle { x: layout.card.x; y: layout.card.y; width: layout.card.w; height: layout.card.h; radius: layout.card.r; color: pal.card }

    Text {
        x: layout.date.x; y: layout.date.y; width: layout.date.w
        text: scene.hijri ? scene.hijri.text : ""
        color: pal.cardInkFaded; font.family: face; font.pixelSize: Table.DATE_PX; font.weight: Font.Normal
        fontSizeMode: Text.HorizontalFit; minimumPixelSize: 14
    }

    Repeater {
        model: layout.rows
        Item {
            id: rowItem
            property real timeY: modelData.timeY
            property color ink: modelData.isNext ? pal.accentInk : (modelData.isPast ? pal.cardInkFaded : pal.cardInk)
            Rectangle {
                visible: modelData.isNext
                x: Table.PILL.x; y: modelData.pillY; width: Table.PILL.w; height: Table.PILL.h; radius: Table.PILL.r; color: pal.accent
            }
            Text {
                x: Table.NAME_X; y: modelData.nameY; text: modelData.name; color: rowItem.ink; font.family: face
                font.pixelSize: Table.NAME_PX; font.weight: modelData.isNext ? Font.DemiBold : Font.Normal
            }
            Repeater {
                model: modelData.glyphs
                Text {
                    x: modelData.x; y: rowItem.timeY
                    text: modelData.ch; color: rowItem.ink; font.family: face
                    font.pixelSize: Table.TIME_PX; font.weight: Font.DemiBold
                }
            }
        }
    }
}
