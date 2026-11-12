'use strict';
// The sun's look by altitude (core/sunlook.js), as the cel stills draw it: a disc, a lighter core and four flat rings.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var L = load('sunlook.js');
function look(alt) { return JSON.parse(JSON.stringify(L.sunLook(alt))); }
function near(a, b, eps) { return Math.abs(a - b) <= eps; }

test('four stepped rings around the disc: radii grow, alphas .5 .34 .2 .1, the stills\' ratios at the horizon and from 12 degrees up', function () {
  [0, 12, 60].forEach(function (alt) {
    var l = look(alt), ratios = alt === 0 ? [1.25, 1.8, 2.6, 3.75] : [1.17, 1.69, 2.44, 3.52];
    assert.strictEqual(l.haloR.length, 4);
    assert.deepStrictEqual(l.haloAlpha, [0.5, 0.34, 0.2, 0.1]);
    for (var i = 0; i < 4; i++) {
      if (i > 0) { assert.ok(l.haloR[i] > l.haloR[i - 1], 'radii grow'); }
      assert.ok(near(l.haloR[i] / l.r, ratios[i], 1e-9), 'ring ' + i + ' at ' + alt + ': ' + l.haloR[i] / l.r);
    }
  });
});

test('the disc is r 40 at the horizon and r 32 from 12 degrees up, shrinking smoothly between; the core is .72 of it', function () {
  assert.strictEqual(look(0).r, 40);
  assert.strictEqual(look(12).r, 32);
  assert.strictEqual(look(60).r, 32);
  var prev = look(0).r;
  for (var alt = 0.25; alt <= 12; alt += 0.25) {
    var l = look(alt);
    assert.ok(l.r <= prev && l.r >= prev - 1.2, 'r steps smoothly at ' + alt + ': ' + l.r);
    assert.ok(near(l.coreR, 0.72 * l.r, 1e-9), 'core at ' + alt);
    prev = l.r;
  }
});

test('below the horizon only the rings show, fading to nothing by -12 degrees; the disc is hidden below -4', function () {
  assert.ok(look(2).discVisible && !look(-4.5).discVisible);
  assert.ok(look(-3).glowVisible && look(-3).haloAlpha[3] > 0 && look(-3).haloAlpha[3] < 0.1);
  assert.ok(!look(-12).glowVisible && !look(-30).glowVisible);
  assert.deepStrictEqual(look(-12).haloAlpha, [0, 0, 0, 0]);
  var prev = look(0);
  for (var alt = -0.5; alt >= -12; alt -= 0.5) {
    var l = look(alt);
    for (var k = 0; k < 4; k++) { assert.ok(l.haloAlpha[k] <= prev.haloAlpha[k] + 1e-9, 'alpha grows going down at ' + alt); }
    prev = l;
  }
});
