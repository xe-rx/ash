'use strict';
// Each text is checked against the colours really behind it: the sky bands its box overlaps,
// or all three dune colours for a label on the ground. Real scenes, real sun altitudes.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var G = load('geometry.js'), P = load('palette.js'), Scene = load('scene.js');

function bandsBehind(pal, y0, y1) {
  var out = [];
  for (var i = 0; i < 5; i++) { if (y0 < G.BANDS[i + 1] && y1 > G.BANDS[i]) { out.push(pal.skyBands[i]); } }
  return out;
}

test('every label, clock line and date reads at 4.5:1 on what is behind it, all year', function () {
  var n = 0, worst = 99;
  for (var day = 0; day < 365; day += 3) {
    [[0, 3], [3, 30], [5, 0], [7, 0], [9, 30], [13, 0], [16, 45], [19, 0], [21, 30], [22, 30], [23, 55]].forEach(function (hm) {
      var s = Scene.sceneAt(H.ams(2026, 1, 1 + day, hm[0], hm[1]), H.amsterdamOffset, H.PLACES.utrecht);
      var pal = P.paletteAt(s.sun.altitudeDeg, s.sun.azimuthDeg < 180), L = G.layout(s);
      var checks = [];
      L.labels.forEach(function (b, i) {
        var land = b.y >= G.LAND_TOP, next = s.prayers[i].isNext;
        var bgs = land ? [pal.duneFar, pal.duneMid, pal.duneNear] : bandsBehind(pal, b.y, b.y + b.h);
        var ink = next ? (land ? pal.accentLand : pal.accentSky) : (land ? pal.inkLand : pal.inkSky);
        var soft = next ? ink : (land ? pal.softLand : pal.softSky);
        checks.push([ink, bgs], [soft, bgs]);
      });
      checks.push([pal.inkSky, bandsBehind(pal, 176, 336)], [pal.accentSky, bandsBehind(pal, 336, 378)], [pal.softSky, bandsBehind(pal, 10, 44)]);
      checks.forEach(function (c) {
        c[1].forEach(function (bg) {
          var k = P.contrast(c[0], bg); worst = Math.min(worst, k); n++;
          assert.ok(k >= 4.5, c[0] + ' on ' + bg + ' = ' + k.toFixed(2) + ' day ' + day + ' ' + hm.join(':'));
        });
      });
    });
  }
  assert.ok(n > 5000);
  console.log('# worst label contrast ' + worst.toFixed(2));
});
