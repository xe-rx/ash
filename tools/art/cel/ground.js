'use strict';
// The foreground: sand the family sits on, the rug, the lantern's warm pool at night, the figures' ground
// contact and the lantern itself. Everything is a solid colour; repaints happen under clips.
const { f } = require('./colour');
const { cel } = require('./paint');
const { W, H, LOC } = require('./moments');
const { dunePath, FG } = require('./land');
const { contacts } = require('./people');

// The rug: a trapezoid about 432 px wide at the top, centred under the family (x 522), as the approved cloth.
const RUG = { top: 536, bottom: 598, xt: [306, 738], xb: [286, 758] };
const lerp = (y, a, b) => a + (b - a) * (y - RUG.top) / (RUG.bottom - RUG.top);
function quad(inset, y0, y1) {
  const pts = [[lerp(y0, RUG.xt[0], RUG.xb[0]) + inset, y0], [lerp(y0, RUG.xt[1], RUG.xb[1]) - inset, y0],
    [lerp(y1, RUG.xt[1], RUG.xb[1]) - inset, y1], [lerp(y1, RUG.xt[0], RUG.xb[0]) + inset, y1]];
  return `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}"/>`;
}
const RUG_EDGE = quad(0, RUG.top, RUG.bottom), RUG_FIELD = quad(9, RUG.top + 6, RUG.bottom - 6);
const BAND = { y0: 562, y1: 584 };

// The diamond band in the middle of the rug.
function diamonds(col) {
  const y0 = BAND.y0, y1 = BAND.y1, ym = (y0 + y1) / 2, xl = lerp(ym, RUG.xt[0], RUG.xb[0]) + 30, xr = lerp(ym, RUG.xt[1], RUG.xb[1]) - 30, n = 13;
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = xl + (xr - xl) * (i + 0.5) / n, w = (xr - xl) / n * 0.36;
    out += `<polygon points="${f(x - w)},${ym} ${f(x)},${y0 + 3} ${f(x + w)},${ym} ${f(x)},${y1 - 3}" fill="${col(LOC.rugGold)}"/>`;
  }
  return out;
}
const withFill = (shape, colour) => shape.replace(/\/>$/, ` fill="${colour}"/>`);

// Sand and rug in one flat mapper, for the repaints (contact shadows, lantern pool).
function groundFlat(col) {
  return `<rect x="0" y="0" width="${W}" height="${H}" fill="${col(LOC.sand[3])}"/>` + withFill(RUG_EDGE, col(LOC.rugEdge)) +
    withFill(RUG_FIELD, col(LOC.rug)) + withFill(quad(20, BAND.y0, BAND.y1), col(LOC.rugMid)) + diamonds(col);
}

// The lit ground: sand and rug shaded with the rule, the rug's middle band and diamonds flat.
function groundLit(doc, P, m) {
  const k = m.k.rug, h = m.h.rug;
  return cel(doc, `<path d="${dunePath(FG)}"/>`, m.L, m.k.dune, m.h.dune, P.cols(FG.col)) +
    cel(doc, RUG_EDGE, m.L, k, h, P.cols(LOC.rugEdge)) + cel(doc, RUG_FIELD, m.L, k, h, P.cols(LOC.rug)) +
    withFill(quad(20, BAND.y0, BAND.y1), P.B(LOC.rugMid)) + diamonds(P.B);
}

// At night the lantern lays a warm pool on the rug: two stepped ellipses, each a solid repaint.
function lanternPool(doc, P, m) {
  const { x, y } = m.lamp;
  return `<g ${doc.clip(`<ellipse cx="${x}" cy="${y}" rx="280" ry="40"/>`)}>${groundFlat(P.WARM)}</g>` +
    `<g ${doc.clip(`<ellipse cx="${x}" cy="${y}" rx="150" ry="22"/>`)}>${groundFlat(P.WARM2)}</g>`;
}

function foreground(doc, P, m) {
  let out = `<g ${doc.clip(`<path d="${dunePath(FG)}"/>`)}>` + groundLit(doc, P, m);
  if (m.lamp) out += lanternPool(doc, P, m);
  out += `<g ${doc.clip(contacts(m))}>${groundFlat(P.S)}</g>`;
  return out + '</g>';
}

// The lantern between the children, shaded with the rule like everything else; the glass is the light itself.
function lantern(doc, P, m) {
  if (!m.lamp) return '';
  const { x, y } = m.lamp, c = P.cols(LOC.lantern), k = 3, h = 1.5;
  const rect = (rx, ry, w, hh, r) => `<rect x="${x + rx}" y="${y + ry}" width="${w}" height="${hh}" rx="${r}"/>`;
  return withFill(rect(-9, -34, 18, 30, 4), '#ffd99a') + cel(doc, rect(-12, -40, 24, 8, 3), m.L, k, h, c) +
    cel(doc, rect(-12, -6, 24, 7, 3), m.L, k, h, c) + withFill(rect(-3, -30, 6, 20, 3), '#fff4dc');
}

module.exports = { foreground, lantern, RUG };
