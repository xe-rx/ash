import QtQuick 2.1

// The sun under the horizon: a ring (the ground shows through) at its real place on the path,
// drawn in front of the family so it is always fully visible.
Item {
    id: ring
    property var pal
    property var layout
    property bool isUp: true
    Rectangle {
        visible: !ring.isUp
        x: ring.layout.sun.x - 15; y: ring.layout.sun.y - 15; width: 30; height: 30; radius: 15
        color: ring.pal.sunBelow
        Rectangle { x: 5; y: 5; width: 20; height: 20; radius: 10; color: ring.pal.duneMid }
    }
}
