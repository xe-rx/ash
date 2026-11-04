'use strict';
const { P } = require('./palette');
const S = require('./svg');

// Rug in light perspective: trapezoid field, borders, flattened eight-point-star medallions, fringe.
function rug(ctx) {
  const out = [], ty = 522, by = 588, tl = 206, tr = 606, bl = 170, br = 642;
  const cx = (tl + tr) / 2, X = (t, side) => side < 0 ? tl + (bl - tl) * t : tr + (br - tr) * t, Y = t => ty + (by - ty) * t;
  const trap = (a, b) => [[X(a, -1), Y(a)], [X(a, 1), Y(a)], [X(b, 1), Y(b)], [X(b, -1), Y(b)]];
  out.push(S.poly([[tl - 10, ty + 2], [tr + 10, ty + 2], [br + 12, by + 8], [bl - 12, by + 8]], { fill: '#10060f', opacity: 0.4 }));   // contact shadow
  for (let i = 0; i < 22; i++) {   // fringe at both short ends
    const t = i / 21, y = Y(t);
    out.push(S.line([X(t, -1), y], [X(t, -1) - 12, y + 1], { stroke: P.fig(P.wool), stroke_width: 1.2, opacity: 0.8 }));
    out.push(S.line([X(t, 1), y], [X(t, 1) + 12, y + 1], { stroke: P.fig(P.wool), stroke_width: 1.2, opacity: 0.8 }));
  }
  out.push(S.poly(trap(0, 1), { fill: P.fig('#e9dcc4') }));                       // wool selvedge
  const inner = (a, b, ins) => [[X(a, -1) + ins * 1.1, Y(a) + ins * 0.2], [X(a, 1) - ins * 1.1, Y(a) + ins * 0.2], [X(b, 1) - ins * 1.1, Y(b) - ins * 0.2], [X(b, -1) + ins * 1.1, Y(b) - ins * 0.2]];
  out.push(S.poly(inner(0, 1, 3), { fill: P.fig(P.ground) }));
  out.push(S.poly(inner(0, 1, 7), { fill: P.fig('#7a2430') }));
  out.push(S.poly(inner(0, 1, 15), { fill: S.lin(ctx, [[0, P.fig('#4a1a3a')], [1, P.fig('#2c1030')]]) }));
  // diamond border row on the red band
  for (let i = 0; i < 26; i++) {
    const t = (i + 0.5) / 26, xa = tl + (tr - tl) * t, xb = bl + (br - bl) * t;
    out.push(S.poly(S.diamond(xa, Y(0.1), 5, 3), { fill: P.fig(P.wool) })); out.push(S.poly(S.diamond(xb, Y(0.9), 6, 3), { fill: P.fig(P.wool) }));
  }
  // medallions: three flattened eight-point stars
  [[0.27, 0.9], [0.5, 1.15], [0.73, 0.9]].forEach(([tx, sc], i) => {
    const mx = cx + (tx - 0.5) * (tr - tl + 40), my = Y(0.5);
    out.push(`<g transform="translate(${S.f(mx)} ${S.f(my)}) scale(1 0.34)">` + S.poly(S.star(0, 0, 32 * sc, 16 * sc, 8), { fill: P.fig(i === 1 ? P.saffron : P.madder) }) + S.poly(S.star(0, 0, 20 * sc, 10 * sc, 8, Math.PI / 8), { fill: P.fig(P.ground) }) + S.poly(S.diamond(0, 0, 9 * sc, 9 * sc), { fill: P.fig(i === 1 ? P.madder : P.saffron) }) + '</g>');
  });
  out.push(S.line([X(0.3, -1) + 22, Y(0.3)], [X(0.3, 1) - 22, Y(0.3)], { stroke: P.fig(P.wool), stroke_width: 0.8, opacity: 0.55 }));
  out.push(S.line([X(0.7, -1) + 22, Y(0.7)], [X(0.7, 1) - 22, Y(0.7)], { stroke: P.fig(P.wool), stroke_width: 0.8, opacity: 0.55 }));
  return out.join('\n');
}

module.exports = { rug };
