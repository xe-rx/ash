.pragma library
.import "colour.js" as C
// The colour script, cel edition (ADR 0004): the picture's light at keyed moments, one shared hue per moment.
// Every local colour (sand, rug, robes) is mixed toward the moment's key by `tint`; the shade bands sink toward
// `amb` by `shade`, the lit bands rise toward `sunlight` by `lit` (tools/art/cel/paint.js bakes the land with
// these; the sky, sun, clock and card are live and read the same moment). Between stops everything is mixed in
// OKLab by the sun's altitude (stopAt), so the picture changes continuously; rising and setting differ.
// Four stops are the PO-approved stills (2026-11-12): rise-7 = dawn, day = noon, set0 = sunset, night = night.
// The light direction is not authored: tools/art/cel/light.js derives it from the altitude.
//
// m(sky, light, glow, clock, card, bands, lamp, dim), in this order:
//   sky    [top, mid, hor]                            the gradient's zenith, middle and horizon colours
//   light  [key, amb, sunlight, tint, lit, shade]     hue colours and their amounts (0..1)
//   glow   the sun's disc and rings
//   clock  [ink, inkShadow]                           clock and countdown ink and its hard shadow
//   card   [card, cardInk, accent]                    the times card, its ink and the next-prayer pill
//   bands  [kDune, kMesa, kRug, hBand, haze]          shade offsets (px), highlight offset (px), mesa haze (0..1)
//   lamp   0..1, the lantern and its warm light (night only); dim, the night factor (0 by day, 0.45 at night)

function m(sky, light, glow, clock, card, bands, lamp, dim) {
  return { top: sky[0], mid: sky[1], hor: sky[2], key: light[0], amb: light[1], sunlight: light[2], tint: light[3], lit: light[4],
    shade: light[5], glow: glow, ink: clock[0], inkShadow: clock[1], card: card[0], cardInk: card[1], accent: card[2],
    kDune: bands[0], kMesa: bands[1], kRug: bands[2], hBand: bands[3], haze: bands[4], lamp: lamp, dim: dim };
}

// Night: moonlit indigo, a warm lantern on the rug, the card a dark navy with light ink. The land goes into
// moonlight before the sky does: every stop from -10 down (setting) and -12 down (rising) has this land, and
// only the sky carries the afterglow (June 23:10 is -7.5 and reads as night on the ground, as the approved still).
var NIGHT_LIGHT = ["#22307a", "#090c2e", "#9fb4ff", 0.78, 0.18, 0.5], NIGHT_BANDS = [16, 12, 7, 4, 0.16];
var NIGHT = m(["#0b1230", "#18244e", "#2e3f74"], NIGHT_LIGHT, "#9fb4ff",
  ["#eef1ff", "#050817"], ["#1d2856", "#e8ecff", "#e9a23b"], NIGHT_BANDS, 1, 0.45);
// Noon: pale gold light, violet shade, blue sky, cream card.
var DAY = m(["#2a78b4", "#5aa6d2", "#bfe4e4"], ["#fff1cc", "#8a7ea8", "#fff8e0", 0.12, 0.3, 0.3], "#fff4d6",
  ["#ffffff", "#1f5a8c"], ["#fcf1dd", "#1f2a3a", "#e9a23b"], [10, 8, 5, 4, 0.12], 0, 0);

