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
