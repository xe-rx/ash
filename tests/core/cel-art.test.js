'use strict';
// Guards for the cel art (tools/art/cel): the shading rule's structure and orientation, the approved family geometry
// as drawn, the light direction, every stop baking with one rule, the stills' card contrast and the sunset disc.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const CEL = path.join(__dirname, '..', '..', 'tools', 'art', 'cel');
const { contrast } = require(path.join(CEL, 'colour'));
const { cel, createDoc, unit, painter } = require(path.join(CEL, 'paint'));
const { FAMILY, SHAPES, PARTS, COLOURS, partShape } = require(path.join(CEL, 'people'));
const { MOMENTS, STOPS, artMoment } = require(path.join(CEL, 'moments'));
const { lightAt } = require(path.join(CEL, 'light'));
const { dunes, mesas } = require(path.join(CEL, 'land'));
const { buildStill, buildLand } = require(path.join(CEL, 'scene'));

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

test('the shade band lies on the side away from the light, for light from the right and from the left', () => {
  // The lit/base clip is the circle (centre 10, r 5) moved k px toward the light; what it leaves of the circle is
  // the shade band. A point on the edge away from the light must be outside the moved clip, one toward it inside.
  [[1, 0], [-1, 0]].forEach(L => {
    const doc = createDoc();
    cel(doc, '<circle cx="10" cy="10" r="5"/>', unit(L), 2, 1, { base: '#111111', lit: '#222222', shade: '#333333' });
    const dx = +/translate\((-?[\d.]+) /.exec(doc.defs[1])[1];
    assert.equal(dx, 2 * L[0], 'the clip moves toward the light');
    const away = 10 - 4 * L[0], toward = 10 + 4 * L[0];
    assert.ok(Math.abs(away - (10 + dx)) > 5, 'the edge away from the light is shade');
    assert.ok(Math.abs(toward - (10 + dx)) <= 5, 'the edge toward the light is not shade');
  });
});

test('family geometry is the October family (Person.qml and Family.qml at d230545), as drawn', () => {
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
  // the father's lap as drawn: the table scaled by u and placed at the figure's origin
  const f = FAMILY[0], u = f.u, r = n => Math.round(n * 10) / 10;
  assert.equal(partShape(f, 'lap'), `<rect x="${r(f.x - 48 * u)}" y="${r(f.y - 26 * u)}" width="${r(96 * u)}" height="${r(28 * u)}" rx="${r(14 * u)}"/>`);
  const svg = buildStill('noon').svg;
  assert.ok(svg.includes(partShape(f, 'lap').replace(/\/>$/, '')), 'the lap rect is drawn as the table says');
});

test('the light follows the sun: from the left when rising, the right when setting, overhead by day, moonlight from -10 to -12', () => {
  const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.01);
  assert.ok(near(lightAt(-7, true), unit([-1, -0.18])), 'dawn ' + lightAt(-7, true));
  assert.ok(near(lightAt(0, false), unit([1, -0.18])), 'sunset ' + lightAt(0, false));
  assert.ok(near(lightAt(90, true), unit([-0.3, -1])) && near(lightAt(90, false), unit([-0.3, -1])), 'noon');
  assert.ok(near(lightAt(-90, true), unit([0.3, -1])) && near(lightAt(-30, false), unit([0.3, -1])), 'night');
  assert.ok(near(lightAt(-12, true), unit([0.3, -1])) && near(lightAt(-12, false), unit([0.3, -1])), 'moonlight by -12: ' + lightAt(-12, false));
  assert.ok(near(lightAt(-10, false), unit([1, -0.18])), 'the horizon glow lights the land down to -10 (the -10 and -4 layers share one shading): ' + lightAt(-10, false));
  [true, false].forEach(rising => {
    let prev = lightAt(-90, rising);
    for (let alt = -89.5; alt <= 90; alt += 0.5) {
      const L = lightAt(alt, rising);
      assert.ok(Math.hypot(L[0] - prev[0], L[1] - prev[1]) < 0.5, `light jumps at ${alt}`); // the two-degree swing to moonlight (setting) peaks at 0.41 per half degree; a jump is over 1
      prev = L;
    }
  });
});

test('every still renders with one sky gradient and no opacity or blur', () => {
  for (const name of Object.keys(MOMENTS)) {
    const { svg } = buildStill(name);
    assert.doesNotMatch(svg, /opacity|feGaussianBlur/, name);
    assert.equal((svg.match(/<linearGradient/g) || []).length, 1, name + ': only the sky is a gradient');
    assert.equal((svg.match(/<radialGradient/g) || []).length, 0, name);
  }
});

test('every colour-script stop bakes as a land layer without sky, gradient or opacity, the lantern at night only', () => {
  for (const [name, stop, rising, alt] of STOPS) {
    const { svg } = buildLand(stop, lightAt(alt, rising));
    assert.doesNotMatch(svg, /opacity|feGaussianBlur|Gradient/, name);
    assert.doesNotMatch(svg, /<rect width="1024" height="600"/, name + ': no sky');
    assert.equal(/#ffd99a/.test(svg), stop.lamp > 0, name + ': lantern glass iff the lamp is on');
  }
});

test('dunes and mesas are single shapes under the rule: no slipface polygons', () => {
  for (const [name, stop, rising, alt] of STOPS) {
    const m = artMoment(stop, lightAt(alt, rising)), doc = createDoc(), land = dunes(doc, painter(m), m) + mesas(doc, m);
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

test('card text reads at 4.5:1 or better in every still', () => {
  for (const name of Object.keys(MOMENTS)) {
    const { report } = buildStill(name);
    assert.ok(report.length >= 4, name + ': date, row, past row and next-prayer row are checked');
    for (const r of report) assert.ok(r.ratio >= 4.5, `${name} ${r.what}: ${r.ratio.toFixed(2)}`);
  }
});
