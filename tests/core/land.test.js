'use strict';
// landAt: which two baked landscape images to cross-fade at an altitude, with the SAME stops and smoothstep as the
// colour script (stopAt), so the land and the sky/sun colours move together.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var S = load('script.js'), C = load('colour.js'), Scene = load('scene.js');
function land(alt, rising) { return JSON.parse(JSON.stringify(S.landAt(alt, rising))); }

test('landAt names the stops: night below the first stop, day above the last, exact stops have t 0 or 1', function () {
  assert.deepStrictEqual(land(-90, true), { a: 'night', b: 'night', t: 0 });
  assert.deepStrictEqual(land(90, true), { a: 'rise18', b: 'day', t: 1 }); // the last stop is day itself
  assert.deepStrictEqual(land(90, false), { a: 'day', b: 'day', t: 1 });
  var r = land(-12, true); assert.strictEqual(r.b, 'rise-12'); assert.strictEqual(r.a, 'rise-20'); assert.ok(Math.abs(r.t - 1) < 1e-9);
  var s = land(-4, false); assert.strictEqual(s.b, 'set-4'); assert.strictEqual(s.a, 'set-10'); assert.ok(Math.abs(s.t - 1) < 1e-9);
  assert.strictEqual(land(-50, true).a, 'night'); assert.strictEqual(land(-50, true).b, 'rise-20');
  assert.strictEqual(land(10, true).a, 'rise4'); assert.strictEqual(land(10, true).b, 'rise18');
  assert.strictEqual(land(25, false).a, 'set18'); assert.strictEqual(land(25, false).b, 'day');
});

test('landAt uses the same blend as stopAt: t equals the mix weight of the colour script, every 0.25 degrees, rising and setting', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.25) {
      var l = S.landAt(alt, rising), m = S.momentAt(alt, rising);
      assert.ok(l.t >= 0 && l.t <= 1);
      // a colour mixed by stopAt must equal the mix of the two named moments at t
      var a = S.MOMENTS[l.a], b = S.MOMENTS[l.b];
      assert.strictEqual(m.top, C.mix(a.top, b.top, l.t), 'top at ' + alt);
      assert.ok(Math.abs(m.sink - (a.sink + (b.sink - a.sink) * l.t)) < 1e-9, 'sink at ' + alt);
    }
  });
});

test('the scene carries the land blend of its sun', function () {
  var s = Scene.sceneAt(H.ams(2026, 6, 21, 12, 0), H.amsterdamOffset, H.PLACES.utrecht);
  assert.ok(s.land && typeof s.land.a === 'string' && typeof s.land.b === 'string' && s.land.t >= 0 && s.land.t <= 1);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(s.land)), land(s.sun.altitudeDeg, s.sun.azimuthDeg < 180));
});
