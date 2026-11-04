'use strict';
const { P } = require('./palette');
const S = require('./svg');

// Horizontal sadu strip in local coordinates (0,0)-(len,h): ground, madder hairlines, a row of diamond motifs.
function strip(len, h, o) {
  o = o || {}; const out = [], d = h * 0.8, n = Math.floor(len / (d * 1.25)), gap = len / n;
  out.push(S.rect(0, 0, len, h, { fill: o.ground || P.ground }));
  out.push(S.rect(0, 1.5, len, 1.6, { fill: P.madder })); out.push(S.rect(0, h - 3.1, len, 1.6, { fill: P.madder }));
  for (let i = 0; i < n; i++) {
    const cx = gap * (i + 0.5), cy = h / 2;
    out.push(S.poly(S.diamond(cx, cy, d * 0.5, d * 0.5 - 1), { fill: i % 2 ? P.wool : P.saffron }));
    out.push(S.poly(S.diamond(cx, cy, d * 0.22, d * 0.22), { fill: i % 2 ? P.madder : P.indigo }));
  }
  return out.join('');
}
// Place a strip along a line (x0,y0) with rotation in degrees.
const placed = (x, y, deg, len, h, o) => S.g({ transform: `translate(${S.f(x)} ${S.f(y)}) rotate(${S.f(deg)})` }, strip(len, h, o));

// Fringe of tassels in local coordinates along +x; hangs toward +y.
function fringe(len, h, w) {
  const out = [], n = Math.floor(len / w);
  for (let i = 0; i < n; i++) out.push(S.poly([[i * w + 1, 0], [(i + 1) * w - 1, 0], [(i + 0.5) * w, h * (0.8 + (i % 3) * 0.1)]], { fill: i % 3 === 1 ? P.madder : P.wool }));
  return out.join('');
}
module.exports = { strip, placed, fringe };
