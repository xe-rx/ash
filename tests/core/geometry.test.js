'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var G = load('geometry.js'), Clock = load('clock.js'), Table = load('table.js');
var Scene = load('scene.js');

function at(ms, place) { return Scene.sceneAt(ms, H.amsterdamOffset, place || H.PLACES.utrecht); }
function overlap(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
// distance from a circle's edge to a rectangle (negative when they overlap)
function clearance(c, r, b) {
  var dx = Math.max(b.x - c.x, 0, c.x - (b.x + b.w)), dy = Math.max(b.y - c.y, 0, c.y - (b.y + b.h));
  return Math.hypot(dx, dy) - r;
}

test('the sun arc: sunrise and sunset at its ends on the horizon, Dhuhr near the top (literal pixels)', function () {
  var s = at(H.ams(2026, 6, 21, 3, 0));
  var rise = G.sunPlace(at(s.sunrise.ms)), set = G.sunPlace(at(s.sunset.ms)), noon = G.sunPlace(at(s.prayers[1].ms));
  assert.ok(Math.abs(rise.x - 70) < 2 && Math.abs(rise.y - 380) < 2, 'sunrise ' + rise.x + ',' + rise.y);
  assert.ok(Math.abs(set.x - 650) < 2 && Math.abs(set.y - 380) < 2, 'sunset ' + set.x + ',' + set.y);
  assert.ok(Math.abs(noon.x - 365) < 25 && Math.abs(noon.y - 128) < 6, 'dhuhr ' + noon.x + ',' + noon.y);
});

test('the sun never jumps more than 12 px in a minute while any of it can be seen (dense days, 3 places)', function () {
  var dense = [[3, 29], [10, 25], [6, 21], [12, 21], [1, 15], [9, 23]];
  [H.PLACES.utrecht, H.PLACES.maastricht, H.PLACES.groningen].forEach(function (place) {
    dense.forEach(function (d) {
      var from = H.ams(2026, d[0], d[1], 0, 0), prev = null, prevSeen = false;
      for (var ms = from; ms < from + 25 * 3600000; ms += 60000) {
        var v = G.sunView(at(ms, place)), seen = v.look.glowVisible;
        if (prev && (seen || prevSeen)) {
          var step = Math.hypot(v.x - prev.x, v.y - prev.y);
          assert.ok(step <= 12, 'jump ' + step.toFixed(1) + ' px at ' + new Date(ms).toISOString() + ' ' + d.join('-'));
        }
        prev = v; prevSeen = seen;
      }
    });
  });
});

test('the sun disc keeps 16 px from the clock and the countdown over the year (disc only; halo contrast is in halo-contrast.test.js) (every 12 minutes, every 5th day, 3 places)', function () {
  var worst = 1e9, where = '';
  [H.PLACES.utrecht, H.PLACES.maastricht, H.PLACES.groningen].forEach(function (place) {
    for (var day = 0; day < 365; day += 5) {
      for (var m = 0; m < 1440; m += 12) {
        var s = at(H.ams(2026, 1, 1 + day, 0, 0) + m * 60000 + 3600000, place);
        if (!s.sun.isUp) { continue; }
        var v = G.sunView(s);
        [Clock.clockBox(s.clockText), Clock.countdownBox(s.next.countdownText)].forEach(function (box) {
          var c = clearance(v, v.look.r, box);
          if (c < worst) { worst = c; where = 'day ' + day + ' min ' + m + ' ' + s.clockText; }
        });
      }
    }
  });
  console.log('# smallest sun-to-clock clearance ' + worst.toFixed(1) + ' px (' + where + ')');
  assert.ok(worst >= 16, 'clearance ' + worst.toFixed(1) + ' at ' + where);
});

test('the clock and countdown lie inside the arc, centred on it', function () {
  ['00:00', '08:48', '11:11', '23:59'].forEach(function (t) {
    var b = Clock.clockBox(t), c = Clock.countdownBox('Maghrib in 2 h 31 min');
    [b, c].forEach(function (box) {
      [[box.x, box.y], [box.x + box.w, box.y]].forEach(function (p) {
        var e = Math.pow((p[0] - G.ARC_CX) / G.ARC_RX, 2) + Math.pow((G.HORIZON - p[1]) / G.ARC_RY, 2);
        assert.ok(e < 1.0, t + ' corner outside the arc: ' + e.toFixed(2));
      });
      assert.ok(Math.abs(box.x + box.w / 2 - G.ARC_CX) < 12, t + ' off centre');
      assert.ok(box.y + box.h < G.HORIZON - 30);
    });
  });
});

test('the qata is a full-height band on the right edge, clear of the sky arc, the clock and the family', function () {
  var Q = Table.QATA;
  assert.ok(Q.x + Q.w === G.W && Q.y === 0 && Q.h === G.H, 'full height, flush right');
  for (var m = 0; m < 1440; m++) {
    var t = (m / 60 | 0), text = (t < 10 ? '0' : '') + t + ':' + (m % 60 < 10 ? '0' : '') + m % 60;
    assert.ok(Clock.clockBox(text).x + Clock.clockBox(text).w < Q.x - 40, text);
  }
  var end = G.arcPoint(1);
  assert.ok(end.x + 46 < Q.x, 'the sun at sunset reaches the qata');
  assert.ok(G.arcPoint(0).x - 46 >= 22, 'the sun just after sunrise is clipped by the left screen edge (and the burn-in shift)');
});

test('table layout: five rows, one next row, passed rows before it, times in aligned cells', function () {
  var s = at(H.ams(2026, 6, 21, 12, 0)), L = Table.tableLayout(s);
  assert.strictEqual(L.rows.length, 5);
  assert.strictEqual(L.rows.filter(function (r) { return r.isNext; }).length, 1);
  var nextAt = L.rows.map(function (r) { return r.isNext; }).indexOf(true);
  L.rows.forEach(function (r, i) { assert.strictEqual(r.isPast, i < nextAt, 'row ' + i); });
  var colonX = null;
  for (var m = 0; m < 1440; m += 7) {
    var t = (m / 60 | 0), text = (t < 10 ? '0' : '') + t + ':' + (m % 60 < 10 ? '0' : '') + m % 60;
    var g = Table.timeGlyphs(text);
    if (colonX === null) { colonX = g[2].inkLeft; }
    assert.ok(Math.abs(g[2].inkLeft - colonX) < 1e-6, 'colon moved at ' + text);
    assert.ok(g[4].inkRight <= Table.TIME_RIGHT && g[0].inkLeft >= Table.NAME_X + 90, text);
  }
});

test('table rows are evenly spaced inside the baked lattice field, and the clock sits clear of the tent valance', function () {
  var L = Table.tableLayout(at(H.ams(2026, 6, 21, 12, 0)));
  L.rows.forEach(function (r, i) { assert.strictEqual(r.y, Table.ROWS_Y + i * Table.ROW_H); });
  assert.strictEqual(Table.END_Y, Table.ROWS_Y + 5 * Table.ROW_H);
  assert.ok(Table.FIELD.x >= Table.QATA.x && Table.FIELD.x + Table.FIELD.w <= Table.QATA.x + Table.QATA.w);
  assert.ok(Clock.CLOCK_INK_TOP >= 160, 'clock top under the valance');
  assert.ok(Clock.COUNTDOWN_Y + Clock.COUNTDOWN_H <= 330, 'countdown above the far land');
});

test('burn-in shift is deterministic, within 4 px, and changes every 10 minutes', function () {
  var a = G.shiftAt(H.ams(2026, 6, 21, 12, 0)), b = G.shiftAt(H.ams(2026, 6, 21, 12, 9));
  assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
  var seen = {};
  for (var i = 0; i < 400; i++) {
    var s = G.shiftAt(1.8e12 + i * 600000);
    assert.ok(Math.abs(s.x) <= 4 && Math.abs(s.y) <= 4);
    seen[s.x + ',' + s.y] = 1;
  }
  assert.ok(Object.keys(seen).length > 10);
});

test('the qata has the same geometry at every moment: its layout is a constant, and the view does not shift it with the burn-in shift', function () {
  var a = Table.tableLayout(at(H.ams(2026, 6, 21, 12, 0))), b = Table.tableLayout(at(H.ams(2026, 12, 21, 0, 1)));
  assert.strictEqual(JSON.stringify(a.qata), JSON.stringify(b.qata));
  assert.deepStrictEqual(a.rows.map(function (r) { return r.y; }), b.rows.map(function (r) { return r.y; }));
  var fs = require('fs'), path = require('path');
  var scene = fs.readFileSync(path.join(__dirname, '..', '..', 'app', 'ash', 'view', 'AshScene.qml'), 'utf8');
  assert.ok(!/PrayerTable/.test(scene), 'PrayerTable sits inside the shifted scene');
});

test('the sun disc stays fully below the tent valance hem and clear of the clock and the panel, all year (every 12 minutes, every 5th day, 3 places)', function () {
  var worstHem = 1e9, worstClock = 1e9, where = '';
  [H.PLACES.utrecht, H.PLACES.maastricht, H.PLACES.groningen].forEach(function (place) {
    for (var day = 0; day < 365; day += 5) {
      for (var m = 0; m < 1440; m += 12) {
        var s = at(H.ams(2026, 1, 1 + day, 0, 0) + m * 60000 + 3600000, place);
        if (!s.sun.isUp) { continue; }
        var v = G.sunView(s), r = v.look.r;
        var hem = v.y - r - G.valanceY(v.x - r); // the hem falls to the right, so its lowest point over the disc is at the disc's left edge
        var c = clearance(v, r, Clock.clockBox(s.clockText));
        if (hem < worstHem) { worstHem = hem; where = 'hem day ' + day + ' min ' + m; }
        worstClock = Math.min(worstClock, c);
        assert.ok(v.x + r < Table.QATA.x - 4, 'the sun reaches the panel at ' + s.clockText);
      }
    }
  });
  console.log('# sun disc to valance hem, smallest ' + worstHem.toFixed(1) + ' px (' + where + '); to the clock ' + worstClock.toFixed(1) + ' px');
  assert.ok(worstHem >= 4, 'the disc touches the valance: ' + worstHem.toFixed(1) + ' at ' + where);
  assert.ok(worstClock >= 16, 'the disc is ' + worstClock.toFixed(1) + ' px from the clock');
});
