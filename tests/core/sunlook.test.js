'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var L = load('sunlook.js');
function look(alt) { return JSON.parse(JSON.stringify(L.sunLook(alt))); }

test('five halos: three tight ones and two very large faint discs that warm the sky around a low sun', function () {
  var l = look(2);
  assert.strictEqual(l.haloR.length, 5);
  assert.strictEqual(l.haloAlpha.length, 5);
  for (var i = 1; i < 5; i++) { assert.ok(l.haloR[i] > l.haloR[i - 1], 'radii grow'); }
  assert.ok(l.haloR[3] >= 4.5 * l.r && l.haloR[4] >= 7 * l.r, 'the wide discs are very large: ' + l.haloR);
  assert.ok(l.haloAlpha[3] > 0 && l.haloAlpha[4] > 0 && l.haloAlpha[3] <= 0.28 && l.haloAlpha[4] <= 0.28, 'faint: ' + l.haloAlpha);
});

test('the wide discs fade out as the sun climbs: gone by 25 degrees, never growing with altitude', function () {
  var prev = look(0);
  for (var alt = 0.5; alt <= 40; alt += 0.5) {
    var l = look(alt);
    [3, 4].forEach(function (k) { assert.ok(l.haloAlpha[k] <= prev.haloAlpha[k] + 1e-9, 'alpha grows at ' + alt); });
    prev = l;
  }
  assert.strictEqual(look(25).haloAlpha[3], 0);
  assert.strictEqual(look(25).haloAlpha[4], 0);
});

test('the wide discs follow the same glow fade below the horizon: nothing at -12 degrees and below', function () {
  assert.strictEqual(look(-12).haloAlpha[3], 0);
  assert.strictEqual(look(-30).haloAlpha[4], 0);
  assert.ok(look(-3).haloAlpha[3] > 0);
});
