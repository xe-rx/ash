import QtQuick 2.1
import "core/scene.js" as Scene
import "core/palette.js" as Palette
import "core/geometry.js" as Geo
import "view"

// The Ash idle screen, 1024x600. Takes the time and the config; draws the desert, the family,
// the sun in the sky and the prayer table. Tap anywhere: `closed`.
// A tile, dim hook or adapter can wrap this item later; it knows nothing about them.
Item {
    id: view
    width: 1024; height: 600
    clip: true

    property double nowMs: 0             // 0 = no real tick yet: draw nothing, never a wrong time
    property bool ticked: nowMs !== 0
    property var config: ({})
    property bool useClock: true          // the harness switches the real clock off and sets nowMs
    signal closed()

    function offsetAt(ms) { return -new Date(ms).getTimezoneOffset() }

    property var scene: Scene.sceneAt(nowMs, offsetAt, config)
    property bool ok: scene.ok === true
    property var shown: null              // last good scene: what the picture draws
    onSceneChanged: { if (scene.ok === true) { shown = scene } else { shown = null } }
    Component.onCompleted: { if (scene.ok === true) { shown = scene } }
    property var pal: shown ? Palette.paletteAt(shown.sun.altitudeDeg, shown.sun.azimuthDeg < 180) : null
    property var sun: shown ? Geo.sunView(shown) : null
    property var shift: Geo.shiftAt(nowMs)
    property string face: fontRegular.status === FontLoader.Ready ? fontRegular.name : "DejaVu Sans, sans-serif"

    FontLoader { id: fontLight; source: "fonts/Poppins-Light.ttf" }
    FontLoader { id: fontRegular; source: "fonts/Poppins-Regular.ttf" }
    FontLoader { id: fontSemi; source: "fonts/Poppins-SemiBold.ttf" }

    MinuteClock { enabled: view.useClock; onMinute: view.nowMs = ms }

    Loader {
        active: view.shown !== null && view.pal !== null && view.sun !== null
        x: view.shift.x; y: view.shift.y; width: 1024; height: 600
        sourceComponent: Component {
            AshScene { scene: view.shown; pal: view.pal; sun: view.sun; face: view.face }
        }
    }

    // the tent frame and the lattice table are not burn-in shifted: same geometry at every moment
    Loader {
        active: view.shown !== null && view.pal !== null
        x: 0; y: 0; width: 1024; height: 600
        sourceComponent: Component { Item {
            Tent { night: view.pal.night }
            PrayerTable { pal: view.pal; scene: view.shown; face: view.face }
        } }
    }

    Rectangle { anchors.fill: parent; color: "#05070f"; visible: !view.ticked }   // before the first tick
    ErrorScreen { anchors.fill: parent; visible: view.ticked && !view.ok; message: view.ok ? "" : view.scene.error; face: view.face }

    MouseArea { anchors.fill: parent; onClicked: view.closed() }
}
