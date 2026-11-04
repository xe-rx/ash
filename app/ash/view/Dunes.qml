import QtQuick 2.1

// The ground in three low-poly layers (far plain, mid, near), each a body with faceted ridges: crisp 45 degree
// faces, the sun's side lit, the other in shade (colours: core/script.js via palette.js).
Item {
    id: dunes
    property var pal

    Ridge { base: 392; peaks: [[190, 366, 200], [520, 370, 210], [760, 372, 180]]
        body: dunes.pal.duneFar; lit: dunes.pal.duneFarLit; shade: dunes.pal.duneFarShade; litLeft: dunes.pal.litLeft }
    Ridge { base: 440; peaks: [[120, 406, 230], [470, 416, 250], [760, 424, 190]]
        body: dunes.pal.duneMid; lit: dunes.pal.duneMidLit; shade: dunes.pal.duneMidShade; litLeft: dunes.pal.litLeft }
    Ridge { base: 530; peaks: [[70, 500, 260], [420, 510, 230], [760, 506, 300]]
        body: dunes.pal.duneNear; lit: dunes.pal.duneNearLit; shade: dunes.pal.duneNearShade; litLeft: dunes.pal.litLeft }
}
