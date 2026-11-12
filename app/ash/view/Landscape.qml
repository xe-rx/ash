import QtQuick 2.1

// The baked landscape: two pictures cross-faded by the sun's altitude (core/script.js landAt). The picture of
// moment a lies below, the one of moment b above it at opacity t. Set once a minute, no animation. The pictures
// are transparent above their silhouette (the sky shows through) and the land meets both side edges at y 406;
// margins in the sand's graded colours (pal.sandEdge: far sand at the top, near sand at the bottom) continue it
// 16 px past the edges, so the burn-in shift never shows a gap.
Item {
    id: land
    property var land3: ({ a: "night", b: "night", t: 0 })
    property var pal
    width: 1024; height: 600

    Rectangle {
        x: -16; y: 406; width: 16; height: 226
        gradient: Gradient {
            GradientStop { position: 0.0; color: land.pal.sandEdge[0] }
            GradientStop { position: 0.86; color: land.pal.sandEdge[1] }
            GradientStop { position: 1.0; color: land.pal.sandEdge[1] }
        }
    }
    Rectangle {
        x: 1024; y: 406; width: 16; height: 226
        gradient: Gradient {
            GradientStop { position: 0.0; color: land.pal.sandEdge[0] }
            GradientStop { position: 0.86; color: land.pal.sandEdge[1] }
            GradientStop { position: 1.0; color: land.pal.sandEdge[1] }
        }
    }
    Rectangle { x: 0; y: 600; width: 1024; height: 32; color: land.pal.sandEdge[1] }

    Image { source: "../assets/land/" + land.land3.a + ".png"; width: 1024; height: 600 }
    Image { visible: land.land3.t > 0 && land.land3.b !== land.land3.a; opacity: land.land3.t
        source: "../assets/land/" + land.land3.b + ".png"; width: 1024; height: 600 }
}
