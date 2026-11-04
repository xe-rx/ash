import QtQuick 2.1
import "../core/table.js" as Table

// The prayer table as a woven band (qata) on the right edge: goat-hair ground, pattern bands from one small PNG
// (tools/gen-weave.js), the Hijri date, five rows (name left, time right in fixed digit cells), the next prayer
// on a madder row, passed prayers faded and light, and a fringe. At night a ground-coloured veil dims the
// pattern. Flat, square corners.
Item {
    id: table
    property var pal
    property var scene
    property string face: "sans-serif"
    property var layout: Table.tableLayout(scene)
    readonly property int qx: layout.qata.x
    readonly property int qw: layout.qata.w

    Rectangle { x: table.qx; y: -16; width: table.qw + 16; height: 632; color: pal.ground }

    // pattern bands: the same image, shown through four clipped windows
    Item { x: table.qx; y: 0; width: table.qw; height: Table.BAND_H + Table.STRIPE_H; clip: true
        Image { y: -Table.STRIPE_H; width: 304; height: 64; source: "../assets/weave.png" } }
    Item { x: table.qx; y: Table.DATE_Y + Table.DATE_H; width: table.qw; height: Table.STRIPE_H; clip: true
        Image { width: 304; height: 64; source: "../assets/weave.png" } }
    Item { x: table.qx; y: Table.END_Y; width: table.qw; height: Table.STRIPE_H + Table.BAND_H; clip: true
        Image { width: 304; height: 64; source: "../assets/weave.png" } }
    Item { x: table.qx; y: 600 - Table.FRINGE_H; width: table.qw; height: Table.FRINGE_H; clip: true
        Image { y: -(Table.BAND_H + 2 * Table.STRIPE_H); width: 304; height: 64; source: "../assets/weave.png" } }
    Rectangle { x: table.qx; y: 0; width: table.qw; height: 600; color: pal.ground; opacity: pal.weaveDim; visible: pal.weaveDim > 0 }

    Text {
        x: layout.header.x; y: layout.header.y; width: layout.header.w; height: layout.header.h
        verticalAlignment: Text.AlignVCenter
        text: scene.hijri ? scene.hijri.text : ""
        color: pal.ink; font.family: face; font.pixelSize: 22; font.weight: Font.Normal; font.letterSpacing: 2
        font.capitalization: Font.AllUppercase; fontSizeMode: Text.HorizontalFit; minimumPixelSize: 14
    }

    Repeater {
        model: layout.rows
        Item {
            id: rowItem
            property real rowY: modelData.y
            property bool past: modelData.isPast
            property color ink: modelData.isNext ? pal.rowInk : (modelData.isPast ? pal.inkFaded : pal.ink)
            Rectangle {
                visible: modelData.isNext
                x: table.qx; y: modelData.y; width: table.qw; height: Table.ROW_H; color: pal.rowFill
            }
            Rectangle {   // fine rule under every row but the last
                visible: modelData.y < Table.END_Y - Table.ROW_H && !modelData.isNext
                x: table.qx + Table.PAD; y: modelData.y + Table.ROW_H - 1; width: table.qw - 2 * Table.PAD; height: 1
                color: pal.inkFaded; opacity: 0.35
            }
            Text {
                x: Table.NAME_X; y: rowY + 26; text: modelData.name; color: ink; font.family: face
                font.pixelSize: Table.NAME_PX; font.weight: modelData.isNext ? Font.DemiBold : (modelData.isPast ? Font.Light : Font.Normal)
            }
            Repeater {
                model: modelData.glyphs
                Text {
                    x: modelData.x; y: parent.rowY + 18
                    text: modelData.ch; color: ink; font.family: face
                    font.pixelSize: Table.TIME_PX; font.weight: rowItem.past ? Font.Light : Font.DemiBold
                }
            }
        }
    }
}
