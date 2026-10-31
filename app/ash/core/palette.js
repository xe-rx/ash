.pragma library
// paletteAt(altitudeDeg, rising): every colour of the scene as hex strings, a pure function of the
// sun's altitude and whether it is rising or setting. Stops are authored in sRGB, mixed in OKLab
// (perceptually even steps). Text colours are derived from the final backgrounds so that every
// ink has at least 4.5:1 contrast against the bands it can sit on (checked in tests).

var MIN_CONTRAST = 4.5;
var SAFE = 4.62; // margin over the minimum, for hex rounding

// Authored stops, ascending altitude. top/hor: sky at the zenith and horizon; sand: middle dune;
// sun: the disc. Rising and setting differ between about -18 and +30 degrees.
var NIGHT = { top: "#03050c", hor: "#0b1226", sand: "#0f1322", sun: "#6a6f8c" };
var DAY = { top: "#4fb4ee", hor: "#c9edf9", sand: "#ebb561", sun: "#ffe066" };
var RISING = [
  [-90, NIGHT],
  [-20, { top: "#050a1c", hor: "#0e2250", sand: "#111a30", sun: "#6a6f8c" }],
  [-12, { top: "#0a1c52", hor: "#2569ad", sand: "#1b2b4d", sun: "#9fb8e8" }],
  [-6, { top: "#2a3f8c", hor: "#e8869b", sand: "#7e5a7c", sun: "#ffb48a" }],
  [-1, { top: "#6a9ee0", hor: "#ffc47e", sand: "#d98e68", sun: "#ffd98a" }],
  [4, { top: "#58aaea", hor: "#ffe4a6", sand: "#e8a45f", sun: "#ffe08a" }],
  [20, { top: "#52b0ec", hor: "#cbeefa", sand: "#ebb05f", sun: "#ffe066" }],
  [90, DAY]
];
var SETTING = [
  [-90, NIGHT],
  [-20, { top: "#050818", hor: "#161a44", sand: "#13152b", sun: "#6a6f8c" }],
  [-10, { top: "#1a1d5c", hor: "#6f3a8a", sand: "#473358", sun: "#d9a0d0" }],
  [-4, { top: "#2f2978", hor: "#c0406e", sand: "#8a4166", sun: "#ff9a7a" }],
  [0, { top: "#43388f", hor: "#e85f55", sand: "#cb5e48", sun: "#ff9966" }],
  [8, { top: "#5f8ed4", hor: "#ffbf66", sand: "#eda23f", sun: "#ffc94d" }],
  [28, { top: "#56a8e6", hor: "#ffe5a3", sand: "#efb24a", sun: "#ffd23f" }],
  [90, DAY]
];

function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }

// ---- colour maths (sRGB hex <-> OKLab) ----
function toLinear(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function toGamma(c) { return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
function hexToRgb(h) {
  return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255];
}
function hex2(v) { var s = Math.round(clamp(v, 0, 1) * 255).toString(16); return s.length < 2 ? "0" + s : s; }
function rgbToHex(c) { return "#" + hex2(c[0]) + hex2(c[1]) + hex2(c[2]); }

function toLab(hex) {
  var c = hexToRgb(hex), r = toLinear(c[0]), g = toLinear(c[1]), b = toLinear(c[2]);
  var l = Math.pow(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b, 1 / 3);
  var m = Math.pow(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b, 1 / 3);
  var s = Math.pow(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b, 1 / 3);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function fromLab(lab) {
  var l = lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2];
  var m = lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2];
  var s = lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2];
  l = l * l * l; m = m * m * m; s = s * s * s;
  return rgbToHex([toGamma(clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, 0, 1)),
    toGamma(clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, 0, 1)),
    toGamma(clamp(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s, 0, 1))]);
}
function mixLab(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function mix(hexA, hexB, t) { return fromLab(mixLab(toLab(hexA), toLab(hexB), t)); }

function luminance(hex) {
  var c = hexToRgb(hex);
  return 0.2126 * toLinear(c[0]) + 0.7152 * toLinear(c[1]) + 0.0722 * toLinear(c[2]);
}
function contrast(a, b) {
  var x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function distance(a, b) { // Euclidean distance in OKLab
  var p = toLab(a), q = toLab(b);
  return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2) + Math.pow(p[2] - q[2], 2));
}

