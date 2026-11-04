import QtQuick 2.1

// The far land on the horizon, behind the dunes: two ridges of low peaks and two flat-topped mesas with
// strata lines and a lit and a shade side. Everything stays at y >= 350, below the countdown (colours: core/script.js).
Item {
    id: far
    property var pal

    Ridge { base: 374; peaks: [[110, 350, 150], [420, 356, 130], [650, 350, 140]]
        body: far.pal.farTwo; lit: far.pal.farTwoLit; shade: far.pal.farTwoShade; litLeft: far.pal.litLeft }
    // mesas: a lit half and a shade half, a cap line and three strata lines, each as wide as the mesa
    Repeater {
        model: [[210, 350, 160, 34], [540, 354, 120, 30]]
        Item {
            id: mesa
            property var m: modelData
            Rectangle { x: modelData[0]; y: modelData[1]; width: modelData[2] / 2; height: modelData[3]; color: far.pal.litLeft ? far.pal.farTwoLit : far.pal.farTwoShade }
            Rectangle { x: modelData[0] + modelData[2] / 2; y: modelData[1]; width: modelData[2] / 2; height: modelData[3]; color: far.pal.litLeft ? far.pal.farTwoShade : far.pal.farTwoLit }
            Rectangle { x: modelData[0]; y: modelData[1]; width: modelData[2]; height: 3; color: far.pal.farTwoLit }
            Repeater {
                model: 3
                Rectangle { x: mesa.m[0]; y: mesa.m[1] + (index + 1) * mesa.m[3] / 4; width: mesa.m[2]; height: 3; color: far.pal.farTwoMid; opacity: 0.8 }
            }
        }
    }
    Ridge { base: 384; peaks: [[40, 362, 140], [330, 358, 170], [610, 364, 150]]
        body: far.pal.farOne; lit: far.pal.farOneLit; shade: far.pal.farOneShade; litLeft: far.pal.litLeft }
}
