'use strict';
const { P } = require('./palette');
const S = require('./svg');
const L = require('./layout');
const { placed, fringe } = require('./sadu');

// Cloth weave: seams of the tent strips plus fine pick lines, as translucent geometry.
function weave(x0, y0, x1, y1, seam, seed) {
  const r = S.rng(seed), out = [];
  for (let x = x0; x <= x1; x += seam) out.push(S.line([x, y0], [x, y1], { stroke: '#000', stroke_width: 1.4, opacity: 0.35 }), S.line([x + 1.6, y0], [x + 1.6, y1], { stroke: P.wool, stroke_width: 0.5, opacity: 0.08 }));
  for (let y = y0; y < y1; y += 4) out.push(S.line([x0, y + r()], [x1, y + r()], { stroke: r() > 0.5 ? P.wool : '#000', stroke_width: 0.6, opacity: 0.05 + r() * 0.04 }));
  return out.join('');
}

// Tent seen from inside: dark goat-hair roof with a sadu valance, a pole and guy ropes, a woven divider on the right.
function panelB(ctx) {
  const x0 = L.PANEL_X, W = L.W, out = [];
  const hemL = 128, hemR = 92, ang = Math.atan2(hemR - hemL, x0) * 180 / Math.PI, len = Math.hypot(x0, hemR - hemL);
  // roof cloth
  out.push(S.poly([[0, 0], [W, 0], [W, hemR], [x0, hemR], [0, hemL]], { fill: S.lin(ctx, [[0, '#0e0907'], [0.8, P.ground], [1, '#2a1c18']]) }));
  out.push(weave(0, 0, W, hemR, 64, 5));
  // sadu valance parallel to the hem, with fringe hanging under it
  out.push(placed(0, hemL - 30, ang, len, 30));
  out.push(`<g transform="translate(0 ${hemL}) rotate(${S.f(ang)})">${fringe(len, 15, 12)}</g>`);
  out.push(S.line([0, hemL], [x0, hemR], { stroke: '#ffb866', stroke_width: 1.2, opacity: 0.5 }));
  // ridge guide lines: two taut lines converging on the pole top (clean geometry)
  out.push(S.line([0, 20], [x0, 40], { stroke: P.wool, stroke_width: 0.8, opacity: 0.18 }));
  // pole at left, with facets
  const px = 38;
  out.push(S.rect(px - 7, hemL - 18, 14, L.H - hemL + 18, { fill: S.lin(ctx, [[0, '#2a170d'], [0.35, '#8a5a2c'], [0.55, '#c08040'], [1, '#2a170d']], { x1: 0, y1: 0, x2: 1, y2: 0 }) }));
  for (let y = hemL + 40; y < L.H; y += 58) out.push(S.rect(px - 7, y, 14, 3, { fill: P.madder }), S.rect(px - 7, y + 3, 14, 1, { fill: P.wool, opacity: 0.6 }));
  out.push(S.poly([[px - 12, L.H], [px + 12, L.H], [px + 8, L.H - 14], [px - 8, L.H - 14]], { fill: '#1a0e08' }));
  // guy ropes with pegs: clean straight lines
  const rope = (a, b) => S.line(a, b, { stroke: '#e0c9a0', stroke_width: 1.6 }) + S.line([a[0] + 1.2, a[1]], [b[0] + 1.2, b[1]], { stroke: '#4a3020', stroke_width: 0.7, opacity: 0.7 });
  out.push(rope([px, hemL - 10], [188, 596]), rope([x0 - 6, hemR + 16], [x0 - 70, 596]));
  [[188, 596], [x0 - 70, 596]].forEach(p => out.push(S.poly([[p[0] - 4, 600], [p[0] + 4, 600], [p[0] + 2, 584], [p[0] - 2, 584]], { fill: '#5a3a1c' })));
  // divider cloth: shadow edge, ground, vertical sadu stripes, bottom fringe
  out.push(S.rect(x0 - 30, 0, 30, L.H, { fill: S.lin(ctx, [[0, '#000', 0], [1, '#10080a', 0.55]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }));
  out.push(S.rect(x0, 0, W - x0, L.H, { fill: S.lin(ctx, [[0, '#251a17'], [1, '#150f0e']], { x1: 0, y1: 0, x2: 1, y2: 0 }) }));
  out.push(weave(x0, 0, W, L.H - 36, 40, 9));
  out.push(S.poly([[x0, 0], [x0 + 8, 0], [x0 + 8, L.H], [x0, L.H]], { fill: P.wool, opacity: 0.12 }));
  const vw = L.H - 44;
  out.push(placed(x0 + 16, 0, 90, vw, 14), placed(W - 2, 0, 90, vw, 14));
  const R = L.ROWS, th = R.h * R.n, bx = x0 + 22, bw = W - x0 - 44;
  out.push(S.rect(bx, L.HDR.y, bw, L.HDR.h, { fill: '#100a09' }), S.rect(bx, R.y - 14, bw, th + 28, { fill: '#100a09' }));
  out.push(placed(bx, L.HDR.y - 12, 0, bw, 12), placed(bx, L.HDR.y + L.HDR.h, 0, bw, 12), placed(bx, R.y - 14, 0, bw, 14), placed(bx, R.y + th, 0, bw, 14));
  for (let i = 1; i < R.n; i++) out.push(S.line([bx + 20, R.y + i * R.h], [bx + bw - 20, R.y + i * R.h], { stroke: P.wool, stroke_width: 0.8, opacity: 0.22 }));
  out.push(S.rect(x0, L.H - 38, W - x0, 8, { fill: P.madder }), S.rect(x0, L.H - 30, W - x0, 2, { fill: P.wool }));
  out.push(`<g transform="translate(${x0} ${L.H - 28})">${fringe(W - x0, 28, 8)}</g>`);
  return out.join('\n');
}
module.exports = { panelB, bounds: () => ({ x0: L.PANEL_X + 22, x1: L.W - 22 }) };
