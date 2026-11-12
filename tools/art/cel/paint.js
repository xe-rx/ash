'use strict';
// The one shading rule and the colour grading (PO decision 2026-11-12, docs/product/CEL-STYLE-HANDOFF.md).
// A shape is painted as three solid colours under nested clips: SHADE along the edge facing away from the
// light, LIT along the edge facing it, BASE between. Never opacity, blur or a gradient.
const { mix, f } = require('./colour');

// One document per still: clip paths collect in `defs`, ids are unique within the document.
function createDoc() {
  const defs = [];
  let n = 0;
  return {
    defs,
    clip(inner) { const k = 'c' + (++n); defs.push(`<clipPath id="${k}">${inner}</clipPath>`); return `clip-path="url(#${k})"`; },
    id(prefix) { return prefix + (++n); },
  };
}

// Move one SVG element by (dx, dy). Shapes given to the rule carry no transform of their own.
function shift(shape, dx, dy) {
  if (!dx && !dy) return shape;
  return shape.replace(/^<(\w+)/, `<$1 transform="translate(${f(dx)} ${f(dy)})"`);
}
const fill = (shape, colour) => shape.replace(/\/>$/, ` fill="${colour}"/>`);
function unit(v) { const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n]; }

// cel(doc, shape, L, k, h, colours): L is the unit vector from the scene toward the light, k the shade offset
// and h the highlight offset in px. Shade band = S minus S moved by +k·L; highlight band = S minus S moved by -h·L.
function cel(doc, shape, L, k, h, c) {
  const inner = fill(shape, c.lit) + fill(shift(shape, -h * L[0], -h * L[1]), c.base);
  return `<g ${doc.clip(shape)}>${fill(shape, c.shade)}<g ${doc.clip(shift(shape, k * L[0], k * L[1]))}>${inner}</g></g>`;
}

// A band of `colour` along the edge of S facing `L`, h px wide, painted over `inner` (the shape's own paint).
function edgeBand(doc, shape, L, h, colour, inner) {
  return `<g ${doc.clip(shape)}>${fill(shape, colour)}<g ${doc.clip(shift(shape, -h * L[0], -h * L[1]))}>${inner}</g></g>`;
}

// Colour grading for a moment: B (base, carrying the moment's hue), L (lit), S (shade toward the ambient),
// WARM and WARM2 (the lantern, scaled by how far it is lit). `cols(local)` gives the three colours the rule needs.
function painter(m) {
  const B = c => mix(c, m.key, m.tint), on = m.lamp ? m.lamp.on : 0;
  const L = c => mix(B(c), m.sunlight || m.key, m.lit);
  const S = c => mix(B(c), m.amb, m.shade);
  const WARM = c => mix(B(c), '#ff9e4a', 0.38 * on), WARM2 = c => mix(B(c), '#ffbe6a', 0.6 * on);
  return { B, L, S, WARM, WARM2, cols: c => ({ base: B(c), lit: L(c), shade: S(c) }) };
}

module.exports = { createDoc, shift, fill, unit, cel, edgeBand, painter };
