'use strict';
// The light direction is not authored: it follows the sun. L is the unit vector from the scene toward the light
// (x right, y down). The sun rises at the picture's left (core/geometry.js arcPoint(0)), so a rising sun lights
// from the left: (-1, -0.18) at the horizon as in the approved dawn still, (1, -0.18) at sunset; overhead it is
// (-0.3, -1) as in the noon still (shared by rising and setting, since the `day` layer is one file). Under the
// horizon the glow on the horizon gives way to moonlight (0.3, -1) by -22 degrees. Continuous in altitude.
const { unit } = require('./paint');

const smooth = t => t * t * (3 - 2 * t);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const HORIZON_Y = -0.18, NOON = [-0.3, -1], MOON = [0.3, -1];

function lightAt(alt, rising) {
  const side = rising ? -1 : 1;
  if (alt >= 0) {
    const a = smooth(clamp(alt / 70, 0, 1)); // horizon light to overhead light by 70 degrees
    return unit([side * (1 - a) + NOON[0] * a, HORIZON_Y * (1 - a) + NOON[1] * a]);
  }
  const n = smooth(clamp((-alt - 8) / 14, 0, 1)); // horizon glow down to -8, moonlight from -22
  return unit([side * (1 - n) + MOON[0] * n, HORIZON_Y * (1 - n) + MOON[1] * n]);
}

module.exports = { lightAt };
