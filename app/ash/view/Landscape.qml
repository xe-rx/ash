import QtQuick 2.1

// The baked landscape: two pictures cross-faded by the sun's altitude (core/script.js landAt). The picture
// of moment a lies below, the one of moment b above it at opacity t. Set once a minute, no animation.
Item {
    id: land
    property var land3: ({ a: "night", b: "night", t: 0 })
    width: 1024; height: 600

    Rectangle { x: -16; y: 580; width: 1056; height: 52; color: "#150c14" }   // under the picture's lower edge, for the burn-in shift
    Image { source: "../assets/land/" + land.land3.a + ".png"; width: 1024; height: 600 }
    Image { visible: land.land3.t > 0 && land.land3.b !== land.land3.a; opacity: land.land3.t
        source: "../assets/land/" + land.land3.b + ".png"; width: 1024; height: 600 }
}
