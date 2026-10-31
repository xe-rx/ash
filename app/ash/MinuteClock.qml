import QtQuick 2.1

// Ticks once a minute, aligned to the minute boundary, and stops while hidden.
// The only place in the app that reads the clock. The harness replaces it by switching it off.
Item {
    id: clock
    property bool enabled: true
    signal minute(double ms)

    Timer {
        id: timer
        running: clock.enabled && clock.visible
        repeat: true
        triggeredOnStart: true
        interval: 1000
        onTriggered: {
            var ms = new Date().getTime()
            clock.minute(ms)
            interval = 60000 - (ms % 60000) + 30
        }
    }
}
