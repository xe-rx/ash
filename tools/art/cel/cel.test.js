'use strict';
// Guards for the cel stills: the shading rule's structure, the approved family geometry, card contrast and the
// sunset disc clearing the times card. Run: node --test tools/art/cel/cel.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { contrast } = require('./colour');
const { cel, createDoc, unit, painter } = require('./paint');
const { FAMILY, SHAPES, PARTS, COLOURS } = require('./people');
const { MOMENTS } = require('./moments');
const { dunes, mesas } = require('./land');
const { buildScene } = require('./scene');

test('contrast follows WCAG: white on black is 21, white on #767676 is about 4.5', () => {
  assert.equal(Math.round(contrast('#ffffff', '#000000')), 21);
  assert.ok(Math.abs(contrast('#ffffff', '#767676') - 4.54) < 0.02);
  assert.equal(contrast('#123456', '#123456'), 1);
});

test('cel paints shade, lit and base as solid fills under nested clips, never opacity', () => {
  const doc = createDoc();
  const cols = { base: '#111111', lit: '#222222', shade: '#333333' };
  const out = cel(doc, '<circle cx="10" cy="10" r="5"/>', unit([-1, 0]), 2, 1, cols);
  assert.equal(doc.defs.length, 2, 'two clips: the shape and the shape moved toward the light');
  assert.match(doc.defs[1], /translate\(-2 0\)/);
  assert.match(out, /^<g clip-path="url\(#c1\)"><circle[^>]*fill="#333333"\/><g clip-path="url\(#c2\)">/);
  assert.match(out, /<circle cx="10" cy="10" r="5" fill="#222222"\/>/);
  assert.match(out, /translate\(1 0\)[^>]*fill="#111111"\/>/);
  assert.doesNotMatch(out + doc.defs.join(''), /opacity|blur|gradient/i);
});

test('family geometry is the October family (Person.qml and Family.qml at d230545)', () => {
  assert.deepEqual(SHAPES.lap, { x: -48, y: -26, w: 96, h: 28, rx: 14 });
  assert.deepEqual(SHAPES.body, { x: -27, y: -76, w: 54, h: 66, rx: 24 });
  assert.deepEqual(SHAPES.head, { x: -15, y: -104, w: 30, h: 30, rx: 15 });
  assert.deepEqual(SHAPES.hair, { x: -16, y: -106, w: 32, h: 20, rx: 10 });
  assert.deepEqual(SHAPES.cap, { x: -14, y: -108, w: 28, h: 14, rx: 7 });
  assert.deepEqual(SHAPES.hood, { x: -24, y: -110, w: 48, h: 64, rx: 24 });
  assert.deepEqual(PARTS, { father: ['lap', 'body', 'head', 'cap'], mother: ['lap', 'body', 'head', 'hood'],
    boy: ['lap', 'body', 'head', 'hair'], girl: ['lap', 'body', 'head', 'hood'] });
  const F = 1.2, at = FAMILY.map(p => [p.name, +p.u.toFixed(3), p.x, p.y]);
  assert.deepEqual(at, [['father', +(1.08 * F).toFixed(3), 522 - 104 * F, 560 - 2 * F],
    ['mother', +(0.98 * F).toFixed(3), 522 + 104 * F, 560 - 2 * F],
    ['boy', +(0.62 * F).toFixed(3), 522 - 36 * F, 560 + 10 * F], ['girl', +(0.62 * F).toFixed(3), 522 + 36 * F, 560 + 10 * F]]);
  assert.equal(COLOURS.father.cap, COLOURS.father.robe, 'the cap is the robe colour');
  assert.equal(COLOURS.girl.hood, COLOURS.mother.hood, 'the girl wears the hijab colour');
});

test('every moment renders with one sky gradient and no opacity or blur', () => {
  for (const name of Object.keys(MOMENTS)) {
    const { svg } = buildScene(name);
    assert.doesNotMatch(svg, /opacity|feGaussianBlur/, name);
    assert.equal((svg.match(/<linearGradient/g) || []).length, 1, name + ': only the sky is a gradient');
    assert.equal((svg.match(/<radialGradient/g) || []).length, 0, name);
  }
});

test('dunes and mesas are single shapes under the rule: no slipface polygons', () => {
  for (const name of Object.keys(MOMENTS)) {
    const m = MOMENTS[name], doc = createDoc(), land = dunes(doc, painter(m), m) + mesas(doc, m);
    assert.doesNotMatch(land, /<polygon/, name);
    assert.equal((land.match(/<path /g) || []).length, 7 * 3, name + ': 3 dunes + 4 mesas, three solid copies each');
    assert.equal(doc.defs.length, 7 * 2, name + ': two clips per shape');
  }
});

test('the sunset disc sits at the west end of the sun arc, clear of the card', () => {
  const s = MOMENTS.sunset.sun;
  assert.ok(s.x + s.r < 724, `disc right edge ${s.x + s.r} must be left of the card at x 724`);
  assert.ok(s.x >= 620 && s.x <= 660 && s.y >= 350 && s.y <= 380, 'about (645, 365)');
});

test('card text reads at 4.5:1 or better in every moment', () => {
  for (const name of Object.keys(MOMENTS)) {
    const { report } = buildScene(name);
    assert.ok(report.length >= 4, name + ': date, row, past row and next-prayer row are checked');
    for (const r of report) assert.ok(r.ratio >= 4.5, `${name} ${r.what}: ${r.ratio.toFixed(2)}`);
  }
});
