import QtQuick 2.1
import "../core/geometry.js" as Geo
import "../core/skygrad.js" as Grad

// The sky, drawn 16 px past every edge so the burn-in shift never shows a gap, then stars and a moon.
// Two versions with the same colours, switched by the one line below:
//   A (false): nine flat poster bands;
//   B (true): one smooth vertical gradient through the same colours (stops in core/skygrad.js), with
//   a very faint paper grain over it (a 128 px tile at 4.5% opacity, tools/gen-grain.js), which also
//   hides the 8-bit steps of a smooth gradient.
Item {
    id: sky
    property var pal
    readonly property bool gradientSky: false  // THE SWITCH: false = flat bands (A), true = gradient + grain (B)
    // what the moon's cut-out must match: the sky colour where it sits (band 1, or the gradient there)
    property color moonCut: gradientSky ? Grad.skyColorAt(pal.skyBands, 61) : pal.skyBands[1]

    Rectangle {
        visible: sky.gradientSky
        x: -16; y: Grad.SKY_TOP; width: 1056; height: Grad.SKY_H
        gradient: Gradient {
            GradientStop { position: Grad.STOPS[0]; color: sky.pal.skyBands[0] }
            GradientStop { position: Grad.STOPS[1]; color: sky.moonCut }
            GradientStop { position: Grad.STOPS[2]; color: sky.pal.skyBands[2] }
            GradientStop { position: Grad.STOPS[3]; color: sky.pal.skyBands[3] }
            GradientStop { position: Grad.STOPS[4]; color: sky.pal.skyBands[4] }
            GradientStop { position: Grad.STOPS[5]; color: sky.pal.skyBands[5] }
            GradientStop { position: Grad.STOPS[6]; color: sky.pal.skyBands[6] }
            GradientStop { position: Grad.STOPS[7]; color: sky.pal.skyBands[7] }
            GradientStop { position: Grad.STOPS[8]; color: sky.pal.skyBands[8] }
        }
    }
    Image {
        visible: sky.gradientSky
        source: "../assets/grain.png"; fillMode: Image.Tile
        x: -16; y: Grad.SKY_TOP; width: 1056; height: Grad.SKY_H; opacity: 0.045
    }

    Repeater {
        model: sky.gradientSky ? 0 : 9
        Rectangle {
            x: -16; width: 1056
            y: Geo.BANDS[index]; height: Geo.BANDS[index + 1] - Geo.BANDS[index] + 1
            color: sky.pal.skyBands[index]
        }
    }

    Repeater {
        model: sky.pal.stars ? [[610, 44, 3], [760, 70, 2], [880, 34, 3], [940, 120, 2], [820, 150, 2],
            [70, 120, 2], [230, 30, 3], [330, 84, 2], [440, 22, 2], [560, 100, 2], [690, 22, 2],
            [30, 40, 2], [150, 160, 2], [980, 70, 3], [890, 200, 2], [120, 230, 2]] : []
        Rectangle { x: modelData[0]; y: modelData[1]; width: modelData[2]; height: modelData[2]
            radius: modelData[2] / 2; color: sky.pal.starColor; opacity: sky.pal.starAlpha }
    }

    // The moon is a fixed crescent symbol, not the astronomical phase: a disc with a disc of sky
    // cut out of it. Both lie wholly inside band 1 (y 40..90), so the cut-out has the
    // colour of the sky there (exactly the band's in A; in B the gradient's at the cut-out's middle). (While it fades in, the cut-out is drawn at the same opacity over the band.)
    Rectangle { visible: sky.pal.moon; opacity: sky.pal.moonAlpha; x: 120; y: 44; width: 44; height: 44; radius: 22; color: sky.pal.moonColor }
    Rectangle { visible: sky.pal.moon; x: 134; y: 42; width: 38; height: 38; radius: 19; color: sky.moonCut }
}
