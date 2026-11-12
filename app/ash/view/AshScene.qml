import QtQuick 2.1

// The picture, back to front: sky (with moon and stars), the sun and its rings, the baked landscape, the times
// card, the clock and countdown. AshView shifts the whole of it a few px for burn-in.
Item {
    id: stage
    property var scene
    property var pal
    property var sun
    property string face: "sans-serif"

    Sky { pal: stage.pal }
    Sun { pal: stage.pal; view: stage.sun }
    Landscape { land3: stage.scene.land; pal: stage.pal }
    PrayerTable { pal: stage.pal; scene: stage.scene; face: stage.face }
    Readouts { pal: stage.pal; scene: stage.scene; face: stage.face }
}
