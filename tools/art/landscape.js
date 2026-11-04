'use strict';
const { P, mix } = require('./palette');
const S = require('./svg');
const L = require('./layout');

// Strata mesa: stacked tiers, each narrower, lit face toward the sun and a shadow face, thin strata lines.
function mesa(ctx, x, base, w, h, tiers, haze) {
  const out = [], sunSide = L.SUN.x > x ? 1 : -1;
  const lit = mix(P.far2, P.horizon, haze * 0.5), dark = mix(P.shade(P.far1), P.horizon, haze * 0.6);
  for (let t = 0; t < tiers; t++) {
    const th = h / tiers, y1 = base - th * t, y0 = y1 - th, inset = t * w * 0.05, hw = w / 2 - inset;
    const w0 = hw - 6, pts = [[x - hw, y1], [x - w0, y0], [x + w0, y0], [x + hw, y1]];
    out.push(S.poly(pts, { fill: dark }));
    const litPts = sunSide > 0 ? [[x - hw, y1], [x - w0, y0], [x + hw * 0.1, y0], [x - hw * 0.05, y1]] : [[x + hw, y1], [x + w0, y0], [x - hw * 0.1, y0], [x + hw * 0.05, y1]];
    out.push(S.poly(litPts, { fill: S.lin(ctx, [[0, P.lit(lit)], [1, lit]]) }));
    for (let s = 1; s < 4; s++) out.push(S.line([x - hw + inset * 0.1, y0 + th * s / 4], [x + hw - inset * 0.1, y0 + th * s / 4], { stroke: P.shadow, stroke_width: 0.7, opacity: 0.18 }));
    out.push(S.line([x - w0, y0], [x + w0, y0], { stroke: P.glint, stroke_width: 1, opacity: 0.45 }));
  }
  return out.join('\n');
}

// One faceted dune layer: shadow silhouette first, then lit faces toward the sun, fine contour ripples.
function duneLayer(ctx, seed, o) {
  const r = S.rng(seed), out = [], peaks = [];
  let x = -60;
  while (x < L.W + 120) { const sp = o.span * (0.7 + r() * 0.7); peaks.push({ vx: x, px: x + sp * (0.35 + r() * 0.3), h: o.amp * (0.45 + r() * 0.55) }); x += sp; }
  peaks.push({ vx: x, px: x + 100, h: 0 });
  const valleyY = i => o.base + (i % 2 ? 6 : 0);
  const ridge = [];
  peaks.forEach((p, i) => { ridge.push([p.vx, valleyY(i)], [p.px, valleyY(i) - p.h]); });
  const base = mix(o.col, P.shadow, 0.0), shade = P.shade(o.col);
  out.push(S.poly([[-80, L.H + 10], ...ridge, [L.W + 200, L.H + 10]], { fill: S.lin(ctx, [[0, shade], [1, mix(shade, P.shadow, 0.5)]]) }));
  for (let i = 0; i < peaks.length - 1; i++) {
    const p = peaks[i], q = peaks[i + 1], vy = valleyY(i), top = [p.px, vy - p.h];
    const toSun = p.px > L.SUN.x;                       // slope facing the sun is lit
    const v = toSun ? [p.vx, vy] : [q.vx, valleyY(i + 1)];
    const foot = [p.px + (toSun ? 0.12 : -0.12) * o.span, Math.max(vy, v[1]) + 4];
    const face = [top, v, foot];
    out.push(S.poly(face, { fill: S.lin(ctx, [[0, mix(P.lit(o.col), P.glint, o.rich ? 0.2 : 0)], [0.45, o.rich ? mix(o.col, P.tint, 0.2) : o.col], [1, o.rich ? mix(o.col, P.shadow, 0.3) : base]], { x1: 0, y1: 0, x2: toSun ? 0.3 : 0.7, y2: 1 }) }));
    const n = o.ripples;
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1), a = [top[0] + (v[0] - top[0]) * t, top[1] + (v[1] - top[1]) * t], b = [top[0] + (foot[0] - top[0]) * t, top[1] + (foot[1] - top[1]) * t];
      out.push(S.line(a, b, { stroke: k % 2 ? P.glint : P.shadow, stroke_width: 0.7, opacity: k % 2 ? 0.22 : 0.16 }));
    }
    out.push(S.line(top, foot, { stroke: P.glint, stroke_width: 1.1, opacity: 0.4 }));   // crest light
    const shadeFace = [top, toSun ? [q.vx, valleyY(i + 1)] : [p.vx, vy], foot];
    out.push(S.poly(shadeFace, { fill: P.shade(o.col), opacity: 0.35 }));
  }
  // layered haze above the layer
  const hz = S.lin(ctx, [[0, P.haze, 0], [1, P.haze, o.haze]]);
  out.push(S.rect(0, o.base - o.amp - 24, L.W, o.amp + 40, { fill: hz }));
  return out.join('\n');
}

function landscape(ctx) {
  const out = [], H = L.HORIZON;
  out.push(S.rect(0, H, L.W, 40, { fill: S.lin(ctx, [[0, P.horizon, 0.0], [1, P.far2, 0.9]]) }));
  out.push(mesa(ctx, 150, H + 44, 330, 88, 4, 0.5), mesa(ctx, 420, H + 38, 190, 54, 3, 0.58), mesa(ctx, 520, H + 38, 140, 38, 2, 0.62));
  const layers = [
    { base: 396, amp: 34, span: 230, col: P.dunes[0], ripples: 3, haze: 0.5 },
    { base: 424, amp: 46, span: 260, col: P.dunes[1], ripples: 6, haze: 0.3, rich: 1 },
    { base: 462, amp: 62, span: 330, col: P.dunes[2], ripples: 8, haze: 0.2, rich: 1 },
    { base: 510, amp: 50, span: 300, col: P.dunes[3], ripples: 6, haze: 0.14 },
    { base: 566, amp: 30, span: 420, col: P.dunes[4], ripples: 4, haze: 0.0 },
  ];
  layers.forEach((l, i) => out.push(duneLayer(ctx, 11 + i * 5, l)));
  out.push(S.rect(0, 470, L.W, 130, { fill: S.lin(ctx, [[0, P.dark, 0], [1, P.dark, 0.55]]) }));   // foreground depth
  return out.join('\n');
}
module.exports = { landscape };
