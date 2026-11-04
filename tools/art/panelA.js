'use strict';
const { P } = require('./palette');
const S = require('./svg');
const L = require('./layout');
const { placed } = require('./sadu');

// Mashrabiya: carved walnut lattice, eight-point-star and diamond openings cut through a mask so the sky shows.
function panelA(ctx) {
  const x0 = L.PANEL_X, w = L.W - x0, s = 64, out = [], open = [], carve = [], r = S.rng(3);
  const ox = x0 + w / 2 - s * 2.5, oy = -26;      // centre the star columns
  for (let row = 0; row < 11; row++) for (let col = -1; col < 6; col++) {
    const cx = ox + s * (col + 0.5), cy = oy + s * (row + 0.5);
    open.push(S.poly(S.star(cx, cy, 30, 15, 8), { fill: '#000' }));
    carve.push(S.poly(S.star(cx, cy, 30, 15, 8)));
    for (const [dx, dy] of [[1, 1]]) { const a = S.diamond(cx + s / 2 * dx, cy + s / 2 * dy, 12, 12); open.push(S.poly(a, { fill: '#000' })); carve.push(S.poly(a)); }
    // engraved outer star line and tiny rivets in the wood between openings
    out.push(S.poly(S.star(cx, cy, 38, 22, 8, Math.PI / 8), { fill: 'none', stroke: P.woodLight, stroke_width: 0.7, opacity: 0.38 }));
    out.push(S.circ(cx, cy, 2.2, { fill: P.woodLight, opacity: 0.3 }));
    out.push(S.line([cx - 32, cy], [cx - 27, cy], { stroke: P.woodLight, stroke_width: 0.7, opacity: 0.4 }));
  }
  ctx.defs.push(`<mask id="lattice" maskUnits="userSpaceOnUse" x="${x0}" y="0" width="${w}" height="${L.H}">${S.rect(x0, 0, w, L.H, { fill: '#fff' })}${open.join('')}</mask>`);
  // warm light pouring through the openings: gold wash masked to the openings only (baked as part of the panel layer)
  ctx.defs.push(`<mask id="openings" maskUnits="userSpaceOnUse" x="${x0}" y="0" width="${w}" height="${L.H}">${open.map(p => p.replace('#000', '#fff')).join('')}</mask>`);
  const wash = S.rect(x0, 0, w, L.H, { fill: S.lin(ctx, [[0, '#ffb45a', 0.1], [0.45, '#ff9a48', 0.5], [0.8, '#e8704a', 0.4], [1, '#c4584a', 0.2]]), mask: 'url(#openings)' });
  const wood = S.lin(ctx, [[0, P.wood[1]], [0.5, P.wood[0]], [1, P.wood[1]]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const grain = [];
  for (let i = 0; i < 70; i++) { const x = x0 + r() * w; grain.push(S.line([x, 0], [x + (r() - 0.5) * 6, L.H], { stroke: r() > 0.5 ? P.woodLight : '#1a0c05', stroke_width: 0.5 + r() * 0.6, opacity: 0.1 + r() * 0.1 })); }
  const body = [S.rect(x0, 0, w, L.H, { fill: wood }), grain.join(''), out.join('')];
  let svg = S.g({ mask: 'url(#lattice)' }, body.join('\n'));
  svg += '\n' + wash;
  // light bleeding over the opening edges, and a bevel
  ctx.defs.push(`<clipPath id="panelclip">${S.rect(x0, 0, w, L.H)}</clipPath>`);
  svg += '\n' + S.g({ clip_path: 'url(#panelclip)' }, carve.map(p => p.replace('/>', ` fill="none" stroke="#ffb866" stroke-width="2.4" opacity="0.55"/>`)).join('') + carve.map(p => p.replace('/>', ` fill="none" stroke="#fff0c8" stroke-width="0.8" opacity="0.75"/>`)).join(''));
  // outer frame with a diamond strip, and the shadow it throws on the picture
  svg += S.rect(x0 - 26, 0, 26, L.H, { fill: S.lin(ctx, [[0, '#000', 0], [1, '#14090c', 0.5]], { x1: 0, y1: 0, x2: 1, y2: 0 }) });
  svg += S.rect(x0, 0, 8, L.H, { fill: P.wood[0] }) + S.rect(x0 + 8, 0, 1.5, L.H, { fill: P.woodLight, opacity: 0.6 });
  svg += S.rect(L.W - 8, 0, 8, L.H, { fill: P.wood[0] }) + S.rect(L.W - 9.5, 0, 1.5, L.H, { fill: P.woodLight, opacity: 0.5 });
  // solid bands for the text: header and table, sadu strips at their edges
  const bx = x0 + 14, bw = w - 28, H = L.HDR, R = L.ROWS, th = R.h * R.n;
  svg += S.rect(bx, H.y, bw, H.h, { fill: P.ground }) + S.rect(bx, R.y - 14, bw, th + 28, { fill: P.ground });
  svg += placed(bx, H.y - 12, 0, bw, 12) + placed(bx, H.y + H.h, 0, bw, 12);
  svg += placed(bx, R.y - 14, 0, bw, 14) + placed(bx, R.y + th, 0, bw, 14);
  for (let i = 1; i < R.n; i++) svg += S.line([bx + 20, R.y + i * R.h], [bx + bw - 20, R.y + i * R.h], { stroke: P.wool, stroke_width: 0.8, opacity: 0.22 });
  return svg;
}
module.exports = { panelA, bounds: () => ({ x0: L.PANEL_X + 14, x1: L.W - 14 }) };
