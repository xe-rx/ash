import QtQuick 2.1

// Two far layers on the horizon, behind the dunes: very low, long domes, lighter, cooler
// and closer to the horizon sky than anything in front (colours: core/script.js). Their tops stay
// at y >= 352, below the countdown text. Flat fills only.
Item {
    id: far
    property var pal

    // farthest: two soft domes, taller than the ones in front so they show above them
    Rectangle { x: -100; y: 352; width: 800; height: 800; radius: 400; color: far.pal.farTwo; antialiasing: true }
    Rectangle { x: 280; y: 356; width: 560; height: 560; radius: 280; color: far.pal.farTwo; antialiasing: true }

    // nearer: two long swells (kept clear of the prayer table, which covers the horizon from x 724)
    Rectangle { x: -180; y: 358; width: 960; height: 960; radius: 480; color: far.pal.farOne; antialiasing: true }
    Rectangle { x: 220; y: 364; width: 700; height: 700; radius: 350; color: far.pal.farOne; antialiasing: true }
}
