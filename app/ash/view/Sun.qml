import QtQuick 2.1

// The sun: four stepped, flat rings of falling opacity, the disc and a lighter core. The outer three rings can
// reach the clock, so they are tints that leave the sky's luminance alone (pal.glow for the outer two, pal.halo
// for the third); the innermost never reaches it (geometry tests) and carries the sun's own colour, as the
// stills do. Lives under the land, so the horizon cuts it; in twilight only the rings rise above the land (a
// glow). Sizes and opacities come from core/sunlook.js by altitude; the largest ring is drawn first.
Item {
    id: sun
    property var pal
    property var view            // { x, y, look }
    property var look: view.look

    Repeater {
        model: 4
        Rectangle {
            visible: sun.look.glowVisible
            x: sun.view.x - sun.look.haloR[3 - index]; y: sun.view.y - sun.look.haloR[3 - index]
            width: 2 * sun.look.haloR[3 - index]; height: width; radius: width / 2
            color: index === 3 ? sun.pal.sun : (index < 2 ? sun.pal.glow : sun.pal.halo)
            opacity: sun.look.haloAlpha[3 - index]; antialiasing: true
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
