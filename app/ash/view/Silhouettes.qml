import QtQuick 2.1

// The far land on the horizon, behind the dunes: two ridges of low peaks and two flat-topped mesas with
// strata lines. Everything stays at y >= 350, below the countdown (colours: core/script.js).
Item {
    id: far
    property var pal

    Ridge { base: 374; peaks: [[110, 350, 150], [420, 356, 130], [650, 350, 140]]
        body: far.pal.farTwo; lit: far.pal.farTwoLit; shade: far.pal.farTwoShade; litLeft: far.pal.litLeft }
    // mesas: body, a lit cap line and two strata
    Repeater {
        model: [[250, 352, 112, 24], [560, 356, 84, 20]]
        Item {
            Rectangle { x: modelData[0]; y: modelData[1]; width: modelData[2]; height: modelData[3]; color: far.pal.farTwoShade }
            Rectangle { x: modelData[0]; y: modelData[1]; width: modelData[2]; height: 3; color: far.pal.farTwoLit }
            Rectangle { x: modelData[0]; y: modelData[1] + modelData[3] * 0.4; width: modelData[2]; height: 2; color: far.pal.farTwo }
            Rectangle { x: modelData[0]; y: modelData[1] + modelData[3] * 0.72; width: modelData[2]; height: 2; color: far.pal.farTwo }
        }
    }
    Ridge { base: 384; peaks: [[40, 362, 140], [330, 358, 170], [610, 364, 150]]
        body: far.pal.farOne; lit: far.pal.farOneLit; shade: far.pal.farOneShade; litLeft: far.pal.litLeft }
}
