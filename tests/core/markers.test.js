'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var G = load('geometry.js');
var Scene = load('scene.js');

// Each prayer marker must sit where the sun ring is at that prayer's time: the scene rendered
// at the prayer's own moment puts the sun marker exactly on the marker drawn earlier in the day.
var DATES = [[2026, 1, 15], [2026, 3, 29], [2026, 6, 21], [2026, 10, 25], [2026, 12, 21]];

test('every prayer marker is at the ring position of that prayer time', function () {
  DATES.forEach(function (d) {
    var morning = Scene.sceneAt(H.ams(d[0], d[1], d[2], 3, 0), H.amsterdamOffset, H.PLACES.utrecht);
    var labels = G.layout(morning).labels;
    morning.prayers.forEach(function (p, i) {
      var at = Scene.sceneAt(p.ms, H.amsterdamOffset, H.PLACES.utrecht);
      var ring = G.sunPoint(at);
      var where = d.join('-') + ' ' + p.name;
      assert.ok(Math.abs(labels[i].ax - ring.x) < 1 && Math.abs(labels[i].ay - ring.y) < 1,
        where + ' marker (' + labels[i].ax.toFixed(1) + ',' + labels[i].ay.toFixed(1) + ') ring (' + ring.x.toFixed(1) + ',' + ring.y.toFixed(1) + ')');
    });
  });
});

test('the ring has fixed anchors: sunrise and sunset at its ends, Dhuhr at the top', function () {
  var cfg = H.PLACES.utrecht, off = H.amsterdamOffset;
  var s = Scene.sceneAt(H.ams(2026, 6, 21, 3, 0), off, cfg);
  var rise = G.sunPoint(Scene.sceneAt(s.sunrise.ms, off, cfg));
  var set = G.sunPoint(Scene.sceneAt(s.sunset.ms, off, cfg));
  var noon = G.sunPoint(Scene.sceneAt(s.prayers[1].ms, off, cfg));
  // Literal screen pixels of the 1024x600 design: the ring runs x 132..892, horizon y 380, top y 148.
  assert.ok(Math.abs(rise.x - 132) < 2 && Math.abs(rise.y - 380) < 2, 'sunrise ' + rise.x + ',' + rise.y);
  assert.ok(Math.abs(set.x - 892) < 2 && Math.abs(set.y - 380) < 2, 'sunset ' + set.x + ',' + set.y);
  assert.ok(Math.abs(noon.x - 512) < 12 && Math.abs(noon.y - 148) < 3, 'dhuhr ' + noon.x + ',' + noon.y);
});
