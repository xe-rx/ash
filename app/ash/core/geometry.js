.pragma library
.import "sunlook.js" as Look
// Screen geometry of the picture, as pure functions (no QML, no clock). The sun moves on an
// invisible arc through the open sky left of the woven table: from the east horizon (progress 0)
// over the top to the west horizon (progress 1). Under the horizon it sits at the arc's end on its
// own side and sinks, so only its glow shows above the dunes.

var W = 1024, H = 600;
var HORIZON = 380;
var ARC_CX = 360, ARC_RX = 290, ARC_RY = 252;
var ARC_FLAT = 0.7;          // < 1 flattens the top of the arc: the sun runs along under the valance, above the clock
var SUNRISE_DEG = -50 / 60;  // altitude of the sun's centre at sunrise and sunset (as in sun.js)

// The tent valance's lower hem (tips of the fringe), measured on assets/tent.png: about y 100 at the left edge falling
// to about y 78 at the right, a straight line with a few px to spare. The sun's disc stays below it.
function valanceY(x) { return 106 - 0.04 * x; }

function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }

function arcPoint(p) {
  var s = Math.sin(Math.PI * p);
  return { x: ARC_CX - ARC_RX * Math.cos(Math.PI * p), y: HORIZON - ARC_RY * Math.pow(s, ARC_FLAT) };
}

// px below the horizon of the sun's centre, for `below` degrees under its sunrise altitude: it
// sinks fast while the disc is leaving, then slowly, so the glow stays near the horizon.
function sinkDepth(below) { return below < 1.4 ? 45 * below : 63 + 3 * (below - 1.4); }

// Centre of the sun on screen, for a scene: on the arc by day progress; at night at the arc's
// end on the side it will rise or has set (same east/west rule as the palette).
function sunPlace(scene) {
  var sun = scene.sun;
  if (sun.isUp) { return arcPoint(sun.dayProgress); }
  var east = sun.azimuthDeg < 180, end = arcPoint(east ? 0 : 1);
  return { x: end.x, y: HORIZON + sinkDepth(Math.max(0, SUNRISE_DEG - sun.altitudeDeg)) };
}

// Everything the sun layer draws: place plus size, halos and glow from the altitude.
function sunView(scene) {
  var pos = sunPlace(scene), look = Look.sunLook(scene.sun.altitudeDeg);
  return { x: pos.x, y: pos.y, look: look };
}

// Burn-in: the whole scene moves by up to 4 px every 10 minutes, deterministically.
var SHIFTS = [[0, 0], [3, -2], [-2, 4], [4, 3], [-4, -1], [1, 4], [-3, -4], [2, -4], [-1, 2], [4, -3], [-4, 3], [3, 1]];
function shiftAt(nowMs) {
  var s = SHIFTS[Math.floor(nowMs / 600000) % SHIFTS.length];
  return { x: s[0], y: s[1] };
}

