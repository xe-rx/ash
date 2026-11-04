'use strict';
const { P } = require('./palette');
const S = require('./svg');
const L = require('./layout');
const { placed, fringe } = require('./sadu');
const { tentFrame, weave } = require('./tent');

// Tent seen from inside: dark goat-hair roof with a sadu valance, a pole and guy ropes, a woven divider on the right.
function panelB(ctx) {
  const x0 = L.PANEL_X, W = L.W, out = [];
  out.push(tentFrame(ctx, W));
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
