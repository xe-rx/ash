import QtQuick 2.1
import "../core/geometry.js" as Geo

// The picture itself, back to front: sky, sun and its glow, dunes, family, prayer table, readouts.
Item {
    id: stage
    property var scene
    property var pal
    property var sun
    property string face: "sans-serif"

    Sky { pal: stage.pal }
    Sun { pal: stage.pal; view: stage.sun }
    Dunes { pal: stage.pal }
    Family { pal: stage.pal; x: Geo.FAMILY.x; y: Geo.FAMILY.y }
    PrayerTable { pal: stage.pal; scene: stage.scene; face: stage.face }
    Readouts { pal: stage.pal; scene: stage.scene; face: stage.face }
}
