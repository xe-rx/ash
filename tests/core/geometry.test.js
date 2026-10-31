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
  assert.ok(Math.abs(rise.x - 45) < 2 && Math.abs(rise.y - 380) < 2, 'sunrise ' + rise.x + ',' + rise.y);
  assert.ok(Math.abs(set.x - 675) < 2 && Math.abs(set.y - 380) < 2, 'sunset ' + set.x + ',' + set.y);
  assert.ok(Math.abs(noon.x - 360) < 25 && Math.abs(noon.y - 65) < 6, 'dhuhr ' + noon.x + ',' + noon.y);
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

test('the sun never touches the clock or the countdown: clearance over the year (every 10 minutes, every 3rd day)', function () {
  var worst = 1e9, where = '';
  [H.PLACES.utrecht, H.PLACES.maastricht, H.PLACES.groningen].forEach(function (place) {
    for (var day = 0; day < 365; day += 3) {
      for (var m = 0; m < 1440; m += 10) {
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
        assert.ok(e < 0.85, t + ' corner outside the arc: ' + e.toFixed(2));
      });
      assert.ok(Math.abs(box.x + box.w / 2 - G.ARC_CX) < 12, t + ' off centre');
      assert.ok(box.y + box.h < G.HORIZON - 30);
    });
  });
});

test('the table is clear of the sky arc, the clock, the family and the screen edges', function () {
  var P = Table.PANEL;
  assert.ok(P.x >= 16 && P.y >= 16 && G.W - (P.x + P.w) >= 16);
  assert.ok(P.y + P.h <= G.HORIZON - 8, 'panel runs into the horizon');
  assert.ok(!overlap(P, G.familyBox()), 'panel hits the family');
  for (var m = 0; m < 1440; m++) {
    var t = (m / 60 | 0), text = (t < 10 ? '0' : '') + t + ':' + (m % 60 < 10 ? '0' : '') + m % 60;
    assert.ok(Clock.clockBox(text).x + Clock.clockBox(text).w < P.x - 40, text);
  }
  var end = G.arcPoint(1);
  assert.ok(end.x + 46 < P.x, 'the sun at sunset reaches the panel');
});

test('table layout: five rows in the panel, one next row, times in aligned cells, dot between the rows', function () {
  var s = at(H.ams(2026, 6, 21, 12, 0)), L = Table.tableLayout(s);
  assert.strictEqual(L.rows.length, 5);
  assert.strictEqual(L.rows.filter(function (r) { return r.isNext; }).length, 1);
  assert.ok(L.rows[4].y + Table.ROW_H <= Table.PANEL.y + Table.PANEL.h);
  var colonX = null, rightX = null;
  for (var m = 0; m < 1440; m += 7) {
    var t = (m / 60 | 0), text = (t < 10 ? '0' : '') + t + ':' + (m % 60 < 10 ? '0' : '') + m % 60;
    var g = Table.timeGlyphs(text);
    if (colonX === null) { colonX = g[2].inkLeft; }
    assert.ok(Math.abs(g[2].inkLeft - colonX) < 1e-6, 'colon moved at ' + text);
    assert.ok(g[4].inkRight <= Table.TIME_RIGHT && g[0].inkLeft >= Table.NAME_X + 90, text);
  }
  assert.ok(L.rail.dotY >= L.rail.y1 && L.rail.dotY <= L.rail.y2);
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