// ---- tone: keep every band of a set on one side of the luminance gap where no ink can read ----
var DARK_MAX = 0.165, LIGHT_MIN = 0.205;
function inkIsLight(bands) {
  var sum = 0;
  for (var i = 0; i < bands.length; i++) { sum += luminance(bands[i]); }
  return sum / bands.length < 0.185;
}
function toneBand(hex, light) {
  var lab = toLab(hex), n = 0;
  while (n++ < 60 && (light ? luminance(fromLab(lab)) > DARK_MAX : luminance(fromLab(lab)) < LIGHT_MIN)) {
    lab[0] += light ? -0.01 : 0.01;
  }
  return fromLab(lab);
}
function tone(bands, light) {
  var out = [];
  for (var i = 0; i < bands.length; i++) { out.push(toneBand(bands[i], light)); }
  return out;
}

function ensureContrast(hex, bgs, toward) { // lightness walks toward white or black until readable
  var lab = toLab(hex), n = 0;
  function ok(h) { for (var i = 0; i < bgs.length; i++) { if (contrast(h, bgs[i]) < SAFE) { return false; } } return true; }
  while (n++ < 80 && !ok(fromLab(lab))) { lab[0] = clamp(lab[0] + (toward ? 0.012 : -0.012), 0, 1); }
  return ok(fromLab(lab)) ? fromLab(lab) : (toward ? "#ffffff" : "#000000");
}

// ---- stops ----
function smooth(t) { return t * t * (3 - 2 * t); }
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

function bandsOf(top, hor) {
  var out = [];
  for (var i = 0; i < 5; i++) { out.push(mix(top, hor, Math.pow(i / 4, 1.25))); }
  return out;
}

function shade(hex, f) { var l = toLab(hex); return fromLab([l[0] * f, l[1] * 1.15 + 0.012, l[2]]); }

function paletteAt(altDeg, rising) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var s = stopAt(rising ? RISING : SETTING, alt);
  var skyLight = inkIsLight(bandsOf(s.top, s.hor));
  var sky = tone(bandsOf(s.top, s.hor), skyLight);
  var far = mix(s.sand, s.hor, 0.55), mid = s.sand, near = shade(s.sand, 0.72);
  var land = [far, mid];
  var landLight = inkIsLight(land);
  land = tone(land, landLight);
  var lit = smooth(clamp((alt + 10) / 24, 0, 1)); // 0 in the dark, 1 in full daylight
  var dim = function (hex) { return mix(mix(hex, s.hor, 0.12), "#04060e", 0.72 * (1 - lit)); };
  var inkS = skyLight ? "#f2efff" : "#0b1c30", inkL = landLight ? "#f2efff" : "#0b1c30";
  var accS = skyLight ? "#ffc861" : "#a1123c", accL = landLight ? "#ffc861" : "#a1123c";
  var mean = function (b) { return b[Math.floor(b.length / 2)]; };
  return {
    skyBands: sky, land: land, duneFar: land[0], duneMid: land[1], duneNear: dim(near),
    sun: s.sun, moon: alt < -3, stars: alt < -9, moonColor: "#e9e6d8", starColor: "#cfd3f0",
    dots: mix(inkS, mean(sky), 0.35), dotsBelow: mix(inkS, mean(sky), 0.7),
    inkSky: ensureContrast(inkS, sky, skyLight), accentSky: ensureContrast(accS, sky, skyLight),
    softSky: ensureContrast(mix(inkS, mean(sky), 0.3), sky, skyLight),
    inkLand: ensureContrast(inkL, land, landLight), accentLand: ensureContrast(accL, land, landLight),
    softLand: ensureContrast(mix(inkL, mean(land), 0.3), land, landLight),
    cloth: dim("#0e7c78"), clothBorder: dim("#f6e7c1"), clothStripe: dim("#e08a3c"),
    father: dim("#f3ead8"), mother: dim("#6d2f63"), hijab: dim("#a54a86"), girl: dim("#e0606b"),
    boy: dim("#2d5fa6"), skin: dim("#c98c60"), skinDark: dim("#8e5a3c"), hair: dim("#2a1a16")
  };
}
