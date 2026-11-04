'use strict';
const { P, mix } = require('./palette');
const S = require('./svg');
const L = require('./layout');

// A seated figure seen from behind, cross-legged: legs mass, tapering torso, arms, neck, head and headwear.
// Faceless. u scales a 100-unit-tall figure; colours are lit by the current moment (P.fig).
function figure(ctx, o) {
  const u = o.h / 100, out = [], T = (x, y) => [o.x + x * u, o.y + y * u], poly = (pts, a) => S.poly(pts.map(p => T(p[0], p[1])), a);
  const ln = (a, b, w, c, op) => S.line(T(a[0], a[1]), T(b[0], b[1]), { stroke: c, stroke_width: Math.max(0.7, w * u), opacity: op, stroke_linecap: 'round' });
  const s = L.SUN.x > o.x ? 1 : -1, robe = P.fig(o.robe), dark = mix(robe, P.shadow, 0.45), light = mix(robe, P.tint, 0.28);
  const skin = P.fig('#b9805a'), hc = T(0, -90), hr = 12 * u;
  // cast shadow toward the viewer, then legs
  out.push(poly([[-42, 2], [48, 2], [66, 14], [-14, 14]], { fill: P.dark, opacity: 0.3 }));
  out.push(poly([[-42, 0], [42, 0], [44, -9], [32, -22], [-32, -22], [-44, -9]], { fill: robe }));
  out.push(poly([[0, 0], [42, 0], [44, -9], [32, -22], [0, -22]], { fill: dark, opacity: 0.65 }));
  out.push(poly([[-44, -9], [-32, -22], [-10, -22], [-18, -3]], { fill: light, opacity: 0.6 }));                       // left knee facet
  out.push(poly([[44, -9], [32, -22], [12, -22], [20, -3]], { fill: P.shadow, opacity: 0.25 }));                        // right knee facet
  out.push(ln([-20, -2], [20, -2], 1.2, P.shadow, 0.35));                                                                // crossed-ankle crease
  // torso: tapering back with sloped shoulders
  const torso = [[-22, -20], [22, -20], [18, -44], [25, -66], [14, -75], [-14, -75], [-25, -66], [-18, -44]];
  out.push(poly(torso, { fill: robe }));
  out.push(poly([[0, -20], [22, -20], [18, -44], [25, -66], [14, -75], [0, -75]], { fill: dark, opacity: 0.6 }));        // shadow half of the back
  out.push(poly([[-22, -20], [-18, -44], [-25, -66], [-14, -75], [-6, -75], [-12, -46], [-14, -20]], { fill: light, opacity: 0.55 }));
  // arms resting at the sides
  out.push(poly([[-25, -66], [-31, -48], [-29, -28], [-22, -26], [-20, -46]], { fill: mix(robe, P.shadow, 0.15) }));
  out.push(poly([[25, -66], [31, -48], [29, -28], [22, -26], [20, -46]], { fill: dark }));
  [[-8, -44, -14, -22], [6, -44, 12, -22], [-2, -50, 0, -22]].forEach(l => out.push(ln([l[0], l[1]], [l[2], l[3]], 0.9, P.shadow, 0.3)));   // folds
  out.push(poly([[-5, -75], [5, -75], [4, -80], [-4, -80]], { fill: P.shade(skin) }));                                    // neck
  headwear(ctx, o, out, { u, T, poly, ln, robe, dark, light, hc, hr });
  const rim = (pts) => out.push(`<polyline points="${S.pts(pts.map(p => T(s * p[0], p[1])))}" fill="none" stroke="${P.rimCol}" stroke-width="${S.f(Math.max(1, 1.5 * u))}" opacity="${P.rimOp}"/>`);
  rim([[14, -75], [25, -66], [31, -48], [29, -28]]);
  out.push(`<path d="M ${S.f(hc[0] + s * hr * 0.15)} ${S.f(hc[1] - hr)} A ${S.f(hr)} ${S.f(hr)} 0 0 ${s > 0 ? 1 : 0} ${S.f(hc[0] + s * hr)} ${S.f(hc[1] + hr * 0.2)}" fill="none" stroke="${P.rimCol}" stroke-width="${S.f(Math.max(1, 1.5 * u))}" opacity="${P.rimOp}"/>`);
  return out.join('\n');
}

