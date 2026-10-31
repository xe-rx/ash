'use strict';
// The colour script (core/script.js): keyed moments of light, mixed by altitude. These tests hold the
// depth rule (each layer further away sits closer to the horizon sky) and the one-light rule.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var P = load('palette.js'), C = load('colour.js');

function pal(alt, rising) { return JSON.parse(JSON.stringify(P.paletteAt(alt, rising))); }
function eachAlt(from, to, step, fn) {
  [true, false].forEach(function (rising) { for (var alt = from; alt <= to; alt += step) { fn(pal(alt, rising), alt, rising); } });
}
function hor(p) { return p.skyBands[8]; }

test('depth: from the farthest silhouette to the near dune, every layer is further from the horizon sky than the one behind it', function () {
  var worst = 9;
  eachAlt(-90, 90, 0.5, function (p, alt, rising) {
    var chain = [p.farTwo, p.farOne, p.duneFar, p.duneMid, p.duneNear], prev = 0;
    chain.forEach(function (c, i) {
      var d = C.distance(c, hor(p));
      if (i > 0) { worst = Math.min(worst, d - prev); }
      assert.ok(d >= prev - 1e-9, 'layer ' + i + ' ' + c + ' is nearer the horizon sky than the one behind it at ' + alt + (rising ? ' rising' : ' setting'));
      prev = d;
    });
  });
  console.log('# smallest gap between neighbouring layers (distance to the horizon colour) ' + worst.toFixed(3));
});

test('depth: every silhouette is visibly different from the horizon band it sits against, and from its neighbour', function () {
  var lo = 9;
  eachAlt(-90, 90, 0.5, function (p, alt) {
    var a = C.distance(p.farTwo, hor(p)), b = C.distance(p.farOne, p.farTwo), c = C.distance(p.duneFar, p.farOne);
    lo = Math.min(lo, a, b, c);
    assert.ok(a >= 0.012 && b >= 0.012 && c >= 0.012, 'layers merge at ' + alt + ': ' + [a, b, c].map(function (x) { return x.toFixed(3); }));
  });
  console.log('# smallest separation between silhouette layers ' + lo.toFixed(3));
});

test('depth: by day the far layers are cooler than the near dune (bluer: higher OKLab b towards negative)', function () {
  eachAlt(20, 90, 5, function (p, alt) {
    assert.ok(C.toLab(p.farTwo)[2] < C.toLab(p.duneNear)[2] - 0.02, 'far ' + p.farTwo + ' not cooler than near ' + p.duneNear + ' at ' + alt);
  });
});
