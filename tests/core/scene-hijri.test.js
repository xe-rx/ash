'use strict';
// PO decision 2026-11-04: the Hijri date rolls over at Maghrib, not at midnight.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var Scene = load('scene.js');

function cfg(offset) { return { lat: 52.09, lon: 5.12, hijriOffsetDays: offset }; }
function textAt(ms, offset) { return Scene.sceneAt(ms, H.amsterdamOffset, cfg(offset)).hijri.text; }
function maghribOf(y, mo, d) {
  var prayers = Scene.sceneAt(H.ams(y, mo, d, 12, 0), H.amsterdamOffset, cfg(0)).prayers;
  return prayers.filter(function (p) { return p.name === 'Maghrib'; })[0].ms;
}

// 1 March 2025 is 1 Ramadan 1446 by civil day (see scene.test.js).
test('hijri rolls over at Maghrib, with no double step at midnight', function () {
  var mg = maghribOf(2025, 3, 1);
  assert.strictEqual(textAt(mg - 60000, 0), '1 Ramadan 1446', '1 min before Maghrib');
  assert.strictEqual(textAt(mg, 0), '2 Ramadan 1446', 'exactly at Maghrib');
  assert.strictEqual(textAt(H.ams(2025, 3, 1, 23, 59), 0), '2 Ramadan 1446', '23:59');
  assert.strictEqual(textAt(H.ams(2025, 3, 2, 0, 0), 0), '2 Ramadan 1446', '00:00 next day');
  assert.strictEqual(textAt(H.ams(2025, 3, 2, 12, 0), 0), '2 Ramadan 1446', 'next noon');
});

test('hijri Maghrib rollover keeps the +1 offset', function () {
  var mg = maghribOf(2025, 3, 1);
  assert.strictEqual(textAt(mg - 60000, 1), '2 Ramadan 1446');
  assert.strictEqual(textAt(mg, 1), '3 Ramadan 1446');
  assert.strictEqual(textAt(H.ams(2025, 3, 1, 23, 59), 1), '3 Ramadan 1446');
  assert.strictEqual(textAt(H.ams(2025, 3, 2, 0, 0), 1), '3 Ramadan 1446');
});

test('hijri Maghrib rollover keeps the -1 offset', function () {
  var mg = maghribOf(2025, 3, 2);
  assert.strictEqual(textAt(mg - 60000, -1), '1 Ramadan 1446');
  assert.strictEqual(textAt(mg, -1), '2 Ramadan 1446');
  assert.strictEqual(textAt(H.ams(2025, 3, 2, 23, 59), -1), '2 Ramadan 1446');
  assert.strictEqual(textAt(H.ams(2025, 3, 3, 0, 0), -1), '2 Ramadan 1446');
});

// Without a Maghrib (polar) the scene reports a sun error and carries no Hijri date at all;
// scene.js also keeps the midnight rule if a Maghrib were ever missing.
test('no Maghrib (polar): no scene, no Hijri date shifted by a missing Maghrib', function () {
  var r = Scene.sceneAt(Date.UTC(2026, 5, 21, 12), function () { return 120; },
    { lat: 78, lon: 15, hijriOffsetDays: 0 });
  assert.strictEqual(r.ok, false);
  assert.ok(/no sunrise or sunset/.test(r.error));
  assert.strictEqual(r.hijri, undefined);
});

// At the table's last day the next day has no date; keep showing the last one, not a blank.
test('hijri after Maghrib on the last table day keeps that day instead of going blank', function () {
  var Hijri = load('hijri.js');
  var day = Math.floor(Date.UTC(2090, 5, 1) / H.DAY); // beyond the table
  while (Hijri.hijriFor(day, 0) === null) { day--; }   // last civil day with a date
  var last = Hijri.hijriFor(day, 0).text;
  var d = new Date(day * H.DAY);
  var y = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, dd = d.getUTCDate();
  assert.strictEqual(Hijri.hijriFor(day + 1, 0), null);
  assert.strictEqual(textAt(H.ams(y, mo, dd, 12, 0), 0), last);
  assert.strictEqual(textAt(H.ams(y, mo, dd, 23, 59), 0), last);
});
