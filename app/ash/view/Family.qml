import QtQuick 2.1

// A family of four on one cloth: father and mother behind, two children in front. Faceless.
// Everything is sized by f (no item scaling, so edges stay crisp).
Item {
    id: family
    property var pal
    property real f: 1.2

    Rectangle { x: -178 * f; y: -28 * f; width: 356 * f; height: 56 * f; radius: 28 * f; color: family.pal.clothBorder; antialiasing: true }
    Rectangle { x: -170 * f; y: -22 * f; width: 340 * f; height: 44 * f; radius: 22 * f; color: family.pal.cloth; antialiasing: true }
    Rectangle { x: -162 * f; y: -17 * f; width: 324 * f; height: 34 * f; radius: 17 * f; color: family.pal.clothStripe; antialiasing: true }
    Rectangle { x: -158 * f; y: -13 * f; width: 316 * f; height: 26 * f; radius: 13 * f; color: family.pal.cloth; antialiasing: true }

    Person { u: f; x: -104 * f; y: -2 * f; robe: family.pal.father; skin: family.pal.skin; hasCap: true; cap: family.pal.father }
    Person { u: f; x: 104 * f; y: -2 * f; robe: family.pal.mother; skin: family.pal.skin; hasScarf: true; scarf: family.pal.hijab }
    Person { u: 0.62 * f; x: -36 * f; y: 10 * f; robe: family.pal.boy
        skin: family.pal.skinDark; hasHair: true; hair: family.pal.hair }
    Person { u: 0.62 * f; x: 36 * f; y: 10 * f; robe: family.pal.girl
        skin: family.pal.skinDark; hasScarf: true; scarf: family.pal.hijab }
}
