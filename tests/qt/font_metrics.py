"""Checks the clock's glyph table (core/geometry.js) against Poppins as Qt 5.11 resolves it.
Usage: font_metrics.py FONT_DIR CLOCK_PX TABLE_JSON   (table: {char: [advance, inkLeft, inkRight]})
Exit 0 when every value is within 1 px; 1 with the offending glyphs, or when the font does not
resolve to SemiBold (what Font.Medium must give)."""
import json, sys
from PyQt5.QtGui import QGuiApplication, QFont, QFontDatabase, QFontInfo, QFontMetricsF

font_dir, px, table = sys.argv[1], int(sys.argv[2]), json.loads(sys.argv[3])
app = QGuiApplication(sys.argv[:1])
for name in ("Light", "Regular", "SemiBold"):
    if QFontDatabase.addApplicationFont("%s/Poppins-%s.ttf" % (font_dir, name)) < 0:
        print("cannot load Poppins-%s" % name); sys.exit(1)
font = QFont("Poppins")
font.setPixelSize(px)
font.setWeight(QFont.Medium)  # QML Font.Medium
style = QFontInfo(font).styleName()
if style != "SemiBold":
    print("Font.Medium resolves to %r, not SemiBold" % style); sys.exit(1)
fm = QFontMetricsF(font)
bad = []
for ch, want in sorted(table.items()):
    adv = fm.width(ch)
    r = fm.tightBoundingRect(ch)
    got = [adv, r.left(), adv - r.right()]
    if any(abs(g - w) > 1 for g, w in zip(got, want)):
        bad.append("%s: table %s, Qt %s" % (ch, want, [round(g, 1) for g in got]))
print("\n".join(bad) if bad else "glyph table matches Qt (%d glyphs, %s)" % (len(table), style))
sys.exit(1 if bad else 0)
