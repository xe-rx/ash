import QtQuick 2.1

// The ground: a far plain on the horizon with two low swells, a mid dune and a near dune built
// from big circles and a slightly tilted pill. Flat fills only.
Item {
    id: dunes
    property var pal

    Rectangle { x: -16; y: 380; width: 1056; height: 240; color: dunes.pal.duneFar }
    Rectangle { x: -330; y: 371; width: 900; height: 900; radius: 450; color: dunes.pal.duneFar }
    Rectangle { x: 640; y: 375; width: 700; height: 700; radius: 350; color: dunes.pal.duneFar }

    Rectangle { x: -520; y: 428; width: 1000; height: 1000; radius: 500; color: dunes.pal.duneMid }
    Rectangle { x: 520; y: 452; width: 1100; height: 1100; radius: 550; color: dunes.pal.duneMid }

    Rectangle { x: -240; y: 524; width: 1500; height: 300; radius: 150; rotation: -3.2; antialiasing: true; color: dunes.pal.duneNear }
    Rectangle { x: -420; y: 560; width: 760; height: 760; radius: 380; color: dunes.pal.duneNear }
}
