.pragma library
.import "colour.js" as C
// The colour script: the picture's light at keyed moments, authored by hand, one limited palette per
// moment. Sky, silhouettes, dunes and figures of a moment share one light, so the land is not
// derived from the sky by a formula. Between moments everything is mixed in OKLab by the sun's
// altitude (stopAt), so the picture changes continuously. Rising and setting differ.
//
// A moment, in this order: sky top, middle and horizon; the two far silhouettes (farTwo is the
// farthest: lightest and closest to the horizon sky; farOne is nearer); the three dunes (far plain,
// mid, near: warmer and stronger the nearer); the sun disc; shade, the cool-or-warm colour that
// shadows and figures sink into, and sink, how far they sink (0 in full light); tint, the colour of
// the light that falls on the figures, and lit, how much of it they take.
// The sky stops at the ink flips (FLIP_RISING -7, FLIP_SETTING 0 in palette.js) keep mid and
// horizon at luminance 0.179: that is what lets the ink flip only once.

function m(top, mid, hor, farTwo, farOne, duneFar, duneMid, duneNear, sun, shade, sink, tint, lit) {
  return { top: top, mid: mid, hor: hor, farTwo: farTwo, farOne: farOne, duneFar: duneFar, duneMid: duneMid, duneNear: duneNear,
    sun: sun, shade: shade, sink: sink, tint: tint, lit: lit };
}

var HAZE = "#dccbbe"; // the day sky between the blue and the cream horizon: a warm haze, not lilac
var NIGHT = m("#080b1f", "#0e1330", "#161c3c", "#131839", "#0f1430", "#0b0f25", "#090c1e", "#070918", "#6a6f8c", "#262d52", 0.68, "#8a90c0", 0);
var DAY = m("#6c9ac2", HAZE, "#f1e4cc", "#d4d7dc", "#d1c6bd", "#e2b890", "#d9a566", "#b9733f", "#f8dc90", "#8a6a78", 0, "#fff0d0", 0.04);

// ascending altitude (degrees): [altitude, moment]
var RISING = [
  [-90, NIGHT],
  [-20, m("#0a0f2a", "#121a3c", "#1c2548", "#181f42", "#131931", "#0e122b", "#0b0f23", "#080a1b", "#6a6f8c", "#2a3158", 0.68, "#8a90c0", 0)],
  // first light: cool blue, the faintest rose along the horizon
  [-12, m("#1a2250", "#2d3868", "#4a5486", "#424c7c", "#394272", "#2e3560", "#232848", "#191d38", "#8f9ac8", "#2c3460", 0.62, "#7a86c0", 0.04)],
  // dawn: violet sky over a mauve horizon, the land still in blue shade
  [-7, m("#37457a", "#6d729e", "#916a83", "#85667f", "#745a76", "#66506b", "#523f5a", "#3e304c", "#e98558", "#4a4268", 0.55, "#e0a090", 0.1)],
  // sunrise: low orange light, cool plum shadows
  [-1, m("#5f80a6", "#c6a3a6", "#f0b98e", "#c6a492", "#cb9b87", "#c98270", "#b87060", "#8f5048", "#f0a255", "#6a4868", 0.35, "#f4b890", 0.16)],
  [4, m("#6c9ac0", "#d8b4ae", "#f4d19c", "#d2c4c0", "#d8b39b", "#dc9c78", "#c98a62", "#a05c38", "#f4bd62", "#7a5a70", 0.15, "#f6cc98", 0.12)],
  [10, m("#6c9ac2", HAZE, "#f2dcb0", "#d6d4d2", "#d4c3ad", "#e0b48a", "#d8a468", "#b8723f", "#f6cc72", "#7e6074", 0.06, "#f8d8a0", 0.08)],
  [24, m("#6c9ac2", HAZE, "#efe1c8", "#d4d7dc", "#d2c5b5", "#e1b78e", "#d9a566", "#b9733f", "#f8d986", "#8a6a78", 0, "#fff0d0", 0.05)],
  [90, DAY]
];
var SETTING = [
  [-90, NIGHT],
  [-20, m("#0a0d26", "#131431", "#1b1a3e", "#18173a", "#131231", "#0e0d28", "#0b0b20", "#080818", "#6a6f8c", "#2a2850", 0.68, "#8a90c0", 0)],
  // dusk: indigo over a plum horizon, the land a shade of the same plum, shadows turning cool
  [-10, m("#1c2050", "#38305e", "#563d6c", "#4e3b69", "#433360", "#392b54", "#2b2245", "#211a37", "#d08a8c", "#3c3158", 0.58, "#a0607a", 0.05)],
  // after sunset: the afterglow, warm rose shadows
  [-4, m("#2d3068", "#5f4378", "#9b4e50", "#924d55", "#824a58", "#6e4258", "#5c3650", "#46293f", "#e8774c", "#7a4452", 0.45, "#d88070", 0.12)],
  // sunset: bright red-orange horizon, a violet band above, the ground a dark plum in its shade
  [0, m("#3b4078", "#966594", "#b25e44", "#a65b48", "#985050", "#823f4f", "#6c3548", "#542a3e", "#ee8049", "#6a3e52", 0.3, "#f09060", 0.18)],
  // golden hour: warm low light, pink-lilac distance, long violet shadows
  [6, m("#5f84a8", "#cc9486", "#f2b46e", "#e4b595", "#d9a07c", "#d4905a", "#c47c4c", "#96523a", "#f4b85c", "#7a4e66", 0.12, "#f8c070", 0.2)],
  [15, m("#6c96bc", "#dcb8b4", "#f3d08e", "#dcc9b0", "#d6b78e", "#dca66a", "#d8a05a", "#b06836", "#f5c468", "#805a6e", 0.05, "#f8cc80", 0.14)],
  [30, m("#6c9ac2", HAZE, "#f0e2ca", "#d4d7dc", "#d2c5b5", "#e0b78c", "#d9a566", "#b9733f", "#f8d886", "#8a6a78", 0, "#fff0d0", 0.05)],
  [55, DAY],
  [90, DAY]
];

// The moment at an altitude: every colour mixed in OKLab, every number linearly, smoothstep between stops.
function stopAt(list, alt) {
  if (alt <= list[0][0]) { return list[0][1]; }
  for (var i = 1; i < list.length; i++) {
    if (alt <= list[i][0]) {
      var a = list[i - 1], b = list[i], t = C.smooth((alt - a[0]) / (b[0] - a[0]));
      var out = {};
      for (var k in a[1]) { out[k] = typeof a[1][k] === "number" ? a[1][k] + (b[1][k] - a[1][k]) * t : C.mix(a[1][k], b[1][k], t); }
      return out;
    }
  }
  return list[list.length - 1][1];
}

function momentAt(alt, rising) { return stopAt(rising ? RISING : SETTING, alt); }
