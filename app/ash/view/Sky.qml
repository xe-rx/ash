import QtQuick 2.1
import "../core/skygrad.js" as Grad

// The sky: one smooth vertical gradient through the nine stops of the palette (positions in core/skygrad.js),
// drawn 16 px past every edge so the burn-in shift never shows a gap, with a very faint paper grain over it
// (a 128 px tile at 2% opacity, tools/gen-grain.js), which also hides the 8-bit steps. Then stars and a moon.
Item {
    id: sky
    property var pal
    // what the moon's cut-out must match: the gradient where it sits
    property color moonCut: Grad.skyColorAt(pal.skyStops, 61)

    Rectangle {
        x: -16; y: Grad.SKY_TOP; width: 1056; height: Grad.SKY_H
        gradient: Gradient {
            GradientStop { position: Grad.STOPS[0]; color: sky.pal.skyStops[0] }
            GradientStop { position: Grad.STOPS[1]; color: sky.moonCut }
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

    Repeater {
        model: sky.pal.stars ? [[610, 44, 3], [760, 70, 2], [880, 34, 3], [940, 120, 2], [820, 150, 2],
            [70, 120, 2], [230, 30, 3], [330, 84, 2], [440, 22, 2], [560, 100, 2], [690, 22, 2],
            [30, 40, 2], [150, 160, 2], [980, 70, 3], [890, 200, 2], [120, 230, 2]] : []
        Rectangle { x: modelData[0]; y: modelData[1]; width: modelData[2]; height: modelData[2]
            radius: modelData[2] / 2; color: sky.pal.starColor; opacity: sky.pal.starAlpha }
    }

    // The moon is a fixed crescent symbol, not the astronomical phase: a disc with a disc of sky
    // cut out of it, the cut-out having the gradient's colour at its middle.
    Rectangle { visible: sky.pal.moon; opacity: sky.pal.moonAlpha; x: 120; y: 44; width: 44; height: 44; radius: 22; color: sky.pal.moonColor }
    Rectangle { visible: sky.pal.moon; x: 134; y: 42; width: 38; height: 38; radius: 19; color: sky.moonCut }
}
