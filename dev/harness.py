"""Dev harness: runs dev/Harness.qml (AshView) in a Qt 5.11 window or offscreen.
Run with the toolchain python (see scripts/setup-qt.sh). Prints `closed` when the view is tapped.

  harness.py [--config FILE] [--at "YYYY-MM-DD HH:MM"] [--speed N] [--shots FILE.json]
  --at     start (or freeze) at this local time (zone from TZ); without it: real time
  --speed  simulated minutes per real second, needs --at
  --shots  JSON list of {"ms": epoch milliseconds, "path": png}; grabs each, then exits
"""
import argparse, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))


def local_ms(text):
    return int(time.mktime(time.strptime(text, "%Y-%m-%d %H:%M")) * 1000)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--at")
    ap.add_argument("--speed", type=float, default=0)
    ap.add_argument("--shots")
    a = ap.parse_args()
    if a.speed and not a.at:
        ap.error("--speed needs --at")
    from PyQt5.QtCore import QUrl, QTimer
    from PyQt5.QtGui import QGuiApplication
    from PyQt5.QtQuick import QQuickView

    with open(a.config) as f:
        config = json.load(f)
    shots = json.load(open(a.shots)) if a.shots else []
    app = QGuiApplication(sys.argv[:1])
    view = QQuickView()
    view.setTitle("Ash")
    view.setResizeMode(QQuickView.SizeRootObjectToView)
    view.engine().quit.connect(app.quit)
    view.setSource(QUrl.fromLocalFile(os.path.join(HERE, "Harness.qml")))
    root = view.rootObject()
    if root is None:
        print("harness: Harness.qml failed to load", file=sys.stderr)
        return 2
    root.setProperty("config", config)
    root.setProperty("shots", shots)
    root.setProperty("speed", a.speed)
    if a.at:
        root.setProperty("startMs", float(local_ms(a.at)))
    root.viewClosed.connect(lambda: print("closed", flush=True))
    root.finished.connect(app.quit)
    view.resize(1024, 600)
    view.setMinimumSize(view.size())
    view.setMaximumSize(view.size())
    view.show()
    if shots:
        QTimer.singleShot(120000, app.quit)  # safety net
    rc = app.exec_()
    view.setSource(QUrl())
    del root, view
    return rc


if __name__ == "__main__":
    sys.exit(main())
