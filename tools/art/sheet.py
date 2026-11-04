#!/usr/bin/env python3
"""Contact sheet: every land layer over a vertical sky gradient. Args: assetsDir out.png (colours read from moments via node JSON on stdin)."""
import sys, json
from PIL import Image, ImageDraw
assets, out = sys.argv[1], sys.argv[2]
stops = json.load(sys.stdin)   # [[name, topHex, horHex], ...]
W, H, cols = 512, 300, 4
sheet = Image.new("RGB", (cols * W, ((len(stops) + cols - 1) // cols) * H), "#000")
hx = lambda c: tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
for i, (name, top, hor) in enumerate(stops):
    bg = Image.new("RGBA", (1024, 600)); d = ImageDraw.Draw(bg); a, b = hx(top), hx(hor)
    for y in range(600):
        t = min(1, y / 372); d.line([(0, y), (1024, y)], fill=tuple(round(a[k] + (b[k] - a[k]) * t) for k in range(3)) + (255,))
    bg.alpha_composite(Image.open(f"{assets}/land/{name}.png").convert("RGBA"))
    tile = bg.convert("RGB").resize((W, H), Image.LANCZOS); ImageDraw.Draw(tile).text((8, 6), name, fill="#ffffff")
    sheet.paste(tile, ((i % cols) * W, (i // cols) * H))
sheet.save(out)