function headwear(ctx, o, out, k) {
  const { u, T, poly, ln, hc, hr } = k, c = x => P.fig(x), trim = c(P.saffron), dk = P.shadow;
  if (o.kind === 'father') {   // bisht cloak with clean folds, then a ghutra: crown, draped shoulders, hanging tail
    const cl = c('#6a4426');
    out.push(poly([[-29, -67], [-14, -75], [14, -75], [29, -67], [31, -34], [26, -16], [-26, -16], [-31, -34]], { fill: cl }));
    out.push(poly([[0, -75], [14, -75], [29, -67], [31, -34], [26, -16], [0, -16]], { fill: dk, opacity: 0.35 }));
    [[-16, -72, -22, -16], [-6, -74, -9, -16], [5, -74, 8, -16], [16, -72, 22, -16]].forEach((l, i) => out.push(ln([l[0], l[1]], [l[2], l[3]], 1, i % 2 ? dk : '#000', 0.3)));
    out.push(ln([-26, -16], [26, -16], 1.8, trim, 0.95), ln([-14, -75], [-29, -67], 1.6, trim, 0.95), ln([14, -75], [29, -67], 1.6, trim, 0.95));
    const gh = c('#f7efe0');
    out.push(poly([[-13, -94], [13, -94], [21, -76], [13, -63], [0, -58], [-13, -63], [-21, -76]], { fill: gh }));
    out.push(poly([[0, -94], [13, -94], [21, -76], [13, -63], [0, -58]], { fill: '#9a8a78', opacity: 0.45 }));
    out.push(poly([[-13, -94], [-21, -76], [-13, -63], [-6, -78]], { fill: '#ffffff', opacity: 0.25 }));
    out.push(ln([-3, -86], [-9, -61], 0.9, dk, 0.35), ln([6, -84], [8, -60], 0.9, dk, 0.35));
    out.push(S.circ(hc[0], hc[1], hr, { fill: gh }), S.poly([[hc[0], hc[1] - hr], [hc[0] + hr * 0.95, hc[1] + hr * 0.3], [hc[0], hc[1] + hr]].map(p => p), { fill: '#9a8a78', opacity: 0.4 }));
    out.push(ln([-12, -96], [12, -96], 3, '#1d1715', 0.95), ln([-12, -91], [12, -91], 1.6, '#1d1715', 0.95));   // agal
  } else if (o.kind === 'mother') {   // hijab falling to the mid back, abaya trim and a back motif
    const hj = c(o.hijab);
    out.push(poly([[-12, -94], [12, -94], [21, -74], [17, -54], [0, -46], [-17, -54], [-21, -74]], { fill: hj }));
    out.push(poly([[0, -94], [12, -94], [21, -74], [17, -54], [0, -46]], { fill: dk, opacity: 0.35 }));
    out.push(poly([[-12, -94], [-21, -74], [-17, -54], [-8, -70]], { fill: '#fff', opacity: 0.12 }));
    out.push(S.circ(hc[0], hc[1], hr * 1.05, { fill: hj }), ln([0, -80], [0, -48], 0.9, dk, 0.35));
    out.push(poly(S.diamond(0, -34, 7, 9), { fill: trim }), poly(S.diamond(0, -34, 3, 4), { fill: c(P.madder) }));
    out.push(poly([[-42, -4], [42, -4], [43, -9], [-43, -9]], { fill: trim, opacity: 0.9 }));
  } else if (o.kind === 'girl') {   // dark hair in a bun with a braid and a ribbon
    const hr2 = c('#2a1a16');
    out.push(S.circ(hc[0], hc[1], hr, { fill: hr2 }), S.circ(hc[0], hc[1] - hr - 4 * u, 6 * u, { fill: hr2 }));
    out.push(poly([[-3, -80], [3, -80], [5, -56], [0, -50], [-5, -56]], { fill: hr2 }));
    out.push(poly(S.diamond(5, -100, 4, 4), { fill: c(P.madder) }), poly(S.diamond(0, -62, 3.5, 3.5), { fill: c(P.madder) }));
    out.push(poly([[-42, -4], [42, -4], [43, -8], [-43, -8]], { fill: c(P.madder), opacity: 0.9 }));
  } else {   // boy: white kufi with a band and diamonds
    out.push(S.circ(hc[0], hc[1], hr, { fill: c('#2a1a16') }));
    const cap = c('#f3ead8');
    out.push(poly([[-12, -88], [-10, -97], [0, -102], [10, -97], [12, -88]], { fill: cap }), ln([-12, -90], [12, -90], 2, c(P.indigo), 1));
    for (let i = -1; i <= 1; i++) out.push(poly(S.diamond(i * 5.5, -96, 2, 2.4), { fill: c(P.madder) }));
    out.push(poly([[0, -102], [10, -97], [12, -88], [0, -88]], { fill: dk, opacity: 0.3 }));
  }
}
module.exports = { figure };
