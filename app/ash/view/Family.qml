import QtQuick 2.1

// A family of four on one rug: father and mother behind, two children in front. Faceless.
// Everything is sized by f (no item scaling, so edges stay crisp).
Item {
    id: family
    property var pal
    property real f: 1.2

    // the rug: goat-hair ground, a cream edge, a woven border (assets/rug.png, tiled) top and bottom, dimmed at night
    Rectangle { x: -180 * f; y: -26 * f; width: 360 * f; height: 54 * f; color: family.pal.cloth
        border.width: 3; border.color: family.pal.clothBorder }
    Image { x: -180 * f + 3; y: -26 * f + 5; width: 360 * f - 6; height: 16; source: "../assets/rug.png"; fillMode: Image.Tile }
    Image { x: -180 * f + 3; y: 28 * f - 21; width: 360 * f - 6; height: 16; source: "../assets/rug.png"; fillMode: Image.Tile }
    Rectangle { x: -180 * f + 3; y: -26 * f + 3; width: 360 * f - 6; height: 54 * f - 6; color: family.pal.cloth
        opacity: family.pal.weaveDim; visible: family.pal.weaveDim > 0 }

    Person { u: 1.08 * f; x: -104 * f; y: -2 * f; robe: family.pal.father; skin: family.pal.skin; hasCap: true; cap: family.pal.clothStripe }
    Person { u: 0.98 * f; x: 104 * f; y: -2 * f; robe: family.pal.mother; skin: family.pal.skin; hasScarf: true; scarf: family.pal.hijab }
    Person { u: 0.62 * f; x: -36 * f; y: 10 * f; robe: family.pal.boy
        skin: family.pal.skinDark; hasHair: true; hair: family.pal.hair }
    Person { u: 0.62 * f; x: 36 * f; y: 10 * f; robe: family.pal.girl
        skin: family.pal.skinDark; hasScarf: true; scarf: family.pal.hijab }
}
