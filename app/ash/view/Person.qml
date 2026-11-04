import QtQuick 2.1

// One faceless seated figure built of crisp parts, sized by `u` (1 = adult at 1x): a lap block, a trapezoid robe
// (a rectangle with two triangular side facets), shoulders, a square-cornered head, and distinct headwear
// (kufi, hair or a triangular hijab). Fold facets are translucent triangles. Origin: bottom centre of the lap.
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

    // hijab: a triangle from the crown down over the shoulders, behind the face
    Facet { visible: person.hasScarf; x: -34 * u; y: -112 * u; hw: 34 * u; hh: 70 * u; leftHalf: true; col: person.scarf }
    Facet { visible: person.hasScarf; x: 0; y: -112 * u; hw: 34 * u; hh: 70 * u; leftHalf: false; col: person.scarf }
    // lap and robe
    Rectangle { x: -48 * u; y: -26 * u; width: 96 * u; height: 28 * u; radius: 3 * u; color: person.robe }
    Rectangle { x: -22 * u; y: -70 * u; width: 44 * u; height: 50 * u; color: person.robe }
    Facet { x: -34 * u; y: -70 * u; hw: 12 * u; hh: 50 * u; leftHalf: true; col: person.robe }      // the robe widens to the lap
    Facet { x: 22 * u; y: -70 * u; hw: 12 * u; hh: 50 * u; leftHalf: false; col: person.robe }
    Rectangle { x: -30 * u; y: -76 * u; width: 60 * u; height: 12 * u; radius: 3 * u; color: person.robe }   // shoulders
    // folds: a shade triangle down the right side, a light one on the left, a lap crease
    Facet { x: 0; y: -62 * u; hw: 28 * u; hh: 42 * u; leftHalf: false; col: "#000000"; opacity: 0.16 }
    Facet { x: -26 * u; y: -62 * u; hw: 22 * u; hh: 36 * u; leftHalf: true; col: "#ffffff"; opacity: 0.12 }
    Rectangle { x: -48 * u; y: -14 * u; width: 96 * u; height: Math.max(1, 1.5 * u); color: "#000000"; opacity: 0.2 }
    // head and headwear
    Rectangle { x: -14 * u; y: -102 * u; width: 28 * u; height: 28 * u; radius: 5 * u; color: person.skin }
    Rectangle { visible: person.hasHair; x: -15 * u; y: -106 * u; width: 30 * u; height: 14 * u; radius: 3 * u; color: person.hair }
    Rectangle { visible: person.hasCap; x: -15 * u; y: -108 * u; width: 30 * u; height: 13 * u; radius: 2 * u; color: person.cap }
    Rectangle { visible: person.hasCap; x: -15 * u; y: -97 * u; width: 30 * u; height: Math.max(1, 2 * u); color: "#000000"; opacity: 0.25 }
}
