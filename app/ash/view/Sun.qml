import QtQuick 2.1
import "../core/palette.js" as Pal

// The sun: four stepped, flat rings of falling opacity, the disc and a lighter core. The outer three rings can
// reach the clock, so over it they are tints that leave the sky's luminance alone (pal.glow for the outer two,
// pal.halo for the third); near the ends of the arc, where a ring cannot reach the text, it carries the sun's
// own colour like the stills' warm dawn and sunset rings (palette.js ringWarmth, by the sun's x and the ring's
// radius). The innermost never reaches the text (geometry tests) and is always the sun's colour. Lives under
// the land, so the horizon cuts it; in twilight only the rings rise above the land (a glow). Sizes and
// opacities come from core/sunlook.js by altitude; the largest ring is drawn first.
Item {
    id: sun
    property var pal
    property var view            // { x, y, look }
    property var look: view.look
    property var warmth: Pal.ringWarmth(view.x, look.haloR)

    Repeater {
        model: 4
        Rectangle {
            visible: sun.look.glowVisible
            x: sun.view.x - sun.look.haloR[3 - index]; y: sun.view.y - sun.look.haloR[3 - index]
            width: 2 * sun.look.haloR[3 - index]; height: width; radius: width / 2
            color: Pal.ringColour(sun.pal, 3 - index, sun.warmth[3 - index])
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
