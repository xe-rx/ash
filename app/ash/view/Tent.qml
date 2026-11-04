import QtQuick 2.1

// The tent frame (valance, pole, ropes): a baked picture in day and night versions, the night one faded in by `night`.
Item {
    id: tent
    property real night: 0
    width: 1024; height: 600
    Image { source: "../assets/tent.png"; width: 1024; height: 600 }
    Image { visible: tent.night > 0; opacity: tent.night; source: "../assets/tent-night.png"; width: 1024; height: 600 }
}
