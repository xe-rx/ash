import QtQuick 2.1

// The sun disc proper; lives under the dunes so the horizon cuts it at sunrise and sunset.
Rectangle {
    property var pal
    property var layout
    property bool isUp: true
    visible: isUp
    x: layout.sun.x - 30; y: layout.sun.y - 30; width: 60; height: 60; radius: 30
    color: pal.sun
}
