.pragma library
.import "colour.js" as C
.import "script.js" as Script
// paletteAt(altitudeDeg, rising): every colour of the scene as hex strings, a pure function of the
// sun's altitude and whether it is rising or setting. A dusty, warm, restrained desert light:
// neighbouring hues and small lightness steps. The colours of every moment of the day are authored in
// core/script.js (the colour script) and mixed in OKLab by altitude; this file assembles them. Text colours are derived from the final backgrounds so every
// ink has at least 4.5:1 contrast against everything it can sit on (checked in tests).

var SAFE = 4.62; // margin over 4.5:1, for hex rounding

var PAPER = "#f4e8d4", INK_NIGHT_PANEL = "#181b38", PLUM = "#4d3b69";
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

// A tint (the hue and chroma of `hex`) that leaves the luminance of `under` unchanged when laid over
// it at alpha a the way the renderer does (a plain blend of the sRGB values): bisection on lightness.
function blendedLuminance(under, over, a) {
  var u = C.hexToRgb(under), o = C.hexToRgb(over);
  return C.luminance(C.rgbToHex([u[0] + (o[0] - u[0]) * a, u[1] + (o[1] - u[1]) * a, u[2] + (o[2] - u[2]) * a]));
}
function tintKeepingLuminance(hex, under, a) {
  var lab = C.toLab(hex), lo = 0, hi = 1, target = C.luminance(under), i;
  for (i = 0; i < 24; i++) {
    lab[0] = (lo + hi) / 2;
    if (blendedLuminance(under, C.fromLab(lab), a) < target) { lo = lab[0]; } else { hi = lab[0]; }
  }
  return C.fromLab(lab);
}

function ensureContrast(hex, bgs, toward) { // lightness walks toward white or black until readable
  var lab = C.toLab(hex), n = 0;
  function ok(h) { for (var i = 0; i < bgs.length; i++) { if (C.contrast(h, bgs[i]) < SAFE) { return false; } } return true; }
  while (n++ < 80 && !ok(C.fromLab(lab))) { lab[0] = clamp(lab[0] + (toward ? 0.012 : -0.012), 0, 1); }
  return ok(C.fromLab(lab)) ? C.fromLab(lab) : (toward ? "#ffffff" : "#000000");
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

// The clock and countdown sit on bands 4..7 (core/clock.js, geometry BANDS), which only use the
// middle and horizon colours. No ink reads on a background whose relative luminance is between
// about 0.165 and 0.205, so the stops are authored so that the sky passes that gap at one altitude
// on each side (FLIP_RISING, FLIP_SETTING): there the middle and horizon colours both have a
// luminance of 0.179, where pure white and pure black both reach 4.5:1. Below the flip every band
// behind the text is darker than that and the ink is light; above it every one is lighter and the
// ink is dark. So the sky never needs a lightness shift, and only the ink flips, once.
var INK_FROM = 4, INK_TO = 7;
var FLIP_RISING = -7, FLIP_SETTING = 0;

function paletteAt(altDeg, rising) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var s = Script.momentAt(alt, rising);
  var raw = bandsOf(s.top, s.mid, s.hor, alt);
  var skyLight = alt < (rising ? FLIP_RISING : FLIP_SETTING);
  var sky = raw;
  var inkBands = sky.slice(INK_FROM, INK_TO + 1);
  var land = [s.duneFar, s.duneMid, s.duneNear];
  // Figures take the light of the moment (tint), then sink into its shade (warm at dusk, cool at night).
  var dim = function (hex) { return mix(mix(hex, s.tint, s.lit), s.shade, s.sink); };
  // All the halos only warm the sky. Near the ink flip (sky luminance about 0.179) their
  // colour is chosen so that, laid over the sky behind the clock, the luminance stays the same: the
  // text keeps its contrast on top of them. Away from the flip they are the plain light of the sun.
  var free = mix(s.sun, s.hor, 0.35), freeW = smooth(clamp((Math.abs(C.luminance(sky[5]) - 0.179) - 0.1) / 0.1, 0, 1));
  var glow = mix(tintKeepingLuminance(mix(s.sun, s.hor, 0.2), sky[5], 0.26), free, freeW);
  var haloFree = mix(s.sun, s.hor, 0.3), halo = mix(tintKeepingLuminance(haloFree, sky[5], 0.4), haloFree, freeW);
  var inkS = skyLight ? "#f3eee6" : "#14233a";
  var accS = skyLight ? "#f3c47c" : "#8a3a1e";
  // The panel: warm paper (tinted by the horizon light) by day, then a long, quiet crossing through a
  // dusty plum to deep indigo; mixed along the hue circle so it is never a desaturated grey.
  var paper = mix(PAPER, s.hor, 0.16);
  var inkPanel = C.mixLch(C.mixLch(INK_NIGHT_PANEL, PLUM, smooth(clamp((alt + 14) / 7, 0, 1))), paper, smooth(clamp((alt + 7) / 8, 0, 1)));
  var panelLight = inkIsLight([inkPanel]);
  var panel = tone([inkPanel], panelLight)[0];
  var panelInk = ensureContrast(panelLight ? "#f3eee6" : "#2a1d12", [panel], panelLight);
  var deep = smooth(clamp((C.luminance(panel) - 0.1) / 0.22, 0, 1)); // 0 on a dark panel, 1 on paper
  var rowFill = mix("#f4bd6a", "#e39a38", deep);
  return {
    skyBands: sky, farTwo: s.farTwo, farOne: s.farOne, duneFar: land[0], duneMid: land[1], duneNear: land[2], land: land,
    sun: s.sun, sunCore: mix(s.sun, "#fff3d6", 0.14), halo: halo, glow: glow,
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
