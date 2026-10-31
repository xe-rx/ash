.pragma library
// Colour maths shared by the palette and its tests: sRGB hex <-> OKLab, mixing, WCAG contrast.

function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }

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

function chroma(hex) { var l = toLab(hex); return Math.sqrt(l[1] * l[1] + l[2] * l[2]); }
function smooth(t) { return t * t * (3 - 2 * t); }

// Mix along the hue circle (OKLCH, shortest way round): in-between colours keep their chroma
// instead of passing through grey. For nearly opposite hues the way round is ambiguous (and flips
// with the slightest change), so the mix fades into plain OKLab there: continuous everywhere.
function mixLch(hexA, hexB, t) {
  var a = toLab(hexA), b = toLab(hexB);
  var ca = Math.sqrt(a[1] * a[1] + a[2] * a[2]), cb = Math.sqrt(b[1] * b[1] + b[2] * b[2]);
  var ha = Math.atan2(a[2], a[1]), hb = Math.atan2(b[2], b[1]);
  if (ca < 0.004) { ha = hb; } else if (cb < 0.004) { hb = ha; }
  var dh = hb - ha;
  if (dh > Math.PI) { dh -= 2 * Math.PI; } else if (dh < -Math.PI) { dh += 2 * Math.PI; }
  var c = ca + (cb - ca) * t, h = ha + dh * t;
  var w = smooth(clamp((Math.abs(dh) - 2.3) / 0.84, 0, 1)); // 0 below about 132 degrees, 1 at 180
  var lab = mixLab(a, b, t);
  return fromLab([lab[0], lab[1] * w + c * Math.cos(h) * (1 - w), lab[2] * w + c * Math.sin(h) * (1 - w)]);
}
