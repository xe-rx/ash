.pragma library
.import "geometry.js" as Geo
.import "colour.js" as C
// The sky: a smooth vertical gradient through the nine stops of the palette (skyStops), on the curve of the
// cel stills (tools/art/cel/sky.js): the zenith colour at y 0, the middle colour at MID_Y (0.5 H), the horizon
// colour at HOR_Y (0.72 H) and flat below, so the sky runs on under the dune line (the baked land is transparent
// above its silhouette, down to y 424). Stops 0..7 (y <= 344) lie above and behind the clock and the countdown
// and are held dark enough for the clock ink (palette.js); stop 8 is the horizon colour, never darkened. The
// rectangle runs from SKY_TOP (16 px past the top edge, for the burn-in shift) to 16 px past the bottom edge.
// Qt's Gradient mixes linearly in sRGB between stops, as the still's SVG gradient does; skyColorAt does the
// same, so tests and the moon's cut-out see the colour the screen shows.

var SKY_TOP = -16, SKY_H = Geo.H + 16 - SKY_TOP;   // y -16 .. 616
var MID_Y = Geo.H * 0.5, HOR_Y = Geo.H * 0.72;     // 300, 432: where the still's gradient bends
var STOP_Y = [0, 50, 100, 150, 200, 250, 300, 344, 432];
var STOPS = (function () {
  var out = [];
  for (var i = 0; i < 9; i++) { out.push((STOP_Y[i] - SKY_TOP) / SKY_H); }
  return out;
})();

function blend(under, over, a) { // over at alpha a on under, in sRGB like the renderer
  var u = C.hexToRgb(under), o = C.hexToRgb(over);
  return C.rgbToHex([u[0] + (o[0] - u[0]) * a, u[1] + (o[1] - u[1]) * a, u[2] + (o[2] - u[2]) * a]);
}

function skyColorAt(bands, y) {
  var f = (y - SKY_TOP) / SKY_H, i;
  if (f <= STOPS[0]) { return bands[0]; }
  if (f >= STOPS[8]) { return bands[8]; }
  for (i = 1; i < 9; i++) {
    if (f <= STOPS[i]) { return blend(bands[i - 1], bands[i], (f - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1])); }
  }
  return bands[8];
}

// The moon (the cel stills, tools/art/cel/sky.js): a fixed crescent symbol, a disc with a disc of sky cut out
// of it, inside two faint rings of MOON_RING laid over the sky. The cut-out must show what lies behind the
// moon, sky and rings: moonCutAt gives that colour at height y (the rings at the moon's opacity).
var MOON = { x: 560, y: 112, r: 26, cutX: 571, cutY: 105, cutR: 23 };
var MOON_RING = "#c8d4ff", MOON_RINGS = [[70, 0.10], [46, 0.18]];   // [radius, alpha], largest first

function moonCutAt(bands, y, moonAlpha) {
  var c = skyColorAt(bands, y), i;
  for (i = 0; i < MOON_RINGS.length; i++) { c = blend(c, MOON_RING, MOON_RINGS[i][1] * moonAlpha); }
  return c;
}
