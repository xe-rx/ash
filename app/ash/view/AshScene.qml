import QtQuick 2.1

// The picture itself, back to front: sky, sun, ground, sun path, family, prayer labels, readouts.
Item {
    id: stage
    property var scene
    property var pal
    property var geo
    property string face: "sans-serif"

    Sky { pal: stage.pal }
    SunDisc { pal: stage.pal; layout: stage.geo; isUp: stage.scene.sun.isUp }
    Dunes { pal: stage.pal }
    SunPath { pal: stage.pal; layout: stage.geo; isUp: stage.scene.sun.isUp }
    Family { pal: stage.pal; x: 590; y: 556; scale: 1.2; transformOrigin: Item.Bottom }
    PrayerLabels { pal: stage.pal; layout: stage.geo; prayers: stage.scene.prayers; face: stage.face }
    Readouts { pal: stage.pal; scene: stage.scene; face: stage.face }
}
