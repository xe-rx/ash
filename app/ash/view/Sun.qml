import QtQuick 2.1

// The sun: five stepped, flat halos of falling opacity (the two largest are very faint and warm the
// sky around a low sun), the disc and a lighter core. Lives under
// the dunes, so the horizon cuts it; in twilight only the halos rise above the dunes (a glow).
// Sizes and opacities come from core/sunlook.js by altitude.
Item {
    id: sun
    property var pal
    property var view            // { x, y, look }
    property var look: view.look

    Repeater {
        model: 5
        Rectangle {
            visible: sun.look.glowVisible
            x: sun.view.x - sun.look.haloR[4 - index]; y: sun.view.y - sun.look.haloR[4 - index]
            width: 2 * sun.look.haloR[4 - index]; height: width; radius: width / 2
            color: index < 2 ? sun.pal.glow : sun.pal.halo; opacity: sun.look.haloAlpha[4 - index]; antialiasing: true
        }
    }
    Rectangle {
        visible: sun.look.discVisible
        x: sun.view.x - sun.look.r; y: sun.view.y - sun.look.r; width: 2 * sun.look.r; height: width; radius: sun.look.r
        color: sun.pal.sun; antialiasing: true
    }
    Rectangle {
        visible: sun.look.discVisible
        x: sun.view.x - sun.look.coreR; y: sun.view.y - sun.look.coreR; width: 2 * sun.look.coreR; height: width; radius: sun.look.coreR
        color: sun.pal.sunCore; antialiasing: true
    }
}
