'use strict';
// Sky: the one smooth gradient of the frame, stepped flat sun rings, the moon with its halo rings, and stars.
const { mix, f } = require('./colour');
const { W, H } = require('./moments');

// The sky colour at height y (matches the gradient stops), used to grade rings and mesas into the sky.
function skyAt(m, y) {
  const u = y / H;
  if (u <= 0.5) return mix(m.skyTop, m.skyMid, u / 0.5);
  return u <= 0.72 ? mix(m.skyMid, m.skyLow, (u - 0.5) / 0.22) : m.skyLow;
}

function gradient(doc, m) {
  const k = doc.id('g');
  doc.defs.push(`<linearGradient id="${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.skyTop}"/>` +
    `<stop offset="0.5" stop-color="${m.skyMid}"/><stop offset="0.72" stop-color="${m.skyLow}"/></linearGradient>`);
  return `<rect width="${W}" height="${H}" fill="url(#${k})"/>`;
}

// Flat stepped rings, each a new colour; the disc only when the sun is above the horizon (r > 0).
function sun(m) {
  const s = m.sun, q = s.r ? (s.y < 200 ? 0.75 : 1) : 0.7;
  const rings = [[150 * q, 0.10], [104 * q, 0.2], [72 * q, 0.34], [50 * q, 0.5]].filter(r => !s.r || r[0] > s.r + 6);
  let out = rings.map(([r, t]) => `<circle cx="${s.x}" cy="${s.y}" r="${f(r)}" fill="${mix(skyAt(m, s.y), s.glow, t)}"/>`).join('');
  if (s.r) out += `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.glow}"/>` +
    `<circle cx="${s.x}" cy="${s.y}" r="${f(s.r * 0.72)}" fill="${mix(s.glow, '#ffffff', 0.5)}"/>`;
  return out;
}

// Deterministic star field (same LCG as the prototype) and the crescent moon cut by a mask.
function stars(m) {
  let out = '', a = 7;
  const next = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  for (let i = 0; i < 70; i++) {
    const x = next() * 700, y = next() * 330, r = 0.8 + next() * 1.6;
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${mix(m.skyLow, '#ffffff', 0.7)}"/>`;
  }
  return out;
}
function moon(doc, m) {
  const o = m.moon, mk = doc.id('m');
  doc.defs.push(`<mask id="${mk}"><circle cx="${o.x}" cy="${o.y}" r="26" fill="#fff"/><circle cx="${o.x + 11}" cy="${o.y - 7}" r="23" fill="#000"/></mask>`);
  return [[70, 0.10], [46, 0.18]].map(([r, t]) => `<circle cx="${o.x}" cy="${o.y}" r="${r}" fill="${mix(m.skyMid, '#c8d4ff', t)}"/>`).join('') +
    `<circle cx="${o.x}" cy="${o.y}" r="26" fill="#f4f2e4" mask="url(#${mk})"/>`;
}

function sky(doc, m) {
  let out = gradient(doc, m);
  if (m.sun) out += sun(m);
  if (m.moon) out += stars(m) + moon(doc, m);
  return out;
}

module.exports = { sky, skyAt };
