'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var ref = require('./adhan-ref').reference;
var H = require('./helpers');
var Civil = load('civil.js');
var Prayer = load('prayer.js');

var KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha'];

test('dayTimes returns whole-minute instants for Utrecht on 1 June 2026', function () {
  var t = Prayer.dayTimes(52.09, 5.12, Civil.daysFromCivil(2026, 6, 1));
  KEYS.forEach(function (k) { assert.strictEqual(t[k] % 60000, 0, k); });
  assert.ok(t.fajr < t.sunrise && t.sunrise < t.dhuhr && t.dhuhr < t.asr);
  assert.ok(t.asr < t.sunset && t.sunset === t.maghrib && t.maghrib < t.isha);
});

test('dayTimes matches adhan-js on every day of 2026 and 2028 at three places', function (t) {
  var max = {};
  KEYS.forEach(function (k) { max[k] = 0; });
  Object.keys(H.PLACES).forEach(function (name) {
    var p = H.PLACES[name];
    for (var year = 2026; year <= 2028; year += 2) {
      var first = Civil.daysFromCivil(year, 1, 1);
      var count = Civil.daysFromCivil(year + 1, 1, 1) - first;
      for (var i = 0; i < count; i++) {
        var c = Civil.civilFromDays(first + i);
        var got = Prayer.dayTimes(p.lat, p.lon, first + i);
        var want = ref(p.lat, p.lon, c.y, c.m, c.d);
        KEYS.forEach(function (k) {
          var dev = Math.abs(got[k] - want[k]);
          if (dev > max[k]) { max[k] = dev; }
          assert.ok(dev <= 60000, name + ' ' + c.y + '-' + c.m + '-' + c.d + ' ' + k + ' off by ' + dev + ' ms');
        });
      }
    }
  });
  t.diagnostic('max deviation vs adhan-js (ms): ' + JSON.stringify(max));
});

test('dayTimes is null when the sun never rises or sets', function () {
  assert.strictEqual(Prayer.dayTimes(90, 0, Civil.daysFromCivil(2026, 6, 21)), null);
  assert.strictEqual(Prayer.dayTimes(78, 15, Civil.daysFromCivil(2026, 12, 21)), null);
});

test('dayTimes works at latitude and longitude extremes without NaN', function () {
  [[0, 180], [0, -180], [-60, 0], [66, 25], [0, 0]].forEach(function (ll) {
    var t = Prayer.dayTimes(ll[0], ll[1], Civil.daysFromCivil(2026, 3, 20));
    KEYS.forEach(function (k) { assert.ok(isFinite(t[k]), ll + ' ' + k); });
  });
});

test('Fajr and Isha use the twilight-angle rule when 18/17 degrees are never reached', function () {
  var day = Civil.daysFromCivil(2026, 6, 21);
  var t = Prayer.dayTimes(52.09, 5.12, day);
  var next = Prayer.dayTimes(52.09, 5.12, day + 1);
  var night = next.sunrise - t.sunset;
  assert.ok(Math.abs((t.sunrise - t.fajr) - night * 18 / 60) < 90000);
  assert.ok(Math.abs((t.isha - t.sunset) - night * 17 / 60) < 90000);
  assert.ok(t.isha > Date.UTC(2026, 5, 21, 22, 0)); // 00:xx local the next morning
});
