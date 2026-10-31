import QtQuick 2.1

// The dotted path of the sun and the sun itself. Above the horizon the sun is a disc behind the
// dunes' edge; under it, it is a small dim marker on the lower half of the path.
Item {
    id: path
    property var pal
    property var layout
    property bool isUp: true

    Repeater {
        model: path.layout.dots
        Rectangle {
            x: modelData.x - 2.5; y: modelData.y - 2.5; width: 5; height: 5; radius: 2.5
            color: modelData.below ? path.pal.dotsBelow : path.pal.dots
        }
    }
    // the sun under the horizon: a ring (the ground shows through) at its real place on the path
    Rectangle {
        visible: !path.isUp
        x: path.layout.sun.x - 15; y: path.layout.sun.y - 15; width: 30; height: 30; radius: 15
        color: path.pal.sunBelow
        Rectangle { x: 5; y: 5; width: 20; height: 20; radius: 10; color: path.pal.duneMid }
    }
}
