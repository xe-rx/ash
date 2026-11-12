'use strict';
// Land: the far mesas and the dune layers, each one shape painted with the shading rule.
const { mix, f } = require('./colour');
const { cel } = require('./paint');
const { W, H, LOC } = require('./moments');

// Dunes: a baseline lifted by cosine humps; smooth and rounded. Paths run past both screen edges so the shifted
// copies the rule uses still cover the frame.
const MARGIN = 60;
const bump = u => (Math.abs(u) < 1 ? (Math.cos(Math.PI * u) + 1) / 2 : 0);
function profile(layer, x) { return layer.base - layer.humps.reduce((s, h) => s + h.h * bump((x - h.x) / h.w), 0); }
function dunePath(layer) {
  let d = `M${-MARGIN},${H + MARGIN} `;
  for (let x = -MARGIN; x <= W + MARGIN; x += 4) d += `L${x},${f(profile(layer, x))} `;
  return d + `L${W + MARGIN},${H + MARGIN}Z`;
}

const LAYERS = [
  { base: 432, col: LOC.sand[0], humps: [{ x: 110, h: 46, w: 240 }, { x: 520, h: 30, w: 260 }, { x: 900, h: 58, w: 230 }] },
  { base: 488, col: LOC.sand[1], humps: [{ x: -40, h: 66, w: 300 }, { x: 400, h: 38, w: 240 }, { x: 820, h: 74, w: 300 }] },
  { base: 540, col: LOC.sand[2], humps: [{ x: 180, h: 52, w: 260 }, { x: 760, h: 44, w: 230 }] },
];
// The foreground sand the family sits on (its humps frame the rug).
const FG = { base: 548, col: LOC.sand[3], humps: [{ x: 60, h: 30, w: 260 }, { x: 960, h: 40, w: 280 }] };

function dunes(doc, P, m) {
  return LAYERS.map(l => cel(doc, `<path d="${dunePath(l)}"/>`, m.L, m.k.dune, m.h.dune, P.cols(l.col))).join('');
}

// Far mesas: flat-topped silhouettes, hazed toward the horizon sky so they sit back.
const MESAS = [[140, 196, 392, 414, 10], [196, 340, 368, 416, 18], [570, 712, 380, 418, 16], [706, 760, 396, 418, 9]];
function mesaPath(x0, x1, top, base, slope) {
  const a = x0 + slope, b = x1 - slope;
  return `M${x0},${base} C${x0 + slope * 0.4},${base - 6} ${a - 3},${top + 10} ${a},${top + 3} Q${a + 1},${top} ${a + 6},${top} ` +
    `L${b - 6},${top} Q${b - 1},${top} ${b},${top + 3} C${b + 3},${top + 10} ${x1 - slope * 0.4},${base - 6} ${x1},${base}Z`;
}
function mesas(doc, m) {
  const haze = m.mesa, horizon = m.skyLow;
  const cols = { base: mix(horizon, m.amb, haze.base), lit: mix(horizon, m.amb, haze.lit), shade: mix(horizon, m.amb, haze.shade) };
  return MESAS.map(spec => cel(doc, `<path d="${mesaPath(...spec)}"/>`, m.L, m.k.mesa, m.h.mesa, cols)).join('');
}

module.exports = { dunes, mesas, dunePath, profile, FG, LAYERS };
