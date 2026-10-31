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
var DAY = { top: "#5b98ae", mid: "#a8c8c4", hor: "#f0e3c8", sand: "#d9a566", sun: "#f8dc90" };
var RISING = [
  [-90, NIGHT],
  [-20, { top: "#0a0f2a", mid: "#121a3c", hor: "#1c2548", sand: "#1f2340", sun: "#6a6f8c" }],
  [-12, { top: "#1a2250", mid: "#2d3868", hor: "#4a5486", sand: "#2d2f52", sun: "#8f9ac8" }],
  [-6, { top: "#3f4f80", mid: "#8a7f9c", hor: "#e0a892", sand: "#8c6c76", sun: "#f1a07a" }],
  [-1, { top: "#5f80a6", mid: "#c6a3a6", hor: "#f0b98e", sand: "#c98c68", sun: "#f5b072" }],
  [4, { top: "#6a9ab4", mid: "#d4b9a4", hor: "#f4d19c", sand: "#d6a26b", sun: "#f6c978" }],
  [10, { top: "#62a0b2", mid: "#bec9b8", hor: "#f2dcb0", sand: "#d8a468", sun: "#f7d684" }],
  [20, { top: "#5f9ab0", mid: "#b0cac6", hor: "#eee0c4", sand: "#d9a566", sun: "#f8da8c" }],
  [90, DAY]
];
var SETTING = [
  [-90, NIGHT],
  [-20, { top: "#0a0d26", mid: "#131431", hor: "#1b1a3e", sand: "#1e1e3b", sun: "#6a6f8c" }],
  [-10, { top: "#1c2050", mid: "#38305e", hor: "#563d6c", sand: "#34304f", sun: "#c090a8" }],
  [-4, { top: "#2d3068", mid: "#5f4378", hor: "#c0644c", sand: "#6e4658", sun: "#e8774c" }],
  [0, { top: "#3b4078", mid: "#7c4c72", hor: "#d97848", sand: "#b25a4a", sun: "#ee8049" }],
  [6, { top: "#5f84a8", mid: "#c8977f", hor: "#f2b46e", sand: "#d9954e", sun: "#f4b85c" }],
  [15, { top: "#62929f", mid: "#c5bfa8", hor: "#f3d08e", sand: "#d8a05a", sun: "#f6cf78" }],
  [30, { top: "#5c98ac", mid: "#a8c6c0", hor: "#eedfc2", sand: "#d9a566", sun: "#f8d88a" }],
  [55, DAY],
  [90, DAY]
];

var PAPER = "#f3e9d6", INK_NIGHT_PANEL = "#181b38";
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

// seven flat bands from the zenith to the horizon, through the deliberate middle colour; mixed
// along the hue circle so the in-between bands keep their chroma
function bandsOf(top, mid, hor) {
  var out = [];
  for (var i = 0; i < 7; i++) {
    var t = i / 6;
    out.push(t <= 0.5 ? C.mixLch(top, mid, t * 2) : C.mixLch(mid, hor, (t - 0.5) * 2));
  }
  return out;
}

// The clock and countdown sit on bands 3..5 (core/clock.js, geometry BANDS): only those are
// toned to one side of the luminance gap, so the rest of the sky keeps its own steps.
var INK_FROM = 3, INK_TO = 5;

function paletteAt(altDeg, rising) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var s = stopAt(rising ? RISING : SETTING, alt);
  var raw = bandsOf(s.top, s.mid, s.hor);
  var skyLight = inkIsLight(raw.slice(INK_FROM, INK_TO + 1));
  var sky = raw.slice(0, INK_FROM).concat(tone(raw.slice(INK_FROM, INK_TO + 1), skyLight), raw.slice(INK_TO + 1));
  var inkBands = sky.slice(INK_FROM, INK_TO + 1);
  var lit = smooth(clamp((alt + 10) / 24, 0, 1)); // 0 in the dark, 1 in full daylight
  var land = [mix(mix(s.sand, s.hor, 0.5), "#e2ab94", 0.16 * lit), s.sand, mix(s.sand, "#7a4038", 0.45 * lit)];
  var dim = function (hex) { return mix(mix(hex, s.hor, 0.12), "#262d52", 0.68 * (1 - lit)); };
  var inkS = skyLight ? "#f3eee6" : "#14233a";
  var accS = skyLight ? "#f3c47c" : "#8a3a1e";
  var panelFlat = C.mixLch(mix(INK_NIGHT_PANEL, s.hor, 0.1), PAPER, smooth(clamp((alt + 7) / 9, 0, 1)));
  var panelLight = inkIsLight([panelFlat]);
  var panel = tone([panelFlat], panelLight)[0];
  var panelInk = ensureContrast(panelLight ? "#f3eee6" : "#2a1d12", [panel], panelLight);
  var rowFill = mix("#c4884a", "#e9a95f", lit);
  var dotStart = mix(s.sun, "#e08a2a", 0.55);
  return {
    skyBands: sky, duneFar: land[0], duneMid: land[1], duneNear: land[2], land: land,
    sun: s.sun, sunCore: mix(s.sun, "#fffbe8", 0.5), halo: mix(s.sun, s.hor, 0.3),
    moon: alt < -3, stars: alt < -9, moonAlpha: clamp((-alt - 3) / 6, 0, 1), starAlpha: clamp((-alt - 8) / 6, 0, 1),
    moonColor: "#e9e6d8", starColor: "#cfd3f0",
    inkSky: ensureContrast(inkS, inkBands, skyLight), accentSky: ensureContrast(accS, inkBands, skyLight),
    panel: panel, panelInk: panelInk,
    panelSoft: ensureContrast(mix(panelInk, panel, 0.28), [panel], panelLight),
    panelHair: mix(panelInk, panel, 0.86), railLine: mix(panelInk, panel, 0.7),
    railDot: ensureContrast(dotStart, [panel], panelLight),
    rowFill: rowFill, rowInk: ensureContrast("#1c1410", [rowFill], false),
    cloth: dim("#0e7c78"), clothBorder: dim("#f6e7c1"), clothStripe: dim("#e08a3c"),
    father: dim("#f3ead8"), mother: dim("#6d2f63"), hijab: dim("#a54a86"), girl: dim("#e0606b"),
    boy: dim("#2d5fa6"), skin: dim("#c98c60"), skinDark: dim("#8e5a3c"), hair: dim("#2a1a16")
  };
}
