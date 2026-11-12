'use strict';
// Colour arithmetic for the cel stills: hex mixing and WCAG 2 contrast. Pure functions, no I/O.

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const clamp8 = v => Math.max(0, Math.min(255, Math.round(v)));
const toHex = v => '#' + v.map(x => clamp8(x).toString(16).padStart(2, '0')).join('');
const f = n => Math.round(n * 10) / 10;

function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return toHex(A.map((x, i) => x + (B[i] - x) * t));
}

function luminance(c) {
  const lin = v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const [r, g, b] = hex(c).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Pull `ink` toward `toward` (black or white) in small steps until it reads against `bg` at `min` or better.
function ensureContrast(ink, bg, min, toward) {
  let c = ink;
  for (let t = 0; t <= 1.001 && contrast(c, bg) < min; t += 0.05) c = mix(ink, toward, t);
  return c;
}

module.exports = { hex, toHex, mix, luminance, contrast, ensureContrast, f };
