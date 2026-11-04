'use strict';
const { P, mix } = require('./palette');
const S = require('./svg');
const L = require('./layout');

// Faceless figures seen from behind, watching the sun: robe silhouette, two-tone back, rim light on the sun side.
function figure(ctx, o) {
  const u = o.h / 100, out = [], T = (x, y) => [o.x + x * u, o.y + y * u], sun = L.SUN.x > o.x ? 1 : -1;
  const robe = o.robe, back = mix(robe, P.shadow, 0.42), glow = mix(robe, '#ffb070', 0.3);
  const body = [[-36, 0], [36, 0], [31, -16], [22, -48], [25, -62], [13, -69], [-13, -69], [-25, -62], [-22, -48], [-31, -16]].map(p => T(p[0], p[1]));
  out.push(S.poly([[o.x - 40 * u, o.y + 3], [o.x + 46 * u, o.y + 3], [o.x + 70 * u + 20, o.y + 14], [o.x - 4 * u + 20, o.y + 14]], { fill: '#12060f', opacity: 0.28 }));   // cast shadow toward viewer
  out.push(S.poly(body, { fill: robe }));
  out.push(S.poly([T(0, 0), T(36, 0), T(31, -16), T(22, -48), T(25, -62), T(13, -69), T(0, -69)], { fill: back, opacity: 0.8 }));   // shadow half
  out.push(S.poly([T(-36, 0), T(-31, -16), T(-22, -48), T(-25, -62), T(-13, -69), T(-4, -69), T(-14, -40), T(-20, -4)], { fill: glow, opacity: 0.45 }));   // sky-lit facet
  [[-14, -46, -24, -2], [-4, -48, -8, -2], [8, -46, 16, -2]].forEach(l => out.push(S.line(T(l[0], l[1]), T(l[2], l[3]), { stroke: P.shadow, stroke_width: Math.max(0.8, u * 0.9), opacity: 0.35 })));
  out.push(S.line(T(-30, -16), T(30, -16), { stroke: P.shadow, stroke_width: Math.max(0.8, u), opacity: 0.3 }));  // knee line
  out.push(S.poly([T(-5, -69), T(5, -69), T(4, -75), T(-4, -75)], { fill: P.shade('#c98c60') }));   // neck
  const hc = T(0, -84), hr = 15 * u;
  if (o.kind === 'father') {
    out.push(S.poly([T(-15, -86), T(15, -86), T(25, -63), T(-25, -63)], { fill: '#f3ead8' }));   // ghutra drape
    out.push(S.poly([T(0, -86), T(15, -86), T(25, -63), T(0, -63)], { fill: '#8a7f78', opacity: 0.55 }));
    out.push(S.circ(hc[0], hc[1], hr, { fill: '#f3ead8' }));
    out.push(S.poly([[hc[0], hc[1] - hr], [hc[0] + hr, hc[1]], [hc[0], hc[1] + hr]], { fill: '#8a7f78', opacity: 0.5 }));
    out.push(`<ellipse cx="${S.f(hc[0])}" cy="${S.f(hc[1] - 3 * u)}" rx="${S.f(hr * 1.02)}" ry="${S.f(3.4 * u)}" fill="none" stroke="#1d1715" stroke-width="${S.f(2 * u)}"/>`);
  } else if (o.kind === 'mother') {
    out.push(S.poly([T(-14, -90), T(14, -90), T(30, -60), T(0, -52), T(-30, -60)], { fill: o.hijab }));
    out.push(S.circ(hc[0], hc[1], hr * 1.08, { fill: o.hijab }));
    out.push(S.poly([T(0, -97), T(15, -88), T(30, -60), T(0, -52)], { fill: P.shadow, opacity: 0.35 }));
    out.push(S.poly(S.diamond(...T(0, -30), 7 * u, 9 * u), { fill: P.saffron })); out.push(S.poly(S.diamond(...T(0, -30), 3 * u, 4 * u), { fill: P.madder }));
    out.push(S.rect(o.x - 36 * u, o.y - 7 * u, 72 * u, 4 * u, { fill: P.saffron, opacity: 0.9 }));
  } else if (o.kind === 'girl') {
    out.push(S.circ(hc[0], hc[1], hr, { fill: '#2a1a16' }));
    out.push(S.circ(hc[0], hc[1] - hr - 5 * u, 6 * u, { fill: '#2a1a16' }));
    out.push(S.poly(S.diamond(hc[0] + 6 * u, hc[1] - hr - 3 * u, 4 * u, 4 * u), { fill: P.madder }));
    out.push(S.line(T(-5, -76), T(-9, -50), { stroke: '#2a1a16', stroke_width: 4 * u }));    // braid
    out.push(S.poly([T(0, -97), T(13, -86), T(0, -72)], { fill: P.shadow, opacity: 0.3 }));
    out.push(S.rect(o.x - 36 * u, o.y - 6 * u, 72 * u, 3 * u, { fill: P.madder, opacity: 0.9 }));
  } else {   // boy: white kufi with a band
    out.push(S.circ(hc[0], hc[1], hr, { fill: '#2a1a16' }));
    out.push(S.poly([[hc[0] - hr, hc[1] - 2 * u], [hc[0] - hr * 0.8, hc[1] - hr * 0.7], [hc[0], hc[1] - hr * 1.02], [hc[0] + hr * 0.8, hc[1] - hr * 0.7], [hc[0] + hr, hc[1] - 2 * u]], { fill: '#f3ead8' }));
    out.push(S.line([hc[0] - hr, hc[1] - 3 * u], [hc[0] + hr, hc[1] - 3 * u], { stroke: P.indigo, stroke_width: 2 * u }));
    for (let i = -1; i <= 1; i++) out.push(S.poly(S.diamond(hc[0] + i * 6 * u, hc[1] - 8 * u, 2 * u, 2.4 * u), { fill: P.madder }));
  }
  // rim light on the sun side: shoulder line and head arc
  const s = sun;
  out.push(`<polyline points="${S.pts([T(s * 13, -69), T(s * 25, -62), T(s * 22, -48), T(s * 31, -16)])}" fill="none" stroke="#ffd9a0" stroke-width="${S.f(Math.max(1, 1.6 * u))}" opacity="0.8"/>`);
  out.push(`<path d="M ${S.f(hc[0] + s * hr * 0.2)} ${S.f(hc[1] - hr * 0.98)} A ${S.f(hr)} ${S.f(hr)} 0 0 ${s > 0 ? 1 : 0} ${S.f(hc[0] + s * hr)} ${S.f(hc[1])}" fill="none" stroke="#ffd9a0" stroke-width="${S.f(Math.max(1, 1.6 * u))}" opacity="0.85"/>`);
  return out.join('\n');
}

