"""Prints `WxH distinct_colours corner_hex` for a PNG (toolchain python). usage: image_stats.py FILE"""
import sys
from PyQt5.QtGui import QImage

img = QImage(sys.argv[1])
if img.isNull():
    print("0x0 0 none"); sys.exit(1)
seen = set()
for y in range(0, img.height(), 6):
    for x in range(0, img.width(), 6):
        seen.add(img.pixel(x, y))
print("%dx%d %d #%06x" % (img.width(), img.height(), len(seen), img.pixel(2, 2) & 0xFFFFFF))
