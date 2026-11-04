'use strict';
const { P } = require('./palette');
const S = require('./svg');
const L = require('./layout');
const { placed, fringe } = require('./sadu');

// Cloth weave: strip seams, lit seam edges and fine pick lines, as translucent geometry.
function weave(x0, y0, x1, y1, seam, seed) {
  const r = S.rng(seed), out = [];
  for (let x = x0; x <= x1; x += seam) out.push(S.line([x, y0], [x, y1], { stroke: '#000', stroke_width: 1.4, opacity: 0.35 }), S.line([x + 1.6, y0], [x + 1.6, y1], { stroke: P.wool, stroke_width: 0.5, opacity: 0.08 }));
  for (let y = y0; y < y1; y += 4) out.push(S.line([x0, y + r()], [x1, y + r()], { stroke: r() > 0.5 ? P.wool : '#000', stroke_width: 0.6, opacity: 0.05 + r() * 0.04 }));
  return out.join('');
}
const rope = (a, b) => S.line(a, b, { stroke: '#1a0e08', stroke_width: 3.6 }) + S.line([a[0] - 0.9, a[1]], [b[0] - 0.9, b[1]], { stroke: '#f0d9a8', stroke_width: 1.7 });

// Tent roof seen from inside: pitched canopy with seams converging, light falloff toward the opening,
// sadu valance with fringe, a banded pole and two edge-hugging guy ropes. roofW is how far the cloth runs right.
function tentFrame(ctx, roofW) {
  const x0 = L.PANEL_X, out = [], hemL = 98, hemR = 70, ang = Math.atan2(hemR - hemL, x0) * 180 / Math.PI, len = Math.hypot(x0, hemR - hemL);
  const hemAt = x => hemL + (hemR - hemL) * Math.min(x, x0) / x0, vp = [352, 400];
  out.push(S.poly([[0, 0], [roofW, 0], [roofW, hemR], [x0, hemR], [0, hemL]], { fill: S.lin(ctx, [[0, '#0b0707'], [0.55, '#2a1c18'], [1, '#7a4e3c']]) }));
  // converging panel seams, alternate panels lightened, depth toward the vanishing point
  for (let x = -200; x < roofW + 300; x += 96) {
    const x2 = x + 96, e = u => [u + (vp[0] - u) * 0.26, hemAt(u + (vp[0] - u) * 0.26)];
    if (((x + 200) / 96) % 2) out.push(S.poly([[x, 0], [x2, 0], e(x2), e(x)], { fill: '#ffd9a0', opacity: 0.045 }));
    out.push(S.line([x, 0], e(x), { stroke: '#000', stroke_width: 1.6, opacity: 0.55 }), S.line([x + 1.8, 0], [e(x)[0] + 1.8, e(x)[1]], { stroke: '#ffd9a0', stroke_width: 0.6, opacity: 0.16 }));
  }
  out.push(weave(0, 0, roofW, hemR, 9999, 5));
  out.push(S.rect(0, 0, roofW, 30, { fill: S.lin(ctx, [[0, '#000', 0.5], [1, '#000', 0]]) }));   // dark apex
  out.push(placed(0, hemL - 26, ang, len, 26));
  out.push(`<g transform="translate(0 ${hemL}) rotate(${S.f(ang)})">${fringe(len, 13, 12)}</g>`);
  out.push(S.line([0, hemL], [x0, hemR], { stroke: '#ffb866', stroke_width: 1.2, opacity: 0.55 }));
  const px = 38;
  out.push(S.rect(px - 7, hemL - 18, 14, L.H - hemL + 18, { fill: S.lin(ctx, [[0, '#2a170d'], [0.35, '#8a5a2c'], [0.55, '#c08040'], [1, '#2a170d']], { x1: 0, y1: 0, x2: 1, y2: 0 }) }));
  for (let y = hemL + 40; y < L.H; y += 58) out.push(S.rect(px - 7, y, 14, 3, { fill: P.madder }), S.rect(px - 7, y + 3, 14, 1, { fill: P.wool, opacity: 0.6 }));
  out.push(S.poly([[px - 12, L.H], [px + 12, L.H], [px + 8, L.H - 14], [px - 8, L.H - 14]], { fill: '#1a0e08' }));
  const pegs = [[104, 594], [x0 - 36, 594]];
  out.push(rope([px + 3, hemL - 8], pegs[0]), rope([x0 - 8, hemR + 14], pegs[1]));
  pegs.forEach(p => out.push(S.poly([[p[0] - 4, 600], [p[0] + 4, 600], [p[0] + 2, 584], [p[0] - 2, 584]], { fill: '#5a3a1c' })));
  return out.join('\n');
}
module.exports = { tentFrame, weave };