// Rug in light perspective: trapezoid field, borders, flattened eight-point-star medallions, fringe.
function rug(ctx) {
  const out = [], ty = 522, by = 588, tl = 206, tr = 606, bl = 170, br = 642;
  const cx = (tl + tr) / 2, X = (t, side) => side < 0 ? tl + (bl - tl) * t : tr + (br - tr) * t, Y = t => ty + (by - ty) * t;
  const trap = (a, b) => [[X(a, -1), Y(a)], [X(a, 1), Y(a)], [X(b, 1), Y(b)], [X(b, -1), Y(b)]];
  out.push(S.poly([[tl - 10, ty + 2], [tr + 10, ty + 2], [br + 12, by + 8], [bl - 12, by + 8]], { fill: '#10060f', opacity: 0.4 }));   // contact shadow
  for (let i = 0; i < 22; i++) {   // fringe at both short ends
    const t = i / 21, y = Y(t);
    out.push(S.line([X(t, -1), y], [X(t, -1) - 12, y + 1], { stroke: P.wool, stroke_width: 1.2, opacity: 0.8 }));
    out.push(S.line([X(t, 1), y], [X(t, 1) + 12, y + 1], { stroke: P.wool, stroke_width: 1.2, opacity: 0.8 }));
  }
  out.push(S.poly(trap(0, 1), { fill: '#e9dcc4' }));                       // wool selvedge
  const inner = (a, b, ins) => [[X(a, -1) + ins * 1.1, Y(a) + ins * 0.2], [X(a, 1) - ins * 1.1, Y(a) + ins * 0.2], [X(b, 1) - ins * 1.1, Y(b) - ins * 0.2], [X(b, -1) + ins * 1.1, Y(b) - ins * 0.2]];
  out.push(S.poly(inner(0, 1, 3), { fill: P.ground }));
  out.push(S.poly(inner(0, 1, 7), { fill: '#7a2430' }));
  out.push(S.poly(inner(0, 1, 15), { fill: S.lin(ctx, [[0, '#4a1a3a'], [1, '#2c1030']]) }));
  // diamond border row on the red band
  for (let i = 0; i < 26; i++) {
    const t = (i + 0.5) / 26, xa = tl + (tr - tl) * t, xb = bl + (br - bl) * t;
    out.push(S.poly(S.diamond(xa, Y(0.1), 5, 3), { fill: P.wool })); out.push(S.poly(S.diamond(xb, Y(0.9), 6, 3), { fill: P.wool }));
  }
  // medallions: three flattened eight-point stars
  [[0.27, 0.9], [0.5, 1.15], [0.73, 0.9]].forEach(([tx, sc], i) => {
    const mx = cx + (tx - 0.5) * (tr - tl + 40), my = Y(0.5);
    out.push(`<g transform="translate(${S.f(mx)} ${S.f(my)}) scale(1 0.34)">` + S.poly(S.star(0, 0, 32 * sc, 16 * sc, 8), { fill: i === 1 ? P.saffron : P.madder }) + S.poly(S.star(0, 0, 20 * sc, 10 * sc, 8, Math.PI / 8), { fill: P.ground }) + S.poly(S.diamond(0, 0, 9 * sc, 9 * sc), { fill: i === 1 ? P.madder : P.saffron }) + '</g>');
  });
  out.push(S.line([X(0.3, -1) + 22, Y(0.3)], [X(0.3, 1) - 22, Y(0.3)], { stroke: P.wool, stroke_width: 0.8, opacity: 0.55 }));
  out.push(S.line([X(0.7, -1) + 22, Y(0.7)], [X(0.7, 1) - 22, Y(0.7)], { stroke: P.wool, stroke_width: 0.8, opacity: 0.55 }));
  return out.join('\n');
}

function family(ctx) {
  const figs = [
    { kind: 'father', x: 290, y: 556, h: 134, robe: '#e9dcc4' },
    { kind: 'mother', x: 524, y: 556, h: 124, robe: '#34408e', hijab: '#2a3478' },
    { kind: 'boy', x: 366, y: 566, h: 84, robe: '#3a58b8' },
    { kind: 'girl', x: 446, y: 568, h: 90, robe: '#f0a53a' },
  ];
  return rug(ctx) + '\n' + figs.map(f => figure(ctx, f)).join('\n');
}
module.exports = { family };
