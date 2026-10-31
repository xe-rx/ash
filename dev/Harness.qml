import QtQuick 2.1
import "../app/ash"

// Dev harness around AshView. Modes (set by harness.py): real time (startMs 0), frozen at startMs,
// running at `speed` simulated minutes per real second, or a list of shots to grab and finish.
Item {
    id: root
    width: 1024; height: 600
    property double startMs: 0
    property double speed: 0
    property var config: ({})
    property string sky: "bands"
    property var shots: []
    property int shotIndex: 0
    signal finished()
    signal viewClosed()
    focus: true
    Keys.onEscapePressed: Qt.quit()

    AshView {
        id: view
        anchors.fill: parent
        config: root.config
        sky: root.sky
        useClock: root.startMs === 0 && root.shots.length === 0
        nowMs: root.startMs
        onClosed: root.viewClosed()
    }

    Timer {   // simulated clock: replaces the real minute timer
        running: root.speed > 0 && root.startMs > 0 && root.shots.length === 0
        repeat: true; interval: 100
        onTriggered: view.nowMs = view.nowMs + root.speed * 60000 * 0.1
    }

    Timer {   // one shot at a time: set the time, let it render, grab
        id: shotTimer
        running: root.shots.length > 0
        repeat: true; interval: 250
        property bool armed: false
        onTriggered: {
            if (!armed) {
                if (root.shotIndex >= root.shots.length) { running = false; root.finished(); return }
                view.nowMs = root.shots[root.shotIndex].ms
                armed = true
                return
            }
            armed = false
            var path = root.shots[root.shotIndex].path
            root.shotIndex = root.shotIndex + 1
            root.grabToImage(function (result) { result.saveToFile(path) })
        }
    }
}
