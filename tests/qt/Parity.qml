import QtQuick 2.0
import "../../app/ash/core/scene.js" as Scene

// Evaluates sceneAt in the real Qt QML JavaScript engine; the host reads `json`.
Item {
    property double nowMs: 0
    property double lat: 0
    property double lon: 0
    property int offsetMin: 0
    property string json: JSON.stringify(Scene.sceneAt(nowMs, function (ms) { return offsetMin; },
        { lat: lat, lon: lon, hijriOffsetDays: 0 }))
}
