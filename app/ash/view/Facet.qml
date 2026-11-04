import QtQuick 2.1

// One right-angled triangle face of a ridge: a rotated square, flattened to the slope, seen through a
// clipping window of hw x hh. The window's top corner is the ridge apex; `leftHalf` picks the half left of it.
Item {
    id: facet
    property real hw: 100
    property real hh: 20
    property bool leftHalf: true
    property color col: "#000000"
    width: hw; height: hh; clip: true

    Item {
        x: facet.leftHalf ? facet.hw : 0; y: facet.hh
        transform: Scale { yScale: facet.hh / facet.hw }
        Rectangle {
            width: facet.hw * 1.4142; height: width; x: -width / 2; y: -width / 2
            rotation: 45; color: facet.col; antialiasing: true
        }
    }
}
