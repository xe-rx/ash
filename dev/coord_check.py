"""Find latitude/longitude values written with named keys (lat/lon/latitude/longitude/lng).

Usage: coord_check.py FILE...   Prints `file:line: message` per non-public coordinate; exit 1 if any.
Only numbers with a fractional part count (whole degrees identify nothing). Pairs are a lat and
the nearest lon within WINDOW characters. Public places (ADR 0003) may appear; nothing else.
Only named keys are matched, so astronomy constants and tables never trigger it.
"""
import re
import sys

# The ONE place for allowed coordinates: public city centres, matched at 2 decimals.
PUBLIC = {(52.09, 5.12): "Utrecht", (50.85, 5.69): "Maastricht", (53.22, 6.57): "Groningen"}
WINDOW = 300

_NAME = (r"(?:(?<![A-Za-z])(?:lat|latitude|lon|long|longitude|lng|LAT|LATITUDE|LON|LONG|LONGITUDE|LNG)"
         r"|(?<=[a-z0-9_])(?:Lat|Latitude|Lon|Long|Longitude|Lng))")
_KV = re.compile(r"(?P<k>" + _NAME + r")[\"']?\s*[:=]\s*(?P<v>-?\d+\.\d+)")


def kind(key):
    return "lat" if key.lower().lstrip("_").startswith("lat") else "lon"


def is_public(lat=None, lon=None):
    for (plat, plon) in PUBLIC:
        if (lat is None or round(lat, 2) == plat) and (lon is None or round(lon, 2) == plon):
            return True
    return False


def check(path, text):
    hits = [(m.start(), kind(m.group("k")), float(m.group("v"))) for m in _KV.finditer(text)]
    lats = [h for h in hits if h[1] == "lat"]
    lons = [h for h in hits if h[1] == "lon"]
    out, used = [], set()
    for pos, _, lat in lats:
        near = [h for h in lons if abs(h[0] - pos) <= WINDOW and h[0] not in used]
        near.sort(key=lambda h: abs(h[0] - pos))
        if near:
            used.add(near[0][0])
            ok = is_public(lat, near[0][2])
            msg = "coordinate pair %s,%s is not a public place" % (lat, near[0][2])
        else:
            ok = is_public(lat=lat)
            msg = "latitude %s is not a public place" % lat
        if not ok:
            out.append((text.count("\n", 0, pos) + 1, msg))
    for pos, _, lon in lons:
        if pos not in used and not is_public(lon=lon):
            out.append((text.count("\n", 0, pos) + 1, "longitude %s is not a public place" % lon))
    return [(path, ln, m) for ln, m in sorted(out)]


def main(files):
    bad = 0
    for f in files:
        try:
            text = open(f, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for path, ln, msg in check(f, text):
            print("%s:%d: %s" % (path, ln, msg))
            bad += 1
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
