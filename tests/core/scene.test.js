'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var Scene = load('scene.js');
var CFG = H.PLACES.utrecht;
var NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function at(y, mo, d, h, mi, s) { return Scene.sceneAt(H.ams(y, mo, d, h, mi, s), H.amsterdamOffset, CFG); }

function assertNoNaN(v, where) {
  if (typeof v === 'number') { assert.ok(isFinite(v), 'NaN/Infinity at ' + where); }
  else if (v && typeof v === 'object') { Object.keys(v).forEach(function (k) { assertNoNaN(v[k], where + '.' + k); }); }
}

test('scene has the documented shape at noon in Utrecht', function () {
  var s = at(2026, 5, 20, 12, 0);
  assert.strictEqual(s.ok, true);
  assert.strictEqual(s.clockText, '12:00');
  assert.strictEqual(s.prayers.length, 5);
  assert.strictEqual(JSON.stringify(s.prayers.map(function (p) { return p.name; })), JSON.stringify(NAMES));
  assert.strictEqual(s.prayers.filter(function (p) { return p.isNext; }).length, 1);
  assert.strictEqual(s.sun.isUp, true);
  assert.ok(s.sun.dayProgress > 0.3 && s.sun.dayProgress < 0.6, 'progress ' + s.sun.dayProgress);
  var noon = Scene.sceneAt(s.prayers[1].ms, H.amsterdamOffset, CFG).sun; // Dhuhr = solar noon + 1 min
  assert.ok(noon.altitudeDeg > 57 && noon.altitudeDeg < 62, 'altitude ' + noon.altitudeDeg);
  assert.ok(noon.azimuthDeg > 178 && noon.azimuthDeg < 182, 'azimuth ' + noon.azimuthDeg);
  assert.ok(s.sun.azimuthDeg > 120 && s.sun.azimuthDeg < 160, 'morning sun is south-east');
  assert.ok(/^\d\d:\d\d$/.test(s.sunrise.timeText) && /^\d\d:\d\d$/.test(s.sunset.timeText));
  assert.ok(s.hijri && s.hijri.text.length > 8);
  assertNoNaN(s, 'scene');
});

test('countdown wording: minutes below an hour, hours and padded minutes above', function () {
  var s = at(2026, 5, 20, 12, 0);
  var asr = s.prayers[2];
  var sc = Scene.sceneAt(asr.ms - 42 * 60000 + 20000, H.amsterdamOffset, CFG);
  assert.strictEqual(sc.next.name, 'Asr');
  assert.strictEqual(sc.next.minutesUntil, 42);
  assert.strictEqual(sc.next.countdownText, 'Asr in 42 min');
  var far = Scene.sceneAt(H.ams(2026, 5, 20, 23, 30), H.amsterdamOffset, CFG);
  assert.ok(/^(Isha|Fajr) in (\d+ min|\d+ h \d\d min)$/.test(far.next.countdownText), far.next.countdownText);
  var f = at(2026, 1, 15, 20, 0);
  assert.strictEqual(f.next.name, 'Fajr');
  assert.ok(/^Fajr in \d+ h \d\d min$/.test(f.next.countdownText), f.next.countdownText);
  assert.strictEqual(f.next.countdownText, 'Fajr in ' + Math.floor(f.next.minutesUntil / 60) + ' h ' +
    (f.next.minutesUntil % 60 < 10 ? '0' : '') + (f.next.minutesUntil % 60) + ' min');
});

// Rule: the current prayer day is the first day (searching from yesterday) whose Isha has
// not yet passed. Its five prayers are listed and the next one is the first still to come.
test('00:03 on 21 June: next is that night Isha, list is coherent', function () {
  var s = at(2026, 6, 21, 0, 3);
  assert.strictEqual(s.next.name, 'Isha');
  assert.strictEqual(s.next.timeText, '00:07');
  assert.strictEqual(s.next.countdownText, 'Isha in 4 min');
  assert.strictEqual(s.prayers[4].isNext, true);
  var ms = s.prayers.map(function (p) { return p.ms; });
  for (var i = 1; i < 5; i++) { assert.ok(ms[i] > ms[i - 1]); }
  assert.ok(ms[0] < H.ams(2026, 6, 21, 0, 0) && ms[4] > H.ams(2026, 6, 21, 0, 0));
});

test('after Isha the list rolls over and next is Fajr of the next day', function () {
  var s = at(2026, 6, 21, 0, 8);
  assert.strictEqual(s.next.name, 'Fajr');
  assert.strictEqual(s.prayers[0].isNext, true);
  assert.ok(s.prayers[0].ms > H.ams(2026, 6, 21, 0, 8));
  var w = at(2026, 1, 15, 23, 30);
  assert.strictEqual(w.next.name, 'Fajr');
  assert.ok(w.next.ms > H.ams(2026, 1, 16, 0, 0));
});

