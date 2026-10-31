import QtQuick 2.1

// A family of four on one cloth: father and mother behind, two children in front. Faceless.
// Everything is sized by f (no item scaling, so edges stay crisp).
Item {
    id: family
    property var pal
    property real f: 1.2

    Rectangle { x: -180 * f; y: -26 * f; width: 360 * f; height: 54 * f; radius: 4 * f; color: family.pal.clothBorder }
    Rectangle { x: -172 * f; y: -19 * f; width: 344 * f; height: 40 * f; radius: 2 * f; color: family.pal.cloth }
    Rectangle { x: -164 * f; y: -13 * f; width: 328 * f; height: 28 * f; color: family.pal.clothStripe }
    Rectangle { x: -160 * f; y: -9 * f; width: 320 * f; height: 20 * f; color: family.pal.cloth }

    Person { u: 1.08 * f; x: -104 * f; y: -2 * f; robe: family.pal.father; skin: family.pal.skin; hasCap: true; cap: family.pal.father }
    Person { u: 0.98 * f; x: 104 * f; y: -2 * f; robe: family.pal.mother; skin: family.pal.skin; hasScarf: true; scarf: family.pal.hijab }
    Person { u: 0.62 * f; x: -36 * f; y: 10 * f; robe: family.pal.boy
        skin: family.pal.skinDark; hasHair: true; hair: family.pal.hair }
    Person { u: 0.62 * f; x: 36 * f; y: 10 * f; robe: family.pal.girl
        skin: family.pal.skinDark; hasScarf: true; scarf: family.pal.hijab }
}
