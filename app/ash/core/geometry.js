.pragma library
// Screen geometry of the sun-path infographic, as pure functions (no QML, no clock).
// The path is one ellipse: its upper half (taller) is the day, from the east horizon (left,
// progress 0) over the top to the west horizon (right, progress 1). Progress outside 0..1 is the
// sun under the horizon, drawn as the flatter lower half, so Fajr and Isha sit on the path too.

var W = 1024, H = 600;
var BANDS = [-16, 100, 190, 268, 330, 380]; // sky band edges, shared with Sky.qml
var CX = 512, HORIZON = 380, RX = 380, RY_UP = 232, RY_DOWN = 92;
var MARGIN = 16;          // labels stay this far from the screen edge (burn-in shift is up to 4)
var LAND_TOP = 420;       // a label below the horizon sits wholly below this line
var DOT_MIN = -0.5, DOT_MAX = 1.5;
var LABEL_W = 100, LABEL_H = 52, SUN_R = 30;

// Rectangles that labels must keep clear: hijri line, clock and next prayer, the family.
var OBSTACLES = [
  { x: 300, y: 8, w: 424, h: 46 },
  { x: 300, y: 176, w: 424, h: 202 },
  { x: 372, y: 420, w: 436, h: 180 }
];

function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }

function pathPoint(p) {
  var s = Math.sin(Math.PI * p);
  return { x: CX - RX * Math.cos(Math.PI * p), y: HORIZON - (s >= 0 ? RY_UP : RY_DOWN) * s };
}

function sunPoint(scene) { return pathPoint(scene.sun.pathProgress); }

// Dotted path (the whole ellipse: the lower half runs behind the family), one entry per dot; dots under the sun disc are left out.
function pathDots(sunP) {
  var sun = pathPoint(sunP), out = [];
  for (var i = 0; ; i++) {
    var p = DOT_MIN + i * 0.02;
    if (p > DOT_MAX + 1e-9) { break; }
    var pt = pathPoint(p);
    var dx = pt.x - sun.x, dy = pt.y - sun.y;
    if (dx * dx + dy * dy > 34 * 34) { out.push({ x: pt.x, y: pt.y, below: pt.y > HORIZON + 0.5 }); }
  }
  return out;
}