test('exactly at a prayer minute that prayer has begun', function () {
  var s = at(2026, 5, 20, 12, 0);
  var asr = s.prayers[2];
  var n = Scene.sceneAt(asr.ms, H.amsterdamOffset, CFG);
  assert.strictEqual(n.next.name, 'Maghrib');
});

test('DST start (29 Mar 2026): Fajr after the change, countdown is real elapsed time', function () {
  var now = H.ams(2026, 3, 28, 22, 0);
  var s = Scene.sceneAt(now, H.amsterdamOffset, CFG);
  assert.strictEqual(s.next.name, 'Fajr');
  assert.strictEqual(s.next.minutesUntil, Math.floor((s.next.ms - now) / 60000));
  assert.strictEqual(s.next.timeText, H.fmtLocal(s.next.ms, 120));
  var naive = Math.floor((s.next.ms - now) / 60000) + 60;
  assert.notStrictEqual(s.next.minutesUntil, naive);
});

test('DST end (25 Oct 2026): Fajr in winter time, countdown is real elapsed time', function () {
  var now = H.ams(2026, 10, 24, 22, 0);
  var s = Scene.sceneAt(now, H.amsterdamOffset, CFG);
  assert.strictEqual(s.next.name, 'Fajr');
  assert.strictEqual(s.next.timeText, H.fmtLocal(s.next.ms, 60));
  assert.strictEqual(s.next.minutesUntil, Math.floor((s.next.ms - now) / 60000));
});

test('clock text at the DST instants', function () {
  var c = function (ms) { return Scene.sceneAt(ms, H.amsterdamOffset, CFG).clockText; };
  assert.strictEqual(c(Date.UTC(2026, 2, 29, 0, 59, 59)), '01:59');
  assert.strictEqual(c(Date.UTC(2026, 2, 29, 1, 0, 0)), '03:00');
  assert.strictEqual(c(Date.UTC(2026, 9, 25, 0, 59, 59)), '02:59');
  assert.strictEqual(c(Date.UTC(2026, 9, 25, 1, 0, 0)), '02:00');
  assert.strictEqual(c(Date.UTC(2026, 9, 25, 1, 59, 59)), '02:59');
});

test('day progress is 0 at sunrise, 1 at sunset, continuous, and isUp tracks it', function () {
  var s = at(2026, 4, 10, 12, 0);
  var p = function (ms) { return Scene.sceneAt(ms, H.amsterdamOffset, CFG).sun; };
  assert.ok(Math.abs(p(s.sunrise.ms).dayProgress) < 1e-9);
  assert.ok(Math.abs(p(s.sunset.ms).dayProgress - 1) < 1e-9);
  assert.strictEqual(p(s.sunrise.ms - 60000).isUp, false);
  assert.strictEqual(p(s.sunrise.ms).isUp, true);
  assert.strictEqual(p(s.sunset.ms + 60000).isUp, false);
  assert.ok(p(s.sunrise.ms - 3600000).dayProgress < 0);
  assert.ok(p(s.sunset.ms + 3600000).dayProgress > 1);
  var from = H.ams(2026, 4, 10, 0, 0), last = null;
  for (var ms = from; ms < from + 36 * 3600000; ms += 60000) {
    var v = p(ms).dayProgress;
    if (last !== null && Math.abs(v - last) > 0.01) {
      var mid = Scene.sceneAt(ms, H.amsterdamOffset, CFG);
      assert.ok(!mid.sun.isUp && (mid.sun.altitudeDeg < -10), 'jump only deep in the night at ' + ms);
    }
    last = v;
  }
});

test('every minute of a day, no NaN and sane shapes (summer and winter)', function () {
  [[2026, 6, 21], [2026, 12, 21], [2026, 3, 29], [2026, 10, 25]].forEach(function (d) {
    var from = H.ams(d[0], d[1], d[2], 0, 0) - 3600000;
    for (var ms = from; ms < from + 26 * 3600000; ms += 7 * 60000) {
      var s = Scene.sceneAt(ms, H.amsterdamOffset, CFG);
      assert.strictEqual(s.ok, true);
      assertNoNaN(s, 'scene');
      assert.strictEqual(s.prayers.filter(function (p) { return p.isNext; }).length, 1);
      assert.ok(s.next.ms > ms && s.next.minutesUntil >= 1);
    }
  });
});

