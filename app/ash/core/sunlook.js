.pragma library
// How the sun looks at an altitude: near the horizon it is larger, deeper and wrapped in wide
// halos; high up it is smaller and tighter. Three stepped halos plus the disc and a lighter core,
// and two very large, very faint discs that warm the sky all around a low sun (so the sky looks lit
// from one place); those fade out as the sun climbs, gone by 25 degrees.
// Below the horizon only the halos show (their opacity fades to nothing by -12 degrees).

var GLOW_END_DEG = -12, WIDE_END_DEG = 25;

function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
function smooth(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

function sunLook(altDeg) {
  var alt = typeof altDeg === "number" && isFinite(altDeg) ? clamp(altDeg, -90, 90) : -90;
  var high = smooth(clamp(alt / 22, 0, 1));              // 0 at the horizon, 1 high up
  var glow = alt >= 0 ? 1 : clamp((alt - GLOW_END_DEG) / -GLOW_END_DEG, 0, 1);
  var boost = 1 + 0.7 * smooth(clamp(-alt / 4, 0, 1)); // twilight glow reads a little stronger
  var r = lerp(46, 30, high);
  var reach = [lerp(1.75, 1.4, high), lerp(2.6, 1.9, high), lerp(3.6, 2.45, high), 4.8, 7.6];
  var low = 1 - smooth(clamp(alt / WIDE_END_DEG, 0, 1)); // 1 at the horizon, 0 from 25 degrees up
  var alpha = [lerp(0.3, 0.22, high) * glow * boost, lerp(0.19, 0.14, high) * glow * boost, lerp(0.1, 0.08, high) * glow * boost,
    0.16 * low * glow * boost, 0.12 * low * glow * boost];
  return {
    r: r, coreR: r * 0.6,
    haloR: [r * reach[0], r * reach[1], r * reach[2], r * reach[3], r * reach[4]],
    haloAlpha: alpha,
    discVisible: alt > -4,       // deeper than this the dunes hide it completely
    glowVisible: glow > 0
  };
}
