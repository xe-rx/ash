"""Builds the contact sheet from the shot list: 4 columns, June row block then December.
usage: sheet.py SHOTS.json OUT.png   (toolchain python)"""
import json, sys
from PyQt5.QtGui import QImage, QPainter, QColor, QFont, QGuiApplication

app = QGuiApplication(sys.argv[:1])
shots = json.load(open(sys.argv[1]))
tw, th, cols = 512, 300, (5 if len(shots) == 10 else 4)
rows = (len(shots) + cols - 1) // cols
sheet = QImage(tw * cols, (th + 26) * rows, QImage.Format_RGB32)
sheet.fill(QColor("#101014"))
p = QPainter(sheet)
f = QFont("DejaVu Sans"); f.setPixelSize(16); p.setFont(f)
for i, s in enumerate(shots):
    img = QImage(s["path"])
    if img.isNull():
        print("missing", s["path"], file=sys.stderr); sys.exit(1)
    x, y = (i % cols) * tw, (i // cols) * (th + 26)
    p.drawImage(x, y + 26, img.scaled(tw, th, 1, 1))
    p.setPen(QColor("#e8e8ee")); p.drawText(x + 8, y + 18, s["label"])
p.end()
sheet.save(sys.argv[2])
