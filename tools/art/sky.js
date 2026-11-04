'use strict';
const { P, mix } = require('./palette');
const S = require('./svg');
const L = require('./layout');

// Sky gradient, stars, sun with halo rings and a fan of fine rays. One gentle feGaussianBlur on the glow only.
function sky(ctx) {
  const r = S.rng(7), out = [];
  const grad = S.lin(ctx, [[0, P.skyTop], [0.38, P.skyMid], [0.72, P.skyLow], [1, P.horizon]]);
  out.push(S.rect(0, 0, L.W, L.HORIZON + 40, { fill: grad }));
  // horizontal colour strata in the sky: thin translucent bars, geometric haze
  for (let i = 0; i < 9; i++) {
    const y = 120 + i * 30 + r() * 6, h = 6 + r() * 14;
    out.push(S.rect(0, y, L.W, h, { fill: i % 2 ? '#ffb070' : '#7a3f8a', opacity: 0.035 + i * 0.006 }));
  }
  // stars: dots and four-point sparkles, only in the upper indigo band
  for (let i = 0; i < 90; i++) {
    const x = r() * L.W, y = r() * 200, a = 0.75 * (1 - y / 215);
    if (i % 11 === 0) out.push(S.poly(S.star(x, y, 3.6, 0.9, 4), { fill: '#e9e6ff', opacity: a.toFixed(2) }));
    else out.push(S.circ(x, y, 0.5 + r() * 0.9, { fill: '#cfd3f0', opacity: a.toFixed(2) }));
  }
  // sun: broad glow, concentric halo rings, rays, disc
  const { x, y, r: R } = L.SUN;
  ctx.defs.push('<filter id="softglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>');
  out.push(S.circ(x, y, 150, { fill: P.horizon, opacity: 0.35, filter: 'url(#softglow)' }));
  out.push(S.circ(x, y, 330, { fill: S.rad(ctx, [[0, '#ffb45a', 0.55], [0.35, '#e8704a', 0.22], [1, '#c4584a', 0]], { cx: 0.5, cy: 0.5, r: 0.5 }) }));
  [64, 92, 130, 180, 240, 310].forEach((rr, i) => out.push(S.circ(x, y, rr, { fill: 'none', stroke: i % 2 ? '#ffd9a0' : '#ffb070', stroke_width: i % 2 ? 0.8 : 1.6, opacity: (0.42 - i * 0.055).toFixed(2) })));
  for (let k = 0; k < 36; k++) {   // fine rays, upper half-plane only
    const a = Math.PI + (k + 0.5) * Math.PI / 36, w = 0.012 + (k % 3) * 0.008, len = 300 + (k % 4) * 60;
    out.push(S.poly([[x, y], [x + len * Math.cos(a - w), y + len * Math.sin(a - w)], [x + len * Math.cos(a + w), y + len * Math.sin(a + w)]], { fill: '#ffd9a0', opacity: 0.05 }));
  }
  out.push(S.circ(x, y, R + 7, { fill: mix(P.sun, '#ffffff', 0.1), opacity: 0.32 }));
  out.push(S.circ(x, y, R, { fill: S.rad(ctx, [[0, '#fff3d6'], [0.55, P.sunCore], [1, P.sun]], { cx: 0.42, cy: 0.4, r: 0.65 }) }));
  out.push(S.circ(x, y, R - 8, { fill: 'none', stroke: '#fff3d6', stroke_width: 0.8, opacity: 0.5 }));
  return out.join('\n');
}
module.exports = { sky };