// ascending altitude (degrees): [altitude, moment]
var RISING = [
  [-90, NIGHT],
  [-20, m(["#0e1538", "#1e2b5a", "#3a4a84"], NIGHT_LIGHT, "#b0a8d8",
    ["#eef1ff", "#080c22"], ["#202c5e", "#e8ecff", "#e9a23b"], NIGHT_BANDS, 1, 0.45)],
  // first light: a violet horizon over the moonlit land, the card still dark, the lantern fading toward the unlit
  // dawn (0.65 is as bright as the smoothness guard allows five degrees from the pinned dawn)
  [-12, m(["#161c4a", "#3a3878", "#8a6090"], NIGHT_LIGHT, "#e0b0c0",
    ["#f6f2ff", "#1c1848"], ["#2c2a60", "#ece8ff", "#e08a5a"], NIGHT_BANDS, 0.65, 0.35)],
  // dawn (the approved still): peach light, violet shade
  [-7, m(["#26335f", "#6a5a8a", "#f0a890"], ["#f6c4ae", "#5a3f86", "#ffd9b8", 0.3, 0.22, 0.4], "#ffd0a8",
    ["#fff7ee", "#3a3a6a"], ["#fae4d4", "#2a2440", "#d9745e"], [26, 18, 10, 5, 0.16], 0, 0.1)],
  // sunrise: gold
  [-1, m(["#2b4a86", "#8c7898", "#ffc07a"], ["#ffd8a0", "#6a4878", "#fff0c8", 0.3, 0.3, 0.4], "#ffd98a",
    ["#fffaf0", "#3a4878"], ["#fbebd0", "#2a2838", "#e2884a"], [26, 18, 10, 5, 0.16], 0, 0)],
  [4, m(["#2a62a2", "#6e9cc4", "#f6cc90"], ["#ffe2b4", "#7a5c88", "#fff4d0", 0.22, 0.3, 0.36], "#fff0b0",
    ["#ffffff", "#2a5282"], ["#fcefd8", "#24283a", "#e9a23b"], [20, 14, 8, 4.5, 0.15], 0, 0)],
  // mid-morning: a hazy near-white horizon, so the way from gold to the noon cyan never passes through green
  [18, m(["#2a72b0", "#5ea2cc", "#d8e6ea"], ["#fff4d6", "#8a7aa4", "#fff8e0", 0.14, 0.3, 0.32], "#fff4d2",
    ["#ffffff", "#22588a"], ["#fcf1dc", "#202a3a", "#e9a23b"], [14, 10, 6, 4, 0.13], 0, 0)],
  [90, DAY]
];
var SETTING = [
  [-90, NIGHT],
  [-20, m(["#0e1438", "#1e2858", "#3c4682"], NIGHT_LIGHT, "#b0a8d4",
    ["#eef1ff", "#080c22"], ["#202a5c", "#e8ecff", "#e9a23b"], NIGHT_BANDS, 1, 0.45)],
  // dusk: a plum afterglow over the moonlit land, the lantern lit, the card dark
  [-10, m(["#161a4a", "#3e2a68", "#9c5a7c"], NIGHT_LIGHT, "#e0a0a8",
    ["#f6f0ff", "#1a1040"], ["#2c2458", "#ece8ff", "#e08a5a"], NIGHT_BANDS, 1, 0.45)],
  // afterglow: an orange horizon, but no sun on the land any more: cool violet shade, the lantern half lit, the
  // card gone dark
  [-4, m(["#2e2a68", "#7c4068", "#ea8a5c"], ["#5a4a98", "#160f3c", "#c8b8e8", 0.6, 0.1, 0.5], "#ffb878",
    ["#fff2e6", "#3a2052"], ["#3a2a58", "#ece6f6", "#e07a52"], [24, 16, 9, 5, 0.16], 0.5, 0.2)],
  // sunset (the approved still): orange light, plum shade
  [0, m(["#3e3474", "#a24e6e", "#f6a15a"], ["#ff9e64", "#5a2856", "#ffc27a", 0.34, 0.3, 0.5], "#ffd27a",
    ["#fff4e6", "#5a2856"], ["#fcd8be", "#2e1a2a", "#e8653f"], [26, 18, 10, 5, 0.16], 0, 0)],
  // golden hour
  [6, m(["#3a4c90", "#9a6a8c", "#f8b56c"], ["#ffc890", "#6a3a6c", "#ffe0a8", 0.26, 0.3, 0.42], "#ffd890",
    ["#fff8ec", "#4a3a70"], ["#fce4cc", "#2a2034", "#e8783f"], [20, 14, 8, 4.5, 0.16], 0, 0)],
  // mid-afternoon: the same hazy near-white horizon (no green between the noon cyan and the golden hour)
  [18, m(["#2e6eae", "#6c9ec8", "#d8e6ea"], ["#ffe8c2", "#8a6e9c", "#fff6dc", 0.16, 0.3, 0.34], "#fff2c8",
    ["#ffffff", "#24567e"], ["#fcefda", "#22283a", "#e9a23b"], [14, 10, 6, 4, 0.14], 0, 0)],
  [40, DAY],
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

// The baked landscape images follow the same stops: landAt names the two moments to cross-fade (image a
// below, image b above at opacity t), with exactly stopAt's stops and smoothstep. Entry i of a list is named
// by entry i of its names; MOMENTS maps a name to its moment (rising and setting share NIGHT and DAY).
var RISING_NAMES = ["night", "rise-20", "rise-12", "rise-7", "rise-1", "rise4", "rise18", "day"];
var SETTING_NAMES = ["night", "set-20", "set-10", "set-4", "set0", "set6", "set18", "day", "day"];
var MOMENTS = {};
(function () {
  var lists = [[RISING, RISING_NAMES], [SETTING, SETTING_NAMES]], i, k;
  for (k = 0; k < 2; k++) { for (i = 0; i < lists[k][0].length; i++) { MOMENTS[lists[k][1][i]] = lists[k][0][i][1]; } }
})();

function landAt(alt, rising) {
  var list = rising ? RISING : SETTING, names = rising ? RISING_NAMES : SETTING_NAMES;
  if (alt <= list[0][0]) { return { a: names[0], b: names[0], t: 0 }; }
  for (var i = 1; i < list.length; i++) {
    if (alt <= list[i][0]) { return { a: names[i - 1], b: names[i], t: C.smooth((alt - list[i - 1][0]) / (list[i][0] - list[i - 1][0])) }; }
  }
  return { a: names[names.length - 1], b: names[names.length - 1], t: 0 };
}
