import QtQuick 2.1

// The ground in three low-poly layers (far plain, mid, near), each a body with faceted ridges: crisp 45 degree
// faces, the sun's side lit (it swaps from the east in the morning to the west in the evening), the other
// in shade, and smaller accent facets in a mid tone (colours: core/script.js via palette.js).
Item {
    id: dunes
    property var pal

    Ridge { base: 392; peaks: [[190, 366, 200], [520, 370, 210], [760, 372, 180]]
        accents: [[60, 380, 70], [350, 378, 90], [640, 382, 80]]
        body: dunes.pal.duneFar; lit: dunes.pal.duneFarLit; mid: dunes.pal.duneFarMid; shade: dunes.pal.duneFarShade; litLeft: dunes.pal.litLeft }
    Ridge { base: 440; peaks: [[120, 406, 230], [470, 416, 250], [760, 424, 190]]
        accents: [[300, 424, 100], [620, 430, 110], [-20, 418, 90]]
        body: dunes.pal.duneMid; lit: dunes.pal.duneMidLit; mid: dunes.pal.duneMidMid; shade: dunes.pal.duneMidShade; litLeft: dunes.pal.litLeft }
    Ridge { base: 530; peaks: [[70, 500, 260], [420, 510, 230], [760, 506, 300]]
        accents: [[250, 516, 100], [600, 520, 90], [-30, 512, 80]]
        body: dunes.pal.duneNear; lit: dunes.pal.duneNearLit; mid: dunes.pal.duneNearMid; shade: dunes.pal.duneNearShade; litLeft: dunes.pal.litLeft }
}