test('invalid input gives ok:false with a message and never throws', function () {
  var good = H.ams(2026, 5, 20, 12, 0);
  var cases = [
    [NaN, H.amsterdamOffset, CFG], [Infinity, H.amsterdamOffset, CFG], ['x', H.amsterdamOffset, CFG],
    [1e18, H.amsterdamOffset, CFG], [good, null, CFG], [good, function () { return NaN; }, CFG],
    [good, function () { throw new Error('boom'); }, CFG], [good, H.amsterdamOffset, null],
    [good, H.amsterdamOffset, { lat: 91, lon: 0 }], [good, H.amsterdamOffset, { lat: CFG.lat + 0.001, lon: CFG.lon }],
    [good, H.amsterdamOffset, { lat: 52.09, lon: 5.12, hijriOffsetDays: 2 }],
    [good, H.amsterdamOffset, { lat: 90, lon: 0, hijriOffsetDays: 0 }]
  ];
  cases.forEach(function (c, i) {
    var r = Scene.sceneAt(c[0], c[1], c[2]);
    assert.strictEqual(r.ok, false, 'case ' + i);
    assert.ok(typeof r.error === 'string' && r.error.length > 10, 'case ' + i);
    assert.ok(!/52\.09|91|5\.12/.test(r.error), 'no config values in error ' + i);
  });
});

test('valid boundaries: lat/lon at limits where the sun rises give a scene', function () {
  var r = Scene.sceneAt(H.ams(2026, 3, 20, 12, 0), function () { return 0; }, { lat: 0, lon: 180, hijriOffsetDays: 0 });
  assert.strictEqual(r.ok, true);
  assertNoNaN(r, 'scene');
  var w = Scene.sceneAt(Date.UTC(2026, 2, 20, 12), function () { return 0; }, { lat: -60, lon: -180, hijriOffsetDays: 0 });
  assert.strictEqual(w.ok, true);
});

test('hijri is null outside the table and offset is applied', function () {
  var far = Scene.sceneAt(Date.UTC(2090, 5, 1, 10), H.amsterdamOffset, CFG);
  assert.strictEqual(far.ok, true);
  assert.strictEqual(far.hijri, null);
  var a = at(2025, 3, 1, 12, 0).hijri.text;
  var b = Scene.sceneAt(H.ams(2025, 3, 1, 12, 0), H.amsterdamOffset, { lat: 52.09, lon: 5.12, hijriOffsetDays: 1 }).hijri.text;
  assert.strictEqual(a, '1 Ramadan 1446');
  assert.strictEqual(b, '2 Ramadan 1446');
});

// adhan-js keeps a sub-second remainder when it rounds, so Fajr and Isha differ from our
// whole-minute values by up to 983 ms (observed max); the others match exactly. The scene is
// evaluated at 13:00 and at 00:03 (when 20 June style lists still hold last night's Isha).
test('the full-year golden: scene prayers equal adhan-js to the minute, with Amsterdam clock text', function (t) {
  var ref = require('./adhan-ref').reference;
  var Civil = load('civil.js');
  var max = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  var KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  function check(label, s, want) {
    var got = { fajr: s.prayers[0].ms, dhuhr: s.prayers[1].ms, asr: s.prayers[2].ms,
      maghrib: s.prayers[3].ms, isha: s.prayers[4].ms, sunrise: s.sunrise.ms };
    Object.keys(got).forEach(function (k) {
      var dev = Math.abs(got[k] - want[k]);
      if (dev > max[k]) { max[k] = dev; }
      assert.ok(dev < 1000, label + ' ' + k + ' off by ' + dev);
    });
    s.prayers.forEach(function (pr, i) {
      var minute = Math.round(want[KEYS[i]] / 60000) * 60000; // adhan's rounded minute
      assert.strictEqual(pr.timeText, H.fmtLocal(minute, H.amsterdamOffset(minute)), label + ' text ' + pr.name);
    });
  }
  Object.keys(H.PLACES).forEach(function (name) {
    var p = H.PLACES[name];
    [2026, 2028].forEach(function (year) {
      var first = Civil.daysFromCivil(year, 1, 1);
      var count = Civil.daysFromCivil(year + 1, 1, 1) - first;
      for (var i = 0; i < count; i++) {
        var c = Civil.civilFromDays(first + i);
        var label = name + ' ' + year + '-' + c.m + '-' + c.d;
        var prev = Civil.civilFromDays(first + i - 1);
        check(label + ' 13:00', Scene.sceneAt(H.ams(c.y, c.m, c.d, 13, 0), H.amsterdamOffset, p),
          ref(p.lat, p.lon, c.y, c.m, c.d));
        // 00:03: the list is last night's day if its Isha is still to come, else today's
        var late = Scene.sceneAt(H.ams(c.y, c.m, c.d, 0, 3), H.amsterdamOffset, p);
        var yday = ref(p.lat, p.lon, prev.y, prev.m, prev.d);
        var yIshaPending = Math.round(yday.isha / 60000) * 60000 > H.ams(c.y, c.m, c.d, 0, 3);
        var today = ref(p.lat, p.lon, c.y, c.m, c.d);
        var want = yIshaPending ? JSON.parse(JSON.stringify(yday)) : today;
        want.sunrise = today.sunrise; // top-level sunrise is always the civil day's
        check(label + ' 00:03', late, want);
        assert.strictEqual(late.prayers.filter(function (x) { return x.isNext; }).length, 1);
      }
    });
  });
  t.diagnostic('scene max deviation vs adhan-js (ms): ' + JSON.stringify(max));
});
