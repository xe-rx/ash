import QtQuick 2.1

// The moving picture, back to front: sky, sun and its glow, the baked landscape, the clock and countdown.
// (The tent frame and the lattice table are drawn by AshView, not shifted for burn-in.)
Item {
    id: stage
    property var scene
    property var pal
    property var sun
    property string face: "sans-serif"

    Sky { pal: stage.pal }
    Sun { pal: stage.pal; view: stage.sun }
    Landscape { land3: stage.scene.land }
    Readouts { pal: stage.pal; scene: stage.scene; face: stage.face }
}
