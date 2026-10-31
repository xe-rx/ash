"""Runs sceneAt in Qt's QML engine (PyQt5, Qt 5.11) and prints one JSON line per case.
usage: qt_parity.py <json list of {nowMs, lat, lon, offsetMin}>"""
import json, os, sys
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ.setdefault("QT_QUICK_BACKEND", "software")
from PyQt5.QtCore import QCoreApplication, QUrl, QT_VERSION_STR
from PyQt5.QtQml import QQmlEngine, QQmlComponent

app = QCoreApplication([])
engine = QQmlEngine()
url = QUrl.fromLocalFile(os.path.join(os.path.dirname(os.path.abspath(__file__)), "Parity.qml"))
out = {"qt": QT_VERSION_STR, "results": []}
for case in json.loads(sys.argv[1]):
    comp = QQmlComponent(engine, url)
    obj = comp.beginCreate(engine.rootContext())
    if obj is None:
        print(json.dumps({"error": [e.toString() for e in comp.errors()]})); sys.exit(2)
    for k in ("nowMs", "lat", "lon", "offsetMin"):
        obj.setProperty(k, case[k])
    comp.completeCreate()
    out["results"].append(json.loads(obj.property("json")))
print(json.dumps(out))
