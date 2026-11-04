import QtQuick 2.1

// One layer of low-poly land: a body from `base` down, with triangular peaks above it. Each peak is
// [apex x, apex y, half width]; its two faces are split at the apex, the one toward the sun lit, the
// other in shade. Peaks must end on the base line (height = base - apex y).
Item {
    id: ridge
    property int base: 400
    property var peaks: []
    property color body
    property color lit
    property color shade
    property bool litLeft: true

    Rectangle { x: -16; y: ridge.base; width: 1056; height: 640 - ridge.base; color: ridge.body }
    Repeater {
        model: ridge.peaks
        Item {
            Facet { x: modelData[0] - modelData[2]; y: modelData[1]; hw: modelData[2]; hh: ridge.base - modelData[1]
                leftHalf: true; col: ridge.litLeft ? ridge.lit : ridge.shade }
            Facet { x: modelData[0]; y: modelData[1]; hw: modelData[2]; hh: ridge.base - modelData[1]
                leftHalf: false; col: ridge.litLeft ? ridge.shade : ridge.lit }
        }
    }
}
