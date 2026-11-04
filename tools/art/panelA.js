'use strict';
const { P } = require('./palette');
const S = require('./svg');
const L = require('./layout');
const { placed } = require('./sadu');

const x0 = L.PANEL_X, w = L.W - x0, s = 64;
// Opening polygons: eight-point star per cell plus a diamond at the cell corner.
function openings() {
  const ox = x0 + w / 2 - s * 2.5, oy = -26, list = [];
  for (let row = 0; row < 11; row++) for (let col = -1; col < 6; col++) {
    const cx = ox + s * (col + 0.5), cy = oy + s * (row + 0.5);
    list.push({ cx, cy, pts: S.star(cx, cy, 30, 15, 8) }, { cx: cx + s / 2, cy: cy + s / 2, pts: S.diamond(cx + s / 2, cy + s / 2, 12, 12) });
  }
  return list;
}
// Bevel: edges on the upper-left of an opening catch light, lower-right edges fall in shadow.
function bevel(o, grow, lit, dark, wd) {
  const out = [], n = o.pts.length;
  for (let i = 0; i < n; i++) {
    const a = o.pts[i], b = o.pts[(i + 1) % n], mx = (a[0] + b[0]) / 2 - o.cx, my = (a[1] + b[1]) / 2 - o.cy, k = grow;
    const sc = p => [o.cx + (p[0] - o.cx) * k, o.cy + (p[1] - o.cy) * k], isLit = -(mx + my) > 0;
    out.push(S.line(sc(a), sc(b), { stroke: isLit ? lit : dark, stroke_width: isLit ? wd * 0.8 : wd, opacity: isLit ? 0.85 : 0.7, stroke_linecap: 'round' }));
  }
  return out.join('');
}

// Mashrabiya: carved walnut lattice cut through a mask so the sky shows. The opening wash is NOT included (see washA).
function panelA(ctx) {
  const ops = openings(), r = S.rng(3), out = [];
  ops.forEach(o => {
    if (o.pts.length === 16) {
      out.push(S.poly(S.star(o.cx, o.cy, 38, 22, 8, Math.PI / 8), { fill: 'none', stroke: P.woodLight, stroke_width: 0.7, opacity: 0.38 }));
      out.push(S.poly(S.star(o.cx, o.cy, 34, 19, 8, Math.PI / 8), { fill: 'none', stroke: '#1a0c05', stroke_width: 0.8, opacity: 0.4 }));
      out.push(S.circ(o.cx, o.cy, 2.2, { fill: P.woodLight, opacity: 0.3 }));
      // raised relief: a pale inner facet ring between the openings
      out.push(bevel({ cx: o.cx, cy: o.cy, pts: S.star(o.cx, o.cy, 41, 24, 8, Math.PI / 8) }, 1, '#e8b878', '#120804', 1.4));
    }
  });
  ctx.defs.push(`<mask id="lattice" maskUnits="userSpaceOnUse" x="${x0}" y="0" width="${w}" height="${L.H}">${S.rect(x0, 0, w, L.H, { fill: '#fff' })}${ops.map(o => S.poly(o.pts, { fill: '#000' })).join('')}</mask>`);
  ctx.defs.push(`<clipPath id="panelclip">${S.rect(x0, 0, w, L.H)}</clipPath>`);
  const wood = S.lin(ctx, [[0, P.wood[1]], [0.5, P.wood[0]], [1, P.wood[1]]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const grain = [];
  for (let i = 0; i < 70; i++) { const x = x0 + r() * w; grain.push(S.line([x, 0], [x + (r() - 0.5) * 6, L.H], { stroke: r() > 0.5 ? P.woodLight : '#1a0c05', stroke_width: 0.5 + r() * 0.6, opacity: 0.1 + r() * 0.1 })); }
  let svg = S.g({ mask: 'url(#lattice)' }, [S.rect(x0, 0, w, L.H, { fill: wood }), grain.join(''), out.join('')].join('\n'));
  // depth: dark inner shadow band and lit outer lip on each opening, clipped to the panel
  svg += '\n' + S.g({ clip_path: 'url(#panelclip)' }, ops.map(o => bevel(o, 1.0, '#ffe2a8', '#0e0603', 3.2) + bevel(o, 1.14, '#c88a48', '#241208', 1.4)).join(''));
  svg += S.rect(x0 - 26, 0, 26, L.H, { fill: S.lin(ctx, [[0, '#000', 0], [1, '#14090c', 0.5]], { x1: 0, y1: 0, x2: 1, y2: 0 }) });
  svg += S.rect(x0, 0, 8, L.H, { fill: P.wood[0] }) + S.rect(x0 + 8, 0, 1.5, L.H, { fill: P.woodLight, opacity: 0.6 });
  svg += S.rect(L.W - 8, 0, 8, L.H, { fill: P.wood[0] }) + S.rect(L.W - 9.5, 0, 1.5, L.H, { fill: P.woodLight, opacity: 0.5 });
  const bx = x0 + 14, bw = w - 28, H = L.HDR, R = L.ROWS, th = R.h * R.n;
  svg += S.rect(bx, H.y, bw, H.h, { fill: P.ground }) + S.rect(bx, R.y - 14, bw, th + 28, { fill: P.ground });
  svg += placed(bx, H.y - 12, 0, bw, 12) + placed(bx, H.y + H.h, 0, bw, 12);
  svg += placed(bx, R.y - 14, 0, bw, 14) + placed(bx, R.y + th, 0, bw, 14);
  for (let i = 1; i < R.n; i++) svg += S.line([bx + 20, R.y + i * R.h], [bx + bw - 20, R.y + i * R.h], { stroke: P.wool, stroke_width: 0.8, opacity: 0.22 });
  return svg;
}
function bandRects() {
  const bx = x0 + 14, bw = w - 28, H = L.HDR, R = L.ROWS;
  return [[bx, H.y - 12, bw, H.h + 24], [bx, R.y - 14, bw, R.h * R.n + 28]];
}
// Separate layer: gold light through the openings, masked to them; could be re-tinted live from the sky.
function washA(ctx) {
  ctx.defs.push(`<mask id="openings" maskUnits="userSpaceOnUse" x="${x0}" y="0" width="${w}" height="${L.H}">${openings().map(o => S.poly(o.pts, { fill: '#fff' })).join('')}${bandRects().map(b => S.rect(b[0], b[1], b[2], b[3], { fill: '#000' })).join('')}</mask>`);
  return S.rect(x0, 0, w, L.H, { fill: S.lin(ctx, [[0, '#ffb45a', 0.1], [0.45, '#ff9a48', 0.5], [0.8, '#e8704a', 0.4], [1, '#c4584a', 0.2]]), mask: 'url(#openings)' });
}
module.exports = { panelA, washA, bounds: () => ({ x0: L.PANEL_X + 14, x1: L.W - 14 }) };
