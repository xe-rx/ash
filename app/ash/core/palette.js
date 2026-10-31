.pragma library
.import "colour.js" as C
// paletteAt(altitudeDeg, rising): every colour of the scene as hex strings, a pure function of the
// sun's altitude and whether it is rising or setting. A dusty, warm, restrained desert light:
// neighbouring hues and small lightness steps, in seven flat bands (no gradients). Stops are
// authored in sRGB and mixed in OKLab. Text colours are derived from the final backgrounds so every
// ink has at least 4.5:1 contrast against everything it can sit on (checked in tests).

var SAFE = 4.62;
var INK_BANDS_NOTE = 0; // margin over 4.5:1, for hex rounding

// Authored stops, ascending altitude. top/mid/hor: sky at the zenith, in between and at the
// horizon; sand: the middle dune; sun: the disc. Rising and setting differ between about -20 and +30.
var NIGHT = { top: "#080b1f", mid: "#0e1330", hor: "#161c3c", sand: "#1d2039", sun: "#6a6f8c" };
var DAY = { top: "#6c9ac2", mid: "#cdc6d0", hor: "#f1e4cc", sand: "#d9a566", sun: "#f8dc90" };
var RISING = [
  [-90, NIGHT],
  [-20, { top: "#0a0f2a", mid: "#121a3c", hor: "#1c2548", sand: "#1f2340", sun: "#6a6f8c" }],
  [-12, { top: "#1a2250", mid: "#2d3868", hor: "#4a5486", sand: "#2d2f52", sun: "#8f9ac8" }],
  [-6, { top: "#3f4f80", mid: "#8a7f9c", hor: "#e0a892", sand: "#8c6c76", sun: "#e98558" }],
  [-1, { top: "#5f80a6", mid: "#c6a3a6", hor: "#f0b98e", sand: "#c98c68", sun: "#f0a255" }],
  [4, { top: "#6c9ac0", mid: "#d4b9a4", hor: "#f4d19c", sand: "#d6a26b", sun: "#f4bd62" }],
  [10, { top: "#6c9ac2", mid: "#d2c6cc", hor: "#f2dcb0", sand: "#d8a468", sun: "#f6cc72" }],
  [20, { top: "#6c9ac2", mid: "#cec6d0", hor: "#efe1c8", sand: "#d9a566", sun: "#f8d986" }],
  [90, DAY]
];
var SETTING = [
  [-90, NIGHT],
  [-20, { top: "#0a0d26", mid: "#131431", hor: "#1b1a3e", sand: "#1e1e3b", sun: "#6a6f8c" }],
  [-10, { top: "#1c2050", mid: "#38305e", hor: "#563d6c", sand: "#34304f", sun: "#d08a8c" }],
  [-4, { top: "#2d3068", mid: "#5f4378", hor: "#c0644c", sand: "#6e4658", sun: "#e8774c" }],
  [0, { top: "#3b4078", mid: "#7c4c72", hor: "#d97848", sand: "#b25a4a", sun: "#ee8049" }],
  [6, { top: "#5f84a8", mid: "#c8977f", hor: "#f2b46e", sand: "#d9954e", sun: "#f4b85c" }],
  [15, { top: "#6c96bc", mid: "#d6bfb6", hor: "#f3d08e", sand: "#d8a05a", sun: "#f5c468" }],
  [30, { top: "#6c9ac2", mid: "#ccc6d0", hor: "#f0e2ca", sand: "#d9a566", sun: "#f8d886" }],
  [55, DAY],
  [90, DAY]
];

var PAPER = "#f4e8d4", INK_NIGHT_PANEL = "#181b38", PLUM = "#5c3874";
var clamp = C.clamp, mix = C.mix, smooth = C.smooth;

// ---- tone: keep every band of a set on one side of the luminance gap where no ink can read ----
var DARK_MAX = 0.165, LIGHT_MIN = 0.205;
function inkIsLight(bands) {
  var sum = 0;
  for (var i = 0; i < bands.length; i++) { sum += C.luminance(bands[i]); }
  return sum / bands.length < 0.185;
}
function toneBand(hex, light) {
  var lab = C.toLab(hex), n = 0;
  while (n++ < 60 && (light ? C.luminance(C.fromLab(lab)) > DARK_MAX : C.luminance(C.fromLab(lab)) < LIGHT_MIN)) {
    lab[0] += light ? -0.01 : 0.01;
  }
  return C.fromLab(lab);
}
function tone(bands, light) {
  var out = [];
  for (var i = 0; i < bands.length; i++) { out.push(toneBand(bands[i], light)); }
  return out;
}

function ensureContrast(hex, bgs, toward) { // lightness walks toward white or black until readable
  var lab = C.toLab(hex), n = 0;
  function ok(h) { for (var i = 0; i < bgs.length; i++) { if (C.contrast(h, bgs[i]) < SAFE) { return false; } } return true; }
  while (n++ < 80 && !ok(C.fromLab(lab))) { lab[0] = clamp(lab[0] + (toward ? 0.012 : -0.012), 0, 1); }
  return ok(C.fromLab(lab)) ? C.fromLab(lab) : (toward ? "#ffffff" : "#000000");
}

// ---- stops ----
function stopAt(list, alt) {
  if (alt <= list[0][0]) { return list[0][1]; }
  for (var i = 1; i < list.length; i++) {
    if (alt <= list[i][0]) {
      var a = list[i - 1], b = list[i], t = smooth((alt - a[0]) / (b[0] - a[0]));
      var out = {};
      for (var k in a[1]) { out[k] = mix(a[1][k], b[1][k], t); }
      return out;
    }
  }
  return list[list.length - 1][1];
}

