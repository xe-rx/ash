'use strict';
// The rail dot shows where now falls between the prayer rows: row index 0..4 as a float,
// interpolated by time between neighbouring prayers.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var Scene = load('scene.js');
var CFG = H.PLACES.utrecht;

function scene(ms) { return Scene.sceneAt(ms, H.amsterdamOffset, CFG); }

test('the rail is on a prayer row at that prayer, and halfway at the middle of two prayers', function () {
  var day = scene(H.ams(2026, 6, 21, 12, 0)).prayers;
  for (var i = 0; i < 4; i++) {
    assert.ok(Math.abs(scene(day[i].ms).railRow - i) < 1e-9, 'at ' + day[i].name);
    var mid = Math.round((day[i].ms + day[i + 1].ms) / 120000) * 60000;
    assert.ok(Math.abs(scene(mid).railRow - (i + 0.5)) < 0.01, 'between ' + day[i].name + ' and ' + day[i + 1].name);
  }
});

test('the rail holds on the first row before Fajr and after the evening rollover', function () {
  var fajr = scene(H.ams(2026, 6, 21, 12, 0)).prayers[0].ms;
  assert.strictEqual(scene(fajr - 3 * 3600000).railRow, 0);
  assert.strictEqual(scene(H.ams(2026, 12, 21, 23, 0)).railRow, 0); // after Isha the list is tomorrow's
});

test('the rail never moves backwards and jumps only at the Isha rollover (every minute, 4 days)', function () {
  [[2026, 1, 15], [2026, 3, 28], [2026, 6, 21], [2026, 10, 24]].forEach(function (d) {
    var from = H.ams(d[0], d[1], d[2], 0, 0), last = null, jumps = 0;
    for (var ms = from; ms < from + 48 * 3600000; ms += 60000) {
      var v = scene(ms).railRow;
      assert.ok(v >= 0 && v <= 4 && isFinite(v));
      if (last !== null && v < last) { jumps++; assert.ok(last > 3.5 && v === 0, 'backwards step ' + last + ' -> ' + v + ' at ' + ms); }
      if (last !== null && v >= last) { assert.ok(v - last < 0.05, 'step ' + (v - last) + ' at ' + ms); }
      last = v;
    }
    assert.ok(jumps === 2, 'two rollovers in 48 h, got ' + jumps);
  });
});
