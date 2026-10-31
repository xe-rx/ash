import QtQuick 2.1

// One faceless seated figure, built of pills and circles. Origin: bottom centre of the lap.
// Variants: a headscarf (hijab colour set), a cap (cap colour set) or bare hair (hair set).
Item {
    id: person
    property color robe: "#ffffff"
    property color skin: "#c98c60"
    property color scarf: "transparent"
    property bool hasScarf: false
    property color cap: "transparent"
    property bool hasCap: false
    property color hair: "#2a1a16"
    property bool hasHair: false
    width: 0; height: 0

    Rectangle { x: -48; y: -26; width: 96; height: 28; radius: 14; color: person.robe }          // crossed legs
    Rectangle { x: -27; y: -76; width: 54; height: 66; radius: 24; color: person.robe }          // body
    Rectangle { x: -15; y: -104; width: 30; height: 30; radius: 15; color: person.skin }         // head
    Rectangle { visible: person.hasHair; x: -16; y: -106; width: 32; height: 20; radius: 10; color: person.hair }
    Rectangle { visible: person.hasCap; x: -14; y: -108; width: 28; height: 14; radius: 7; color: person.cap }
    Rectangle { visible: person.hasScarf; x: -25; y: -112; width: 50; height: 66; radius: 24; color: person.scarf }
    Rectangle { visible: person.hasScarf; x: -11; y: -100; width: 22; height: 26; radius: 11; color: person.skin }
}