// Nine flat bands from the zenith to the horizon. The zenith is first drawn towards the horizon
// (a calmer sky, small steps), then mixed through the middle colour: along the hue circle at dawn
// and dusk (in-between bands keep their chroma, rose and lilac rather than grey) and in plain
// OKLab by day (blue goes to pale haze through a neutral, never through green).
var BAND_COUNT = 9, CALM = 0.28;
function bandsOf(top, mid, hor, alt) {
  var calm = mix(top, hor, CALM), byDay = smooth(clamp((alt - 6) / 14, 0, 1)), out = [];
  for (var i = 0; i < BAND_COUNT; i++) {
    var t = i / (BAND_COUNT - 1);
    var lch = t <= 0.5 ? C.mixLch(calm, mid, t * 2) : C.mixLch(mid, hor, (t - 0.5) * 2);
    var lab = t <= 0.5 ? mix(calm, mid, t * 2) : mix(mid, hor, (t - 0.5) * 2);
    out.push(mix(lch, lab, byDay));
  }
  return out;
}

// The clock and countdown sit on bands 4..7 (core/clock.js, geometry BANDS). Those four must all
// be on one side of the luminance gap where no ink can read. The whole sky is moved together
// (same lightness shift on every band), so the steps and their order never change; the shift is
// the smaller of "dark enough for light ink" and "light enough for dark ink".
var INK_FROM = 4, INK_TO = 7;
function shiftSky(bands, light) {
  var labs = [], i, n = 0;
  for (i = 0; i < bands.length; i++) { labs.push(C.toLab(bands[i])); }
  function ok() {
    for (var k = INK_FROM; k <= INK_TO; k++) {
      var l = C.luminance(C.fromLab(labs[k]));
      if (light ? l > DARK_MAX : l < LIGHT_MIN) { return false; }
    }
    return true;
  }
  while (n < 200 && !ok()) { for (i = 0; i < labs.length; i++) { labs[i][0] += light ? -0.005 : 0.005; } n++; }
  var out = [];
  for (i = 0; i < labs.length; i++) { out.push(C.fromLab(labs[i])); }
  return { bands: out, steps: n };
}

function paletteAt(altDeg, rising) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var s = stopAt(rising ? RISING : SETTING, alt);
  var raw = bandsOf(s.top, s.mid, s.hor, alt);
  var withLight = shiftSky(raw, true), withDark = shiftSky(raw, false);
  var skyLight = withLight.steps <= withDark.steps;
  var sky = (skyLight ? withLight : withDark).bands;
  var inkBands = sky.slice(INK_FROM, INK_TO + 1);
  var lit = smooth(clamp((alt + 10) / 24, 0, 1)); // 0 in the dark, 1 in full daylight
  var land = [mix(mix(s.sand, s.hor, 0.5), "#e2ab94", 0.16 * lit), s.sand, mix(s.sand, "#7a4038", 0.45 * lit)];
  // Family shadow: warm while the sky still glows (dusk), cool only in real night.
  var warmth = smooth(clamp((alt + 14) / 12, 0, 1));
  var shadow = mix("#262d52", "#7c4a50", warmth);
  var dim = function (hex) { return mix(mix(hex, s.hor, 0.12), shadow, 0.68 * (1 - lit)); };
  var inkS = skyLight ? "#f3eee6" : "#14233a";
  var accS = skyLight ? "#f3c47c" : "#8a3a1e";
  // The panel: warm paper (tinted by the horizon light) by day, then a short crossing through a
  // saturated plum to deep indigo; mixed along the hue circle so it is never a desaturated grey.
  var paper = mix(PAPER, s.hor, 0.16);
  var inkPanel = C.mixLch(C.mixLch(INK_NIGHT_PANEL, PLUM, smooth(clamp((alt + 9) / 4, 0, 1))), paper, smooth(clamp((alt + 5) / 3.5, 0, 1)));
  var panelLight = inkIsLight([inkPanel]);
  var panel = tone([inkPanel], panelLight)[0];
  var panelInk = ensureContrast(panelLight ? "#f3eee6" : "#2a1d12", [panel], panelLight);
  var deep = smooth(clamp((C.luminance(panel) - 0.1) / 0.22, 0, 1)); // 0 on a dark panel, 1 on paper
  var rowFill = mix("#f4bd6a", "#c8742a", deep);
  return {
    skyBands: sky, duneFar: land[0], duneMid: land[1], duneNear: land[2], land: land,
    sun: s.sun, sunCore: mix(s.sun, "#fff3d6", 0.14), halo: mix(s.sun, s.hor, 0.3),
    moon: alt < -3, stars: alt < -9, moonAlpha: clamp((-alt - 3) / 6, 0, 1), starAlpha: clamp((-alt - 8) / 6, 0, 1),
    moonColor: "#e9e6d8", starColor: "#cfd3f0",
    inkSky: ensureContrast(inkS, inkBands, skyLight), accentSky: ensureContrast(accS, inkBands, skyLight),
    panel: panel, panelInk: panelInk,
    panelSoft: ensureContrast(mix(panelInk, panel, 0.28), [panel], panelLight),
    panelHair: mix(panelInk, panel, 0.86), railLine: mix(panelInk, panel, 0.7),
    railDot: "#f2b84e", railRing: panelInk,
    rowFill: rowFill, rowInk: ensureContrast("#1c1410", [rowFill], false),
    cloth: dim("#0e7c78"), clothBorder: dim("#f6e7c1"), clothStripe: dim("#e08a3c"),
    father: dim("#f3ead8"), mother: dim("#92518a"), hijab: dim("#a54a86"), girl: dim("#e0606b"),
    boy: dim("#2d5fa6"), skin: dim("#c98c60"), skinDark: dim("#8e5a3c"), hair: dim("#2a1a16")
  };
}
