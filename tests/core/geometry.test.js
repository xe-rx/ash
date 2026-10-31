'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var G = load('geometry.js');
var Scene = load('scene.js');

function overlap(a, b, gap) {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

test('the sun path rises from the east horizon, peaks at Dhuhr time and sets on the west horizon', function () {
  var a = G.pathPoint(0), m = G.pathPoint(0.5), b = G.pathPoint(1);
  assert.ok(a.x < m.x && m.x < b.x);
  assert.ok(Math.abs(a.y - G.HORIZON) < 0.01 && Math.abs(b.y - G.HORIZON) < 0.01);
  assert.ok(m.y < G.HORIZON - 150);
  assert.ok(G.pathPoint(-0.2).y > G.HORIZON && G.pathPoint(1.2).y > G.HORIZON);
});

test('dots skip the sun disc and stay on screen', function () {
  var dots = G.pathDots(0.5);
  assert.ok(dots.length > 60 && dots.length < 100);
  var sun = G.pathPoint(0.5);
  dots.forEach(function (d) {
    assert.ok(d.x > 0 && d.x < G.W && d.y > 0 && d.y < G.H);
    assert.ok(Math.hypot(d.x - sun.x, d.y - sun.y) > 30, 'dot under the sun');
  });
});

function checkScene(s, where) {
  var L = G.layout(s);
  assert.strictEqual(L.labels.length, 5, where);
  L.labels.forEach(function (b, i) {
    assert.ok(b.x >= G.MARGIN && b.x + b.w <= G.W - G.MARGIN && b.y >= G.MARGIN && b.y + b.h <= G.H - G.MARGIN, where + ' off screen ' + i);
    assert.ok(b.y + b.h <= G.HORIZON - 8 || b.y >= G.LAND_TOP, where + ' straddles horizon ' + i);
    G.OBSTACLES.forEach(function (o) { assert.ok(!overlap(b, o, 0), where + ' hits readout/family ' + i); });
    assert.ok(!overlap(b, L.sunBox, 0), where + ' hits sun ' + i);
    for (var j = 0; j < i; j++) { assert.ok(!overlap(b, L.labels[j], 4), where + ' labels ' + j + ' and ' + i + ' collide'); }
    assert.ok(Math.hypot(b.ax - (b.x + b.w / 2), b.ay - (b.y + b.h / 2)) < 150, where + ' too far from its marker ' + i);
  });
}

[['Utrecht', H.PLACES.utrecht], ['Maastricht', H.PLACES.maastricht], ['Groningen', H.PLACES.groningen]].forEach(function (pl) {
  test('labels never collide or leave the screen across 2026 in ' + pl[0], function () {
    var n = 0;
    for (var day = 0; day < 365; day += 2) {
      [[0, 3], [5, 0], [9, 30], [13, 0], [16, 45], [20, 0], [22, 30], [23, 55]].forEach(function (hm) {
        var ms = H.ams(2026, 1, 1 + day, hm[0], hm[1]);
        var s = Scene.sceneAt(ms, H.amsterdamOffset, pl[1]);
        assert.strictEqual(s.ok, true);
        checkScene(s, pl[0] + ' day ' + day + ' ' + hm.join(':'));
        n++;
      });
    }
    assert.ok(n > 1000);
  });
});

test('layout is a pure function of the scene', function () {
  var s = Scene.sceneAt(H.ams(2026, 6, 21, 12, 0), H.amsterdamOffset, H.PLACES.utrecht);
  assert.strictEqual(JSON.stringify(G.layout(s)), JSON.stringify(G.layout(JSON.parse(JSON.stringify(s)))));
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
