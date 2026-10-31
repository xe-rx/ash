import QtQuick 2.1
import "../core/geometry.js" as Geo

// Nine flat bands, then stars and a crescent at night. Drawn 16 px past every edge so the
// burn-in shift never shows a gap. Bands are stepped on purpose: no gradient.
Item {
    id: sky
    property var pal

    Repeater {
        model: 9
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
    // cut out of it. Both lie wholly inside band 1 (y 40..90), so the cut-out has exactly the
    // band's colour. (While it fades in, the cut-out is drawn at the same opacity over the band.)
    Rectangle { visible: sky.pal.moon; opacity: sky.pal.moonAlpha; x: 120; y: 44; width: 44; height: 44; radius: 22; color: sky.pal.moonColor }
    Rectangle { visible: sky.pal.moon; x: 134; y: 42; width: 38; height: 38; radius: 19; color: sky.pal.skyBands[1] }
}
