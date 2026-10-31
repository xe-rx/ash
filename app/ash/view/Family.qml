import QtQuick 2.1

// A family of four on one cloth: father and mother behind, two children in front. Faceless.
Item {
    id: family
    property var pal

    Rectangle { x: -178; y: -28; width: 356; height: 56; radius: 28; color: family.pal.clothBorder }
    Rectangle { x: -170; y: -22; width: 340; height: 44; radius: 22; color: family.pal.cloth }
    Rectangle { x: -162; y: -17; width: 324; height: 34; radius: 17; color: family.pal.clothStripe }
    Rectangle { x: -158; y: -13; width: 316; height: 26; radius: 13; color: family.pal.cloth }

    Person { x: -104; y: -2; robe: family.pal.father; skin: family.pal.skin; hasCap: true; cap: family.pal.father }
    Person { x: 104; y: -2; robe: family.pal.mother; skin: family.pal.skin; hasScarf: true; scarf: family.pal.hijab }
    Person { x: -36; y: 10; scale: 0.62; transformOrigin: Item.Bottom; robe: family.pal.boy
        skin: family.pal.skinDark; hasHair: true; hair: family.pal.hair }
    Person { x: 36; y: 10; scale: 0.62; transformOrigin: Item.Bottom; robe: family.pal.girl
        skin: family.pal.skinDark; hasScarf: true; scarf: family.pal.hijab }
}
