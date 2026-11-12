.pragma library
.import "colour.js" as C
.import "script.js" as Script
.import "skygrad.js" as Grad
.import "clock.js" as K
// paletteAt(altitudeDeg, rising): every live colour of the cel picture (ADR 0004) as hex strings, a pure
// function of the sun's altitude and whether it is rising or setting. The colours of every moment are
// authored in core/script.js and mixed in OKLab by altitude; this file assembles what the QML draws live:
// the sky, the sun, the moon, the clock and the times card (the land is baked from the same script).
// Inks are pulled until they read at 4.5:1 on what they really sit on (checked in tests): the clock ink on
// the sky, which is held dark enough behind the clock; the card inks on the card and the accent pill.

var SAFE = 4.62; // margin over 4.5:1, for hex rounding
var TEXT_CONTRAST = 5.6; // the sky behind the clock is darkened until its ink reads at this (margin for rings and hex rounding)
var SAND = ["#efc28a", "#d08a56"]; // the far and the near sand before grading: tools/art/cel/moments.js LOC.sand[0] and [3]
var TEXT_HALF_W = 160, WARM_FADE = 40; // half the widest clock or countdown text about K.CLOCK_CX (checked in tests); px of clearance over which a ring warms up
var clamp = C.clamp, mix = C.mix;

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

// The ink for a fill: the candidate that reads best on it, pulled toward whichever of white and black reads
// better on the fill until it reads (on a mid tone, where the card's ink flips, only one of the two does).
function inkOn(candidates, fill) {
  var best = candidates[0], i;
  for (i = 1; i < candidates.length; i++) { if (C.contrast(candidates[i], fill) > C.contrast(best, fill)) { best = candidates[i]; } }
  return ensureContrast(best, [fill], C.contrast("#ffffff", fill) >= C.contrast("#000000", fill));
}

// The lightest colour of hex's hue, no lighter than hex, on which ink reads at TEXT_CONTRAST: a bisection on
// OKLab lightness, so every darkened band lands on the same ceiling and the gradient stays monotonic.
function heldDark(hex, ink) {
  var lab = C.toLab(hex), lo = 0, hi = lab[0], i;
  if (C.contrast(ink, hex) >= TEXT_CONTRAST) { return hex; }
  for (i = 0; i < 24; i++) {
    lab[0] = (lo + hi) / 2;
    if (C.contrast(ink, C.fromLab(lab)) >= TEXT_CONTRAST) { lo = lab[0]; } else { hi = lab[0]; }
  }
  lab[0] = lo;
  return C.fromLab(lab);
}

// The nine gradient stops of the still's sky (tools/art/cel/sky.js), read off its curve at the positions in
// core/skygrad.js: the zenith colour at y 0, the middle colour at MID_Y, the horizon colour at HOR_Y, mixed
// linearly in sRGB like the still's SVG gradient. Stop 7, the one stop between the middle and the horizon
// colour, is mixed in OKLab instead: between a blue mid and a gold horizon (alt +2 rising) the sRGB chord
// crosses grey, and the stop keeps the gradient off it (within 0.02 units of the still wherever it shows
// undarkened). Stops 0..7 lie behind or above the clock and the countdown: they are held dark enough for
// the clock ink to read on them; stop 8, the horizon, is left as authored.
function stopsOf(top, mid, hor, ink) {
  var out = [], i, y, t;
  for (i = 0; i < 9; i++) {
    y = Grad.STOP_Y[i];
    if (y <= Grad.MID_Y) { out.push(Grad.blend(top, mid, y / Grad.MID_Y)); }
    else { t = Math.min(1, (y - Grad.MID_Y) / (Grad.HOR_Y - Grad.MID_Y)); out.push(t < 1 ? mix(mid, hor, t) : hor); }
    if (i < 8) { out[i] = heldDark(out[i], ink); }
  }
  return out;
}

function paletteAt(altDeg, rising) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var s = Script.momentAt(alt, rising);
  var sky = stopsOf(s.top, s.mid, s.hor, s.ink);
  var cardInk = inkOn([s.cardInk], s.card);
  // The sun's rings (glow: the outer two, halo: the third; the innermost is the sun's colour) tint the sky: laid
  // over the sky behind the clock their colour keeps its luminance, so the clock ink keeps its contrast on top of
  // them. Where a ring cannot reach the text it carries the sun's own colour instead (ringWarmth, ringColour).
  var glow = tintKeepingLuminance(s.glow, sky[5], 0.2), halo = tintKeepingLuminance(s.glow, sky[5], 0.42);
  function graded(c) { return mix(c, s.key, s.tint); } // the land's base grading (tools/art/cel/paint.js B)
  return {
    skyStops: sky,
    sun: s.glow, sunCore: mix(s.glow, "#ffffff", 0.5), glow: glow, halo: halo,
    moon: alt < -8, stars: alt < -9, moonAlpha: clamp((-alt - 8) / 6, 0, 1), starAlpha: clamp((-alt - 8) / 6, 0, 1), // none at dawn (-7), as the stills
    moonColor: "#f4f2e4", starColor: "#cfd3f0",
    inkSky: s.ink, clockShadow: s.inkShadow, night: clamp(s.dim / 0.45, 0, 1),
    card: s.card, cardShadow: mix(s.mid, s.amb, 0.5), cardInk: cardInk,
    cardInkFaded: inkOn([mix(cardInk, s.card, 0.42)], s.card),
    accent: s.accent, accentInk: inkOn(["#ffffff", cardInk, "#1a1a1a"], s.accent),
    sandEdge: [graded(SAND[0]), graded(SAND[1])]
  };
}

// The rings' warmth, one value per ring (innermost first, radii haloR from sunlook.js): a ring carries the sun's
// own colour (laid over the sky at its alpha it is then the still's warm mix toward glow, tools/art/cel/sky.js)
// only where it cannot reach the clock or the countdown, that is near the ends of the arc with the sun low: 1
// when WARM_FADE px clear of the widest text, 0 where it touches it. A high sun always sits over the text and
// keeps the neutral tints; the outermost ring (r 150 at the horizon) touches the text even at the arc's ends.
function ringWarmth(sunX, haloR) {
  var out = [], k;
  for (k = 0; k < haloR.length; k++) { out.push(C.smooth(clamp((Math.abs(sunX - K.CLOCK_CX) - TEXT_HALF_W - haloR[k]) / WARM_FADE, 0, 1))); }
  return out;
}
function ringColour(pal, k, warmth) { // ring k of the palette at a warmth 0..1, as Sun.qml paints it
  var neutral = k === 0 ? pal.sun : (k >= 2 ? pal.glow : pal.halo);
  return warmth >= 1 ? pal.sun : (warmth <= 0 ? neutral : mix(neutral, pal.sun, warmth));
}
