import QtQuick 2.1

// Two far layers on the horizon, behind the dunes: very low, long mesas and swells, lighter, cooler
// and closer to the horizon sky than anything in front (colours: core/script.js). Their tops stay
// at y >= 346, below the countdown text. Flat fills only.
Item {
    id: far
    property var pal

    // farthest: two stepped buttes and one long swell
    Rectangle { x: 80; y: 358; width: 230; height: 40; radius: 16; color: far.pal.farTwo; antialiasing: true }
    Rectangle { x: 120; y: 346; width: 140; height: 30; radius: 10; color: far.pal.farTwo; antialiasing: true }
    Rectangle { x: 300; y: 362; width: 110; height: 30; radius: 12; color: far.pal.farTwo; antialiasing: true }
    Rectangle { x: 440; y: 356; width: 800; height: 800; radius: 400; color: far.pal.farTwo; antialiasing: true }

    // nearer: two long swells
    Rectangle { x: -180; y: 358; width: 960; height: 960; radius: 480; color: far.pal.farOne; antialiasing: true }
    Rectangle { x: 300; y: 364; width: 700; height: 700; radius: 350; color: far.pal.farOne; antialiasing: true }
}
