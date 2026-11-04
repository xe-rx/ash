.pragma library
.import "colour.js" as C
.import "script.js" as Script
// paletteAt(altitudeDeg, rising): every colour of the scene as hex strings, a pure function of the
// sun's altitude and whether it is rising or setting. The Bedouin dye family: indigo, madder, saffron,
// ochre, goat-hair black and undyed cream. The colours of every moment of the day are authored in
// core/script.js (the colour script) and mixed in OKLab by altitude; this file assembles them. The
// clock and the table use cream ink everywhere, so the sky behind the clock is held dark enough for
// it (checked in tests); at night the cream and the whole table are dimmed, an authored weave.

var SAFE = 4.62; // margin over 4.5:1, for hex rounding

var CREAM = "#fff1dc", WOOL = "#efe4cf", GROUND = "#1d1715", MADDER = "#a8322a";
var TEXT_CONTRAST = 5.6; // the sky behind the clock is darkened until cream reads at this (margin for halos and hex rounding)
var clamp = C.clamp, mix = C.mix, smooth = C.smooth;

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

// Nine gradient stops from the zenith to the horizon (stop positions in core/skygrad.js). Stops 0..6
// run from the top to the middle colour, stop 7 goes a third of the way to the horizon, stop 8 is the
// horizon. Stops 0..7 lie behind or above the clock and the countdown: they are darkened (in OKLab
// lightness) until the cream ink reads on them.
function stopsOf(top, mid, hor, ink) {
  var out = [], i, lab, n;
  for (i = 0; i < 9; i++) {
    out.push(i < 7 ? mix(top, mid, i / 6) : (i === 7 ? mix(mid, hor, 0.3) : hor));
    lab = C.toLab(out[i]); n = 0;
    while (i < 8 && n++ < 80 && C.contrast(ink, C.fromLab(lab)) < TEXT_CONTRAST) { lab[0] -= 0.01; }
    if (i < 8) { out[i] = C.fromLab(lab); }
  }
  return out;
}

function paletteAt(altDeg, rising) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var s = Script.momentAt(alt, rising);
  var ground = GROUND, cream = mix(CREAM, ground, s.dim * 0.3);
  var sky = stopsOf(s.top, s.mid, s.hor, cream);
  var land = [s.duneFar, s.duneMid, s.duneNear];
  // The halos only warm the sky: their colour is chosen so that, laid over the sky behind the clock, the
  // luminance stays the same, and the cream text keeps its contrast on top of them.
  var glow = tintKeepingLuminance(mix(s.sun, s.hor, 0.2), sky[5], 0.26);
  var halo = tintKeepingLuminance(mix(s.sun, s.hor, 0.3), sky[5], 0.4);
  var madder = mix(MADDER, ground, s.dim * 0.5), woolDim = mix(WOOL, ground, s.dim * 0.5);
  var faded = ensureContrast(mix(cream, ground, 0.55), [ground], true);
  return {
    skyStops: sky, farTwo: s.farTwo, farOne: s.farOne, duneFar: land[0], duneMid: land[1], duneNear: land[2], land: land,
    sun: s.sun, sunCore: mix(s.sun, "#fff3d6", 0.14), halo: halo, glow: glow,
    moon: alt < -3, stars: alt < -9, moonAlpha: clamp((-alt - 3) / 6, 0, 1), starAlpha: clamp((-alt - 8) / 6, 0, 1),
    moonColor: "#e9e6d8", starColor: "#cfd3f0",
    inkSky: cream, night: clamp(s.dim / 0.45, 0, 1),
    ground: ground, ink: cream, inkFaded: faded, weaveDim: s.dim * 0.9,
    rowFill: madder, rowInk: ensureContrast(cream, [madder], true),
    tagFill: woolDim, tagInk: ensureContrast(ground, [woolDim], false)
  };
}
