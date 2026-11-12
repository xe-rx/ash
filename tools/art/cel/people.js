'use strict';
// The family, seen from behind on the rug: the October figures (app/ash/view/Person.qml and Family.qml at
// d230545), pills and circles in units of u with the origin at the bottom centre of the lap, y down.
// Their silhouettes are approved and fixed; only the shading rule and the colour grading touch them.
const { f } = require('./colour');
const { cel, edgeBand, shift, fill, unit } = require('./paint');

const SHAPES = {
  lap: { x: -48, y: -26, w: 96, h: 28, rx: 14 },
  body: { x: -27, y: -76, w: 54, h: 66, rx: 24 },
  head: { x: -15, y: -104, w: 30, h: 30, rx: 15 },
  hair: { x: -16, y: -106, w: 32, h: 20, rx: 10 },
  cap: { x: -14, y: -108, w: 28, h: 14, rx: 7 },
  hood: { x: -24, y: -110, w: 48, h: 64, rx: 24 },
};
// Draw order per person; later parts cover earlier ones (the hood covers the head).
const PARTS = {
  father: ['lap', 'body', 'head', 'cap'],
  mother: ['lap', 'body', 'head', 'hood'],
  boy: ['lap', 'body', 'head', 'hair'],
  girl: ['lap', 'body', 'head', 'hood'],
};
const COLOURS = {
  father: { robe: '#f3ead8', skin: '#c98c60', cap: '#f3ead8' },
  mother: { robe: '#6d2f63', skin: '#c98c60', hood: '#a54a86' },
  boy: { robe: '#2d5fa6', skin: '#8e5a3c', hair: '#2a1a16' },
  girl: { robe: '#e0606b', skin: '#8e5a3c', hood: '#a54a86' },
};
const PART_COLOUR = { lap: 'robe', body: 'robe', head: 'skin', hair: 'hair', cap: 'cap', hood: 'hood' };

const F = 1.2, CX = 522, BASE = 560;
const person = (name, u, x, y) => ({ name, u: u * F, x: CX + x * F, y: BASE + y * F });
// Adults behind, children in front (drawn later).
const FAMILY = [person('father', 1.08, -104, -2), person('mother', 0.98, 104, -2), person('boy', 0.62, -36, 10), person('girl', 0.62, 36, 10)];

function partShape(fig, part) {
  const s = SHAPES[part], u = fig.u;
  return `<rect x="${f(fig.x + s.x * u)}" y="${f(fig.y + s.y * u)}" width="${f(s.w * u)}" height="${f(s.h * u)}" rx="${f(s.rx * u)}"/>`;
}
const HEIGHT = 110; // units from the lap's bottom to the top of the hood

// Night only: the lantern is a second, warm light. For each figure L_lamp points from the figure toward the
// lantern; a narrow band on the edges facing it is painted WARM after the moon pass.
function lampLight(doc, P, m, fig, part, inner) {
  if (!m.lamp) return inner;
  const L = unit([m.lamp.x - fig.x, m.lamp.y - (fig.y - HEIGHT * fig.u / 2)]);
  return edgeBand(doc, partShape(fig, part), L, m.k.lamp, P.WARM(COLOURS[fig.name][PART_COLOUR[part]]), inner);
}

// One figure: each part under the shading rule; the head or hood casts onto the body (the crown shape moved
// away from the light, in the body's SHADE colour, clipped to the body) before the head is drawn.
function figure(doc, P, m, fig) {
  // The shade band is a fraction of the figure's height (k.fig), capped at 8 px so the adults' bands stay as thin as
  // the children's: a wider band reads as a second colour on the robe, not as shading.
  const k = Math.min(8, m.k.fig * HEIGHT * fig.u), h = m.h.fig, parts = PARTS[fig.name];
  const cols = part => P.cols(COLOURS[fig.name][PART_COLOUR[part]]);
  const paint = part => lampLight(doc, P, m, fig, part, cel(doc, partShape(fig, part), m.L, k, h, cols(part)));
  const crown = parts[parts.length - 1] === 'hood' ? 'hood' : 'head';
  const cast = `<g ${doc.clip(partShape(fig, 'body'))}>${fill(shift(partShape(fig, crown), -k * m.L[0], -k * m.L[1]), cols('body').shade)}</g>`;
  return paint('lap') + paint('body') + cast + parts.slice(2).map(paint).join('');
}

const family = (doc, P, m) => FAMILY.map(fig => figure(doc, P, m, fig)).join('');

// Ground contact: one flat ellipse under each figure, shifted a few px away from the light (painted by the
// ground in its SHADE colour, clipped to the ground).
function contacts(m) {
  return FAMILY.map(fig => {
    const u = fig.u, rx = 0.95 * 48 * u, ry = u > 1 ? 7 : 6, cx = fig.x - 4 * m.L[0], cy = fig.y + 2 * u - 2;
    return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${ry}"/>`;
  }).join('');
}

module.exports = { SHAPES, PARTS, COLOURS, FAMILY, family, contacts, partShape };
