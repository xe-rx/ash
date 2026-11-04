'use strict';
// Sadu dye palette for the Maghrib key moment (taken from the sadu-redesign branch, script.js -1..4 min).
function hex(c) { return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
function toHex(v) { return '#' + v.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex(a), B = hex(b); return toHex(A.map((x, i) => x + (B[i] - x) * t)); }
function lum(c) {
  const v = hex(c).map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

const P = {
  cream: '#fff1dc', wool: '#efe4cf', ground: '#1d1715', madder: '#a8322a', saffron: '#f0a53a', indigo: '#2c3a8a',
  skyTop: '#1b2b78', skyMid: '#5a3a80', skyLow: '#c4584a', horizon: '#f6a845',
  sun: '#f6a845', sunCore: '#ffe2a8', haze: '#f2a05a',
  dunes: ['#e08a58', '#d86a42', '#b24632', '#822f2c', '#5a2024'],   // far to near
  shadow: '#2a1030', passed: '#a99d8a',
  wood: ['#4a2a14', '#7a4c24', '#a8702f'], woodLight: '#d9a362',
};
P.shade = c => mix(c, P.shadow, 0.55);
P.lit = c => mix(c, '#ffd9a0', 0.38);
module.exports = { P, mix, lum, contrast };

// Moonlit variant of a finished SVG string: every #rrggbb is cooled toward blue-violet and dimmed. Geometry is untouched,
// so a day/night pair is pixel-for-pixel the same shape and cross-fades cleanly.
P.moonlit = svg => svg.replace(/#([0-9a-fA-F]{6})\b/g, (m, h) => {
  const c = '#' + h.toLowerCase(), l = Math.pow(lum(c), 0.45);
  const target = mix('#080c26', '#9aa2d4', l);
  return mix(mix(mix(c, '#1a2050', 0.5), target, 0.35), '#05071a', 0.12);
});

// Re-light the land palette from a colour-script moment (see moments.js). Rising: sun in the east (left of
// the picture); setting: sun in the west (right). Night and day count as setting for geometry.
P.apply = function (m, rising, L) {
  L.SUN.x = rising ? 150 : 640;
  P.horizon = m.hor; P.haze = m.hor; P.shadow = m.shade; P.sunc = m.sun;
  P.far2 = m.farTwo; P.far1 = m.farOne; P.tint = m.tint;
  P.dunes = [m.duneFar, mix(m.duneFar, m.duneMid, 0.5), m.duneMid, mix(m.duneMid, m.duneNear, 0.5), m.duneNear];
  const litAmt = 0.22 + m.lit * 1.6;                          // moonlit/blue light at night, warm by day
  P.shade = c => mix(c, m.shade, 0.55);
  P.lit = c => mix(c, m.tint, litAmt);
  P.rimCol = mix(m.tint, '#ffffff', 0.35); P.rimOp = Math.min(0.9, 0.22 + m.lit * 4);
  P.fig = c => mix(mix(c, m.shade, m.sink * 0.9), m.tint, Math.min(0.5, m.lit * 1.6));
  P.glint = mix(m.tint, '#ffffff', 0.45);
  P.dark = mix(m.shade, '#000000', 0.5);
};
