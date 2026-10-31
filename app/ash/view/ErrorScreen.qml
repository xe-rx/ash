import QtQuick 2.1

// Shown instead of the scene when sceneAt says ok:false. Never shows a time.
Rectangle {
    id: err
    property string message: ""
    property string face: "sans-serif"
    color: "#120d16"
    Text {
        anchors.centerIn: parent; width: parent.width - 160
        horizontalAlignment: Text.AlignHCenter; wrapMode: Text.WordWrap
        text: err.message; color: "#f6ecd9"; font.family: err.face
        font.pixelSize: 34; font.weight: Font.DemiBold
    }
    Text {
        anchors.horizontalCenter: parent.horizontalCenter; y: parent.height / 2 + 110
        text: "Ash cannot show the time right now"; color: "#c9b99a"; font.family: err.face; font.pixelSize: 20
    }
}
