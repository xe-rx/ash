#!/usr/bin/env python3
"""Deterministic PNG re-encoder for baked art. colours=0 (default): lossless RGBA, max zlib. colours>0: palette quantise (bands on gradients)."""
import sys
from PIL import Image

def quantize(src, dst, colours=0):
    im = Image.open(src).convert("RGBA")
    if not colours:
        im.save(dst, optimize=True, compress_level=9)
        return
    q = im.quantize(colors=colours, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.save(dst, optimize=True, compress_level=9)

if __name__ == "__main__":
    quantize(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
