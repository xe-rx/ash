import QtQuick 2.1

// One faceless seated figure, built of pills and circles, sized by `u` (1 = adult at 1x).
// Origin: bottom centre of the lap. Variants: headscarf, cap or bare hair.
Item {
    id: person
    property real u: 1
    property color robe: "#ffffff"
    property color skin: "#c98c60"
    property color scarf: "transparent"
    property bool hasScarf: false
    property color cap: "transparent"
    property bool hasCap: false
    property color hair: "#2a1a16"
    property bool hasHair: false
    width: 0; height: 0

    Rectangle { x: -48 * u; y: -26 * u; width: 96 * u; height: 28 * u; radius: 14 * u; color: person.robe; antialiasing: true }
    Rectangle { x: -27 * u; y: -76 * u; width: 54 * u; height: 66 * u; radius: 24 * u; color: person.robe; antialiasing: true }
    // folds as facets: the right half of the robe in shade, a crisp lap fold and a sash line
    Rectangle { x: 6 * u; y: -70 * u; width: 21 * u; height: 60 * u; radius: 20 * u; color: "#000000"; opacity: 0.14; antialiasing: true }
    Rectangle { x: 14 * u; y: -22 * u; width: 34 * u; height: 22 * u; radius: 11 * u; color: "#000000"; opacity: 0.12; antialiasing: true }
    Rectangle { x: -27 * u; y: -46 * u; width: 54 * u; height: Math.max(1, 2 * u); color: "#000000"; opacity: 0.2 }
    Rectangle { x: -15 * u; y: -104 * u; width: 30 * u; height: 30 * u; radius: 15 * u; color: person.skin; antialiasing: true }
    Rectangle { visible: person.hasHair; x: -16 * u; y: -106 * u; width: 32 * u; height: 20 * u; radius: 10 * u; color: person.hair; antialiasing: true }
    Rectangle { visible: person.hasCap; x: -14 * u; y: -108 * u; width: 28 * u; height: 14 * u; radius: 7 * u; color: person.cap; antialiasing: true }
    Rectangle { visible: person.hasScarf; x: -24 * u; y: -110 * u; width: 48 * u; height: 64 * u; radius: 24 * u; color: person.scarf; antialiasing: true }
}