function hits(a, b, gap) {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

var TURNS = [0, 20, -20, 40, -40, 60, -60, 80, -80, 100, -100, 120, -120, 140, -140, 160, -160, 180];
var DISTS = [10, 22, 36, 54, 76, 100];

function acceptable(box, placed, sunBox, dots) {
  if (box.x < MARGIN || box.x + box.w > W - MARGIN || box.y < MARGIN || box.y + box.h > H - MARGIN) { return false; }
  if (!(box.y + box.h <= HORIZON - 8 || box.y >= LAND_TOP)) { return false; }
  var i;
  for (i = 0; i < OBSTACLES.length; i++) { if (hits(box, OBSTACLES[i], 0)) { return false; } }
  if (hits(box, sunBox, 0)) { return false; }
  for (i = 0; i < placed.length; i++) { if (hits(box, placed[i], 6)) { return false; } }
  for (i = 0; i < dots.length; i++) {
    if (dots[i].x > box.x - 3 && dots[i].x < box.x + box.w + 3 && dots[i].y > box.y - 3 && dots[i].y < box.y + box.h + 3) { return false; }
  }
  return true;
}

function place(a, placed, sunBox, dots) {
  var nx = (a.x - CX) / (RX * RX), ny = (a.y - HORIZON) / ((a.y > HORIZON ? RY_DOWN : RY_UP) * (a.y > HORIZON ? RY_DOWN : RY_UP));
  var base = Math.atan2(ny, nx), best = null;
  for (var d = 0; d < DISTS.length; d++) {
    for (var t = 0; t < TURNS.length; t++) {
      var ang = base + TURNS[t] * Math.PI / 180;
      var cx = a.x + Math.cos(ang) * (LABEL_W / 2 + DISTS[d]), cy = a.y + Math.sin(ang) * (LABEL_H / 2 + DISTS[d]);
      var box = { x: Math.round(cx - LABEL_W / 2), y: Math.round(cy - LABEL_H / 2), w: LABEL_W, h: LABEL_H };
      if (acceptable(box, placed, sunBox, dots)) { return box; }
      if (best === null) { best = box; }
    }
  }
  return best;
}

// Marker positions and label boxes for the five prayers; deterministic for a given scene.
function layout(scene) {
  var sunP = scene.sun.pathProgress;
  var sun = pathPoint(sunP);
  var sunBox = scene.sun.isUp ? { x: sun.x - SUN_R - 8, y: sun.y - SUN_R - 8, w: 2 * SUN_R + 16, h: 2 * SUN_R + 16 } : { x: -99, y: -99, w: 0, h: 0 }; // the night ring never moves labels
  var dots = pathDots(sunP), order = [1, 3, 2, 0, 4], boxes = [], placed = [], i;
  for (i = 0; i < 5; i++) { boxes.push(null); }
  for (var k = 0; k < order.length; k++) {
    var idx = order[k], a = pathPoint(scene.prayers[idx].pathProgress);
    var box = place(a, placed, sunBox, dots);
    box.ax = a.x; box.ay = a.y; box.p = scene.prayers[idx].pathProgress;
    boxes[idx] = box; placed.push(box);
  }
  return { labels: boxes, sun: { x: sun.x, y: sun.y, p: sunP }, sunBox: sunBox, dots: dots };
}

// A label box wholly on the ground (below the horizon) rather than on the sky.
function onLand(box) { return box.y >= LAND_TOP; }

// Clock: Poppins digits are proportional, and Qt 5.11 cannot switch on tabular figures. Each
// character is placed by its ink so every visible gap is the same (a "1" gets no extra air), and
// the colon stays at the horizontal centre, so it never moves between minutes. The metrics are
// the advance and the left/right ink bearings at 140 px of Poppins SemiBold (what Font.Medium
// resolves to), read in Qt 5.11 with QFontMetricsF.advance and tightBoundingRect.
var CLOCK_PX = 140, CLOCK_GAP = 15;
var GLYPH_METRICS = {
  "0": [90.4, 7, 6.4], "1": [50.7, 5, 11.7], "2": [80.4, 6, 4.4], "3": [83.9, 6, 7.9], "4": [92.5, 6, 4.5],
  "5": [90.2, 11, 7.2], "6": [89.6, 9, 7.6], "7": [76.7, 4, 3.7], "8": [90.0, 8, 8.0], "9": [87.6, 9, 7.6],
  ":": [36.8, 6, 5.8]
};
function glyphMetrics(ch) { return GLYPH_METRICS[ch] || GLYPH_METRICS["0"]; }

// One entry per character: ch, x of the Text item (its glyph origin), colon flag, and the ink
// extent inkLeft..inkRight, all in screen pixels. The colon's ink is centred on CX.
function clockGlyphs(text) {
  var n = text.length, colonAt = text.indexOf(":");
  if (colonAt < 0) { colonAt = n; }
  var out = [], i, m, ink;
  for (i = 0; i < n; i++) { m = glyphMetrics(text.charAt(i)); out.push({ ch: text.charAt(i), colon: i === colonAt, x: 0, inkLeft: 0, inkRight: m[0] - m[1] - m[2] }); }
  if (colonAt < n) {
    m = glyphMetrics(":");
    ink = m[0] - m[1] - m[2];
    out[colonAt].inkLeft = CX - ink / 2; out[colonAt].inkRight = CX + ink / 2;
  }
  var edge = colonAt < n ? out[colonAt].inkLeft : CX;
  for (i = colonAt - 1; i >= 0; i--) { // hours grow leftwards from the colon
    m = glyphMetrics(out[i].ch); ink = out[i].inkRight;
    out[i].inkRight = edge - CLOCK_GAP; out[i].inkLeft = out[i].inkRight - ink; edge = out[i].inkLeft;
  }
  edge = colonAt < n ? out[colonAt].inkRight : CX;
  for (i = colonAt + 1; i < n; i++) { // minutes grow rightwards
    ink = out[i].inkRight;
    out[i].inkLeft = edge + CLOCK_GAP; out[i].inkRight = out[i].inkLeft + ink; edge = out[i].inkRight;
  }
  for (i = 0; i < n; i++) { out[i].x = out[i].inkLeft - glyphMetrics(out[i].ch)[1]; }
  return out;
}

// Burn-in: the whole scene moves by up to 4 px every 10 minutes, deterministically.
var SHIFTS = [[0, 0], [3, -2], [-2, 4], [4, 3], [-4, -1], [1, 4], [-3, -4], [2, -4], [-1, 2], [4, -3], [-4, 3], [3, 1]];
function shiftAt(nowMs) {
  var s = SHIFTS[Math.floor(nowMs / 600000) % SHIFTS.length];
  return { x: s[0], y: s[1] };
}
