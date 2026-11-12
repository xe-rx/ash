import QtQuick 2.1
import "../core/skygrad.js" as Grad

// The sky: one smooth vertical gradient through the nine stops of the palette (positions in core/skygrad.js),
// drawn 16 px past every edge so the burn-in shift never shows a gap, with a very faint paper grain over it
// (a 128 px tile at 2% opacity, tools/gen-grain.js), which also hides the 8-bit steps. Then stars and the moon.
Item {
    id: sky
    property var pal

    Rectangle {
        x: -16; y: Grad.SKY_TOP; width: 1056; height: Grad.SKY_H
        gradient: Gradient {
            GradientStop { position: Grad.STOPS[0]; color: sky.pal.skyStops[0] }
            GradientStop { position: Grad.STOPS[1]; color: sky.pal.skyStops[1] }
            GradientStop { position: Grad.STOPS[2]; color: sky.pal.skyStops[2] }
            GradientStop { position: Grad.STOPS[3]; color: sky.pal.skyStops[3] }
            GradientStop { position: Grad.STOPS[4]; color: sky.pal.skyStops[4] }
            GradientStop { position: Grad.STOPS[5]; color: sky.pal.skyStops[5] }
            GradientStop { position: Grad.STOPS[6]; color: sky.pal.skyStops[6] }
            GradientStop { position: Grad.STOPS[7]; color: sky.pal.skyStops[7] }
            GradientStop { position: Grad.STOPS[8]; color: sky.pal.skyStops[8] }
        }
    }
    Image {
        source: "../assets/grain.png"; fillMode: Image.Tile
        x: -16; y: Grad.SKY_TOP; width: 1056; height: Grad.SKY_H; opacity: 0.02
    }

    Image { visible: sky.pal.stars; x: 0; y: 0; width: 1024; height: 360; source: "../assets/stars.png"; opacity: sky.pal.starAlpha }

    // The moon is a fixed crescent symbol, not the astronomical phase: two faint rings, a disc, and a disc of
    // sky cut out of it. The cut-out is a gradient of what lies behind the moon (sky and rings, core/skygrad.js
    // moonCutAt), so it vanishes into them at any opacity.
    Repeater {
        model: Grad.MOON_RINGS
        Rectangle {
            visible: sky.pal.moon; opacity: modelData[1] * sky.pal.moonAlpha
            x: Grad.MOON.x - modelData[0]; y: Grad.MOON.y - modelData[0]; width: 2 * modelData[0]; height: width
            radius: modelData[0]; color: Grad.MOON_RING; antialiasing: true
        }
    }
    Rectangle {
        visible: sky.pal.moon; opacity: sky.pal.moonAlpha
        x: Grad.MOON.x - Grad.MOON.r; y: Grad.MOON.y - Grad.MOON.r; width: 2 * Grad.MOON.r; height: width
        radius: Grad.MOON.r; color: sky.pal.moonColor; antialiasing: true
    }
    Rectangle {
        visible: sky.pal.moon
        x: Grad.MOON.cutX - Grad.MOON.cutR; y: Grad.MOON.cutY - Grad.MOON.cutR; width: 2 * Grad.MOON.cutR; height: width
        radius: Grad.MOON.cutR; antialiasing: true
        gradient: Gradient {
            GradientStop { position: 0.0; color: Grad.moonCutAt(sky.pal.skyStops, Grad.MOON.cutY - Grad.MOON.cutR, sky.pal.moonAlpha) }
            GradientStop { position: 0.5; color: Grad.moonCutAt(sky.pal.skyStops, Grad.MOON.cutY, sky.pal.moonAlpha) }
            GradientStop { position: 1.0; color: Grad.moonCutAt(sky.pal.skyStops, Grad.MOON.cutY + Grad.MOON.cutR, sky.pal.moonAlpha) }
        }
    }
}
