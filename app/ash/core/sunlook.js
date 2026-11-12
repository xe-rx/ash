.pragma library
// How the sun looks at an altitude (the cel stills, tools/art/cel/sky.js): four stepped, flat rings of
// falling opacity around the disc, and a lighter core. At the horizon the disc is larger (r 40) and the
// rings reach wider; from 12 degrees up it is smaller (r 32) and the rings tighter. Below the horizon only
// the rings show, their opacity fading to nothing by -12 degrees.

var GLOW_END_DEG = -12;
var RING_LOW = [1.25, 1.8, 2.6, 3.75], RING_HIGH = [1.17, 1.69, 2.44, 3.52]; // ring radius over the disc's, innermost first
var RING_ALPHA = [0.5, 0.34, 0.2, 0.1];

function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
function smooth(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

function sunLook(altDeg) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var high = smooth(clamp(alt / 12, 0, 1));              // 0 at the horizon, 1 from 12 degrees up
  var glow = alt >= 0 ? 1 : clamp((alt - GLOW_END_DEG) / -GLOW_END_DEG, 0, 1);
  var r = lerp(40, 32, high), haloR = [], haloAlpha = [], i;
  for (i = 0; i < 4; i++) {
    haloR.push(r * lerp(RING_LOW[i], RING_HIGH[i], high));
    haloAlpha.push(RING_ALPHA[i] * glow);
  }
  return {
    r: r, coreR: r * 0.72,
    haloR: haloR, haloAlpha: haloAlpha,
    discVisible: alt > -4,       // deeper than this the land hides it completely
    glowVisible: glow > 0
  };
}
